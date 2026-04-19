# Mapbox Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --mapbox`

> Mapbox is the Android map implementation. iOS uses Apple Maps (`--apple-maps`). Gate ALL Mapbox code behind `Platform.OS === 'android'`.

Covers: `@rnmapbox/maps` (React Native), access token management, camera control, and markers.

---

## CRITICAL RULES

### 1. Access token from SSM — never in client bundle

```typescript
// ✅ Token from SSM (injected into build-time env or fetched from backend)
const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN; // SSM: /[project]/MAPBOX_ACCESS_TOKEN

// In app.json / app.config.js for Expo:
export default {
  extra: {
    mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN,
  },
  plugins: [
    [
      "@rnmapbox/maps",
      { RNMapboxMapsAccessToken: process.env.MAPBOX_ACCESS_TOKEN }
    ]
  ],
};

// ❌ Hardcoded token in source
const ACCESS_TOKEN = "pk.eyJ1IjoicXVpa25hdGlvbiIsImEiOiJhYmMxMjMifQ.hardcoded";
```

**SSM path:**
```
/[project]/dev/MAPBOX_ACCESS_TOKEN
/[project]/prod/MAPBOX_ACCESS_TOKEN
```

---

### 2. Platform gate — Android only

```typescript
import { Platform } from "react-native";
import Mapbox from "@rnmapbox/maps";

// ✅ Always gate Mapbox behind Platform.OS === 'android'
export function MapComponent({ coordinates }: { coordinates: Coordinates }) {
  if (Platform.OS === "ios") {
    return <AppleMapsComponent coordinates={coordinates} />;
  }

  return (
    <Mapbox.MapView style={{ flex: 1 }}>
      <Mapbox.Camera
        zoomLevel={14}
        centerCoordinate={[coordinates.lng, coordinates.lat]}
      />
      <Mapbox.PointAnnotation
        id="marker"
        coordinate={[coordinates.lng, coordinates.lat]}
      >
        <View style={styles.marker} />
      </Mapbox.PointAnnotation>
    </Mapbox.MapView>
  );
}

// ❌ Loading @rnmapbox/maps on iOS — wastes resources, not needed
```

---

### 3. Initialize Mapbox once at app root — not per component

```typescript
// App.tsx (or _layout.tsx in Expo Router)
import Mapbox from "@rnmapbox/maps";
import Constants from "expo-constants";

// ✅ Initialize once with token from app config
Mapbox.setAccessToken(Constants.expoConfig?.extra?.mapboxAccessToken ?? "");

// ❌ Setting access token inside a component on every render
function MapScreen() {
  Mapbox.setAccessToken(process.env.MAPBOX_ACCESS_TOKEN!); // wrong — called every render
  return <Mapbox.MapView ... />;
}
```

---

### 4. AndroidManifest.xml — location permissions

```xml
<!-- android/app/src/main/AndroidManifest.xml -->

<!-- ✅ Required for location on Android -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Only if background tracking needed (delivery driver) -->
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

<!-- ❌ Omitting these = LocationManager returns null -->
```

```typescript
import * as Location from "expo-location";

// ✅ Request at runtime AND check manifest
export async function requestAndroidLocation(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}
```

---

### 5. Use map styles from SSM / config — not hardcoded style URLs

```typescript
// ✅ Map style from config (allows switching light/dark without code change)
const MAP_STYLE = process.env.MAPBOX_STYLE_URL ?? Mapbox.StyleURL.Dark;

// Standard Mapbox style URLs (no SSM needed — these are public):
// Mapbox.StyleURL.Dark     → "mapbox://styles/mapbox/dark-v11"
// Mapbox.StyleURL.Light    → "mapbox://styles/mapbox/light-v11"
// Mapbox.StyleURL.Street   → "mapbox://styles/mapbox/streets-v12"

// ✅ Custom brand style (if created in Mapbox Studio)
const BRAND_STYLE = process.env.MAPBOX_CUSTOM_STYLE; // SSM: /[project]/MAPBOX_CUSTOM_STYLE

<Mapbox.MapView styleURL={BRAND_STYLE ?? Mapbox.StyleURL.Dark} style={{ flex: 1 }} />

// ❌ Hardcoding custom style URL in source
<Mapbox.MapView styleURL="mapbox://styles/quiknation/abc123def456" />
```

---

### 6. Cluster large datasets — required for >50 points

```typescript
import Mapbox from "@rnmapbox/maps";

// ✅ Use ShapeSource + cluster for performance
const geojson: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: locations.map(loc => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [loc.lng, loc.lat] },
    properties: { id: loc.id, title: loc.name },
  })),
};

<Mapbox.MapView style={{ flex: 1 }}>
  <Mapbox.ShapeSource
    id="locations"
    shape={geojson}
    cluster
    clusterRadius={50}
    clusterMaxZoomLevel={14}
  >
    <Mapbox.CircleLayer
      id="clusters"
      filter={["has", "point_count"]}
      style={{ circleColor: "#7C3AED", circleRadius: 20 }}
    />
    <Mapbox.SymbolLayer
      id="cluster-count"
      filter={["has", "point_count"]}
      style={{ textField: ["get", "point_count_abbreviated"], textColor: "#fff" }}
    />
    <Mapbox.CircleLayer
      id="unclustered"
      filter={["!", ["has", "point_count"]]}
      style={{ circleColor: "#7BCDD8", circleRadius: 8 }}
    />
  </Mapbox.ShapeSource>
</Mapbox.MapView>

// ❌ PointAnnotation for 200 markers — laggy, unresponsive
```

---

### 7. Turn-by-turn navigation — deep link to Google Maps

```typescript
import { Linking } from "react-native";

// ✅ Deep link to Google Maps for navigation on Android
export function openAndroidDirections(destLat: number, destLng: number) {
  Linking.openURL(`google.navigation:q=${destLat},${destLng}`);
}

// ❌ Implementing in-app navigation — duplicates Google Maps
```

---

### Heru-specific tech doc required

Each Heru using Mapbox MUST have `docs/standards/mapbox.md` documenting:
- Which screens use Mapbox (Android) vs Apple Maps (iOS)
- Mapbox account and style used
- Whether a custom Mapbox Studio style exists and its URL (stored in SSM)
- Clustering thresholds configured
- Offline maps enabled? (premium tier only)

If `docs/standards/mapbox.md` does not exist, create it.
