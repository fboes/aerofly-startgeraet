import { type BrowserWindow, dialog, type IpcMain, type IpcMainInvokeEvent } from "electron";
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
import type { ImportSimBriefWebComponentState } from "../web-components/form/ImportSimBriefWebComponent.js";
import {
    createNotificationErrorPayload,
    createNotificationPayload,
    type NotificationEventPayload,
} from "../renderer/notificationEventHandler.js";
import type { SettingsWebComponentState } from "../web-components/form/SettingsWebComponent.js";
import { AeroflyCustomMissionsTmcToAeroflyFlightConverter } from "../../core/converter/other/AeroflyCustomMissionsTmcToAeroflyFlightConverter.js";
import { AeroflyMcfToImportFileConverter } from "../../core/converter/other/AeroflyMcfToImportFileConverter.js";
import { GarminFplToAeroflyFlightConverter } from "../../core/converter/other/GarminFplToAeroflyFlightConverter.js";
import { MsfsPlnToAeroflyFlightConverter } from "../../core/converter/other/MsfsPlnToAeroflyFlightConverter.js";
import { XplaneFmsToAeroflyFlightConverter } from "../../core/converter/other/XplaneFmsToAeroflyFlightConverter.js";
import { IMPORT_FILE_TYPES } from "../../core/io/importFlightplan.js";
import { AeroflyFlightToAeroflyMainMcfConverter } from "../../core/converter/aerofly-flight/AeroflyFlightToAeroflyMainMcfConverter.js";
import { AeroflyFlightToAeroflyCustomMissionsTmcConverter } from "../../core/converter/aerofly-flight/AeroflyFlightToAeroflyCustomMissionsTmcConverter.js";
import { AeroflyFlightToGeoJsonConverter } from "../../core/converter/aerofly-flight/AeroflyFlightToGeoJsonConverter.js";
import { AeroflyFlightToKmlConverter } from "../../core/converter/aerofly-flight/AeroflyFlightToKmlConverter.js";
import path from "node:path";
import { getFlightplanIdentifier } from "../../core/formatter/AeroflyFlightFormatter.js";
import { AeroflyFlightToMarkdownConverter } from "../../core/converter/aerofly-flight/AeroflyFlightToMarkdownConverter.js";
import type { MetarInputWebComponentState } from "../web-components/form/MetarInputWebComponent.js";
import type { ImportWebComponentPayload } from "../web-components/form/ImportWebComponent.js";
import type { FlightPlanChooserWebComponentState } from "../web-components/form/FlightPlanChooserWebComponent.js";
import { AeroflyMainConfigReaderError } from "../../core/io/AeroflyMainConfigReader.js";
import { AeroflyFlightToMetarConverter } from "../../core/converter/aerofly-flight/AeroflyFlightToMetarConverter.js";
import type { AeroflylightCategoryUs, AeroflylightCategoryIcao } from "../../core/util/AeroflyFlightHelper.js";

export class AeroflyFlightServiceHandler {
    private readonly service: AeroflyFlightService;
    private readonly metar: AeroflyFlightToMetarConverter;
    private writeTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly writeDelay = 1_000;
    private isMissingMainMcf = false;

    constructor(
        protected ipcMain: IpcMain,
        protected win: BrowserWindow,
    ) {
        const config = new Config("electron");
        this.service = new AeroflyFlightService(config);
        this.metar = new AeroflyFlightToMetarConverter();
        this.loadMainMcf();
        this.registerHandlers();
    }

    loadMainMcf() {
        try {
            this.service.readMainMcf();
            this.isMissingMainMcf = false;
        } catch (e) {
            if (e instanceof AeroflyMainConfigReaderError) {
                this.isMissingMainMcf = true;
            } else {
                throw e;
            }
        }
    }

    writeMainMcf() {
        try {
            this.service.writeFile();
            this.isMissingMainMcf = false;
        } catch (e) {
            if (e instanceof AeroflyMainConfigReaderError) {
                this.isMissingMainMcf = true;
            } else {
                throw e;
            }
        }
    }

