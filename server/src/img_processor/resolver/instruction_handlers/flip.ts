import type { TransformationResolver } from "../resolver";
export function resolveFlip(ctx: TransformationResolver) {

    ctx.updateState("flip", true);
};
