export type ClientHints = {
    userDeviceSupportedFormats: string | null;
    width?: number;
    dpr?: number;
    viewPortWidth?: number;
    ect: string | null;
    rtt: string | null;
    downlink: string | null;

};

export function getClientHints(header: Headers): ClientHints {
    return {
        userDeviceSupportedFormats: header.get("accept"),
        width: header.get("sec-ch-width") ? parseInt(header.get("sec-ch-width")!, 10) : undefined,
        dpr: header.get("sec-ch-dpr") ? parseFloat(header.get("sec-ch-dpr")!) : undefined,
        viewPortWidth: header.get("sec-ch-viewport-width") ? parseFloat(header.get("sec-ch-viewport-width")!) : undefined,
        ect: header.get("ect"),
        rtt: header.get("rtt"),
        downlink: header.get("downlink"),

    };
};

