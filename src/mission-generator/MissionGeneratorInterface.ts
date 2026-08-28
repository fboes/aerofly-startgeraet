import type { z } from "zod";
import type { AeroflyFlightService } from "../core/services/AeroflyFlightService.js";

/**
 * Describes the purpose of a Mission Generator to the user
 */
export type MissionGeneratorManifest = {
    /**
     * Technical identifier, the name cannot contain any non-URL-safe characters.
     */
    name: string;
    /**
     * Plain text, brief name
     */
    displayName: string;
    /**
     * Multi-line description. If in doubt use Markdown
     */
    description: string;
    /**
     * SEM ver, e.g. "2.0.0"
     */
    version: string;
};

/**
 * Interface for a Mission Generator. It provides a manifest which describes the
 * Mission Generator to the use, a configuration for the user to change settings
 * for a mission to be generated, and the actual process for generating a
 * mission using the configuration.
 */
export interface MissionGeneratorInterface<S extends z.ZodRawShape> {
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
     */
    convert(configuration: z.infer<z.ZodObject<S>>, flightPlanService: AeroflyFlightService): void;
}
