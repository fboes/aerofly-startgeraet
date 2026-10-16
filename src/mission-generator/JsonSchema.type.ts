/**
 * Possibly in need for replacement via `npm install --save @types/json-schema`
 */

export type JsonSchemaType = "null" | "boolean" | "object" | "array" | "number" | "string" | "integer";

export type JsonSchemaValue = null | boolean | number | string | JsonSchemaValue[] | { [key: string]: JsonSchemaValue };

export type JsonSchemaObject = {
    type?: JsonSchemaType | JsonSchemaType[];
    title?: string;
    description?: string;
    default?: JsonSchemaValue;
    enum?: JsonSchemaValue[];
    properties?: Record<string, JsonSchemaObject>;
    required?: string[];

    // Number / Integer
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number;
    exclusiveMaximum?: number;
    multipleOf?: number;

    // String
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: string;

    // Custom
    unit?: string;
};
