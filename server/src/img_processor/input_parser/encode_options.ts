export const encodingFunctionHandlers = {
    "quality": {
        num: qualityHanler,
    },
    "format": {
        ext: formatHanler,
    }
};

function qualityHanler(vals: string) {
    const match = vals.match(/^(100|[1-9]\d?)$/);
    if (!match) throw new Error(`invalid quality parameters: ${vals}`);

    const [q] = match;
    const qNum = parseFloat(q);

    if (qNum < 10 || qNum > 100) throw new Error("quaility parameter should be between 10 and 100");

    return qNum;
};

function formatHanler(vals: string) {
    const supportedFormats = ["jpeg", "png", "webp", "avif"];
    if (!supportedFormats.includes(vals)) throw new Error(`unsupported format`);

    return vals;
};
