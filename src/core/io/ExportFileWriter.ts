import fs from "node:fs";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";

export class ExportFileWriter {
  static exportFlightplanToFile(filePath: string, flightplan: AeroflyFlight): void {
    fs.writeFileSync(filePath, flightplan.toString(), "utf8");
  }
}
