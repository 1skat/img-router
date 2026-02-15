import type { TransformationResolver } from "../resolver";
import type { ImageState } from "../state";
export function resolveFlop(ctx: TransformationResolver, img: ImageState) {

    img.updateState("flop", true);
};
