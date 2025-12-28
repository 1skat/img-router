import sharp from "sharp";
import { tryCatch } from "@/utils/try-catch";
import { ImageState } from "./state";
import { ImageStateMap, SharpArgsMap, SharpInsructionMap } from "./hashmaps";
import type { AddInstructionType } from "./state_handlers/types";

export function resolvedSharpInstructions(metadata: sharp.Metadata, funcChains: any, accSettings?: any) {
    const [imgState, imgStateErr] = tryCatch(() => new ImageState(metadata));
    if (imgStateErr) throw imgStateErr;

    return funcChains.map(chain => {
        const resolver = new TransformationResolver(imgState, accSettings); // create new per chain
        const [sharpIxs, err] = tryCatch(() => resolver.resolveChain(chain));
        if (err) throw err;

        return sharpIxs;
    });
};

export class TransformationResolver {
    public img: ImageState;
    public accountSettings: any;
    public reqFunctions: Record<string, any>;
    public sharpInstructions: { method: string, content: any }[];

    constructor(imgState: ImageState, accountSettings?: any) {
        this.img = imgState;
        this.accountSettings = accountSettings;
        this.reqFunctions = {};
        this.sharpInstructions = [];
    };

    resolveChain(chain: any) {
        this.reqFunctions = chain; // load requested transformations to context map

        for (const [method, content] of Object.entries(this.reqFunctions)) {
            const handler = SharpInsructionMap[method as keyof typeof SharpInsructionMap];
            if (handler) handler(this, content);
        };
        console.log("final state:", this.img.state);

        return this.sharpInstructions;
    };

    getReqFunctions(modifiers: string[]) {
        const out: Record<string, any> = {};
        return modifiers.reduce((acc, mod) => {
            acc[mod] = this.reqFunctions[mod];
            return acc;
        }, out);
    };

    updateState<K extends keyof AddInstructionType>(sharpMethod: K, methodArgs: AddInstructionType[K]) {
        const applier = ImageStateMap[sharpMethod];
        if (!applier) throw new Error(`failed to get state handler for ${sharpMethod}`);

        applier(this.img.state, methodArgs);

        // const sharpArgsHandler = SharpArgsMap[sharpMethod];
        // if (!sharpArgsHandler) throw new Error(`failed to get sharp arg handler for ${sharpMethod}`);
        // const sharpArgs = sharpArgsHandler(methodArgs);
        // this.sharpInstructions.push({ method: sharpMethod, content: sharpArgs });
    };

    extractFuncData(fnName: string) {
        return this.reqFunctions[fnName];
    };
};

// private resolveResize(value: ResizeParams) {
//     const { width, height } = value;
//     if (!width && !height) throw new Error("resize requires at least one dimension");
//     const { position, extract, aspectRatio } = this.getMods(["position", "extract", "aspectRatio"]);

//     if (width && height) {
//         if (extract && position) {
//             const leftOffset = position.x ?? Math.round((this.state.width - width) / 2);
//             const topOffset = position.y ?? Math.round((this.state.height - height) / 2);

//             if (leftOffset > (this.state.width - width)) throw new Error("x out of boundary");
//             if (topOffset > (this.state.height - height)) throw new Error("y out of boundary");

//             this.addInstruction("extract", { left: leftOffset, top: topOffset, width: width, height: height });
//             return;
//         };

//         if (position) {
//             const { x, y } = position;
//             const origRatio = this.state.width / this.state.height;
//             const currRatio = width / height;

//             const boxWidth = (origRatio > currRatio) ? Math.round(height * origRatio) : width;
//             const boxHeight = (origRatio < currRatio) ? Math.round(width / origRatio) : height;

//             const xMax = boxWidth - width;
//             const yMax = boxHeight - height;

//             if ((xMax - x) < 0) throw new Error("x out of boundary");
//             if ((yMax - y) < 0) throw new Error("y out of boundary");

//             this.addInstruction("resize", { width: boxWidth, height: boxHeight });
//             this.addInstruction("extract", { left: x ?? 0, top: y ?? 0, width: width, height: height });
//             return;
//         };

//         this.addInstruction("resize", { width, height });
//         return;
//     };

//     if (width || height) {
//         if (aspectRatio) {
//             const newDimensions = this.applyAspectRatio({ width, height }, aspectRatio);
//             this.addInstruction("resize", { width: newDimensions.width, height: newDimensions.height });
//             return;
//         };

//         const [adjustedDimensions, dimensionsErr] = tryCatch(() => this.adjustAspectRatio(value, {
//             origWidth: this.state.width,
//             origHeight: this.state.height
//         }));
//         if (dimensionsErr) throw new Error(`resize: ${dimensionsErr.message}`);

//         this.addInstruction("resize", { width: adjustedDimensions.width, height: adjustedDimensions.height });
//         return;
//     };
// }

// // Aspect ratio inside resize: (applied only to the request value)
// const ar = this.transformationMap["aspectRatio"];
// if (ar) {
//     const newDimensions = this.applyAspectRatio({ width, height }, ar);
//     out.width = newDimensions.width
//     out.height = newDimensions.height;

//     // should check for extract inside of here?
// }
// // Adjust aspect ratio if only one demension is known
// else {
//     const [newDimensions, dimensionsErr] = tryCatch(() => this.adjustAspectRatio(value, {
//         origWidth: this.state.width,
//         origHeight: this.state.height
//     }));

//     if (dimensionsErr) throw new Error(`resize: ${dimensionsErr.message}`);
//     out.width = newDimensions.width;
//     out.height = newDimensions.height;
// };

// // I need to save the adjusted dimensions (one side is specified)
// const pos = this.transformationMap["position"]; // requires both w and h values
// if (pos) {
//     const { x, y } = pos;
//     const adjustedWidth = out.width;
//     const adjustedHeight = out.height;
// };



