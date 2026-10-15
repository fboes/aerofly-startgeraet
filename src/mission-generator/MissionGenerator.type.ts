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
     * Single-line description.
     */
    description: string;
    /**
     * Multi-line, extended description. If in doubt use Markdown.
     */
    longDescription: string;
    /**
     * SEM ver, e.g. "2.0.0"
     */
    version: string;
    /**
     * Configuration fields (can be converted into form elements)
     */
    configuration?: MissionGeneratorManifestField[];
};

export type ZodSchemaProperty = {
    type: string;
    title?: string;
    description?: string;
    unit?: string;
    minimum?: number;
    maximum?: number;
    default?: number | string;
};

export type MissionGeneratorManifestField = ZodSchemaProperty & {
    name: string;
    required: boolean;
};
