import tinycolor from "tinycolor2";
import { ZoomSchema, type AspectRatioParams, type BackgroundParams, type ExtractParams, type FitParams, type PaddingParams, type ResizeParams, type ZoomParams } from "@/img_processor/types";
import { optionHandlers } from "./resizing/options_map";
import { tryCatch } from "@/utils/try-catch";
import z from "zod";

export const resizeParametersV2 = {
    extr: {
        k: "extract",
        handler: extractParser,
    },
    rs: {
        k: "resize",
        handler: resizeParser,
    },
    z: {
        k: "zoom",
        handler: zoomParser,
    },
    // w: {
    //     k: "resize",
    //     handler: resizeWidthHandler,
    // },
    // h: {
    //     k: "resize",
    //     handler: resizeHeightHandler,
    // },
    // x: {
    //     k: "position",
    //     handler: xAxisHandler,
    // },
    // y: {
    //     k: "position",
    //     handler: yAxisHandler,
    // },
    // cr: {
    //     k: "extract",
    //     handler: extractImageHandler,
    // },
    // fit: {
    //     k: "fit",
    //     handler: fitImageHandler,
    // },
    pad: {
        k: "padding",
        handler: padImageHandler,
    },
    // bg: {
    //     k: "background",
    //     handler: backgroundHandler,
    // },
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

// function zoomImageHandler(vals: string): ZoomParams {
//     if (!vals.trim()) throw new Error("zoom_image_handler: parameter required after `z`");
//     const out: ZoomParams = {};

//     // const match = vals.match(/^([1-9]\d*(?:\.\d+)?)(?:-x(\d+))?(?:-y(\d+))?$/);
//     const match = vals.match(/^([1-9]\d*(?:\.\d+)?)$/);
//     if (!match) throw new Error(`invalid zoom parameters: ${vals}`)
//     const [_, z, x, y] = match;

//     const zoom = z ? parseFloat(z) : 1;
//     // const xNum = x ? parseInt(x, 10) : undefined;
//     // const yNum = y ? parseInt(y, 10) : undefined;

//     if (zoom < 1) throw new Error("Zoom factor must be >= 1");
//     if (xNum && xNum < 1) throw new Error("Zoom: x must be >= 1");
//     if (yNum && yNum < 1) throw new Error("Zoom: y factor must be >= 1");

//     out.zoom = zoom; out.x = xNum; out.y = yNum;

//     return out;
// };

// function backgroundHandler(val: string): BackgroundParams {
//     if (!val.trim()) {
//         console.error("pad_image_handler: parameter required after `bg`");
//         throw new Error("invalid image transformation for 'bg'");
//     };

//     const color = tinycolor(val);
//     if (!color.isValid()) throw new Error(`Invalid color format: ${val}`);

//     const rgb = color.toRgb();

//     return { r: rgb.r, g: rgb.g, b: rgb.b, alpha: rgb.a };
// };

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

// function xAxisHandler(vals: string) {
//     if (!vals.trim()) throw new Error("x_axis_image_handler: parameter required after `x`");

//     const match = vals.match(/^\d+$/); // e.g 130
//     if (!match) throw new Error("X's value udefined");

//     const num = parseInt(match[0], 10);
//     if (isNaN(num) || num < 0) throw new Error("x must be >= 0");

//     return { x: num };
// };

// function yAxisHandler(vals: string) {
//     if (!vals.trim()) throw new Error("x_axis_image_handler: parameter required after `x`");

//     const match = vals.match(/^\d+$/); // e.g 150
//     if (!match) throw new Error("X's value udefined");

//     const num = parseInt(match[0], 10);
//     if (isNaN(num) || num < 0) throw new Error("x must be >= 0");

//     return { y: num };
// };

// function extractImageHandler(vals: string) {
//     return true;
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
// };



// function fitImageHandler(vals: string): FitParams {
//     if (!vals.trim()) throw new Error("fit_image_handler: parameter required after `fit`");

//     const match = vals.match(/^(p|in|out|fill)(.*)$/); // e.g 'prt' (padding right top) 
//     if (!match) throw new Error(`Invalid fit transformation: ${vals}`);

//     const [_, mode, position] = match;
//     switch (mode) {
//         case "p": {
//             const positionMap = {
//                 t: "top",
//                 rt: "right top",
//                 r: "right",
//                 rb: "right bottom",
//                 b: "bottom",
//                 lb: "left bottom",
//                 l: "left",
//                 lt: "left top",
//             };
//             const pos = positionMap[position?.trim()];

//             return { fit: "contain", ...(pos && { position: pos }) };
//         };
//         case "fill": {
//             return { fit: "fill" };
//         }
//         case "in": {
//             return { fit: "inside" };
//         }
//         case "out": {
//             return { fit: "outside" };
//         }
//         default: throw new Error(`Unknown fit mode: ${mode}`);
//     };
// };

// function resizeWidthHandler(vals: string) {
//     if (!vals.trim()) throw new Error("resize_image_handler: parameter required after `rs`");

//     const match = vals.match(/^\d+$/); // e.g 400
//     if (!match) throw new Error("width undefined");

//     const num = parseInt(match[0], 10);
//     if (isNaN(num) || num < 1) throw new Error("width must be >= 1");

//     return { width: num };
// };

// function resizeHeightHandler(vals: string) {
//     if (!vals.trim()) throw new Error("resize_image_handler: parameter required after `rs`");

//     const match = vals.match(/^\d+$/); // e.g 350
//     if (!match) throw new Error("height undefined");

//     const num = parseInt(match[0], 10);
//     if (isNaN(num) || num < 1) throw new Error("height must be >= 1");

//     return { height: num };
// };

function extractParser(data: string) {
    if (!data.trim()) throw new Error("extract_image_handler: parameter required after `extr`");
    const ExtractDataSchema = z.object({
        width: z.number().optional(),
        height: z.number().optional(),
        x: z.number().optional(),
        y: z.number().optional(),
    });

    try {
        const extracted: Record<string, any> = {};
        const args = data.split(",").map(arg => arg.trim());
        const [width, height] = args.filter(p => !p.includes(":"));
        const opts = args.filter(p => p.includes(":"));

        parseAndMerge("w", width, extracted);
        parseAndMerge("h", height, extracted);

        for (const arg of opts) {
            const [k, v] = arg.split(":").map(a => a.trim());
            if (!k || !v) throw new Error(`Invalid format: "${arg}". Expected "key:value"`);
            parseAndMerge(k, v, extracted);
        };

        return ExtractDataSchema.parse(extracted);
    } catch (err) {
        throw new Error(`extractHandler: ${err}`,)
    };
};
function resizeParser(data: string) {
    if (!data.trim()) throw new Error("resizeParser: parameter required after `rs`");

    const ResizeSchema = z.object({
        width: z.number().optional(),
        height: z.number().optional(),
        x: z.number().optional(),
        y: z.number().optional(),
        fit: z.enum(["contain", "cover", "fill", "inside", "outside"]).optional(),
        position: z.enum(["top", "right top", "right", "right bottom", "bottom", "left bottom", "left", "left top"]).optional(),
        bg: z.object({
            r: z.number().min(0).max(255),
            g: z.number().min(0).max(255),
            b: z.number().min(0).max(255),
            alpha: z.number().min(0).max(1),
        }).optional()
    });
    const extracted = parseArgs(data, ["w", "h"], "resize");

    return ResizeSchema.parse(extracted);
};

// try {
//     const exracted: Record<string, any> = {};
//     const args = data.split(",").map(arg => arg.trim());
//     const [width, height] = args.filter(p => !p.includes(":"));
//     const opts = args.filter(p => p.includes(":"));

//     if (!width && !height) throw new Error("rs: at least one dimension required");

//     parseAndMerge("w", width, exracted);
//     parseAndMerge("h", height, exracted);

//     for (const opt of opts) {
//         const [k, v] = opt.split(":").map(o => o.trim());
//         if (!k || !v) throw new Error(`Invalid format: "${opt}". Expected "key:value"`);
//         parseAndMerge(k, v, exracted);
//     };

//     return ResizeSchema.parse(exracted);
// } catch (err) {
//     throw new Error(`resizeHandler: ${err}`,);
// }

function zoomParser(data: string) {
    if (!data.trim()) throw new Error("zoomParser: parameter required after `z`");

    const extracted = parseArgs(data, ["z"], "zoom");

    return ZoomSchema.parse(extracted);
};
// try {
//     const exracted: Record<string, any> = {};
//     const args = data.split(",").map(arg => arg.trim());
//     const [zoom] = args.filter(p => !p.includes(":"));
//     const opts = args.filter(p => p.includes(":"));

//     if (!zoom) throw new Error(`zoom value undefined`);

//     parseAndMerge("z", zoom, exracted);

//     for (const opt of opts) {
//         const [k, v] = opt.split(":").map(o => o.trim());
//         if (!k || !v) throw new Error(`Invalid format: "${opt}". Expected "key:value"`);
//         parseAndMerge(k, v, exracted);
//     };

//     return ZoomSchema.parse(exracted);
// } catch (err) {
//     throw new Error(`zoomParser: ${err}`,);
// }

// function parseAndMerge(key: string, val: string, extracted: Record<string, any>) {
//     if (val === "_") return;

//     const spec = optionHandlers[key];
//     if (!spec) throw new Error(`Unknown handler: ${key}`);

//     const [parsed, err] = tryCatch(() => spec.handler(val));
//     if (err) throw new Error(`parsed arg: ${err.message}`);
//     Object.assign(extracted, parsed);
// };

function parseArgs(data: string, inputKeys: string[], fnName: string) {
    const extracted: Record<string, any> = {};
    const parseAndMerge = (key: string, val: string) => {
        if (val === "_") return;

        const spec = optionHandlers[key];
        if (!spec) throw new Error(`Unknown handler: ${key}`);

        const [parsed, err] = tryCatch(() => spec.handler(val));
        if (err) throw new Error(`parsed arg: ${err.message}`);
        Object.assign(extracted, parsed);
    };

    try {
        const args = data.split(",").map(arg => arg.trim());
        const reqParams = args.filter(p => (!p.includes(":")));
        const optParams = args.filter(p => (p.includes(":")));

        inputKeys.forEach((key, i) => {
            if (reqParams[i]) parseAndMerge(key, reqParams[i]);
        });

        for (const opt of optParams) {
            const [k, v] = opt.split(":").map(o => o.trim());
            if (!k || !v) throw new Error(`${fnName}: Invalid option format: "${opt}". Expected "key:value"`);
            parseAndMerge(k, v);
        };

        return extracted;
    } catch (err) {
        throw new Error(`parseArgs: ${err}`);
    };
};
