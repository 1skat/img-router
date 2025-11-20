import sharp from "sharp";

// export function buildSharpTransformer(chains: any) {
//     try {
//         const out = chains.map(chain => {
//             let pipeline = sharp();
//             for (const [method, content] of Object.entries(chain)) {
//                 const fn = pipeline[method];
//                 if (typeof fn !== "function") throw new Error(`Unknown Sharp instruction: ${method}`);
//                 pipeline = fn.call(pipeline, ...(content.options) ? Object.values(content) : [content]);
//             }
//             return pipeline;
//         });

//         return out;
//     }
//     catch (err) {
//         throw new Error(`build_sharp_transformer: ${err} `);
//     };
// };

export function buildSharpTransformerV2(chains: any) {
    try {
        return chains.map((chain: any) => {
            return (instance: any) => {
                for (const [method, content] of Object.entries(chain)) {
                    if (typeof instance[method] !== "function") throw new Error(`Unknown Sharp instruction: ${method}`);
                    // instance = fn.call(instance, ...(content.options) ? ...Object.values(content) : [content]);
                    if (content && content.options) instance = instance[method](...Object.values(content));
                    else instance = instance[method](content)
                }
                return instance;
            };
        });
    }
    catch (err) {
        throw new Error(`build_sharp_transformer: ${err} `);
    };
};

