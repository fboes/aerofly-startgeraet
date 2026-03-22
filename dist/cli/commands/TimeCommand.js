import { CliFormatter } from "../formatter/CliFormatter.js";
import { ControllerCommand } from "./Command.js";
export class TimeCommand extends ControllerCommand {
    async execute() {
        const timeAndDate = new Date().toISOString();
        this.controller.setTimeAndDate(timeAndDate);
        CliFormatter.writeln(`Time and date set to ${timeAndDate}`);
        return 0;
    }
}
