export type OpenTopoDataApiResult = {
    results: OpenTopoDataApiResultItem[];
    status: "OK" | "INVALID_REQUEST" | "SERVER_ERROR";
    error?: string;
};

export type OpenTopoDataApiResultItem = {
    /**
     * in meters
     */
    elevation: number;
    location: {
        lat: number;
        lng: number;
    };
    dataset: string;
};

export type OpenTopoDataApiCoordinates = {
    lat: number;
    lng: number;
};
