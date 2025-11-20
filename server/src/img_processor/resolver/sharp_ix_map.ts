import { resolveAspectRatio } from "./resizing/aspect_ratio";
import { resolveResize } from "./resizing/resize";

export const SharpInsructionMap = {
    aspectRatio: resolveAspectRatio,
    resize: resolveResize,
};
