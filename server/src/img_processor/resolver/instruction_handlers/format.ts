import type { FormatType } from "@/img_processor/types";
import type { ImageState } from "@/img_processor/resolver/state";

export function resolveFormat(ctx: ImageState, data: FormatType) {
    const { ext } = data;

    ctx.updateState("format", ext);
};
