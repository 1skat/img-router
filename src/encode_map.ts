import { DEFAULT_IMG_QUALITY } from "@/constant";

export const encodeParametersV2 = {
    f: {
        handler: formatHandler,
    },
    q: {
        handler: qualityHandler,
    },
};

function qualityHandler(value: string) {
    const num = Number(value);
    if (isNaN(num)) throw new Error(`qualiy_handler: number required`)
    if (num >= 10 && num <= 100) return { quality: num };

    return {
        quality: DEFAULT_IMG_QUALITY
    };
};

function formatHandler(value: string) {
    if (["jpg", "png", "webp", "avif"].includes(value)) return { format: value };

    else return { format: "auto" };
};
