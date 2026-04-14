# Push Notifications Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --push`

Covers: APNs (Apple Push Notification service) for iOS, Firebase FCM for Android, `expo-notifications` integration, device token registration, and backend delivery.

---

## CRITICAL RULES

### 1. APNs and FCM credentials from SSM — never in source

```typescript
// ✅ APNs credentials from SSM
const apnsKey        = process.env.APNS_PRIVATE_KEY;  // SSM: /[project]/APNS_PRIVATE_KEY (base64 .p8)
const apnsKeyId      = process.env.APNS_KEY_ID;       // SSM: /[project]/APNS_KEY_ID
const apnsTeamId     = process.env.APNS_TEAM_ID;      // SSM: /quik-nation/shared/APPLE_TEAM_ID
const apnsBundleId   = process.env.APNS_BUNDLE_ID;    // SSM: /[project]/APNS_BUNDLE_ID

// ✅ FCM credentials from SSM
const fcmServiceAccountJson = process.env.FCM_SERVICE_ACCOUNT_JSON; // SSM: /[project]/FCM_SERVICE_ACCOUNT_JSON (base64)

// ❌ NEVER hardcode APNs keys or FCM service account JSON
// ❌ NEVER commit .p8 files to git
```

**SSM paths:**
```
/quik-nation/shared/APPLE_TEAM_ID
/[project]/APNS_PRIVATE_KEY             # Base64 .p8 key content
/[project]/APNS_KEY_ID                  # 10-character key ID from Apple Developer
/[project]/APNS_BUNDLE_ID              # e.g. com.quiknation.app
/[project]/FCM_SERVICE_ACCOUNT_JSON    # Base64 service account JSON from Firebase Console
```

---

### 2. expo-notifications — setup handler at app root

```typescript
// App.tsx or _layout.tsx
import * as Notifications from "expo-notifications";

// ✅ Set notification handler BEFORE any rendering
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    // Register for push notifications on mount
    registerForPushNotifications();

    // Handle notification tap (app in background/killed)
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      // Navigate to relevant screen based on data.type
      handleNotificationNavigation(data);
    });

    return () => sub.remove();
  }, []);

  return <Stack />;
}

// ❌ Setting up notification listeners inside individual screens
// ❌ Forgetting to remove listeners in cleanup
```

---

### 3. Request permissions before registering — never request silently

```typescript
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

export async function registerForPushNotifications(): Promise<string | null> {
  // ✅ Physical device check — push doesn't work in simulator
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device");
    return null;
  }

  // ✅ Android: create notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // ✅ Request permission — show system prompt
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null; // User denied — do not retry without user action
  }

  // ✅ Get push token (Expo push token for expo-server-sdk)
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = await Notifications.getExpoPushTokenAsync({ projectId });

  // ✅ Register token with backend
  await registerTokenWithBackend(token.data);

  return token.data;
}

// ❌ Calling requestPermissionsAsync without checking existing status first
// ❌ Calling getExpoPushTokenAsync without a valid projectId
```

---

### 4. Device token registration endpoint — backend required

```typescript
// POST /api/notifications/register
// ✅ Backend stores token per user per device
router.post("/api/notifications/register", requireAuth, async (req: ApiKeyRequest, res) => {
  const userId = req.claraUser?.userId;
  const { token, platform } = req.body;

  if (!token || !["ios", "android"].includes(platform)) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }

  await DeviceToken.upsert({
    userId,
    token,
    platform,
    updatedAt: new Date(),
  });

  res.json({ success: true });
});

// ✅ Tokens expire — implement DELETE for logout/unregister
router.delete("/api/notifications/register", requireAuth, async (req: ApiKeyRequest, res) => {
  const userId = req.claraUser?.userId;
  const { token } = req.body;
  await DeviceToken.destroy({ where: { userId, token } });
  res.json({ success: true });
});
```

---

### 5. Backend push delivery — use Expo Push API (not direct APNs/FCM)

```typescript
import { Expo, ExpoPushMessage } from "expo-server-sdk";

const expo = new Expo();

// ✅ Use expo-server-sdk for delivery (handles APNs + FCM routing)
export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const messages: ExpoPushMessage[] = tokens
    .filter(token => Expo.isExpoPushToken(token))
    .map(token => ({
      to: token,
      sound: "default",
      title,
      body,
      data: data ?? {},
    }));

  // Send in chunks (Expo API limit: 100 per request)
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      logger.error("Push send failed", { err });
    }
  }
}

// ❌ Sending directly to APNs/FCM without going through Expo
// ❌ Ignoring chunking — Expo enforces a 100-message limit per request
```

---

### 6. Handle delivery receipts — remove invalid tokens

```typescript
import { Expo } from "expo-server-sdk";

// ✅ Check receipts and clean up dead tokens
export async function processPushReceipts(receiptIds: string[]): Promise<void> {
  const expo = new Expo();
  const chunks = expo.chunkPushNotificationReceiptIds(receiptIds);

  for (const chunk of chunks) {
    const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

    for (const [id, receipt] of Object.entries(receipts)) {
      if (receipt.status === "error") {
        if (receipt.details?.error === "DeviceNotRegistered") {
          // ✅ Remove dead token from DB
          await DeviceToken.destroy({ where: { receiptId: id } });
        }
        logger.error("Push receipt error", { id, error: receipt.details?.error });
      }
    }
  }
}
```

---

### 7. No notification spam — respect user frequency preferences

```typescript
// ✅ Check user notification preferences before sending
async function shouldSendNotification(userId: string, type: string): Promise<boolean> {
  const prefs = await NotificationPreferences.findOne({ where: { userId } });
  if (!prefs) return true; // default: send
  return prefs.enabled && prefs.types?.[type] !== false;
}

// ❌ Sending every event without user preference check
await sendPushNotification(tokens, "Update", "Something happened");
```

---

### Heru-specific tech doc required

Each Heru using push notifications MUST have `docs/standards/push.md` documenting:
- Notification types sent (transactional, promotional, real-time)
- APNs key ID and bundle ID (non-secret values only)
- Firebase project ID (non-secret)
- Notification channels defined (Android)
- User preference controls implemented (opt-out per notification type)
- Receipt processing schedule (daily job recommended)

If `docs/standards/push.md` does not exist, create it.