    registerHandlers() {
        this.ipcMain.handle("config:set", (event: IpcMainInvokeEvent, config: SettingsWebComponentState) => {
            this.service.config.mainMcfFilePath = config.mainMcfFilePath;
            this.sendStateUpdate();
        });

        this.ipcMain.handle("aircraft:set", (event: IpcMainInvokeEvent, aircraft: AircraftWebComponentState) => {
            this.service.setCruise(aircraft.cruiseAltitude_ft, aircraft.cruiseSpeed_kts);
            this.service.setAircraft(aircraft.aircraftName, aircraft.aircraftPaintscheme);
            this.sendStateUpdate();
        });

        this.ipcMain.handle(
            "fuel-payload:set",
            (event: IpcMainInvokeEvent, fuelPayload: FuelPayloadWebComponentState) => {
                this.service.setFuelAndPayload(fuelPayload.fuelMass, fuelPayload.payloadMass);
                this.sendStateUpdate();
            },
        );

        this.ipcMain.handle("wind:set", (event: IpcMainInvokeEvent, wind: WindWebComponentState) => {
            this.service.setWind(wind.directionInDegree, wind.speed_kts, wind.gust_kts);
            this.sendStateUpdate();
        });

        this.ipcMain.handle("date-time:set", (event: IpcMainInvokeEvent, dateTime: TimeAndDateWebComponentState) => {
            this.service.setTimeAndDate(`${dateTime.utcDate}T${dateTime.utcTime}Z`);
            this.sendStateUpdate();
        });

        this.ipcMain.handle(
            "temperature:set",
            (event: IpcMainInvokeEvent, temperature: TemperatureWebComponentState) => {
                this.service.setTemperature(temperature.temperatureCelsius);
                this.sendStateUpdate();
            },
        );

        this.ipcMain.handle("visibility:set", (event: IpcMainInvokeEvent, visibility: VisibilityWebComponentState) => {
            this.service.setVisibilityM(visibility.visibilityMeters);
            this.sendStateUpdate();
        });

        this.ipcMain.handle("clouds:set", (event: IpcMainInvokeEvent, clouds: CloudsWebComponentState) => {
            this.service.setClouds(
                clouds.clouds.map((cloud) => ({
                    base_feet_agl: cloud.baseFt,
                    cloud_coverage: cloud.coverageEighths / 8, // convert oktas to 0-1
                })),
            );
            this.sendStateUpdate();
        });

        this.ipcMain.handle("metar:set", (event: IpcMainInvokeEvent, metar: MetarInputWebComponentState) => {
            this.service.setWeatherFromMETAR(metar.metar);
            this.sendStateUpdate();
        });

        this.ipcMain.handle("config:choose-main-mcf-path", this.chooseMainMcfPath);
        this.ipcMain.handle("flightplan:import-simbrief", this.importSimbrief);
        this.ipcMain.handle("flightplan:import-file", this.openDialogAndImportFile);
        this.ipcMain.handle(
            "flightplan:import-flightplan-index",
            (event: IpcMainInvokeEvent, payload: FlightPlanChooserWebComponentState) => {
                try {
                    this.service.importFlightplanFromFile(payload.filepath, payload.flightPlanIndex);
                    this.sendStateUpdate();
                } catch (error) {
                    return createNotificationErrorPayload(error);
                }

                this.service.config.importDirectory = path.dirname(payload.filepath);

                return createNotificationPayload("Successfully imported file", "success");
            },
        );
        this.ipcMain.handle("flightplan:export-file", this.exportFile);
        this.ipcMain.handle("metar:fetch", this.fetchMetar);
        this.ipcMain.handle("flight-category:us:set", (event: IpcMainInvokeEvent, category: AeroflylightCategoryUs) => {
            this.service.setWeatherViaFlightCategory(category);
            this.sendStateUpdate();
        });
        this.ipcMain.handle(
            "flight-category:icao:set",
            (event: IpcMainInvokeEvent, category: AeroflylightCategoryIcao) => {
                this.service.setWeatherViaFlightCategoryIcao(category);
                this.sendStateUpdate();
            },
        );
    }

    private chooseMainMcfPath = async (
        event: IpcMainInvokeEvent,
        payload: SettingsWebComponentState,
    ): Promise<NotificationEventPayload<undefined>> => {
        const result = await dialog.showOpenDialog(this.win, {
            title: "Select Aerofly Main Configuration File",
            defaultPath:
                payload.mainMcfFilePath || (this.service.config.mainMcfFilePath ?? this.service.config.importDirectory),
            properties: ["openFile"],
            filters: [
                {
                    name: AeroflyMcfToImportFileConverter.fileName,
                    extensions: [AeroflyMcfToImportFileConverter.fileExtension],
                },
            ],
        });

        if (result.canceled) {
            return createNotificationPayload("");
        }

        try {
            this.service.config.mainMcfFilePath = path.dirname(result.filePaths[0]);
            this.sendStateUpdate();
        } catch (error) {
            return createNotificationErrorPayload(error);
        }

        return createNotificationPayload("Successfully located main.mcf file", "success");
    };

    private importSimbrief = async (
        event: IpcMainInvokeEvent,
        simBrief: ImportSimBriefWebComponentState,
    ): Promise<NotificationEventPayload<undefined>> => {
        try {
            this.service.config.simBriefUserName = simBrief.simBriefUserName;
            this.service.config.useSimBriefWeather = simBrief.useSimBriefWeather;
            await this.service.importFlightplanFromSimBrief(simBrief.simBriefUserName, simBrief.useSimBriefWeather);
            this.sendStateUpdate();
        } catch (error) {
            return createNotificationErrorPayload(error);
        }

        return createNotificationPayload("Successfully imported flightplan from SimBrief", "success");
    };

