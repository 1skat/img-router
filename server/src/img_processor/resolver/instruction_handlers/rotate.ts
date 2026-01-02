import type { RotateType } from "@/img_processor/types";
import type { TransformationResolver } from "../resolver";
import type { RotateContent } from "../state_handlers/types";

export function resolveRotate(ctx: TransformationResolver, data: RotateType) {
    const { degrees, bg } = data;
    console.log("rt hit")

    ctx.updateState("rotate", { degrees: degrees, background: bg });
    const w = ctx.img.getCurrWidthV2;
    const h = ctx.img.getCurrHeightV2;
    console.log(w, h);
};
