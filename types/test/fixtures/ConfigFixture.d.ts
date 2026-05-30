import { Config } from "../../core/io/Config.js";
export declare class ConfigFixture extends Config {
    private confFixture;
    protected get(key: string, defaultValue?: string): string;
    protected set(key: string, value: string | number): void;
    protected getBoolean(key: string): boolean;
    protected setBoolean(key: string, value: boolean): void;
}
//# sourceMappingURL=ConfigFixture.d.ts.map