    private openDialogAndImportFile = async (): Promise<
        NotificationEventPayload<ImportWebComponentPayload | undefined>
    > => {
        const result = await dialog.showOpenDialog(this.win, {
            title: "Select Flight Plan File",
            defaultPath: this.service.config.importDirectory,
            properties: ["openFile"],
            filters: [
                {
                    name: "All supported file types",
                    extensions: IMPORT_FILE_TYPES,
                },
                {
                    name: AeroflyCustomMissionsTmcToAeroflyFlightConverter.fileName,
                    extensions: [AeroflyCustomMissionsTmcToAeroflyFlightConverter.fileExtension],
                },
                {
                    name: AeroflyMcfToImportFileConverter.fileName,
                    extensions: [AeroflyMcfToImportFileConverter.fileExtension],
                },
                {
                    name: MsfsPlnToAeroflyFlightConverter.fileName,
                    extensions: [MsfsPlnToAeroflyFlightConverter.fileExtension],
                },
                {
                    name: GarminFplToAeroflyFlightConverter.fileName,
                    extensions: [GarminFplToAeroflyFlightConverter.fileExtension],
                },
                {
                    name: XplaneFmsToAeroflyFlightConverter.fileName,
                    extensions: [XplaneFmsToAeroflyFlightConverter.fileExtension],
                },
            ],
        });

        if (result.canceled) {
            return createNotificationPayload("");
        }

        const filepath = result.filePaths[0];

        return this.importFlightplanFromFile(filepath);
    };

    async importFlightplanFromFile(
        filepath: string,
    ): Promise<NotificationEventPayload<ImportWebComponentPayload | undefined>> {
        try {
            const flightplans = this.service.getImportableFlightplans(filepath);
            if (flightplans.length > 1) {
                return createNotificationPayload<ImportWebComponentPayload>(
                    "Multiple flightplans found in file. Please select the desired flightplan in the app.",
                    "info",
                    {
                        flightplans,
                        filepath,
                    },
                );
            }

            this.service.importFlightplanFromFile(filepath);
            this.sendStateUpdate();
        } catch (error) {
            return createNotificationErrorPayload(error);
        }

        this.service.config.importDirectory = path.dirname(filepath);

        return createNotificationPayload("Successfully imported file", "success");
    }

    private exportFile = async (): Promise<NotificationEventPayload<undefined>> => {
        const result = await dialog.showSaveDialog(this.win, {
            title: "Select Flight Plan File",
            defaultPath: path.join(
                this.service.config.exportDirectory,
                `flight-${getFlightplanIdentifier(this.service.getAeroflyFlight())}.${AeroflyFlightToAeroflyCustomMissionsTmcConverter.fileExtension}`,
            ),
            filters: [
                {
                    name: AeroflyFlightToAeroflyCustomMissionsTmcConverter.fileName,
                    extensions: [AeroflyFlightToAeroflyCustomMissionsTmcConverter.fileExtension],
                },
                {
                    name: AeroflyFlightToAeroflyMainMcfConverter.fileName,
                    extensions: [AeroflyFlightToAeroflyMainMcfConverter.fileExtension],
                },
                {
                    name: AeroflyFlightToGeoJsonConverter.fileName,
                    extensions: [AeroflyFlightToGeoJsonConverter.fileExtension],
                },
                {
                    name: AeroflyFlightToKmlConverter.fileName,
                    extensions: [AeroflyFlightToKmlConverter.fileExtension],
                },
                {
                    name: AeroflyFlightToMarkdownConverter.fileName,
                    extensions: [AeroflyFlightToMarkdownConverter.fileExtension],
                },
            ],
        });

        if (result.canceled) {
            return createNotificationPayload("");
        }

        try {
            this.service.exportFlightplanToFile(result.filePath);
            this.sendStateUpdate();
        } catch (error) {
            return createNotificationErrorPayload(error);
        }

        this.service.config.exportDirectory = path.dirname(result.filePath);

        return createNotificationPayload("Successfully exported file", "success");
    };

    private fetchMetar = async (
        event: IpcMainInvokeEvent,
        args: { icao: string },
    ): Promise<NotificationEventPayload<undefined>> => {
        try {
            await this.service.setWeatherViaApi(args.icao);
            this.sendStateUpdate();
        } catch (error) {
            return createNotificationErrorPayload(error);
        }

        return createNotificationPayload("Successfully fetched METAR", "success");
    };

    private getMetar(): string {
        return this.metar.convert(this.service.getAeroflyFlight());
    }

    onClose() {
        this.writeMainMcf();
    }

    sendStateUpdate() {
        const state = new AppState(
            this.service.getAeroflyFlight(),
            this.service.getAircraftData(),
            this.service.getMaxRemainingPayload(),
            this.getMetar(),
            this.isMissingMainMcf,
            this.service.config,
        );
        this.win.webContents.send("state:update", state);
        this.startDebouncedWriteFile();
    }

    startDebouncedWriteFile() {
        if (this.writeTimer !== null) {
            clearTimeout(this.writeTimer);
        }

        this.writeTimer = setTimeout(() => {
            this.writeTimer = null;
            this.writeMainMcf();
        }, this.writeDelay);
    }
}
