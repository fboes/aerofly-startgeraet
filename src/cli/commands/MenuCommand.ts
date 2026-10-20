import { confirm, input, number, select, Separator } from "@inquirer/prompts";
import type { AeroflyFlightServiceCloud } from "../../core/services/AeroflyFlightService.js";
import { BaseControllerCommand } from "./ControllerCommand.base.js";
import { HelpCommand } from "./HelpCommand.js";
import { SetupCommand } from "./SetupCommand.js";
import path from "node:path";
import * as AeroflyFlightFormatter from "../../core/formatter/AeroflyFlightFormatter.js";
import { findAeroflyAircraft, getAllAeroflyAircraftWithLiveries } from "../../core/services/getAeroflyAircraft.js";
import { writeln, writeSuccess, writeMenuTitle, writeCatch, writeError } from "../formatter/writeCli.js";
import { EXPORT_FILE_EXTENSIONS } from "../../core/io/exportFlightplan.js";
import {
    executeMissionGenerator,
    getMissionGeneratorManifest,
    restoreMissionGeneratorValues,
    MISSIONS_GENERATOR_MANIFESTS,
    storeMissionGeneratorValues,
} from "../../mission-generator/MissionGenerator.js";
import { fmt } from "../../core/formatter/format.js";
import type { MissionGeneratorManifestField } from "../../mission-generator/MissionGenerator.type.js";

export type MenuCommandMethod = Exclude<keyof MenuCommand, "controller" | "writeMenuTitle" | "name" | "execute">;

/**
 * Providing menu options to set up the flight in a more convenient way.
 * The menu will then generate a configuration file that can be loaded in
 * Aerofly FS 4.
 */
export class MenuCommand extends BaseControllerCommand {
    async execute(): Promise<number> {
        process.stdout.write("\x1Bc");

        let next: MenuCommandMethod = "mainMenu";
        while (next !== "exit") {
            try {
                next = await this[next]();
            } catch (error) {
                if (error instanceof Error && error.name === "ExitPromptError") {
                    next = "exit";
                } else {
                    next = "mainMenu";
                    writeCatch(error);
                }
            }

            process.stdout.write("\n");
        }

        return 0;
    }

    async mainMenu(): Promise<MenuCommandMethod> {
        writeMenuTitle();

        const aeroflyFlight = this.controller.getAeroflyFlight();

        const choices = [
            {
                name: this.name("Aircraft", AeroflyFlightFormatter.getAircraft(aeroflyFlight)),
                value: "selectAircraft",
                short: "Select aircraft",
            },
            /*{
                name: this.name("Fuel / Payload", AeroflyFlightFormatter.getFuelAndPayload(aeroflyFlight), true),
                value: "setFuelAndPayload",
                short: "Set fuel and payload",
            },*/
            {
                name: this.name("Flightplan", AeroflyFlightFormatter.getFlightplanSummary(aeroflyFlight)),
                value: "importFlightplan",
                short: "Import / export flightplan",
                description: "Import / export flightplan, run mission generator",
            },
            {
                name: this.name("Time & Date", this.controller.getTimeAndDateCombinedString(), true),
                value: "setTimeAndDate",
                short: "Set time and date",
            },
            {
                name: this.name("Weather", AeroflyFlightFormatter.getCombinedFlightCategory(aeroflyFlight)),
                value: "importWeather",
                short: "Import weather",
                description: "Import METAR & TAF weather reports",
            },
            {
                name: this.name("Wind", AeroflyFlightFormatter.getWind(aeroflyFlight), true),
                value: "setWind",
                short: "Set wind",
            },
            {
                name: this.name("Temperature", AeroflyFlightFormatter.getTemperature(aeroflyFlight), true),
                value: "setTemperature",
                short: "Set thermal activity",
            },

            {
                name: this.name("Clouds", AeroflyFlightFormatter.getClouds(aeroflyFlight), true),
                value: "setClouds",
                short: "Set clouds",
            },
            {
                name: this.name("Visibility", AeroflyFlightFormatter.getVisibility(aeroflyFlight), true),
                value: "setVisibility",
                short: "Set visibility",
            },
            new Separator(),
            {
                name: "Configuration & Help",
                value: "setConfiguration",
                description: "Change basic settings of this application",
            },
            { name: "Save & Exit", value: "saveAndExit" },
        ];

        return (await select({
            message: "Select options",
            choices,
            pageSize: choices.length,
        })) as MenuCommandMethod;
    }

