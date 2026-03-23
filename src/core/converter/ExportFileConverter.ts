import { AeroflyFlight } from "@fboes/aerofly-custom-missions";

export interface ExportFileConverter {
  // static readonly fileExtension: string;

  convert(flightplan: AeroflyFlight): string;
}
