import { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
export interface Command {
    execute: () => Promise<number>;
}
export declare abstract class ControllerCommand implements Command {
    controller: AeroflyFlightService;
    constructor(controller: AeroflyFlightService);
    abstract execute(): Promise<number>;
}
//# sourceMappingURL=Command.d.ts.map