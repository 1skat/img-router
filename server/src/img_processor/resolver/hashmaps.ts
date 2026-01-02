import type sharp from "sharp";
import { resolveAspectRatio } from "./instruction_handlers/aspect_ratio";
import { resolveExtract } from "./instruction_handlers/extract";
import { resolvePadding } from "./instruction_handlers/padding";
import { resolveResize } from "./instruction_handlers/resize";
import { resolveZoom } from "./instruction_handlers/zoom";

import { applyExtend, applyExtract, applyPostExtract, applyPreExtract, applyResize, applyRotate } from "./state_handlers/apply";
import type { StateMap } from "./types";
import { resolveRotate } from "./instruction_handlers/rotate";

export const SharpInsructionMap = {
    aspectRatio: resolveAspectRatio,
    resize: resolveResize,
    zoom: resolveZoom,
    padding: resolvePadding,
    extract: resolveExtract,
    rotate: resolveRotate,
};

export const ImageStateMap: StateMap = {
    resize: applyResize,
    extract: applyExtract,
    preExtract: applyPreExtract,
    postExtract: applyPostExtract,
    extend: applyExtend,
    rotate: applyRotate,
};

