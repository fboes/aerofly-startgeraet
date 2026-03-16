import { input, number, select, confirm, Separator } from "@inquirer/prompts";
import { styleText } from "node:util";
import { Controller, ControllerCloud } from "../controller/Controller.js";
import { Config } from "../model/Config.js";

export type CliMenuMethod = Exclude<keyof CliMenu, "controller" | "showMenuTitle" | "name">;

/**
 * Providing menu options to set up the flight in a more convenient way.
 * The menu will then generate a configuration file that can be loaded in
 * Aerofly FS 4.
 */
export class CliMenu {
  constructor(public controller: Controller) {}

  async mainMenu(): Promise<CliMenuMethod> {
    this.showMenuTitle();

    const choices = [
      {
        name: this.name("Aircraft", this.controller.getAircraftString()),
        value: "selectAircraft",
        short: "Select aircraft",
      },
      {
        name: this.name("Fuel / Payload", this.controller.getFuelAndPayloadString(), true),
        value: "setFuelAndPayload",
        short: "Set fuel and payload",
      },
      {
        name: this.name("Flightplan", this.controller.getFlightplanString()),
        value: "importFlightplan",
        short: "Import flightplan",
      },
      {
        name: this.name("Time & Date", this.controller.getTimeAndDateCombinedString(), true),
        value: "setTimeAndDate",
        short: "Set time and date",
      },
      { name: "Weather", value: "importWeather", short: "Import weather" },
      { name: this.name("Wind", this.controller.getWindString(), true), value: "setWind", short: "Set wind" },
      {
        name: this.name("Temperature", this.controller.getTemperatureString(), true),
        value: "setTemperature",
        short: "Set thermal activity",
      },

      {
        name: this.name("Clouds", this.controller.getCloudsString(), true),
        value: "setClouds",
        short: "Set clouds",
      },
      {
        name: this.name("Visibility", this.controller.getVisibilityString(), true),
        value: "setVisibility",
        short: "Set visibility",
      },
      new Separator(),
      { name: "Configuration & Help", value: "setConfiguration" },
      { name: "Save & Exit", value: "saveAndExit" },
    ];

    return (await select({
      message: "Select options",
      choices,
      pageSize: choices.length,
    })) as CliMenuMethod;
  }

