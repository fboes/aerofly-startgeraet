import { styleText } from "node:util";
export class HelpCommand {
    async execute() {
        process.stdout.write(HelpCommand.getExtendedHelpText());
        return 0;
    }
    static getHelpText() {
        return `\
Welcome to the Aerofly Startgerät. It allows you to set up your flight in a more convenient way.

You can select your aircraft, set fuel and payload, import flightplans and weather, and much more.

The Startgerät will then generate a configuration file that can be loaded in Aerofly FS 4.
`;
    }
    static getExtendedHelpText() {
        return `\
${HelpCommand.getHelpText()}
There are optional command line arguments that allow you to directly access specific features of the Startgerät. For example, you can use "metar" to directly fetch and display the current weather for a specific location.

Available commands:
  ${styleText(["blueBright"], "help, --help, -h")}    Show this help message
  ${styleText(["blueBright"], "setup")}               Run the initial setup wizard
  ${styleText(["blueBright"], "metar")}               Fetch and display current weather information
  ${styleText(["blueBright"], "simbrief")}            Import flight plans from Simbrief
  ${styleText(["blueBright"], "time")}                Display the current time in Aerofly FS 4

If you run the Startgerät without any arguments, it will launch an interactive menu that guides you through the setup process.

`;
        // For more detailed information on each command and its options, please refer to the documentation or run the command with the --help flag (e.g., "metar --help").
    }
}
