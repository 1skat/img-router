import { tryCatch } from "@/utils/try-catch";
import { resizeParametersV2 } from "./resize_map";
import { encodeParametersV2 } from "./encode_map";

export class ParameterParser {
    parameterMap: Record<string, any>;
    constructor() {
        this.parameterMap = {
            ...resizeParametersV2,
            ...encodeParametersV2,
        };
    };

    parseParams(trParams: string) {
        const chains = trParams.split("::");

        return chains.map((c) => {
            const [parsedChain, err] = tryCatch(() => this.parseChainV2(c));
            if (err) throw err;

            const transformationMap: Record<string, any> = {};
            return parsedChain.reduce((acc, [method, content]) => {
                if (!acc[method]) acc[method] = {};
                typeof content === "object"
                    ? Object.assign(acc[method], content)
                    : (acc[method] = content);
                return acc;
            }, transformationMap);
        });
    };

    parseChain(chain: string) {
        const parameters = chain.split(",");

        return parameters
            .map(p => p.trim())
            .filter(Boolean)
            .map((param) => {
                const match = param.match(/^([^-]+)-(.*)$/);
                if (!match) throw new Error("Invalid param format");

                const [_, key, val] = match;
                const spec = this.parameterMap[key];
                if (!spec) throw new Error(`Unknown key '${key}'`);

                const [handlerResult, handlerErr] = tryCatch(() => spec.handler(val));
                if (handlerErr) throw handlerErr;
                const specKey = spec.k;

                return [specKey, handlerResult];
            });
    };

    parseChainV2(chain: string) {
        const parsedChainRes = chain.match(/[a-zA-z]+\([^)]*\)/g)
        if (!parsedChainRes) throw new Error("invalid params");

        const imgFunctions = parsedChainRes.map(param => {
            const match = param.match(/^([a-zA-Z]+)(\([^)]*\))$/)
            if (!match) throw new Error(`Invalid param: ${param}`);

            return [match[1]/*key method*/, match[2]/*value params*/];
        });

        return imgFunctions
            .map(([m, c]) => {
                const spec = this.parameterMap[m];
                if (!spec) throw new Error(`Unknown key '${m}'`);

                const [handlerResult, handlerErr] = tryCatch(() => spec.parser(c?.replace(/^\(|\)$/g, "")));
                if (handlerErr) throw handlerErr;
                const specKey = spec.k;

                return [specKey, handlerResult]
            });


        // return parameters
        //     .map(p => p.trim())
        //     .filter(Boolean)
        //     .map((param) => {
        //         console.log(param);
        //         const match = param.match(/^([a-zA-Z]+)\((.*)\)$/);
        //         if (!match) throw new Error("Invalid param format");

        //         const [_, key, val] = match;
        //         console.log(match);
        //         // const spec = this.parameterMap[key];
        //         // if (!spec) throw new Error(`parse_param: Unknown key '${key}'`);

        //         // const [handlerResult, handlerErr] = tryCatch(() => spec.handler(val));
        //         // if (handlerErr) throw new Error(`parse_chain: ${handlerErr.message}`);
        //         // const specKey = spec.k;

        //         // return [specKey, handlerResult];
        //     });
    };
};
