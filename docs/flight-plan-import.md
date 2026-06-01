# ![](../assets/icons/linux/icons/64x64.png) Aerofly Startgerät - Importing flight plans

Importing flight plans is not completely straightforward with the Aerofly Startgerät. This workflow will get you started:

## Regular flight plan files

1. Download the flight plan file to your import folder. By default this is the `Downloads` folder of your operating system.
2. Start the Aerofly Startgerät and import the flight plan into the `main.mcf`.
3. Start Aerofly FS 4. You will find the basic flight plan prepared, but for some things you might want to add:
   1. Re-add the origin and destination airport, so Aerofly FS4 can align your waypoints with its internal database.
   2. Add runways, as the Aerofly Startgerät and most external flight plan formats do not know about the runway designations of Aerofly FS 4.
   3. Choose a starting position, as the Aerofly Startgerät does not know about the valid parking positions.
4. Start your flight normally.

## SimBrief import

1. Set-up your SimBrief flight plan
   1. Be sure to choose an ICAO aircraft code assigned to an existing [Aerofly FS 4 aircraft](https://github.com/fboes/aerofly-data/blob/main/data/aircraft.md).
   2. You might also want to choose an ICAO airline code assigned to an existing Aerofly FS 4 livery. (Not all liveries are matched, but for major airlines you may be lucky.)
   3. Remember to generate the flight plan.
2. Start the Aerofly Startgerät and import the flight plan into the `main.mcf` using your SimBrief user name. Importing from SimBrief will also set up fuel, payload, time, date and weather.
3. Start Aerofly FS 4. You will find the basic flight plan prepared, but for some things you might want to add:
   1. Re-add the origin and destination airport, so Aerofly FS4 can align your waypoints with its internal database.
   2. Add runways, as the Aerofly Startgerät and most external flight plan formats do not know about the runway designations of Aerofly FS 4.
   3. Choose a starting position, as the Aerofly Startgerät does not know about the valid parking positions.
4. Start your flight normally.

---

[Back to top](../README.md)
