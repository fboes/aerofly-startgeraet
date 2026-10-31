# Helicopter Emergency Medical Services Mission GeoJSON Files

The mission generator needs a [GeoJSON file](https://geojson.org/) which contains all possible locations to be used in the missions.

At the base of this file it needs a `FeatureCollection`, in which a list of `Feature` locations need to be put. There are three types of `Feature` locations:

- **Heliports** as a possible starting point for your helicopter; at least one is required.
- **Hospitals** as a possible end point to return at the end of your mission. If no hospital is given, the heliport will be used as hospital instead.
- All other locations are considered to be **emergency sites**.

> [!TIP]
> [geojson.io](https://geojson.io/) is a free online editor for creating and modifying GeoJSON files. It allows for adding, editing and deleting GeoJson `Feature` locations on an interactive map, as well as editing the properties of each `Feature`. It also will display icons matching the [`marker-symbol`](https://labs.mapbox.com/maki-icons/).

To create the different types of locations, you will need to add properties to every GeoJSON `Feature`. Find the list of properties below:

## Properties of heliports & hospitals

| Property                   | Type       | Description                             |
| -------------------------- | ---------- | --------------------------------------- |
| `properties.marker-symbol` | `string`   | `heliport`, `hospital` or `hospital-JP` |
| `properties.title`         | `string`   | Name of location                        |
| `properties.icaoCode`      | `string`   | ICAO code                               |
| `properties.direction`     | `number`   | _Optional_ orientation of helicopter    |
| `properties.approaches`    | `number[]` | _Optional_ list of approach directions  |

There are special `properties.marker-symbol` values for these locations:

| `properties.marker-symbol` | Mission purpose                                       |
| -------------------------- | ----------------------------------------------------- |
| `heliport`                 | Landing pad position to start / end flights           |
| `hospital`                 | Landing pad position at hospital to ferry patients to |
| `hospital-JP`              | Combined `hospital` and `heliport`                    |

## Properties of emergency sites

| Property                   | Type     | Description                   |
| -------------------------- | -------- | ----------------------------- |
| `properties.marker-symbol` | `string` | _Optional_, see below         |
| `properties.title`         | `string` | Name of location¹             |
| `properties.direction`     | `number` | _Optional_ orientation of POI |

¹) If the location does not have a unique name, use "location near …" to describe the location.

There are special `properties.marker-symbol` values for emergency sites, which will create different types of emergency sites:

| `properties.marker-symbol` | Missions                                                          |
| -------------------------- | ----------------------------------------------------------------- |
| default                    | Patient recovery                                                  |
| `car`, `road-accident`     | Car accident (not yet fully implemented)                          |
| `person`², `cricket`       | Lost person (not yet fully implemented)                           |
| `ship`², `ferry`           | Ship SAR (not yet fully implemented)                              |
| `bicycle`                  | Bicycle accident (not yet fully implemented)                      |
| `bus`                      | Bus accident (not yet fully implemented)                          |
| `farm`                     | Farming accident (not yet fully implemented)                      |
| `fire-station`             | Fire (not yet fully implemented)                                  |
| `logging`                  | Logging accident (not yet fully implemented)                      |
| `mountain`                 | Lost person in mountain area accident (not yet fully implemented) |
| `rail-light`               | Tram accident (not yet fully implemented)                         |
| `rail-metro`               | Metro train accident (not yet fully implemented)                  |
| `rail`                     | Train accident (not yet fully implemented)                        |
| `swimming`                 | Lost person in open water (not yet fully implemented)             |

²) Some marker symbols will not spawn the correct icon in [geojson.io](https://geojson.io/), but are still valid mission types.
