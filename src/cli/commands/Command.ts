import { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";

export interface Command {
    execute: () => Promise<number>;
}

export abstract class ControllerCommand implements Command {
    constructor(public controller: AeroflyFlightService) {}

    abstract execute(): Promise<number>;
}
