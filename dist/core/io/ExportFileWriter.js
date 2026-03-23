import fs from "node:fs";
export class ExportFileWriter {
    static exportFlightplanToFile(filePath, flightplan) {
        fs.writeFileSync(filePath, flightplan.toString(), "utf8");
    }
}