// this.addOrMerge("resize", out);
// this.state.applyResize({ width: out.width, height: out.height });

// const MODIFIERS = ["ar", "z"];
// const mods = this.getModifiers(MODIFIERS);
// const { ar, z } = mods;

// const newDimensions = this.adjustDemensions(value);
// if (!newDimensions) throw new Error("failed to adjust w & h");

// const content: any = { width: newDimensions.width, height: newDimensions.height };

// if (ar) this.applyAspectRatio(content, ar);

// this.addOrMerge("resize", content);
// this.state.applyResize({ width: content.width, height: content.height });

// if (z) this.applyZoom(z);

// adjustAspectRatio({ width, height }: ResizeParams, { origWidth, origHeight }: any) {
//     const orgAspectRatio = origWidth / origHeight;

//     if (width && !height) return { width, height: Math.round(width / orgAspectRatio) };
//     if (!width && height) return { width: Math.round(height * orgAspectRatio), height: height };
//     else throw new Error("failed to adjust dimensions");
// };

// resolveAspectRatio(value: AspectRatioParams) {
//     if (this.transformationMap.resize) return; // rs will handle it
//     const out: ResizeParams = {};

//     const { width, height } = this.state;
//     const { wRatio, hRatio } = value;

//     if (!wRatio || !hRatio) throw new Error("aspect ratio undefined");

//     const currRatio = width / height;
//     const targetRatio = wRatio / hRatio;

//     if (currRatio > targetRatio) { // image is wide -> constrain by height, scale down width
//         out.width = Math.floor(height * targetRatio);
//         out.height = height;
//     };
//     if (currRatio < targetRatio) { // image is tall -> constain by width, scale down height
//         out.width = width;
//         out.height = Math.floor(width / targetRatio)
//     };

//     this.addInstruction("resize", out);
//     this.state.applyResize({ width: out.width, height: out.height });
// };

// applyAspectRatio({ width, height }: ResizeParams, ar: AspectRatioParams) {
//     const { wRatio, hRatio } = ar;

//     // if (width && height) return { width, height }; // both present, 'ar' ignored, or might throw error

//     const outWidth = width ?? Math.round((height * wRatio) / hRatio);
//     const outHeight = height ?? Math.round((width * hRatio) / wRatio);

//     return { width: outWidth, height: outHeight };
// };
// // resolve1(chain: any) {
// //     const instructionsChains = [];
// //     parsedParamChains.forEach((chain) => {
// //         console.log("single chain:", chain)
// //         this.params = this.toObject(chain) // create a hashmap
// //         console.log("params", this.params);
// //         const supportedMethods = Object.keys(this.transformHandlers);
// //         this.instructions = {}; // each new iteration resets the instruction - FIX DESIGN

// //         // call transformation handlers to build up the insruction object
// //         for (const key of supportedMethods) {
// //             if (this.params[key]) this.transformHandlers[key](this.params[key]);
// //         };

// //         instructionsChains.push(this.instructions); // <-- push the instruction object to the output tuple
// //     });

// //     return instructionsChains;
// // };

// resolveBackground(value: any) {
//     const content = { background: value };
//     if (this.params.fit) this.addOrMerge("resize", content);
//     if (this.params.pad) this.addOrMerge("extend", content);
// };

// resolvePad(value: any) {
//     const content: any = { ...value };
//     this.addOrMerge("extend", content);
// };

// resolveZoom(value: any) {
//     if (this.params.rs) return;
//     this.applyZoom(value);// apply to curren image
// };

// resolveFormat(value: any) {
//     const MODIFIERS = ["q"];
//     const mods = this.getModifiers(MODIFIERS);
//     const { format } = value;

//     const targetFormat = (format === "auto")
//         ? (this.userSettings.encoding.format ?? this.state.format)
//         : format;

//     const targetQuality = mods.q?.quality ?? this.userSettings.encoding.quality;

//     this.addOrMerge("toFormat", { id: targetFormat, options: { quality: targetQuality } });
// };

// resolveQuality(value: any) {
//     if (this.params.f) return; // resolveFormat will handle it
//     const { quality } = value;

//     const format = this.userSettings.format /* best format */ ?? this.state.format;
//     if (!format) throw new Error("failed to detect image's format");

//     this.addOrMerge("toFormat", { id: format, options: { quality: quality } });
// };

// resolveFit(value: any) {
//     this.addOrMerge("resize", value);
// };

// resolveResize(value: any) {
//     const MODIFIERS = ["ar", "z"];
//     const mods = this.getModifiers(MODIFIERS);
//     const { ar, z } = mods;

//     const newDimensions = this.adjustDemensions(value);
//     if (!newDimensions) throw new Error("failed to adjust w & h");

//     const content: any = { width: newDimensions.width, height: newDimensions.height };

//     if (ar) this.applyAspectRatio(content, ar);

//     this.addOrMerge("resize", content);
//     this.state.applyResize({ width: content.width, height: content.height });

//     if (z) this.applyZoom(z);
// };

// applyZoom(value: any) {
//     const { zoom, x, y } = value;

//     const targetWidth = Math.round(this.state.width * zoom);
//     const targetHeight = Math.round(this.state.height * zoom);

//     const left = (x && x > 0) ? x : Math.floor((targetWidth - this.state.width) / 2);
//     const top = (y && y > 0) ? y : Math.floor((targetHeight - this.state.height) / 2);

//     if (left < 0 || top < 0) throw new Error("failed zooming");

//     this.addOrMerge("resize", { width: targetWidth, height: targetHeight });
//     console.log("after zoom", targetWidth, targetWidth);
//     this.addOrMerge("extract", { top: top, left: left, width: this.state.width, height: this.state.height });
// };



