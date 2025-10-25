import { tryCatch } from "@/utils/try-catch";
import { resizeParametersV2 } from "./resize_map";
import { encodeParametersV2 } from "./encode_map";

export class TranformationParser {
    parameterMap: Record<string, any>;

    constructor() {
        this.parameterMap = {
            ...resizeParametersV2,
            ...encodeParametersV2,
        };
    };

    parseTransformationString(trParams: string) {
        const chains = trParams.split("::");

        return chains.map((c) => {
            const parsedChain = this.parseChainv4(c);
            return parsedChain;
        });
    };

    parseChainv4(chain: string) {
        const parameters = chain.split(",");

        return parameters
            .map(p => p.trim())
            .filter(Boolean)
            .map((param) => {
                const match = param.match(/^([^-]+)-(.*)$/);
                if (!match) throw new Error("Invalid param format");

                const [_, key, val] = match;
                const spec = this.parameterMap[key];
                if (!spec) throw new Error(`parse_param: Unknown key '${key}'`);

                const [handlerResult, handlerErr] = tryCatch(spec.handler(val));
                if (handlerErr) throw handlerErr;

                return { key: key, value: handlerResult };
            });
    };
};
