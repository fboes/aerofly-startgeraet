import { Config } from "../../core/io/Config.js";

export class ConfigFixture extends Config {
    private confFixture: { [key: string]: number | string | boolean } = {
        importDirectory: "./src/test/fixtures",
    };

    protected get(key: string, defaultValue: string = ""): string {
        return String(this.confFixture[key] ?? defaultValue);
    }

    protected set(key: string, value: string | number): void {
        this.confFixture[key] = value;
    }

    protected getBoolean(key: string): boolean {
        return Boolean(this.confFixture[key] ?? false);
    }

    protected setBoolean(key: string, value: boolean): void {
        this.confFixture[key] = value;
    }
}
