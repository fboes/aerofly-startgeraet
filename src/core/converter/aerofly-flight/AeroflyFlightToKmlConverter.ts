import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter, ExportFileConverterWaypointType } from "./AeroflyFlightToStringConverter.js";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";

type KeyholeMarkupLanguageRouteStyle = {
    id: ExportFileConverterWaypointType | "aircraft";
    iconHref: string;
};

export class AeroflyFlightToKmlConverter extends AeroflyFlightToStringConverter {
    static readonly fileExtension = "kml";

    convert(flightplan: AeroflyFlight): string {
        const routeColor = "9314ff";

        const styles: KeyholeMarkupLanguageRouteStyle[] = [
            { id: "airport", iconHref: "https://maps.google.com/mapfiles/kml/shapes/airports.png" },
            { id: "runway", iconHref: "https://maps.google.com/mapfiles/kml/shapes/target.png" },
            { id: "waypoint", iconHref: "http://maps.google.com/mapfiles/kml/shapes/triangle.png" },
            { id: "navaid", iconHref: "https://maps.google.com/mapfiles/kml/shapes/polygon.png" },
            { id: "aircraft", iconHref: "https://maps.google.com/mapfiles/kml/shapes/airports.png" },
        ];

        return `\
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${this.xml(this.getFlightplanTitle(flightplan))}</name>
    <Style id="flightplan">
      <LineStyle>
        <color>ff${routeColor}</color>
        <width>6</width>
      </LineStyle>
      <PolyStyle>
        <color>44${routeColor}</color>
      </PolyStyle>
    </Style>
${styles
    .map((style) => {
        return `\
    <Style id="${style.id}">
      <IconStyle>
        <Icon>
          <href>${style.iconHref}</href>
        </Icon>
      </IconStyle>
      <color>ffffffff</color>
    </Style>`;
    })
    .join("\n")}
    <Placemark>
      <name>${this.xml(this.getFlightplanTitle(flightplan))}</name>
      <styleUrl>#flightplan</styleUrl>
      <LineString>
        <tessellate>1</tessellate>
        <extrude>1</extrude>
        <altitudeMode>absolute</altitudeMode>
        <coordinates>
${flightplan.navigation.waypoints.map((wp) => this.coordinatesToString(wp)).join("\n")}
        </coordinates>
      </LineString>
    </Placemark>
${flightplan.navigation.waypoints
    .map((wp) => {
        const alt = this.getWaypointAltitude(wp);
        return `\
    <Placemark>
      <name>${this.xml(wp.identifier)}</name>
      <styleUrl>#${this.getWaypointSimplifiedType(wp)}</styleUrl>
      <LookAt>
        <longitude>${wp.longitude.toString()}</longitude>
        <latitude>${wp.latitude.toString()}</latitude>
        <altitude>${(alt ?? 0).toString()}</altitude>
        <range>10000</range>
        <tilt>70</tilt>
        <heading>0</heading>
        <altitudeMode>${alt ? "absolute" : "relativeToGround"}</altitudeMode>
      </LookAt>
      <Point>
        <altitudeMode>${alt !== null ? "absolute" : "relativeToGround"}</altitudeMode>
        <coordinates>${this.coordinatesToString(wp)}</coordinates>
      </Point>
    </Placemark>`;
    })
    .join("\n")}
  </Document>
</kml>
`;
    }

    protected xml(str: string): string {
        return str
            .replace(/&/g, "&amp;") // must be first!
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

    protected coordinatesToString(wp: AeroflyNavRouteBase) {
        return [wp.longitude, wp.latitude, this.getWaypointAltitude(wp) ?? 0].join(",");
    }
}
