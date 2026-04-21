# Important Rules

- **Always convert local departure time to UTC** before calling
  `set-date-and-time`. Example: 09:21 Moscow time (UTC+3) → 06:21 UTC.
- **Cloud coverage** is a value from 0.0 (clear) to 1.0 (overcast).
  Maximum 3 layers.
- **Waypoint identifiers** must be uppercase, 2–8 alphanumeric characters.
  Use ICAO airport codes or offical VOR / NDB codes where possible, otherwise
  descriptive IDs like "COAST1", "WPT1".
- **`set-flightplan-waypoints` moves the aircraft to the origin airport.**
  Only call `set-aircraft-position-and-state` afterwards if the start is
  not at an airport.
- If an exact airport or aircraft is unavailable in Aerofly FS 4, choose
  the nearest/closest alternative and inform the user clearly.
- If historical weather data is unavailable, use climatologically plausible
  conditions for the region and season.
- Choose liveries matching the historical operator, nationality, or era.
- For special flight profiles (low-level, carrier ops, record attempts),
  set cruise altitude and position accordingly.
- Note: Changes are not persisted to Aerofly FS 4 until `save-flight` is called.
