import tinycolor from "tinycolor2";
import type { AspectRatioParams, BackgroundParams, ExtractParams, FitParams, PadParams, ResizeParams, ZoomParams } from "@/img_processor/types";

export const resizeParametersV2 = {
    rs: {
        handler: resizeImageHandler,
    },
    extr: {
        handler: extractImageHandler,
    },
    fit: {
        handler: fitImageHandler,
    },
    pad: {
        handler: padImageHandler,
    },
    bg: {
        handler: backgroundHandler,
    },
    z: {
        handler: zoomImageHandler,
    },
    ar: {
        handler: aspectRationImaegHandler,
    },
};

function aspectRationImaegHandler(vals: string): AspectRatioParams {
    if (!vals.trim()) throw new Error("ar_image_handler: parameter required after `ar`");

    const out: AspectRatioParams = {};

    const matched = vals.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
    if (!matched) throw new Error(`Invalid pad transformation: ${vals}`);

    const [_, w, h] = matched;
    const wRatio = w ? parseInt(w, 10) : undefined;
    const hRatio = h ? parseInt(h, 10) : undefined;

    if (!wRatio || !hRatio) throw new Error("aspect ration paramters undefined");

    out.wRatio = wRatio;
    out.hRatio = hRatio;

    return out
};

function zoomImageHandler(vals: string): ZoomParams {
    if (!vals.trim()) throw new Error("zoom_image_handler: parameter required after `z`");
    const out: ZoomParams = {};

    const match = vals.match(/^([1-9]\d*(?:\.\d+)?)(?:-x(\d+))?(?:-y(\d+))?$/);
    if (!match) throw new Error(`invalid zoom parameters: ${vals}`)
    const [_, z, x, y] = match;

    const zoom = z ? parseFloat(z) : 1;
    const xNum = x ? parseInt(x, 10) : undefined;
    const yNum = y ? parseInt(y, 10) : undefined;

    if (zoom < 1) throw new Error("Zoom factor must be >= 1");
    if (xNum && xNum < 1) throw new Error("Zoom: x must be >= 1");
    if (yNum && yNum < 1) throw new Error("Zoom: y factor must be >= 1");

    out.zoom = zoom; out.x = xNum; out.y = yNum;

    return out;
};

function backgroundHandler(val: string): BackgroundParams {
    if (!val.trim()) {
        console.error("pad_image_handler: parameter required after `bg`");
        throw new Error("invalid image transformation for 'bg'");
    };

    const color = tinycolor(val);
    if (!color.isValid()) throw new Error(`Invalid color format: ${val}`);

    const rgb = color.toRgb();

    return { r: rgb.r, g: rgb.g, b: rgb.b, alpha: rgb.a };
};

function padImageHandler(vals: string): PadParams {
    if (!vals.trim()) throw new Error("pad_image_handler: parameter required after `pad`");

    if (!/^[\dtlbr-]+$/.test(vals)) throw new Error("Invalid padding format. Use: 10 or t10-l20-b30-r40");

    // All sides
    if (/^\d+$/.test(vals)) {
        const num = parseInt(vals, 10);
        if (isNaN(num) || num < 1) throw new Error("value has to be greater than 0");

        return { top: num, left: num, bottom: num, right: num };
    }

    // One or more sides
    const out: PadParams = {};
    const match = vals.matchAll(/(t|l|b|r)(\d+)/g);

    for (const [_, mode, val] of match) {
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 1) throw new Error("value has to be greater than 0");

        switch (mode) {
            case "t": out.top = num; break;
            case "l": out.left = num; break;
            case "b": out.bottom = num; break;
            case "r": out.right = num; break;
            default: throw new Error(`Unknown parameter: ${mode}${val}`);
        };
    };

    if (!out.top && !out.left && !out.bottom && !out.right) throw new Error("padding parameters undefined");

    return out;
};

function extractImageHandler(vals: string): ExtractParams {
    if (!vals.trim()) {
        console.error("extract_image_handler: parameter required after `extr`");
        throw new Error("invalid image transformation");
    };
    const out: ExtractParams = {};
    const match = vals.matchAll(/(x|y|w|h)(\d+)/g);

    for (const [_, mode, val] of match) {
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 1) throw new Error("value has to be greater than 0");

        switch (mode) {
            case "x": out.x = num; break;
            case "y": out.y = num; break;
            case "w": out.width = num; break;
            case "h": out.height = num; break;
            default: throw new Error(`Unknown parameter: ${mode}${val}`);
        }
    };

    if (!out.width) throw new Error("extract: width not specified");
    if (!out.height) throw new Error("extract: height not specified");
    if (!out.x) throw new Error("extract: x not specified");
    if (!out.y) throw new Error("extract: y not specified");

    return out;
};

function fitImageHandler(vals: string): FitParams {
    if (!vals.trim()) throw new Error("fit_image_handler: parameter required after `fit`");

    const match = vals.match(/^(p|in|out|fill)(.*)$/); // e.g 'prt' (padding right top) 
    if (!match) throw new Error(`Invalid fit transformation: ${vals}`);

    const [_, mode, position] = match;
    switch (mode) {
        case "p": {
            const positionMap = {
                t: "top",
                rt: "right top",
                r: "right",
                rb: "right bottom",
                b: "bottom",
                lb: "left bottom",
                l: "left",
                lt: "left top",
            };
            const pos = positionMap[position?.trim()];
            if (!pos) throw new Error(`Invalid position: ${position?.trim()}`);

            return { fit: "contain", position: pos };
        };
        case "fill": {
            return { fit: "fill" };
        }
        case "in": {
            return { fit: "inside" };
        }
        case "out": {
            return { fit: "outside" };
        }
        default: throw new Error(`Unknown fit mode: ${mode}`);
    };
};


function resizeImageHandler(vals: string): ResizeParams {
    if (!vals.trim()) throw new Error("resize_image_handler: parameter required after `rs`");

    const out: ResizeParams = {};

    const match = vals.matchAll(/(w|h)(\d+)/g); // e.g w400-h320
    for (const [_, mode, val] of match) {
        if (mode === "w") out.width = parseInt(val, 10);
        if (mode === "h") out.height = parseInt(val, 10);
    };

    if (!out.height && !out.width) throw new Error("resize parameterundefined");

    return out;
};
