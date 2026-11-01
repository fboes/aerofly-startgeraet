export type OpenTopoDataApiResult = {
    /**
     * List of elevations for each location, in same order as input. Only provided for OK status.
     */
    results: OpenTopoDataApiResultItem[];
    status: "OK" | "INVALID_REQUEST" | "SERVER_ERROR";
    error?: string;
};

export type OpenTopoDataApiResultItem = {
    /**
     * Elevation, using units and datum from the dataset.
     * For example, the SRTM and ASTER dataset uses meters.
     */
    elevation: number;
    location: {
        lat: number;
        lng: number;
    };
    /**
     * The name of the dataset which the returned elevation is from.
     */
    dataset: string;
};

export type OpenTopoDataApiCoordinates = {
    lat: number;
    lng: number;
};
