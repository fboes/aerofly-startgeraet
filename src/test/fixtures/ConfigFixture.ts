import Conf from "conf";
import { Config, CONFIG_DEFAULTS, type ConfigStore } from "../../core/io/Config.js";
import { DIR_FIXTURE } from "../loadFixture.js";

/**
 * Use this `Config` for tests. Will be automatically cleared on invocation.
 *
 * `mainMcfFilePath` will be set to the fixture path to avoid damaging
 * production files or searching for non-existing files.
 */
export class ConfigFixture extends Config {
    public conf: ConfigStore;

    constructor(projectName: string) {
        super();

        this.conf = new Conf({
            projectName: "fixture-" + projectName,
            defaults: CONFIG_DEFAULTS,
        });

        this.conf.clear();
        this.mainMcfFilePath = DIR_FIXTURE;
        this.importDirectory = DIR_FIXTURE;
    }
}
