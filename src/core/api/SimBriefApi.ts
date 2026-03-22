export type SimBriefApiPayloadAirport = {
  icao_code: string;
  icao_region: string;
  pos_lat: string;
  pos_long: string;
  /**
   * Feet
   */
  elevation: string;
  name: string;
  plan_rwy: string;
  metar: string;
  /**
   * Meters
   */
  metar_visibility: string;
  /**
   * Feet
   */
  metar_ceiling: string;
  metar_category: string;
};

export type SimBriefApiPayloadNavlogItem = {
  ident: string;
  type: "ltlg" | "wpt" | "vor" | "apt";
  icao_region: string;
  pos_lat: string;
  pos_long: string;
  altitude_feet: string;
  /**
   * Can be in kHz or MHz
   */
  frequency: string;
};

export type SimBriefApiPayloadFmsDownload = {
  name: string;
  link: string;
};

export type SimBriefApiPayload = {
  general: {
    icao_airline: string;
    cruise_tas: string;
  };
  origin: SimBriefApiPayloadAirport;
  destination: SimBriefApiPayloadAirport;
  navlog: SimBriefApiPayloadNavlogItem[];
  atc: {
    callsign: string;
  };
  aircraft: {
    icaocode: string;
    reg: string;
  };
  fuel: {
    plan_ramp: string; // kg
  };
  times: {
    sched_out: string;
  };
  weights: {
    payload: string; // kg
  };
  fms_downloads: {
    directory: string;
    mfs: SimBriefApiPayloadFmsDownload;
    mfn: SimBriefApiPayloadFmsDownload;
  };
};

export type SimBriefApiError = {
  fetch: {
    userid: string;
    static_id: string;
    status: string;
    time: string;
  };
};

export class SimBriefApi {
  public async fetch(username: string): Promise<SimBriefApiPayload> {
    const url = new URL("https://www.simbrief.com/api/xml.fetcher.php");
    url.searchParams.append(username.match(/^\d+$/) ? "userid" : "username", username);
    url.searchParams.append("json", "v2");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorResponse = (await response.json()) as SimBriefApiError;
      throw new Error(errorResponse?.fetch?.status ?? `Response status: ${response.status}`);
    }

    return await (<Promise<SimBriefApiPayload>>response.json());
  }
}
