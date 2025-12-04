import type { FitParams } from "@/img_processor/types";
import type { TransformationResolver } from "../main";

export const resolveExport = (ctx: TransformationResolver, value: FitParams): void => {

    const { fit, position } = value;
    const { background } = ctx.getMods(["background"]);

    ctx.addInstructionV2("fit", { fit, ...(position && { position }) });
};
