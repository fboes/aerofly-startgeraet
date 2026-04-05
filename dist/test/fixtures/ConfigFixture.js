import { Config } from "../../core/io/Config.js";
export class ConfigFixture extends Config {
    confFixture = {
        importDirectory: "./src/test/fixtures",
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
}
