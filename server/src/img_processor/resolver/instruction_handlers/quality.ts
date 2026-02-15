import type { FormatType, QualityType } from "@/img_processor/types";
import type { ImageState } from "@/img_processor/resolver/state";
import type { TransformationResolver } from "../resolver";

export function resolveQuality(ctx: TransformationResolver, img: ImageState, data: QualityType) {
    const { num } = data;

    ctx.encoding.quality = num;
    // ctx.updateState("quality", num);
};
