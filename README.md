# uTransit

uTransit is a location-aware bus tracker built with Expo, React Native, and TypeScript. It displays live vehicle data from an external transit API, groups buses by route, and lets you open a trip to view its stops and scheduled arrival times.

## Current features

- Requests foreground location permission and uses your current position to prioritize nearby buses.
- Fetches vehicle data on startup and refreshes it every **15 seconds**.
- Groups related route IDs together and displays one bus per direction, favoring the lowest calculated arrival estimate.
- Shows route numbers, destination headsigns, direction IDs, and approximate minutes to a nearby stop.
- Uses route colors from the API and horizontal paging to browse directions within each route group.
- Opens a trip-details modal containing stop names, stop sequence numbers, and scheduled arrival times.
- Supports manual refresh through the house-icon button in the header.

> **Status:** This is an early-stage client. The “Where To” header is currently a visual placeholder, not a working destination search or journey planner.

## Tech stack

- Expo SDK 58 and React Native 0.88
- React 19.3 and TypeScript 6
- Expo Router for file-based navigation
- Expo Location for foreground location access
- NativeWind 5 release candidate and Tailwind CSS 4 for styling
- Bun for dependency management (`bun.lock` is included)

## Getting started

### Prerequisites

- [Bun](https://bun.sh/) installed.
- A Node.js version supported by Expo SDK 58.
- A reachable transit backend implementing the endpoints described below. **The backend is not included in this repository.**
- A physical device or simulator/emulator for mobile development, or a browser for the web target. Platform-specific behavior still needs to be verified.

### 1. Install dependencies

```bash
bun install
```

### 2. Configure the API URL

Create a `.env` file in the repository root, or update your existing one:

```dotenv
EXPO_PUBLIC_BASE_URL=https://your-transit-api.example.com
```

Use the backend's base URL without a trailing slash. The client appends `/fetch` and `/trips/:id` to this value.

- On a physical device, `localhost` points to the device itself. Use a backend address that the device can reach, such as your computer's LAN IP or a hosted HTTPS endpoint.
- For the web target, the backend must allow requests from the app's origin through CORS.
- `EXPO_PUBLIC_` values are exposed to the client. Do not put API secrets in this variable.
- `.env` is ignored by Git. Restart the development server after changing configuration if the new value is not picked up.

### 3. Start development

```bash
bun run start
```

Or start a specific target:

```bash
bun run android
bun run ios
bun run web
```

Allow location access when prompted. **The current route list requires a successful location lookup**; if permission is denied or location cannot be obtained, no route groups are displayed.

## Transit API contract

The client makes two GET requests. The response shapes below summarize what the current UI reads; the full TypeScript interfaces are in [`global.d.ts`](./global.d.ts).

### `GET /fetch`

Returns an object with an `entity` array of bus records. The app uses this feed for vehicle positions, route grouping, and arrival estimates.

```json
{
  "entity": [
    {
      "id": "vehicle-123",
      "vehicle": {
        "routeName": "Example route",
        "route": {
          "route_color": "208AEF",
          "route_id": "4-CITY",
          "route_name": "Example route"
        },
        "position": {
          "latitude": 48.4284,
          "longitude": -123.3656,
          "speed": 8
        },
        "trip": {
          "trip_id": "trip-123",
          "route_id": "4-CITY",
          "trip_headsign": "Downtown",
          "direction_id": 0,
          "stops": [
            {
              "stop_id": "stop-123",
              "stop_name": "Main Street",
              "arrival_time": "14:30:00",
              "stop_sequence": 1,
              "stop_lat": 48.429,
              "stop_long": -123.366
            }
          ]
        }
      }
    }
  ]
}
```

`route_color` is a hex color **without** the leading `#`. Vehicle speed is treated as meters per second. Include trip stops in this response if you want the cards to calculate arrival estimates; otherwise they display `--`.

### `GET /trips/:id`

Returns a trip object directly, not wrapped in an `entity` field. `:id` is the selected bus's `trip_id`.

```json
{
  "trip_id": "trip-123",
  "route_id": "4-CITY",
  "trip_headsign": "Downtown",
  "direction_id": 0,
  "stops": [
    {
      "stop_id": "stop-123",
      "stop_name": "Main Street",
      "arrival_time": "14:30:00",
      "stop_sequence": 1,
      "stop_lat": 48.429,
      "stop_long": -123.366
    }
  ]
}
```

This data populates the trip-details modal. The client currently formats `arrival_time` as a 12-hour clock time.

## Project layout

```text
src/
  app/
    _layout.tsx       # Root navigation layout and global CSS import
    index.tsx         # Location, polling, route groups, and trip selection
  components/
    Header.tsx       # App title, placeholder search, and refresh button
    BusGroup.tsx     # Horizontally paged buses grouped by route
    BusCard.tsx      # Route, destination, direction, and estimated minutes
    BusModal.tsx     # Trip stops and scheduled arrival times
constants/
  index.ts           # API base URL from EXPO_PUBLIC_BASE_URL
  theme.ts           # Light and dark color definitions
utils/
  index.ts           # Distance, grouping, stop selection, and ETA helpers
assets/              # Icons, splash artwork, and other app assets
app.json             # Expo configuration and config plugins
global.css           # Global styling
global.d.ts          # Shared bus, trip, and stop interfaces
package.json         # Dependencies and development scripts
bun.lock             # Dependency lockfile
```

## Development commands

| Command | Purpose |
| --- | --- |
| `bun run start` | Start the Expo development server |
| `bun run android` | Start Expo and open the Android target |
| `bun run ios` | Start Expo and open the iOS target |
| `bun run web` | Start the web target |
| `bun run lint` | Run Expo's ESLint checks |
| `bunx tsc --noEmit` | Check TypeScript without generating files |
| `bunx expo-doctor` | Diagnose Expo dependency and configuration issues |

When adding dependencies, use `bunx expo install <package>` to resolve versions compatible with the installed Expo SDK.

The `reset-project` script in `package.json` references a missing `scripts/reset-project.js` file and is not currently usable. No automated test script or EAS build configuration is included.

## Current limitations

- Arrival estimates use straight-line distance from the vehicle to a selected nearby stop, divided by vehicle speed (falling back to 8 m/s when speed is falsy). They are **not official transit predictions** and do not account for road routing, traffic, or dwell times.
- Location is read once on startup; it does not continuously track the user's movement.
- Network errors are logged to the console. There are no dedicated loading, error, or location-permission fallback screens yet.
- The stop-selection and stop-sorting helpers need further validation; do not assume the modal is reliably ordered by proximity or that its first stop is the next arrival.
- Arrival-time formatting does not currently handle GTFS times beyond `24:00:00`.
- Android, iOS, and web launch scripts exist, but this does not establish complete feature parity or production readiness across platforms.

## License

See [LICENSE](./LICENSE) for the included MIT license and copyright notice.
