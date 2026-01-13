import sharp from "sharp";
import { tryCatch } from "@/utils/try-catch";
import { ImageState } from "./state";
import { ImageStateMap, SharpInsructionMap } from "./hashmaps";
import type { AddInstructionType } from "./state_handlers/types";
import { compile } from "./compiler";
import type { AccountSettings } from "@/internal/db/schema";
import type { UserSettings } from "./types";

// export function resolveSharpInstructions(metadata: sharp.Metadata, funcChains: any[], accSettings: any) {
//     const [imgState, imgStateErr] = tryCatch(() => new ImageState(metadata));
//     if (imgStateErr) throw imgStateErr;

//     const sharpPipeline = funcChains.map(chain => {
//         const resolver = new TransformationResolver(imgState, accSettings); // create new per chain
//         const [sharpIxs, err] = tryCatch(() => resolver.resolveChain(chain));
//         if (err) throw err;

//         return sharpIxs;
//     });
// };

function buildTransfromInstance(chain: any) {
    return (instance: any) => {
        let c = 1;
        for (const { method, content } of chain) {
            console.log(`#${c++} ${method} ${JSON.stringify(content)}`);
            if (typeof instance[method] !== "function") throw new Error(`Unknown Sharp instruction: ${method}`);
            instance = instance[method](...(content));
        }
        return instance;
    };
};

export async function resolveSharpInstructions(buf: Buffer, funcChains: any[], accSettings: any) {
    try {
        const resolver = new TransformationResolver(accSettings);
        let currBuf = buf;

        for (const chain of funcChains) {
            let sharpInst = sharp(currBuf);

            const metadata = await sharpInst.metadata();
            const imgState = new ImageState(metadata);

            const sharpIxs = resolver.resolveChain(imgState, chain);

            const transforms = buildTransfromInstance(sharpIxs);
            sharpInst = transforms(sharpInst);
            currBuf = await sharpInst.toBuffer();
        };

        return currBuf;
    } catch (err) {
        throw err;
    };

    // let [imgState, imgStateErr] = tryCatch(() => new ImageState(metadata));
    // if (imgStateErr) throw imgStateErr;

    // const sharpPipeline = funcChains.map(chain => {
    //     const resolver = new TransformationResolver(imgState, accSettings); // create new per chain
    //     const [sharpIxs, err] = tryCatch(() => resolver.resolveChain(chain));
    //     if (err) throw err;

    //     return sharpIxs;
    // });
};

export class TransformationResolver {
    public settings: UserSettings;

    constructor(settings: any) {
        this.settings = settings;
    };

    resolveChain(img: ImageState, chain: typeof SharpInsructionMap) {
        for (const [method, content] of Object.entries(chain)) {
            const handler = SharpInsructionMap[method as keyof typeof SharpInsructionMap];
            if (handler) handler(img, content);
        };

        console.log("final state", img.state);
        return compile(img, this.settings);
    };

    // updateState<K extends keyof AddInstructionType>(sharpMethod: K, methodArgs: AddInstructionType[K]) {
    //     const applier = ImageStateMap[sharpMethod];
    //     if (!applier) throw new Error(`failed to get state handler for ${sharpMethod}`);

    //     applier(this.img, methodArgs);
    // };
};
