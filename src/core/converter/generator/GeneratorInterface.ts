import type { AeroflyFlightService } from "../../services/AeroflyFlightService.js";
import { z } from "zod";

interface GeneratorInterface<S extends z.ZodRawShape> {
    configuration(): z.ZodObject<S>;
    convert(configuration: z.infer<z.ZodObject<S>>, flightPlanService: AeroflyFlightService): void;
}