    async selectAircraft(): Promise<MenuCommandMethod> {
        writeMenuTitle(["Aircraft"]);
        const aeroflyCodeAircraft = await select({
            message: "Aircraft",
            default: this.controller.getAircraft(),
            choices: getAllAeroflyAircraftWithLiveries()
                .map((aircraft) => ({
                    name: aircraft.nameFull,
                    value: aircraft.aeroflyCode,
                    description: aircraft.icaoCode,
                }))
                .sort((a, b) => a.name.localeCompare(b.name)),
        });

        const liveries = findAeroflyAircraft(aeroflyCodeAircraft)?.liveries ?? [];

        const aeroflyCodeLivery =
            liveries.length > 1
                ? await select({
                      message: "Aircraft livery",
                      default: this.controller.getLivery(),
                      choices: liveries
                          .map((livery) => ({
                              name: livery.name,
                              value: livery.aeroflyCode !== "default" ? livery.aeroflyCode : "",
                              description: livery.icaoCode,
                          }))
                          .sort((a, b) => a.name.localeCompare(b.name)),
                  })
                : "";

        this.controller.setAircraft(aeroflyCodeAircraft, aeroflyCodeLivery);

        return "mainMenu";
    }

    async setFuelAndPayload(): Promise<MenuCommandMethod> {
        writeMenuTitle(["Fuel & Payload"]);
        const fuel = this.controller.getMaxFuel()
            ? await number({
                  message: fmt(`Fuel (kg) - max {{ maxFuel }} kg`, {
                      maxFuel: this.controller.getMaxFuel().toFixed(),
                  }),
                  default: this.controller.getFuel(),
                  min: 0,
                  max: this.controller.getMaxFuel(),
                  required: true,
              })
            : 0;

        this.controller.setFuel(fuel); // set fuel first to update max payload based on fuel weight

        const maxPayload = this.controller.getMaxRemainingPayload();

        const payload =
            maxPayload > 0
                ? await number({
                      message: fmt(`Payload (kg) - max {{ maxPayload }} kg`, {
                          maxPayload: maxPayload.toFixed(),
                      }),
                      default: this.controller.getPayload(),
                      min: 0,
                      max: maxPayload,
                      required: true,
                  })
                : 0;

        this.controller.setFuelAndPayload(fuel, payload);

        return "mainMenu";
    }

    async importFlightplan(): Promise<MenuCommandMethod> {
        writeMenuTitle(["Import Flightplan"]);

        writeln(
            fmt(`Current flightplan: {{ waypoints }}`, {
                waypoints: AeroflyFlightFormatter.getFlightplanWaypoints(this.controller.getAeroflyFlight()),
            }),
        );

        const isMissionGeneratorDisabled = MISSIONS_GENERATOR_MANIFESTS.length === 0;

        const simBriefUserName = this.controller.config.simBriefUserName;
        const importableFileChoices = this.controller
            .getImportFiles()
            .map((file) => ({ name: fmt(`Import from file {{ file }}`, { file }), value: file }));

        const choice = await select({
            message: "Import",
            choices: [
                {
                    name: simBriefUserName
                        ? fmt(`Import via SimBrief username {{ simBriefUserName }}`, { simBriefUserName })
                        : "Import via SimBrief - please set SimBrief username in configuration",
                    value: "simbrief",
                    disabled: !simBriefUserName,
                },
                importableFileChoices.length === 1
                    ? importableFileChoices[0]
                    : {
                          name: "Import local files",
                          value: "localFiles",
                          disabled: importableFileChoices.length === 1,
                      },
                {
                    name: "Mission generator",
                    value: "missionGenerator",
                    disabled: isMissionGeneratorDisabled,
                },
                {
                    name: "Export current flightplan to file",
                    value: "exportFlightplan",
                },
                new Separator(),
                this.getMainMenuChoice(),
            ],
        });

        if (choice === "mainMenu" || choice === "exportFlightplan" || choice === "missionGenerator") {
            return choice;
        }

        if (choice === "simbrief") {
            writeln(fmt(`Importing flightplan from SimBrief for user {{ simBriefUserName }}...`, { simBriefUserName }));
            await this.controller.importFlightplanFromSimBrief(
                simBriefUserName,
                this.controller.config.useSimBriefWeather,
            );
        } else {
            const filename =
                choice === "localFiles"
                    ? await select({
                          message: "Local files for import",
                          choices: importableFileChoices,
                      })
                    : choice;

            if (!filename) {
                throw new Error("No filename selected for import");
            }
            const flightplans = this.controller.getImportableFlightplans(filename);
            const index: string =
                flightplans.length === 1
                    ? "0"
                    : await select({
                          message: "Choose flightplan from file",
                          choices: flightplans.map((name, index) => {
                              return {
                                  name,
                                  value: String(index),
                              };
                          }),
                      });
            writeln(fmt(`Importing flightplan from file {{ filename }}...`, { filename }));
            this.controller.importFlightplanFromFile(filename, Number(index));
        }
        writeSuccess("Flightplan imported successfully");
        writeln(
            fmt(`Imported flightplan: {{ waypoints }}`, {
                waypoints: AeroflyFlightFormatter.getFlightplanWaypoints(this.controller.getAeroflyFlight()),
            }),
        );

        return "mainMenu";
    }

