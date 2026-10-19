import type { z } from "zod";
import type { AeroflyFlightService } from "../core/services/AeroflyFlightService.js";
import type { MissionGeneratorManifest } from "./MissionGenerator.type.js";

/**
 * Interface for a Mission Generator. It provides a manifest which describes the
 * Mission Generator to the use, a configuration for the user to change settings
 * for a mission to be generated, and the actual process for generating a
 * mission using the configuration.
 */
export interface MissionGenerator<S extends z.ZodRawShape> {
    /**
     * Describes the purpose of a Mission Generator to the user
     */
    manifest(): MissionGeneratorManifest;

    /**
     * Provides a configuration object the user may change settings for the
     * mission to be generated.
     *
     * The configuration will be shown to the user by converting it into a
     * GUI form.
     */
    configuration(): z.ZodObject<S>;

    /**
     * Provides the actual conversion to change the current mission setup
     * to the generated mission. It takes into account the `configuration`
     * provided by the user, as well as the current state of the mission setup.
     * Changes to the mission setup are done via the pass-by-reference
     * `flightPlanService`.
     *
     * @returns if conversion was successful
     */
    convert(configuration: z.infer<z.ZodObject<S>>, flightPlanService: AeroflyFlightService): Promise<boolean>;
}
