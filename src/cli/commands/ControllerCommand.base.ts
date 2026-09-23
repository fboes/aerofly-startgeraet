import type { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
import type { ControllerCommand } from "./ControllerCommand.interface.js";

export abstract class BaseControllerCommand implements ControllerCommand {
    constructor(public controller: AeroflyFlightService) {}

    abstract execute(): Promise<number>;
}
