import type { TransformationResolver } from "../resolver";
import type { ImageState } from "../state";
export function resolveFlop(ctx: ImageState) {

    ctx.updateState("flop", true);
};
