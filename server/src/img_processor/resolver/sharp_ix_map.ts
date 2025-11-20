import { resolveAspectRatio } from "./resizing/aspect_ratio";
import { resolveResize } from "./resizing/resize";
import { resolveZoom } from "./resizing/zoom";

export const SharpInsructionMap = {
    aspectRatio: resolveAspectRatio,
    resize: resolveResize,
    zoom: resolveZoom,
};
