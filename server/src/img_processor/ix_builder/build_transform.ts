import sharp from "sharp";
import { json } from "zod";

export function buildSharpTransformer(chains: any) {
    try {
        return chains.map((chain: any) => {
            return (instance: any) => {
                let c = 1;
                for (const { method, content } of chain) {
                    console.log(`#${c++} ${method} ${JSON.stringify(content)}`);
                    if (typeof instance[method] !== "function") throw new Error(`Unknown Sharp instruction: ${method}`);
                    instance = instance[method](...(content));
                }
                return instance;
            };
        });
    }
    catch (err) {
        throw new Error(`build_sharp_transformer: ${err} `);
    };
};


