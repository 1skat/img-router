import type { FormatType, QualityType } from "@/img_processor/types";
import type { ImageState } from "@/img_processor/resolver/state";

export function resolveQuality(ctx: ImageState, data: QualityType) {
    const { num } = data;

    ctx.updateState("quality", num);
};
