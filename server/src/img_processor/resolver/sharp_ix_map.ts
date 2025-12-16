import { resolveAspectRatio } from "./resizing/aspect_ratio";
import { resolveExtract } from "./resizing/extract";
import { resolvePadding } from "./resizing/padding";
import { resolveResize } from "./resizing/resize";
import { resolveZoom } from "./resizing/zoom";

export const SharpInsructionMap = {
    aspectRatio: resolveAspectRatio,
    resize: resolveResize,
    zoom: resolveZoom,
    padding: resolvePadding,
    extract: resolveExtract,
};
