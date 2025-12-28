import type sharp from "sharp";
import type { ArgsMap, StateMap } from "../types";
import type { ImgStateFields } from "./state";
import { resolveAspectRatio } from "./instruction_handlers/aspect_ratio";
import { resolveExtract } from "./instruction_handlers/extract";
import { resolvePadding } from "./instruction_handlers/padding";
import { resolveResize } from "./instruction_handlers/resize";
import { resolveZoom } from "./instruction_handlers/zoom";
import { applyExtract, applyPostExtract, applyPreExtract, applyResize } from "./state_handlers/applyExtract";

export const SharpInsructionMap = {
    aspectRatio: resolveAspectRatio,
    resize: resolveResize,
    zoom: resolveZoom,
    padding: resolvePadding,
    extract: resolveExtract,
};

export const ImageStateMap: StateMap = { // add type 
    resize: applyResize,
    extract: applyExtract,
    preExtract: applyPreExtract,
    postExtact: applyPostExtract,
};

// export const SharpArgsMap: ArgsMap = {
//     extract: (opts: Partial<sharp.Region>) => ({
//         left: opts.left ?? 0,
//         top: opts.top ?? 0,
//         width: opts.width!,
//         height: opts.height!,
//     }),
//     resize: (opts: Partial<sharp.ResizeOptions>) => ({
//         width: opts.width,
//         height: opts.height,
//         fit: opts.fit,
//         position: opts.position,
//         background: opts.background,
//     }),

// };
