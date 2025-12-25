import { tryCatch } from "@/utils/try-catch";
import { resizeParameters } from "./resize_map";

export class ParameterParser {
    parameterMap: Record<string, any>;
    constructor() {
        this.parameterMap = {
            ...resizeParameters,
        };
    };

    parseParams(trParams: string) {
        console.log(trParams);
        const chains = trParams.split("::");

        return chains.map((c) => {
            const [parsedChain, err] = tryCatch(() => this.parseChain(c));
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
        // const parsedChainRes = chain.match(/[a-zA-z]+\([^)]*\)/g)
        const parsedChainRes = chain.match(/^\w+\([^)]*\)(?:,\w+\([^)]*\))*$/)
        if (!parsedChainRes) throw new Error("invalid params");

        const parsedFuncs = parsedChainRes[0].match(/\w+\([^)]*\)/g);
        if (!parsedFuncs) throw new Error("invalid params");

        const imgFunctions = parsedFuncs.map(fn => {
            const match = fn.match(/^(\w+)(\([^)]*\))$/)
            if (!match) throw new Error("invalid params");

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
    };
};
