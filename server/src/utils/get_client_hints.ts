export type ClientHints = {
    userDeviceSupportedFormats?: string;
    width?: number;
    dpr?: number;
    viewPortWidth?: number;
    ect?: string;
    rtt?: string;
    downlink?: string;
};

export function getClientHints(header: Record<string, string | undefined>): ClientHints {
    return {
        userDeviceSupportedFormats: header["accept"],
        width: header["sec-ch-width"] ? parseInt(header["sec-ch-width"], 10) : undefined,
        dpr: header["sec-ch-dpr"] ? parseFloat(header["sec-ch-dpr"]) : undefined,
        viewPortWidth: header["sec-ch-viewport-width"] ? parseFloat(header["sec-ch-viewport-width"]) : undefined,
        ect: header["ect"],
        rtt: header["rtt"],
        downlink: header["downlink"],
    };
};

