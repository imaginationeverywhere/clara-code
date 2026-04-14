# Apple Maps Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --apple-maps`

> Apple Maps is iOS ONLY. It MUST be gated behind `Platform.OS === 'ios'`. Never load Apple Maps on Android — use Mapbox (`--mapbox`) instead.

Covers: MapKit (React Native), MapKit JS (web), location permissions, annotations, and routing.

---

## CRITICAL RULES

### 1. Platform gate — mandatory on every map component

```typescript
import { Platform } from "react-native";

// ✅ Always gate Apple Maps behind Platform.OS
if (Platform.OS !== "ios") {
  // Render Mapbox or null for Android
  return <MapboxMap ... />;
}
// Only reach here on iOS
return <AppleMap ... />;

// ❌ NEVER render Apple Maps component unconditionally
<MapView provider={PROVIDER_DEFAULT} />  // Will crash on Android
```

---

### 2. react-native-maps with PROVIDER_DEFAULT (iOS only)

```typescript
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from "react-native-maps";
import { Platform } from "react-native";

// ✅ iOS: PROVIDER_DEFAULT = Apple Maps
// Android: always use PROVIDER_GOOGLE (or Mapbox — see --mapbox standard)
export function LocationMap({ coords }: { coords: Coordinates }) {
  if (Platform.OS === "android") {
    return <MapboxMap coordinates={coords} />;
  }

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={{ flex: 1 }}
      initialRegion={{
        latitude: coords.lat,
        longitude: coords.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker coordinate={{ latitude: coords.lat, longitude: coords.lng }} />
    </MapView>
  );
}

// ❌ Using PROVIDER_GOOGLE on iOS — wastes API quota, doesn't use MapKit
<MapView provider={PROVIDER_GOOGLE} />
```

---

### 3. Location permissions — required strings in Info.plist

```xml
<!-- ios/[AppName]/Info.plist — ALL of these are required if using location -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>We use your location to show nearby [items/drivers/stores].</string>

<!-- Only add this if background tracking is required (delivery driver, etc.) -->
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>We need background location to track your delivery.</string>

<!-- ❌ Omitting these strings = crash on iOS 14+ -->
```

```typescript
import * as Location from "expo-location";

// ✅ Request only what you need
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

// ✅ Background location — only for delivery driver / real-time tracking
export async function requestBackgroundPermission(): Promise<boolean> {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  return status === "granted";
}

// ❌ Never request background without foreground first
```

---

### 4. MapKit JS token from SSM (web usage)

```typescript
// MapKit JS requires a JWT token (rotate every 30 days)
// ✅ Token from SSM — NOT embedded in client bundle
const mapkitToken = process.env.MAPKIT_JS_TOKEN; // SSM: /[project]/MAPKIT_JS_TOKEN

// Backend: generate or serve the token
router.get("/api/mapkit-token", requireAuth, (req, res) => {
  res.json({ token: process.env.MAPKIT_JS_TOKEN });
});

// ❌ Never put MapKit token directly in frontend env (it's a server-side secret)
// The token should be fetched from your backend, not NEXT_PUBLIC_MAPKIT_TOKEN
```

**SSM paths:**
```
/[project]/MAPKIT_JS_TOKEN              # JWT for MapKit JS (rotate every 30 days)
/quik-nation/shared/APPLE_MAPS_KEY_ID   # Key ID from Apple Developer portal
/quik-nation/shared/APPLE_TEAM_ID       # Apple Team ID
```

---

### 5. Clustering for performance — required when >50 markers

```typescript
// ✅ Use clustering when showing multiple locations
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import SuperCluster from "supercluster";

// For react-native-maps + clustering, use react-native-map-clustering
import ClusteredMapView from "react-native-map-clustering";

export function LocationsMap({ locations }: { locations: Location[] }) {
  if (Platform.OS !== "ios") return <MapboxMap locations={locations} />;

  return (
    <ClusteredMapView
      provider={PROVIDER_DEFAULT}
      style={{ flex: 1 }}
      clusterColor="#7C3AED"
    >
      {locations.map(loc => (
        <Marker key={loc.id} coordinate={{ latitude: loc.lat, longitude: loc.lng }} />
      ))}
    </ClusteredMapView>
  );
}

// ❌ Rendering 500 markers individually — crashes on low-end devices
```

---

### 6. Turn-by-turn directions — open Apple Maps app, don't reimplement

```typescript
import { Linking, Platform } from "react-native";

// ✅ Deep link to Apple Maps for navigation (iOS best practice)
export function openDirections(destLat: number, destLng: number, label: string) {
  if (Platform.OS !== "ios") {
    // Google Maps deep link for Android
    Linking.openURL(`https://maps.google.com/?daddr=${destLat},${destLng}`);
    return;
  }
  Linking.openURL(
    `maps://app?daddr=${destLat},${destLng}&dirflg=d&t=m&q=${encodeURIComponent(label)}`
  );
}

// ❌ Implementing turn-by-turn in-app — expensive, duplicates native capability
```

---

### Heru-specific tech doc required

Each Heru using Apple Maps MUST have `docs/standards/apple-maps.md` documenting:
- Which screens show maps and which platform each uses (iOS = Apple Maps, Android = Mapbox)
- Location permission level required (foreground / background) and justification
- Whether MapKit JS is used on web and token rotation schedule
- Marker clustering strategy (threshold for enabling)
- Any custom map styles applied

If `docs/standards/apple-maps.md` does not exist, create it.
