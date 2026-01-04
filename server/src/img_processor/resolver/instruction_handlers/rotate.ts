import type { RotateType } from "@/img_processor/types";
import type { TransformationResolver } from "../resolver";
import type { RotateContent } from "../state_handlers/types";

export function resolveRotate(ctx: TransformationResolver, data: RotateType) {
    const { degrees, bg } = data;

    ctx.updateState("rotate", { degrees: degrees, background: bg });
};
