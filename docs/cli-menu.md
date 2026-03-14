# Aerofly Startgerät CLI Menu Options

This document explains how to use the interactive Aerofly Startgerät command-line menu and what each option does.

The main menu is an interactive select list. Use arrow keys to move and Enter to choose.

## Main menu entries

- **Aircraft**: Choose aircraft and optional livery. This menu does not actually check which aircraft are installed, but wil refer to a public database.
- **Fuel / Payload**: Set fuel and payload values (payload is limited by aircraft maximum).
- **Flightplan**: Import a flight plan from local file or SimBrief via the [SimBrief API](https://www.simbrief.com/). For SimBrief import you will need to set the SimBrief username in the Aerofly Startgerät configuration, for importing local fight plan files you will need to set the import directory in the Startgerät configuration.
- **Time & Date**: Sync to current time or set manually (UTC or departure airport timezone).
- **Weather**: Import METAR weather for departure airport from the [Aviation Weather Center API](https://aviationweather.gov/).
- **Wind**: Manually set wind speed, direction and gusts.
- **Temperature**: Set ambient temperature in °C.
- **Clouds**: Configure three cloud layers (base altitude, and coverage).
- **Visibility**: Set visibility in statute miles or meters.
- **Configuration & Help**: Update app settings (main.mcf path, SimBrief username, import directory).
- **Save & Exit**: Write configuration file and end the menu.

## Notes

- If no SimBrief username is set, the SimBrief import option is disabled. Also be sure to have an active flight plan in SimBrief - flight plans get de-published after some time.
- After save and exit, the `main.mcf` gets rewritten and is available Aerofly FS 4 on the next start up.

---

[Back to top](../README.md)
