# ![](../assets/icons/icon.svg) Aerofly Startgerät - Importing flight plans

Importing flight plans is not completely straightforward with the Aerofly Startgerät. There are multiple workflow to create flight plans:

1. Import from regular flight plan files
2. SimBrief import
3. Use the [Aerofly Startgerät Mission Generator](./mission-generator.md)

## Import from regular flight plan files

1. Download the flight plan file to your import folder. By default this is the `Downloads` folder of your operating system.
2. Start the Aerofly Startgerät and import the flight plan into the `main.mcf`.
   1. Start the "Open / Import flight plan" dialog.
   2. Open / import the flight plan file from your import folder.
3. Change additional settings in the Aerofly Startgerät (e.g. weather, time of day, date, aircraft).
4. Quit the Aerofly Startgerät.
5. Start Aerofly FS 4. You will find the basic flight plan prepared, but for some things you might want to add:
   1. Re-add the origin and destination airport, so Aerofly FS4 can align your waypoints with its internal database.
   2. Add runways, as the Aerofly Startgerät and most external flight plan formats do not know about the runway designations of Aerofly FS 4.
   3. Choose a starting position, as the Aerofly Startgerät does not know about the valid parking positions.
6. Start your flight normally.

Caveats:

- Create your route on any flight planning software, and crucially, manually select a AIRAC Cycle matching with Aerofly's native database.
- Be aware that most flight plan formats do not include aircraft and weather settings. They need to be setup using the Aerofly Startgerät.

## SimBrief import

1. Set-up your SimBrief flight plan:
   1. Be sure to choose an ICAO aircraft code assigned to an existing [Aerofly FS 4 aircraft](https://github.com/fboes/aerofly-data/blob/main/data/aircraft.md).
   2. You might also want to choose an ICAO airline code assigned to an existing Aerofly FS 4 livery. (Not all liveries are matched, but for major airlines you may be lucky.)
   3. Remember to generate the flight plan.
2. Start the Aerofly Startgerät and import the flight plan into the `main.mcf` using your SimBrief user name. Importing from SimBrief will also set up fuel, payload, time, date and weather.
3. Quit the Aerofly Startgerät.
4. Start Aerofly FS 4. You will find the basic flight plan prepared, but for some things you might want to add:
   1. Re-add the origin and destination airport, so Aerofly FS4 can align your waypoints with its internal database.
   2. Add runways, as the Aerofly Startgerät and most external flight plan formats do not know about the runway designations of Aerofly FS 4.
   3. Choose a starting position, as the Aerofly Startgerät does not know about the valid parking positions.
5. Start your flight normally.

Caveats:

- **Oceanic Routing (NATs/PACOTs):** Aerofly cannot parse compressed track designators (e.g., NAT U). To fix this, take the expanded latitude/longitude coordinates manually from SimBrief's map above, write them by hand into the route text box, re-validate the entire route, generate the flight plan and then fetch the plan via Startgerät, which takes literally seconds to do.
- Be aware that weather data imported from SimBrief reflects the weather settings at the time the flight plan was generated, and not the the weather settings at the actual start of flight. You might want to use the "Fetch METAR" functionality to obtain current weather.

> Instructions contributed by AeRodri from [RealFlightOps](https://www.youtube.com/@RealFlightOps)

---

[Back to documentation index](./README.md) | [Back to top](../README.md)