    async exportFlightplan(): Promise<MenuCommandMethod> {
        writeMenuTitle(["Export Flightplan"]);

        const fileType = await select({
            message: "Export file type",
            choices: EXPORT_FILE_EXTENSIONS.map((c) => ({
                name: c.name,
                value: c.extension,
            })),
        });

        const fileNameDefault = `flight-${AeroflyFlightFormatter.getFlightplanIdentifier(this.controller.getAeroflyFlight())}.${fileType}`;

        const fileName = await input({
            message: "Enter file name to export flightplan",
            default: fileNameDefault,
            required: true,
        });

        const filePath = path.join(this.controller.config.exportDirectory, fileName);

        await this.controller.exportFlightplanToFile(filePath);
        writeSuccess(fmt(`Flightplan exported successfully to {{ filePath }}`, { filePath }));

        return "mainMenu";
    }

    async missionGenerator(): Promise<MenuCommandMethod> {
        writeMenuTitle(["Mission Generator"]);

        const choice = await select({
            message: "Mission Generator",
            choices: [
                ...MISSIONS_GENERATOR_MANIFESTS.map((manifest) => ({
                    name: manifest.displayName,
                    value: manifest.name,
                    description: manifest.description,
                })),

                new Separator(),
                this.getMainMenuChoice(),
            ],
        });

        if (choice === "mainMenu") {
            return choice;
        }

        return this.missionGeneratorExecute(choice);
    }

    private async missionGeneratorExecute(generatorName: string): Promise<MenuCommandMethod> {
        const savedValues = restoreMissionGeneratorValues(this.controller.config, generatorName);
        const manifest = getMissionGeneratorManifest(generatorName, savedValues);

        writeMenuTitle(["Mission Generator", manifest.displayName]);
        writeln(manifest.longDescription);

        const generatorConfiguration: Record<string, string | number | boolean | undefined> = {};
        for (const field of manifest.configuration ?? []) {
            generatorConfiguration[field.name] = await this.missionGeneratorField(field);
        }

        const success = await executeMissionGenerator(this.controller, generatorName, generatorConfiguration);
        if (success) {
            storeMissionGeneratorValues(this.controller.config, generatorName, generatorConfiguration);
            writeSuccess(
                fmt(`Mission generator {{ generatorName }} executed successfully, flight plan has been updated`, {
                    generatorName,
                }),
            );
        } else {
            writeError("Mission generator failed and did not update the flight plan. Please check your input.");
        }

        return "mainMenu";
    }

    private async missionGeneratorField(
        field: MissionGeneratorManifestField,
    ): Promise<string | number | boolean | undefined> {
        const message = field.title ?? field.name + (field.unit ? ` (${field.unit})` : "");

        if (field.enum) {
            return select({
                message,
                choices: field.enum.map((e) => String(e)),
                default: field.default ? String(field.default) : undefined,
            });
        }

        switch (field.type) {
            case "number":
            case "integer":
                return number({
                    message,
                    required: field.isRequired,
                    min: field.minimum,
                    max: field.maximum,
                    step: field.multipleOf,
                    default: field.default ? Number(field.default) : undefined,
                });
            case "boolean":
                return confirm({
                    message,
                });
            default:
                return input({
                    message,
                    required: field.isRequired,
                    default: field.default ? String(field.default) : undefined,
                });
        }
        return undefined;
    }