  async selectAircraft(): Promise<CliMenuMethod> {
    this.showMenuTitle(["Aircraft"]);
    const aeroflyCodeAircraft = await select({
      message: "Aircraft",
      default: this.controller.getAircraft(),
      choices: this.controller
        .getAllAircraftData()
        .map((livery) => ({
          name: livery.nameFull,
          value: livery.aeroflyCode,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    });

    const liveries = this.controller.getAircraftLiveriesData(aeroflyCodeAircraft);

    const aeroflyCodeLivery = await select({
      message: "Aircraft livery",
      default: this.controller.getLivery(),
      choices: liveries
        .map((livery) => ({
          name: livery.name,
          value: livery.aeroflyCode !== "default" ? livery.aeroflyCode : "",
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    });

    this.controller.setAircraft(aeroflyCodeAircraft, aeroflyCodeLivery);

    return "mainMenu";
  }

  async setFuelAndPayload(): Promise<CliMenuMethod> {
    this.showMenuTitle(["Fuel & Payload"]);
    const fuel = this.controller.getMaxFuel()
      ? await number({
          message: `Fuel (kg) - max ${this.controller.getMaxFuel()} kg`,
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
            message: `Payload (kg) - max ${maxPayload} kg`,
            default: this.controller.getPayload(),
            min: 0,
            max: maxPayload,
            required: true,
          })
        : 0;

    this.controller.setFuelAndPayload(fuel, payload);

    return "mainMenu";
  }

  async importFlightplan(): Promise<CliMenuMethod> {
    this.showMenuTitle(["Import Flightplan"]);

    Cli.writeln(`Current flightplan: ${this.controller.getFlightplanWaypointsString()}`);

    const simBriefUserName = this.controller.config.simBriefUserName;
    const importableFileChoices = this.controller
      .getImportFiles()
      ?.map((file) => ({ name: `Import from file ${file}`, value: file })) ?? [
      {
        name: "No local import files found",
        value: "",
        disabled: true,
      },
    ];

    const choice = await select({
      message: "Import",
      choices: [
        {
          name: simBriefUserName
            ? `Import via Simbrief username ${simBriefUserName}`
            : "Import via Simbrief - please set SimBrief username in configuration",
          value: "simbrief",
          disabled: !simBriefUserName,
        },
        ...importableFileChoices,
        new Separator(),
        this.getMainMenuChoice(),
      ],
    });

    if (choice === "mainMenu") {
      return choice;
    }

    if (choice === "simbrief") {
      Cli.writeln(`Importing flightplan from SimBrief for user ${simBriefUserName}...`);
      await this.controller.importFlightplanFromSimBrief(
        simBriefUserName,
        this.controller.config.simBriefWeatherFromDestination,
      );
    } else {
      Cli.writeln(`Importing flightplan from file ${choice}...`);
      await this.controller.importFlightplanFromFile(choice);
    }
    Cli.writeSuccess("Flightplan imported successfully");
    Cli.writeln(`Imported flightplan: ${this.controller.getFlightplanWaypointsString()}`);

    return "mainMenu";
  }

  async setTimeAndDate(): Promise<CliMenuMethod> {
    this.showMenuTitle(["Time & Date"]);

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
          name: `Set manually (${departureTimeZoneUTCString})`,
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

  protected async setTimeAndDateManual(
    timeZoneUTCName: string,
    timeZoneName: string,
    timeValue: Date,
  ): Promise<string> {
    const time = await input({
      message: `Date (${timeZoneUTCName})`,
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
      message: `Time (${timeZoneUTCName})`,
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

  async importWeather(): Promise<CliMenuMethod> {
    this.showMenuTitle(["Import Weather"]);

    const choice = await select({
      message: "Import weather from API",
      choices: [
        {
          name: `Import weather for ${this.controller.getFlightplanDepartureAirportString()}`,
          value: this.controller.getFlightplanDepartureAirportString(),
        },
        {
          name: `Import weather for ${this.controller.getFlightplanArrivalAirportString()}`,
          value: this.controller.getFlightplanArrivalAirportString(),
        },
        new Separator(),
        this.getMainMenuChoice(),
      ],
    });

    if (choice === "mainMenu") {
      return "mainMenu";
    }

    Cli.writeln(`Importing METAR for ${choice}...`);
    await this.controller.setWeatherFromMETAR(choice);
    Cli.writeSuccess("Weather imported successfully");

    return "mainMenu";
  }

  async setWind(): Promise<CliMenuMethod> {
    this.showMenuTitle(["Wind"]);
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

  async setTemperature(): Promise<CliMenuMethod> {
    this.showMenuTitle(["Temperature"]);
    const temperatureCelsius = await number({
      message: "Temperature (°C)",
      default: this.controller.getTemperature(),
      min: -50,
      max: 50,
      required: true,
    });

    this.controller.setTemperature(temperatureCelsius);

    return "mainMenu";
  }

  async setVisibility(): Promise<CliMenuMethod> {
    this.showMenuTitle(["Visibility"]);

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

  async setClouds(): Promise<CliMenuMethod> {
    this.showMenuTitle(["Clouds"]);

    const clouds = this.controller.getClouds();
    const cloudData: ControllerCloud[] = [
      await this.setCloud(0, clouds[0]),
      await this.setCloud(1, clouds[1]),
      await this.setCloud(2, clouds[2]),
    ];

    this.controller.setClouds(cloudData);

    return "mainMenu";
  }

  protected async setCloud(index = 0, cloud?: ControllerCloud): Promise<ControllerCloud> {
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
      message: `${cloudLayer} base (ft)`,
      default: cloud ? cloud.base_feet_agl : 0,
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
              message: `${cloudLayer} coverage`,
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

  async setConfiguration(): Promise<CliMenuMethod> {
    this.showMenuTitle(["Configuration & Help"]);
    process.stdout.write(`\
  Welcome to the Aerofly Startgerät. It allows you to set up your flight in a
  more convenient way.

  You can select your aircraft, set fuel and payload, import flightplans
  and weather, and much more.

  The Startgerät will then generate a configuration file that can be
  loaded in Aerofly FS 4.

`);

    const mainMcfFilePath = await input({
      message: "Path to main.mcf file",
      default: this.controller.config.mainMcfFilePath ?? "",
      required: true,
    });

    this.controller.config.mainMcfFilePath = mainMcfFilePath;

    const simbriefUserName = await input({
      message: "SimBrief username (for flightplan import)",
      default: this.controller.config.simBriefUserName,
      required: false,
      validate(value) {
        if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
          return "Please enter a valid SimBrief username (alphanumeric and underscores only)";
        }
        return true;
      },
    });

    this.controller.config.simBriefUserName = simbriefUserName;

    const simBriefWeatherFromDestination = await confirm({
      message: "Use SimBrief weather from destination airport (instead of departure airport)?",
      default: this.controller.config.simBriefWeatherFromDestination,
    });

    this.controller.config.simBriefWeatherFromDestination = simBriefWeatherFromDestination;

    const importDirectory = await input({
      message: "Import directory for local flightplan files (e.g. .pln files)",
      default: this.controller.config.importDirectory,
      required: true,
    });

    this.controller.config.importDirectory = importDirectory;

    const syncTimeOnStartup = await confirm({
      message: "Autmmoatically synchronize time / date on start-up",
      default: this.controller.config.syncTimeOnStartup,
    });

    this.controller.config.syncTimeOnStartup = syncTimeOnStartup;

    Cli.writeSuccess("Configuration saved successfully.");

    return "mainMenu";
  }

  saveAndExit(): CliMenuMethod {
    process.stdout.write("Saving flightplan...\n");
    this.controller.writeFile();
    Cli.writeSuccess("Flightplan saved successfully");

    return "exit";
  }

  exit() {
    return null;
  }

  protected showMenuTitle(titles: string[] = []) {
    process.stdout.write(["Aerofly Startgerät", ...titles].join(" → ") + "\n");
  }

  protected name(option: string, value: string, sub: boolean = false): string {
    if (sub) {
      option = ` ↳ ${option}`;
    }
    if (!value) {
      return option;
    }
    return `${option.padEnd(20)} ⇒ ${value}`;
  }

  protected getMainMenuChoice(): { name: string; value: CliMenuMethod } {
    return { name: "Return to main menu", value: "mainMenu" };
  }
}

export class CliSetup {
  constructor(protected config: Config) {}

  async setup(): Promise<void> {
    process.stdout.write(`\

Welcome to the Aerofly Startgerät. It allows you to set up your flight in a more
convenient way.

As the Startgerät is missing some configuration, we need to set it up first.
Please provide the following information to get started.

Please note that you can change all of these settings later in the configuration
menu.

`);

    const mainMcfFilePath = await input({
      message: "Path to main.mcf file",
      default: this.config.mainMcfFilePath ?? "",
      required: true,
    });

    this.config.mainMcfFilePath = mainMcfFilePath;

    Cli.writeSuccess("Configuration saved successfully.");
  }
}

/**
 * Helper class to write styled messages to the console.
 */
export class Cli {
  static writeln(message: string) {
    process.stdout.write("  " + message + "\n");
  }

  static writeSuccess(message: string) {
    process.stdout.write(styleText("green", "✓ " + message + "\n"));
  }

  static writeError(message: string) {
    process.stdout.write(styleText("red", "⚠  " + message + "\n"));
  }

  static writeCatch(error: unknown) {
    Cli.writeError(error instanceof Error ? error.message : String(error));
  }
}
