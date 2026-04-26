import { AeroflyFlight, AeroflySettingsWind, AeroflySettingsCloud } from "@fboes/aerofly-custom-missions";
import { StringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
import { metarParser } from "aewx-metar-parser";

export class MetarToAeroflyFlightConverter extends StringToAeroflyFlightConverter {
    getIndices(content: string): string[] {
        return this.getLines(content);
    }

    convert(content: string, flightplan: AeroflyFlight, index = 0): void {
        const lines = this.getLines(content);
        const metarString = lines.at(index);
        if (metarString === undefined) {
            throw new Error("Metar index does nnot exist");
        }

        const metar = metarParser(metarString);

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

    protected getLines(content: string): string[] {
        return content.split(/\n/);
    }
}
