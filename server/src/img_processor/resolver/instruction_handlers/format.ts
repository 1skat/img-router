import type { FormatType } from "@/img_processor/types";
import type { ImageState } from "@/img_processor/resolver/state";
import type { TransformationResolver } from "../resolver";

export function resolveFormat(ctx: TransformationResolver, img: ImageState, data: FormatType) {
    const { ext } = data;

    ctx.encoding.format = ext;
    // ctx.updateState("format", ext);
};
