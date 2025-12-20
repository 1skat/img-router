import type { PaddingParams } from "@/img_processor/types";
import type { TransformationResolver } from "../main";

export const resolvePadding = (ctx: TransformationResolver, value: PaddingParams): void => {
    const { top, left, bottom, right } = value;
    const { background } = ctx.getMods(["background"]);

    ctx.addInstructionV2("extend", { top: top ?? 0, left: left ?? 0, bottom: bottom ?? 0, right: right ?? 0, ...(background && { background }) });
    return;
};
