import Conf from "conf";
import { Config, CONFIG_DEFAULTS, type ConfigStore } from "../../core/io/Config.js";
import { getFixturePath } from "../loadFixture.js";

/**
 * Use this `Config` for tests. Will be automatically cleared on invocation.
 *
 * `mainMcfFilePath` will be set to the fixture path to avoid damaging
 * production files or searching for non-existing files.
 */
export class ConfigFixture extends Config {
    protected readonly conf: ConfigStore = new Conf({
        projectName: "startgeraet-fixture",
        defaults: CONFIG_DEFAULTS,
    });

    constructor() {
        super();
        this.conf.clear();
        this.mainMcfFilePath = getFixturePath();
        this.importDirectory = getFixturePath();
    }
}
