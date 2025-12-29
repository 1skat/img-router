import type { ExtractType } from "@/img_processor/types";
import type { TransformationResolver } from "../resolver";
import { get } from "../helpers";

export const resolveExtract = (ctx: TransformationResolver, data: ExtractType): void => {
    const { w, h, x, y } = data;
    const ar = ctx.img.getAspectRatio;

    if (w === undefined && h === undefined) throw new Error("extract: at least one dimension required");

    const width = w ?? Math.round(h * ar);
    const height = h ?? Math.round(w / ar);

    const imgWidth = get.ifSet(ctx.img.state.rsWidth) ?? ctx.img.state.origWidth;
    const imgHeight = get.ifSet(ctx.img.state.rsHeight) ?? ctx.img.state.origHeight;

    const left = x ?? Math.round((imgWidth - width) / 2);
    const top = y ?? Math.round((imgHeight - height) / 2);

    if (left > (imgWidth - width)) throw new Error("x out of boundary");
    if (top > (imgHeight - height)) throw new Error("y out of boundary");

    ctx.updateState("extract", { left: left, top: top, width: width, height: height });
    return;
};