    async setTimeAndDate(): Promise<MenuCommandMethod> {
        writeMenuTitle(["Time & Date"]);

        const departureTimeZoneUTCString = this.controller.getDepartureTimeZoneUTCString();
        const choice = await select({
            message: "Time & Date",
            choices: [
                {
                    name: "Use current time and date",
                    value: "sync",
                },
                {
                    name: "Set manually (UTC)",
                    value: "UTC",
                },
                {
                    name: fmt(`Set manually ({{ departureTimeZoneUTCString }})`, { departureTimeZoneUTCString }),
                    value: departureTimeZoneUTCString,
                    disabled: departureTimeZoneUTCString === "UTC",
                },
                new Separator(),
                this.getMainMenuChoice(),
            ],
        });

        if (choice === "mainMenu") {
            return "mainMenu";
        }

        const timeAndDate =
            choice === "sync"
                ? new Date().toISOString()
                : await this.setTimeAndDateManual(
                      choice,
                      choice === "UTC" ? "Z" : this.controller.getDepartureTimeZoneString(),
                      choice === "UTC" ? this.controller.getTimeAndDate() : this.controller.getTimeAndDateDeparture(),
                  );

        this.controller.setTimeAndDate(timeAndDate);

        return "mainMenu";
    }

    private async setTimeAndDateManual(
        timeZoneUTCName: string,
        timeZoneName: string,
        timeValue: Date,
    ): Promise<string> {
        const time = await input({
            message: fmt(`Date ({{timeZoneUTCName}})`, { timeZoneUTCName }),
            default: timeValue.toISOString().slice(0, 10),
            required: true,
            validate(value) {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    return "Please enter a valid date (YYYY-MM-DD)";
                }
                return true;
            },
        });

        const date = await input({
            message: fmt(`Time ({{timeZoneUTCName}})`, { timeZoneUTCName }),
            default: timeValue.toISOString().slice(11, 16),
            required: true,
            validate(value) {
                const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
                if (!timeRegex.test(value)) {
                    return "Please enter a valid time (HH:MM)";
                }
                return true;
            },
        });

