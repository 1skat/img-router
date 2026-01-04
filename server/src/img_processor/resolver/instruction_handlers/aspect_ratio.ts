import type { AspectRatioType } from "@/img_processor/types";
import type { TransformationResolver } from "../resolver";

export const resolveAspectRatio = (ctx: TransformationResolver, data: AspectRatioType): void => {
    const { w, h, fit } = data;

    const currAr = ctx.img.getAspectRatio;
    const targetAr = w / h;

    const currWidth = ctx.img.getCurrWidth;
    const currHeight = ctx.img.getCurrHeight;

    const newWidth = (fit === "w") ? currWidth : Math.round(currHeight * targetAr);
    const newHeight = (fit === "h") ? currHeight : Math.round(currWidth / targetAr);

    if (ctx.img.isPostExtracted) {
        if (newWidth > ctx.img.state.rsWidth) throw new Error(`aspect ratio: max width exceded`);
        if (newHeight > ctx.img.state.rsHeight) throw new Error(`aspect ratio: max height exceded`);
        ctx.updateState("postExtract", { width: newWidth, height: newHeight, left: ctx.img.state.postLeftOffset, top: ctx.img.state.postTopOffset });
    }
    else if (!ctx.img.isRsized && ctx.img.isPreExtracted) {
        ctx.updateState("preExtract", { width: newWidth, height: newHeight, left: ctx.img.state.preLeftOffset, top: ctx.img.state.preTopOffset });
    }
    else {
        ctx.updateState("resize", { width: newWidth, height: newHeight });
    };

    // 800x450 - ar(2,3) - ar > tar
    // 800x1200 -> 800 / (2/3) w
    // 300x450 -> 450 * (2/3) h

    // 800x450 - ar(5,2) - ar < tar
    // 450 * (5/2) = 1125x450 fit:h
    // 800 / (5/2) = 800x320  fit:w

    // 200x900 - ar(2,3) - ar < tar
    // 200 * (2/3) = 200x133
    // 900 * (2/3) = 600x900

    // 600x900 - ar(2,4,fit:h) - ar > tar
    // 600 / (2/4) = 600x1200
    // 900 * (2/4) = 450x900 

    // 200x900 - ar(5,2) - ar < tar
    // 200 / (5/2) = 200x80
    // 900 * (5/2) = 2250x900

    // ar > tr is width === height*tr
    // ar < tr height === width/tr
};
