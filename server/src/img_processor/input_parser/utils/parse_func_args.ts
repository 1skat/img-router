import { tryCatch } from "@/utils/try-catch";
import { resizeFunctionHandlers } from "../resize_options";
import { encodingFunctionHandlers } from "../encode_options";

const funcHandlers = {
    ...resizeFunctionHandlers,
    ...encodingFunctionHandlers,
};

export function parseImgFuncArgs(data: string, fnName: string) {
    const extracted: Record<string, any> = {};
    const funcHandler = funcHandlers[fnName];
    if (!funcHandler) throw new Error(`Function handlers not found: ${fnName}`);

    const parseKVs = (key: string, val: string, handlers: Record<string, Function>) => {
        if (val === "_") return;

        const argHandler = handlers[key] // e.g resize[w] = resizeHandler
        if (!argHandler) throw new Error(`Unknown argument handler: ${key}`);

        const [parsedValue, err] = tryCatch(() => argHandler(val));
        if (err) throw err;
        Object.assign(extracted, { [key]: parsedValue });
    };

    const { mainParams, optionalParams } = getFuncParamNames(funcHandler);

    const argsArray = data.split(",").map(arg => arg.trim());
    const args = argsArray.filter(a => !a.includes(":"));
    const kwargs = argsArray.filter(a => a.includes(":"));

    mainParams.forEach((p, i) => {
        const val = args[i];
        if (val === undefined) throw new Error(`${fnName}: ${mainParams.length} arguments required: missng '${mainParams[i]}' or '_'`);

        parseKVs(p, val, funcHandler);
    });

    for (const opt of kwargs) {
        const [k, v] = opt.split(":").map(o => o.trim());
        if (!k || !v) throw new Error(`${fnName}: Invalid option format: "${opt}" Expected "key:value"`);
        if (!optionalParams.includes(k)) throw new Error(`${fnName}: invalid option param: "${k}"`);
        parseKVs(k, v, funcHandler.opts);
    };

    return extracted;
};

function getFuncParamNames(handler: Record<string, Function>) {
    const { opts = {}, ...mainParams } = handler;
    return {
        mainParams: Object.keys(mainParams),
        optionalParams: Object.keys(opts),
    };
}
