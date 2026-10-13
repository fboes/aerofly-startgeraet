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

export type MissionGeneratorManifestField = {
    name: string;
    label: string;
    type: "string" | "number";
    required: boolean;
    default?: string | number;
    min?: number;
    max?: number;
    // Only applicable for `type:"number"`
    step?: number;
    // Only applicable for `type:"string"`
    pattern?: number;
};
