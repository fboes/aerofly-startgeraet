import { AeroflyFlight, AeroflySettingsWind, AeroflySettingsCloud } from "@fboes/aerofly-custom-missions";
import { ImportFileConverter } from "./ImportFileConverter.js";
import { metarParser } from "aewx-metar-parser";

export class ImportMetarConverter extends ImportFileConverter {
    convert(content: string, flightplan: AeroflyFlight, index = 0): void {
        if (index > 0) {
            throw new Error("File format only contains one set of information");
        }

        const metar = metarParser(content);

        flightplan.wind = new AeroflySettingsWind(
            metar.wind.speed_kts,
            metar.wind.degrees ?? 0,
            metar.wind.gust_kts ?? 0,
            metar.temperature.celsius ?? 14,
        );

        flightplan.clouds = metar.clouds.map((metarCloud) => {
            const cloud = AeroflySettingsCloud.createInFeet(0, metarCloud.feet);
            cloud.density_code = metarCloud.code;
            return cloud;
        });

        flightplan.visibility_meter = metar.visibility.meters;
    }
}
