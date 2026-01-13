import type { RotateType } from "@/img_processor/types";
import type { TransformationResolver } from "../resolver";
import type { RotateContent } from "../state_handlers/types";
import type { ImageState } from "../state";

export function resolveRotate(ctx: ImageState, data: RotateType) {
    const { degrees, bg } = data;

    ctx.updateState("rotate", { degrees: degrees, background: bg });
};
