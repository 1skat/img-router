import tinycolor from "tinycolor2";
import { functionHandlers } from "./func_options";
import { tryCatch } from "@/utils/try-catch";
import z from "zod";
import { parseImgFuncArgs } from "../utils/parse_func_args";
import { AspectRatioSchema, ExtractSchema, ResizeSchema, ZoomSchema } from "@/img_processor/types";

export const resizeParameters = {
    extr: {
        k: "extract",
        parser: extractParser,
    },
    rs: {
        k: "resize",
        parser: resizeParser,
    },
    z: {
        k: "zoom",
        parser: zoomParser,
    },
    ar: {
        k: "aspectRatio",
        parser: aspectRatioParser,
    }
};

// function aspectRatioImageHandler(vals: string): AspectRatioParams {
//     if (!vals.trim()) throw new Error("ar_image_handler: parameter required after `ar`");

//     const out: AspectRatioParams = {};

//     const matched = vals.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
//     if (!matched) throw new Error(`Invalid pad transformation: ${vals}`);

//     const [_, w, h] = matched;
//     const wRatio = w ? parseInt(w, 10) : undefined;
//     const hRatio = h ? parseInt(h, 10) : undefined;

//     if (!wRatio || !hRatio) throw new Error("aspect ratio paramters undefined");

//     out.wRatio = wRatio;
//     out.hRatio = hRatio;

//     return out
// };

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

// function padImageHandler(vals: string): PaddingParams {
//     if (!vals.trim()) throw new Error("pad_image_handler: parameter required after `pad`");

//     if (!/^[\dtlbr-]+$/.test(vals)) throw new Error("Invalid padding format. Use: 10 or t10-l20-b30-r40");

//     // All sides
//     if (/^\d+$/.test(vals)) {
//         const num = parseInt(vals, 10);
//         if (isNaN(num) || num < 1) throw new Error("value has to be greater than 0");

//         return { top: num, left: num, bottom: num, right: num };
//     }

//     // One or more sides
//     const out: PaddingParams = {};
//     const match = vals.matchAll(/(t|l|b|r)(\d+)/g);

//     for (const [_, mode, val] of match) {
//         const num = parseInt(val, 10);
//         if (isNaN(num) || num < 1) throw new Error("value has to be greater than 0");

//         switch (mode) {
//             case "t": out.top = num; break;
//             case "l": out.left = num; break;
//             case "b": out.bottom = num; break;
//             case "r": out.right = num; break;
//             default: throw new Error(`Unknown parameter: ${mode}${val}`);
//         };
//     };

//     if (!out.top && !out.left && !out.bottom && !out.right) throw new Error("padding parameters undefined");

//     return out;
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

function extractParser(data: string) {
    if (!data.trim()) throw new Error("extract_image_handler: parameter required after `extr`");
    const extracted = parseImgFuncArgs(data, "extract");

    return ExtractSchema.parse(extracted);
};

function resizeParser(data: string) {
    if (!data.trim()) throw new Error("resizeParser: parameter required after `rs`");
    const extracted = parseImgFuncArgs(data, "resize");

    return ResizeSchema.parse(extracted);
};

function zoomParser(data: string) {
    if (!data.trim()) throw new Error("zoomParser: parameter required after `z`");
    const extracted = parseImgFuncArgs(data, "zoom");

    return ZoomSchema.parse(extracted);
};

function aspectRatioParser(data: string) {
    if (!data.trim()) throw new Error("zoomParser: parameter required after `ar`");
    const extracted = parseImgFuncArgs(data, "aspectRatio");

    return AspectRatioSchema.parse(extracted);
};
