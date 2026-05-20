import { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
import { Config } from "../../core/io/Config.js";
import { AppState } from "../renderer/AppState.js";
export class AeroflyFlightServiceHandler {
    ipcMain;
    win;
    service;
    constructor(ipcMain, win) {
        this.ipcMain = ipcMain;
        this.win = win;
        const config = new Config("electron");
        this.service = new AeroflyFlightService(config);
        this.service.readMainMcf();
        this.registerHandlers();
    }
    registerHandlers() {
        this.ipcMain.handle("aircraft:set", (event, aircraft) => {
            this.service.setAircraft(aircraft.aircraftName, aircraft.aircraftPaintscheme);
            this.sendStateUpdate();
        });
        this.ipcMain.handle("fuel-payload:set", (event, fuelPayload) => {
            this.service.setFuelAndPayload(fuelPayload.fuelMass, fuelPayload.payloadMass);
            this.sendStateUpdate();
        });
        this.ipcMain.handle("wind:set", (event, wind) => {
            this.service.setWind(wind.directionInDegree, wind.speed_kts, wind.gust_kts);
            this.sendStateUpdate();
        });
        this.ipcMain.handle("date-time:set", (event, dateTime) => {
            this.service.setTimeAndDate(`${dateTime.utcDate}T${dateTime.utcTime}Z`);
            this.sendStateUpdate();
        });
        this.ipcMain.handle("temperature:set", (event, temperature) => {
            this.service.setTemperature(temperature.temperatureCelsius);
            this.sendStateUpdate();
        });
        this.ipcMain.handle("visibility:set", (event, visibility) => {
            this.service.setVisibilityM(visibility.visibilityMeters);
            this.sendStateUpdate();
        });
        this.ipcMain.handle("clouds:set", (event, clouds) => {
            this.service.setClouds(clouds.clouds.map((cloud) => ({
                base_feet_agl: cloud.baseFt,
                cloud_coverage: cloud.coverageEighths / 8, // convert oktas to 0-1
            })));
            this.sendStateUpdate();
        });
    }
    sendStateUpdate() {
        const state = new AppState(this.service.getAeroflyFlight(), this.service.getAircraftData());
        this.service.writeFile();
        this.win.webContents.send("state:update", state);
    }
}
