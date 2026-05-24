import { BrowserWindow, type IpcMain } from "electron";
import { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
import { Config } from "../../core/io/Config.js";
import { AppState } from "../renderer/AppState.js";
import type { AircraftWebComponentState } from "../web-components/form/AircraftWebComponent.js";
import type { FuelPayloadWebComponentState } from "../web-components/form/FuelPayloadWebComponent.js";
import type { WindWebComponentState } from "../web-components/form/WindWebComponent.js";
import type { TimeAndDateWebComponentState } from "../web-components/form/TimeAndDateWebComponent.js";
import type { TemperatureWebComponentState } from "../web-components/form/TemperatureWebComponent.js";
import type { VisibilityWebComponentState } from "../web-components/form/VisibilityWebComponent.js";
import type { CloudsWebComponentState } from "../web-components/form/CloudsWebComponent.js";

export class AeroflyFlightServiceHandler {
    readonly service: AeroflyFlightService;

    constructor(
        protected ipcMain: IpcMain,
        protected win: BrowserWindow,
    ) {
        const config = new Config("electron");
        this.service = new AeroflyFlightService(config);
        this.service.readMainMcf();
        this.registerHandlers();
    }

    registerHandlers() {
        this.ipcMain.handle("aircraft:set", (event, aircraft: AircraftWebComponentState) => {
            this.service.setAircraft(aircraft.aircraftName, aircraft.aircraftPaintscheme);
            this.sendStateUpdate();
        });

        this.ipcMain.handle("fuel-payload:set", (event, fuelPayload: FuelPayloadWebComponentState) => {
            this.service.setFuelAndPayload(fuelPayload.fuelMass, fuelPayload.payloadMass);
            this.sendStateUpdate();
        });

        this.ipcMain.handle("wind:set", (event, wind: WindWebComponentState) => {
            this.service.setWind(wind.directionInDegree, wind.speed_kts, wind.gust_kts);
            this.sendStateUpdate();
        });
        this.ipcMain.handle("date-time:set", (event, dateTime: TimeAndDateWebComponentState) => {
            this.service.setTimeAndDate(`${dateTime.utcDate}T${dateTime.utcTime}Z`);
            this.sendStateUpdate();
        });
        this.ipcMain.handle("temperature:set", (event, temperature: TemperatureWebComponentState) => {
            this.service.setTemperature(temperature.temperatureCelsius);
            this.sendStateUpdate();
        });
        this.ipcMain.handle("visibility:set", (event, visibility: VisibilityWebComponentState) => {
            this.service.setVisibilityM(visibility.visibilityMeters);
            this.sendStateUpdate();
        });
        this.ipcMain.handle("clouds:set", (event, clouds: CloudsWebComponentState) => {
            this.service.setClouds(
                clouds.clouds.map((cloud) => ({
                    base_feet_agl: cloud.baseFt,
                    cloud_coverage: cloud.coverageEighths / 8, // convert oktas to 0-1
                })),
            );
            this.sendStateUpdate();
        });
    }

    sendStateUpdate() {
        const state = new AppState(this.service.getAeroflyFlight(), this.service.getAircraftData());
        this.service.writeFile();
        this.win.webContents.send("state:update", state);
    }
}
