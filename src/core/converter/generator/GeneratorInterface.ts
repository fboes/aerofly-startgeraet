import type { AeroflyFlightService } from "../../services/AeroflyFlightService.js";
import type { z } from "zod";

export type GeneratorManifest = {
    name: string;
    description: string;
    version: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface GeneratorInterface<S extends z.ZodRawShape> {
    manifest(): GeneratorManifest;
    configuration(): z.ZodObject<S>;
    convert(configuration: z.infer<z.ZodObject<S>>, flightPlanService: AeroflyFlightService): void;
}
