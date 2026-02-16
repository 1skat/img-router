import sharp from "sharp";
import { tryCatch } from "@/utils/try-catch";
import { ImageState } from "./state";
import { ImageStateMap, SharpInsructionMap } from "./hashmaps";
import type { AddInstructionType } from "./state_handlers/types";
import { compileEncoding, compileTransforms, type SharpInstr } from "./compiler";
import type { AccountSettings } from "@/internal/schema";
import type { ResolverContext } from "./types";

// export function buildTransfromInstance(chain: any) {
//     return (instance: any) => {
//         for (const { method, content } of chain) {
//             if (typeof instance[method] !== "function") throw new Error(`Unknown Sharp instruction: ${method}`);
//             instance = instance[method](...(content));
//         }
//         return instance;
//     };
// };

export function tranformSharpInstance(sharpInstructions: SharpInstr[]) {
    return (instance: any) => {
        for (const { method, content } of sharpInstructions) {
            console.log(method, content);
            if (typeof instance[method] !== "function") throw new Error(`Unknown Sharp instruction: ${method}`);
            instance = instance[method](...(content));
        }
        return instance;
    };
};

export async function resolveSharpInstructions(buf: Buffer, funcChains: any[], resolverCtx: ResolverContext) {
    const resolver = new TransformationResolver(resolverCtx);
    let currBuffer = buf;

    for (let i = 0; i < funcChains.length; i++) {
        const isLastChain = i === funcChains.length - 1;
        const sharpInst = sharp(currBuffer);
        const metadata = await sharpInst.metadata();

        const imgState = new ImageState(metadata);
        const sharpIxs = resolver.resolveChain(imgState, funcChains[i], isLastChain);
        const inst = tranformSharpInstance(sharpIxs)(sharpInst)
        currBuffer = await inst.toBuffer();
    };

    return currBuffer;
};

export class TransformationResolver {
    public encoding: {
        format: keyof sharp.FormatEnum,
        quality: number,
    };

    constructor(ctx: ResolverContext) {
        this.encoding = {
            format: ctx.encoding.format,
            quality: ctx.encoding.quality,
        };
    };

    resolveChain(img: ImageState, chain: typeof SharpInsructionMap, isLastChain: boolean) {
        for (const [method, content] of Object.entries(chain)) {
            const handler = SharpInsructionMap[method as keyof typeof SharpInsructionMap];
            if (handler) handler(this /* global ctx */, img /* image state */, content);
        };

        const transfomIxs = compileTransforms(img);
        const encodeIxs = isLastChain ? compileEncoding(this.encoding) : [];

        return [
            ...transfomIxs,
            ...encodeIxs,
        ];
    };
};
