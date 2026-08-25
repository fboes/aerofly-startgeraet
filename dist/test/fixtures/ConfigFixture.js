import { Config } from "../../core/io/Config.js";
import path from "node:path";
export class ConfigFixture extends Config {
    confFixture = {
        importDirectory: path.join(import.meta.dirname, "../../..", "src/test/fixtures"),
    };
    get(key, defaultValue = "") {
        return String(this.confFixture[key] ?? defaultValue);
    }
    set(key, value) {
        this.confFixture[key] = value;
    }
    getBoolean(key) {
        return Boolean(this.confFixture[key] ?? false);
    }
    setBoolean(key, value) {
        this.confFixture[key] = value;
    }
    getNumber(key, defaultValue = 0) {
        return Number(this.confFixture[key] ?? defaultValue);
    }
    setNumber(key, value) {
        this.confFixture[key] = value;
    }
    // protected getDate(key: string): Date {
    setDate(key, value) {
        this.confFixture[key] = value.toISOString();
    }
}
