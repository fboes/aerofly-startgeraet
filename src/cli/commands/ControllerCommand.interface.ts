export interface ControllerCommand {
    execute(): Promise<number>;
}
