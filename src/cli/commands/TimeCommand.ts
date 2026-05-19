import { writeln } from "../formatter/CliFormatter.js";
import { ControllerCommand } from "./Command.js";

export class TimeCommand extends ControllerCommand {
    async execute(): Promise<number> {
        const timeAndDate = new Date().toISOString();

        this.controller.setTimeAndDate(timeAndDate);

        writeln(`Time and date set to ${timeAndDate}`);

        return 0;
    }
}
