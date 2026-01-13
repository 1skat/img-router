import type sharp from "sharp";
import { resolveAspectRatio } from "./instruction_handlers/aspect_ratio";
import { resolveExtract } from "./instruction_handlers/extract";
import { resolvePadding } from "./instruction_handlers/padding";
import { resolveResize } from "./instruction_handlers/resize";
import { resolveZoom } from "./instruction_handlers/zoom";

import { applyExtend, applyExtract, applyFlip, applyFlop, applyFormat, applyPostExtract, applyPreExtract, applyQuality, applyResize, applyRotate } from "./state_handlers/apply";
import type { StateMap } from "./types";
import { resolveRotate } from "./instruction_handlers/rotate";
import { resolveFlip } from "./instruction_handlers/flip";
import { resolveFlop } from "./instruction_handlers/flop";
import { resolveFormat } from "./instruction_handlers/format";
import { resolveQuality } from "./instruction_handlers/quality";

export const SharpInsructionMap = {
    aspectRatio: resolveAspectRatio,
    resize: resolveResize,
    zoom: resolveZoom,
    padding: resolvePadding,
    extract: resolveExtract,
    rotate: resolveRotate,
    flip: resolveFlip,
    flop: resolveFlop,
    format: resolveFormat,
    quality: resolveQuality,
};

export const ImageStateMap: StateMap = {
    resize: applyResize,
    extract: applyExtract,
    preExtract: applyPreExtract,
    postExtract: applyPostExtract,
    extend: applyExtend,
    rotate: applyRotate,
    flip: applyFlip,
    flop: applyFlop,
    format: applyFormat,
    quality: applyQuality,
};
