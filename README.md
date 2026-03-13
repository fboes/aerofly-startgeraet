# Aerofly Startgerät

This Node.js application is an additional way to set-up flights in Aerofly Flight Simulator 4 on Microsoft Windows and Apple OSX.

Capabilities:

- Change aircraft as well as set-up fuel and payload.
- Change weather with settings in feet, statute miles and other meaningful units.
- Change time and date.
- Import weather for given time, date and airport.
- Import a flight plan as well as aircraft and weather settings from SimBrief.
- Import a flight plan from flight plan file formats like Garmin `fpl`, Microsoft Flight Simulator `pln` and X-Plane `fms`.

## Requirements

This tool requires [Node.js](https://nodejs.org/en) in at least version 20 to be installed on your local computer.

1. Visit [nodejs.org](https://nodejs.org/en)
2. Download the LTS (Long Term Support) version or newer
3. Run the installer and follow the setup wizard
4. Open your terminal application and verify the correct installation: `node --version`

The Startgerät is a Command Line Interface (CLI) tool, which means you need to open a terminal to run it. The tool itself does not need to be installed, as the Node.js tool `npx` will take care of downloading as well as executing the Startgerät.

## Installation

No installation is required! The Startgerät runs directly via `npx`, which automatically downloads and executes the latest version. This means:

- No disk space is used for installation
- You always get the latest version
- No manual updates needed
- Works immediately after Node.js is installed

## Usage

Call this tool by opening the pre-installed terminal application of your computer and execute this command:

```bash
npx @fboes/aerofly-startgeraet@latest
```

This will automatically download the latest version of this application and show the main menu of the Aerofly Startgerät.

### Caveats and notes

1. Importing flight plans almost vertainly will require to set-up the starting location of you aircraft in Aerofly FS 4, as the parking positions of aircraft are unknown.
2. Importing of SIDs and STARs is not possible, so you will also need to add these manually in Aerofly FS 4.
3. The Startgerät is able to alter the date and a third cloud layer, which both are not editable in Aerofly FS 4.
4. The mapping of aircrafts from Simbrief import relies on the correct ICAO code of the aircraft being chosen.

## Technical stuff

This projects uses the public APIs of the [Aviation Weather Center](https://aviationweather.gov/) and [SimBrief](https://www.simbrief.com/). The usage of these APIs may be restricted or blocked on your local computer.

## Status

[![GitHub Tag](https://img.shields.io/github/v/tag/fboes/aerofly-startgeraet)](https://github.com/fboes/aerofly-startgeraet)
[![NPM Version](https://img.shields.io/npm/v/%40fboes%2Faerofly-startgeraet.svg)](https://www.npmjs.com/package/@fboes/aerofly-startgeraet)
![GitHub License](https://img.shields.io/github/license/fboes/aerofly-startgeraet)

For a detailed history of changes, see [CHANGELOG.md](CHANGELOG.md).

## Legal stuff

Author: [Frank Boës](https://3960.org/) 2026

Copyright & license: See [LICENSE.txt](LICENSE.txt)

This tool is NOT affiliated with, endorsed, or sponsored by IPACS GbR. As stated in the [LICENSE.txt](LICENSE.txt), this tool comes with no warranty and might damage your files.

This software complies with the General Data Protection Regulation (GDPR) as it does not collect nor transmits any personal data to third parties, but for the usage of the [Aviation Weather Center API](https://aviationweather.gov/). For their data protection statement you might want to check their terms of service.
