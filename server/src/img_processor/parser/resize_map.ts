import tinycolor from "tinycolor2";
import type { AspectRatioParams, BackgroundParams, ExtractParams, FitParams, PaddingParams, ResizeParams, ZoomParams } from "@/img_processor/types";

export const resizeParametersV2 = {
    // rs: {
    //     handler: resizeImageHandler,
    // },
    w: {
        k: "resize",
        handler: resizeWidthHandler,
    },
    h: {
        k: "resize",
        handler: heightWidthHandler,
    },
    x: {
        k: "position",
        handler: xAxisHandler,
    },
    y: {
        k: "position",
        handler: yAxisHandler,
    },
    cr: {
        k: "extract",
        handler: extractImageHandler,
    },
    fit: {
        k: "fit",
        handler: fitImageHandler,
    },
    pad: {
        k: "padding",
        handler: padImageHandler,
    },
    bg: {
        k: "background",
        handler: backgroundHandler,
    },
    z: {
        k: "zoom",
        handler: zoomImageHandler,
    },
    ar: {
        k: "aspectRatio",
        handler: aspectRatioImaegHandler,
    },
};

function aspectRatioImaegHandler(vals: string): AspectRatioParams {
    if (!vals.trim()) throw new Error("ar_image_handler: parameter required after `ar`");

    const out: AspectRatioParams = {};

    const matched = vals.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
    if (!matched) throw new Error(`Invalid pad transformation: ${vals}`);

    const [_, w, h] = matched;
    const wRatio = w ? parseInt(w, 10) : undefined;
    const hRatio = h ? parseInt(h, 10) : undefined;

    if (!wRatio || !hRatio) throw new Error("aspect ratio paramters undefined"); // 0s will error out too

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

function padImageHandler(vals: string): PaddingParams {
    if (!vals.trim()) throw new Error("pad_image_handler: parameter required after `pad`");

    if (!/^[\dtlbr-]+$/.test(vals)) throw new Error("Invalid padding format. Use: 10 or t10-l20-b30-r40");

    // All sides
    if (/^\d+$/.test(vals)) {
        const num = parseInt(vals, 10);
        if (isNaN(num) || num < 1) throw new Error("value has to be greater than 0");

        return { top: num, left: num, bottom: num, right: num };
    }

    // One or more sides
    const out: PaddingParams = {};
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

function xAxisHandler(vals: string) {
    if (!vals.trim()) throw new Error("x_axis_image_handler: parameter required after `x`");

    const match = vals.match(/^\d+$/); // e.g 130
    if (!match) throw new Error("X's value udefined");

    const num = parseInt(match[0], 10);
    if (isNaN(num) || num < 0) throw new Error("x must be >= 0");

    return { x: num };
};

function yAxisHandler(vals: string) {
    if (!vals.trim()) throw new Error("x_axis_image_handler: parameter required after `x`");

    const match = vals.match(/^\d+$/); // e.g 150
    if (!match) throw new Error("X's value udefined");

    const num = parseInt(match[0], 10);
    if (isNaN(num) || num < 0) throw new Error("x must be >= 0");

    return { y: num };
};

function extractImageHandler(vals: string) {
    return true;
    // if (!vals.trim()) throw new Error("extract_image_handler: parameter required after `extr`");

    // const out: ExtractParams = {};
    // const match = vals.matchAll(/(x|y)(\d+)/g); // e.g x20-y30

    // for (const [_, mode, val] of match) {
    //     const num = parseInt(val, 10);
    //     if (isNaN(num) || num < 1) throw new Error("value has to be greater than 0");

    //     switch (mode) {
    //         case "x": out.x = num; break;
    //         case "y": out.y = num; break;
    //         case "w": out.width = num; break;
    //         case "h": out.height = num; break;
    //         default: throw new Error(`Unknown parameter: ${mode}${val}`);
    //     }
    // };

    // if (!out.width) throw new Error("extract: width not specified");
    // if (!out.height) throw new Error("extract: height not specified");
    // if (!out.x) throw new Error("extract: x not specified");
    // if (!out.y) throw new Error("extract: y not specified");

    // return out;
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

            return { fit: "contain", ...(pos && { position: pos }) };
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


// function resizeImageHandler(vals: string): ResizeParams {
//     if (!vals.trim()) throw new Error("resize_image_handler: parameter required after `rs`");

//     const out: ResizeParams = {};

//     const match = vals.matchAll(/(w|h)(\d+)/g); // e.g w400-h320
//     for (const [_, mode, val] of match) {
//         if (mode === "w") out.width = parseInt(val, 10);
//         if (mode === "h") out.height = parseInt(val, 10);
//     };

//     if (!out.height && !out.width) throw new Error("resize parameterundefined");

//     return out;
// };

function resizeWidthHandler(vals: string) {
    if (!vals.trim()) throw new Error("resize_image_handler: parameter required after `rs`");

    const match = vals.match(/^\d+$/); // e.g 400
    if (!match) throw new Error("width undefined");

    const num = parseInt(match[0], 10);
    if (isNaN(num) || num < 1) throw new Error("width must be >= 1");

    return { width: num };
};

function heightWidthHandler(vals: string) {
    if (!vals.trim()) throw new Error("resize_image_handler: parameter required after `rs`");

    const match = vals.match(/^\d+$/); // e.g 350
    if (!match) throw new Error("height undefined");

    const num = parseInt(match[0], 10);
    if (isNaN(num) || num < 1) throw new Error("height must be >= 1");

    return { height: num };
};
