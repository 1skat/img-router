import type { TransformationResolver } from "../resolver";
import type { ImageState } from "../state";
export function resolveFlip(ctx: TransformationResolver, img: ImageState) {

    img.updateState("flip", true);
};
