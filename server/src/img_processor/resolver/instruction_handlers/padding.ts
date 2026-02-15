import type { PaddingType } from "@/img_processor/types";
import type { TransformationResolver } from "../resolver";
import type { ExtendOptions } from "sharp";
import type { ExtendContent } from "../state_handlers/types";
import type { ImageState } from "../state";

export function resolvePadding(ctx: TransformationResolver, img: ImageState, data: PaddingType) {
    const out: ExtendContent = {};
    const { px, side, bg } = data;

    out.background = bg;

    if (!side) {
        out.top = px;
        out.bottom = px;
        out.left = px;
        out.right = px;
    }
    else {
        out.top = side.top ? px : undefined;
        out.bottom = side.bottom ? px : undefined;
        out.left = side.left ? px : undefined;
        out.right = side.right ? px : undefined;
    };

    img.updateState("extend", out);
};
