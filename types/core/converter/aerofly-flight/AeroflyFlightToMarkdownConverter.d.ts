import type { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
export declare class AeroflyFlightToMarkdownConverter extends AeroflyFlightToStringConverter {
    static readonly fileName = "Markdown Text File";
    static readonly fileExtension = "md";
    convert(flightplan: AeroflyFlight): string;
    private getAircraftSummary;
    private getTimeSummary;
    private getWeatherSummary;
    private getFlightSummary;
    private numericOutput;
}
//# sourceMappingURL=AeroflyFlightToMarkdownConverter.d.ts.map