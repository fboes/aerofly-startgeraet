import { Config } from "../../core/io/Config.js";
import path from "node:path";

export class ConfigFixture extends Config {
    private confFixture: { [key: string]: number | string | boolean } = {
        importDirectory: path.join(import.meta.dirname, "../../..", "src/test/fixtures"),
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

    protected getNumber(key: string, defaultValue: number = 0): number {
        return Number(this.confFixture[key] ?? defaultValue);
    }

    protected setNumber(key: string, value: number): void {
        this.confFixture[key] = value;
    }

    // protected getDate(key: string): Date {

    protected setDate(key: string, value: Date): void {
        this.confFixture[key] = value.toISOString();
    }
}
