import type { AspectRatioType } from "@/img_processor/types";
import type { TransformationResolver } from "../resolver";
import type { ImageState } from "../state";

export const resolveAspectRatio = (ctx: TransformationResolver, img: ImageState, data: AspectRatioType): void => {
    const { w, h, fit } = data;

    const currAr = img.getAspectRatio;
    const targetAr = w / h;

    const currWidth = img.getCurrWidth;
    const currHeight = img.getCurrHeight;

    const newWidth = (fit === "w") ? currWidth : Math.round(currHeight * targetAr);
    const newHeight = (fit === "h") ? currHeight : Math.round(currWidth / targetAr);

    if (img.isPostExtracted) {
        if (newWidth > img.state.rsWidth) throw new Error(`aspect ratio: max width exceded`);
        if (newHeight > img.state.rsHeight) throw new Error(`aspect ratio: max height exceded`);
        img.updateState("postExtract", { width: newWidth, height: newHeight, left: img.state.postLeftOffset, top: img.state.postTopOffset });
    }
    else if (!img.isRsized && img.isPreExtracted) {
        img.updateState("preExtract", { width: newWidth, height: newHeight, left: img.state.preLeftOffset, top: img.state.preTopOffset });
    }
    else {
        img.updateState("resize", { width: newWidth, height: newHeight });
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
