import { writeln } from "../formatter/writeCli.js";
import { BaseControllerCommand } from "./ControllerCommand.base.js";

export class TimeCommand extends BaseControllerCommand {
    async execute(): Promise<number> {
        const timeAndDate = new Date().toISOString();

        this.controller.setTimeAndDate(timeAndDate);

        writeln(`Time and date set to ${timeAndDate}`);

        return 0;
    }
}
