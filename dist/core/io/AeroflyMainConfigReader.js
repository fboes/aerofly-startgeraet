import fs from "node:fs";
import path from "node:path";
import { AeroflyFileParser } from "../converter/AeroflyFileParser.js";
import { AeroflyMainConfigParser } from "../converter/AeroflyMainConfigParser.js";
export class AeroflyMainConfigReader {
    constructor(config) {
        this.config = config;
        if (!this.config.mainMcfFilePath) {
            throw new Error("mainMcfFilePath is not defined in the config.");
        }
        if (!fs.existsSync(this.config.mainMcfFilePath)) {
            throw new Error(`The specified mainMcfFilePath does not exist: ${this.config.mainMcfFilePath}`);
        }
        this.mainCfgFileName = path.join(this.config.mainMcfFilePath, "main.mcf");
    }
    read() {
        const mainMcfContent = fs.readFileSync(this.mainCfgFileName, "utf-8");
        return this.parseMainMcf(mainMcfContent);
    }
    parseMainMcf(mainMcfContent) {
        const parser = new AeroflyMainConfigParser();
        return parser.parse(mainMcfContent);
    }
    write(flight) {
        // Open the main.mcf file
        let mainMcfContent = fs.readFileSync(this.mainCfgFileName, "utf-8");
        // Replace the appropriate sections with the data from the AeroflyFlight object
        const parser = new AeroflyFileParser();
        mainMcfContent = parser.setGroup(mainMcfContent, "tmsettings_aircraft", 2, flight.aircraft.getElement().toString(2));
        mainMcfContent = parser.setGroup(mainMcfContent, "tmsettings_flight", 2, flight.flightSetting.getElement().toString(2));
        mainMcfContent = parser.setGroup(mainMcfContent, "tm_time_utc", 2, flight.timeUtc.getElement().toString(2));
        mainMcfContent = parser.setGroup(mainMcfContent, "tmsettings_wind", 2, flight.wind.getElement().toString(2));
        mainMcfContent = parser.setGroup(mainMcfContent, "tmsettings_clouds", 2, flight.getCloudsElement().toString(2));
        mainMcfContent = parser.setGroup(mainMcfContent, "tmnavigation_config", 2, flight.navigation.getElement().toString(2));
        mainMcfContent = parser.setGroup(mainMcfContent, "tmsettings_fuel_load", 2, flight.fuelLoadSetting.getElement().toString(2));
        mainMcfContent = parser.setNumber(mainMcfContent, "visibility", flight.visibility);
        // Save the modified content back to the main.mcf file
        fs.writeFileSync(this.mainCfgFileName, mainMcfContent, "utf-8");
    }
}