        return `${time}T${date}${timeZoneName}`;
    }

    async importWeather(): Promise<MenuCommandMethod> {
        writeMenuTitle(["Import Weather"]);

        const choice = await select({
            message: "Import weather",
            choices: [
                {
                    name: fmt(`Import weather via API for {{ airport }}`, {
                        airport: this.controller.getFlightplanDepartureAirportString(),
                    }),
                    value: this.controller.getFlightplanDepartureAirportString(),
                },
                {
                    name: fmt(`Import weather via API for {{ airport }}`, {
                        airport: this.controller.getFlightplanArrivalAirportString(),
                    }),
                    value: this.controller.getFlightplanArrivalAirportString(),
                },
                {
                    name: fmt(`Import weather by METAR code for {{ airport }}`, {
                        airport: this.controller.getFlightplanArrivalAirportString(),
                    }),
                    value: `metar`,
                },
                new Separator(),
                this.getMainMenuChoice(),
            ],
        });

        if (choice === "mainMenu") {
            return "mainMenu";
        }

        if (choice === "metar") {
            const metar = await input({
                message: "Enter METAR code",
            });
            this.controller.setWeatherFromMETAR(metar);
        } else {
            writeln(fmt(`Importing METAR for {{ airport }}...`, { airport: choice }));
            await this.controller.setWeatherViaApi(choice);
        }
        writeSuccess(fmt(`Weather imported successfully for {{ airport }}`, { airport: choice }));

        return "mainMenu";
    }

    async setWind(): Promise<MenuCommandMethod> {
        writeMenuTitle(["Wind"]);
        const windSpeedKts = await number({
            message: "Wind speed (kts)",
            default: this.controller.getWindSpeed(),
            min: 0,
            max: 200,
            required: true,
        });
        const windDirectionDegrees = await number({
            message: "Wind direction (°)",
            default: this.controller.getWindDirection(),
            min: 0,
            max: 360,
            required: true,
        });
        const gustsKts = await number({
            message: "Gusts (kts)",
            default: this.controller.getWindGusts(),
            min: 0,
            max: 200,
            required: false,
        });

        this.controller.setWind(windDirectionDegrees, windSpeedKts, gustsKts);

        return "mainMenu";
    }

    async setTemperature(): Promise<MenuCommandMethod> {
        writeMenuTitle(["Temperature"]);
        const temperatureCelsius = await number({
            message: "Temperature (°C)",
            default: Math.round(this.controller.getTemperature()),
            min: -50,
            max: 50,
            required: true,
        });

        this.controller.setTemperature(temperatureCelsius);

        return "mainMenu";
    }

    async setVisibility(): Promise<MenuCommandMethod> {
        writeMenuTitle(["Visibility"]);

        const visibilitySM = Number(this.controller.getVisibilitySM().toPrecision(3));
        const visibilityM = this.controller.getVisibilityM();

        const visibility = await number({
            message: "Visibility (SM / m)",
            default: Math.round(visibilitySM % 1 === 0 ? Math.round(visibilitySM) : visibilityM),
            min: 0,
            required: true,
        });

        if (visibility <= 10) {
            this.controller.setVisibilitySM(visibility);
        } else {
            this.controller.setVisibilityM(visibility);
        }

        return "mainMenu";
    }

    async setClouds(): Promise<MenuCommandMethod> {
        writeMenuTitle(["Clouds"]);

        const clouds = this.controller.getClouds();
        const cloudData: AeroflyFlightServiceCloud[] = [
            await this.setCloud(0, clouds[0]),
            await this.setCloud(1, clouds[1]),
            await this.setCloud(2, clouds[2]),
        ];

        this.controller.setClouds(cloudData);

        return "mainMenu";
    }

    private async setCloud(index = 0, cloud?: AeroflyFlightServiceCloud): Promise<AeroflyFlightServiceCloud> {
        let cloudLayer = "Cumulus";
        switch (index) {
            case 1:
                cloudLayer = "Cumulus Mediocris";
                break;
            case 2:
                cloudLayer = "Cirrus";
                break;
        }

        const base_feet_agl = await number({
            message: fmt(`{{ cloudLayer }} base (ft)`, { cloudLayer }),
            default: cloud ? Math.round(cloud.base_feet_agl) : 0,
            min: 0,
            max: 50000,
            required: true,
        });

        const choices = [
            { name: "0/8 Clear", value: "0" },
            { name: "1/8 Few", value: "1" },
            { name: "2/8 Few", value: "2" },
            { name: "3/8 Scattered", value: "3" },
            { name: "4/8 Scattered", value: "4" },
            { name: "5/8 Broken", value: "5" },
            { name: "6/8 Broken", value: "6" },
            { name: "7/8 Broken", value: "7" },
            { name: "8/8 Overcast", value: "8" },
        ];
        const cloud_coverage =
            (base_feet_agl > 0
                ? Number(
                      await select({
                          message: fmt(`{{ cloudLayer }} coverage`, { cloudLayer }),
                          default: cloud ? String(Math.round(cloud.cloud_coverage * 8)) : "0",
                          choices,
                          pageSize: choices.length,
                      }),
                  )
                : 0) / 8;

        return {
            base_feet_agl,
            cloud_coverage,
        };
    }

    async setConfiguration(): Promise<MenuCommandMethod> {
        writeMenuTitle(["Configuration & Help"]);

        process.stdout.write(HelpCommand.getHelpText());
        await SetupCommand.configure(this.controller.config);

        return "mainMenu";
    }

    saveAndExit(): MenuCommandMethod {
        process.stdout.write("Saving flightplan...\n");
        this.controller.writeFile();
        writeSuccess("Flightplan saved successfully");

        return "exit";
    }

    exit() {
        return null;
    }

    private name(option: string, value: string, sub: boolean = false): string {
        if (sub) {
            option = ` ↳ ${option}`;
        }
        if (!value) {
            return option;
        }
        return `${option.padEnd(20)} ⇒ ${value}`;
    }

    private getMainMenuChoice(): { name: string; value: MenuCommandMethod } {
        return { name: "Return to main menu", value: "mainMenu" };
    }
}
