import tinycolor from "tinycolor2";

export const resizeParametersV2 = {
    rs: {
        handler: resizeImageHandler,
    },
    extr: {
        handler: extractImageHandler,
    },
    fit: {
        handler: fitImageHandler,
    },
    pad: {
        handler: padImageHandler,
    },
    bg: {
        handler: backgroundHandler,
    },
    z: {
        handler: zoomImageHandler,
    },
    ar: {
        handler: aspectRationImaegHandler,
    },
};

function aspectRationImaegHandler(val: string) {
    if (!val || val.trim() === "") {
        console.error("ar_image_handler: parameter required after `ar`");
        throw new Error("invalid image transformation");
    };

    const out: { wRatio?: number, hRatio?: number } = {};

    const matched = val.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
    if (!matched) throw new Error(`Invalid pad transformation: ${val}`);

    const [_, w, h] = matched;
    const wRatio = w ? parseInt(w, 10) : undefined;
    const hRatio = h ? parseInt(h, 10) : undefined;

    if (!wRatio || !hRatio) throw new Error("invalid ration params");

    out.wRatio = wRatio;
    out.hRatio = hRatio;

    return out
};

function zoomImageHandler(val: string) {
    if (!val || val.trim() === "") {
        console.error("zoom_image_handler: parameter required after `z`");
        throw new Error("invalid image transformation");
    };
    const out: { zoom?: number, x?: number, y?: number } = {};

    const matched = val.match(/^([1-9]\d*(?:\.\d+)?)(?:-x(\d+))?(?:-y(\d+))?$/);
    if (!matched) throw new Error(`Invalid z transformation: ${val}`);
    const [_, z, x, y] = matched;

    const zoom = z ? parseFloat(z) : 1;
    const xNum = x ? parseInt(x, 10) : undefined;
    const yNum = y ? parseInt(y, 10) : undefined;

    if (zoom < 1) throw new Error("Zoom factor must be >= 1");

    out.zoom = zoom;
    out.x = xNum;
    out.y = yNum;

    return out;
};

function backgroundHandler(val: string) {
    if (!val || val.trim() === "") {
        console.error("pad_image_handler: parameter required after `bg`");
        throw new Error("invalid image transformation for 'bg'");
    };

    const color = tinycolor(val);
    if (!color.isValid()) throw new Error(`Invalid color format: ${val}`);

    const rgb = color.toRgb();

    return { r: rgb.r, g: rgb.g, b: rgb.b, alpha: rgb.a };
};

function padImageHandler(val: string) {
    if (!val || val.trim() === "") {
        console.error("pad_image_handler: parameter required after `pad`");
        throw new Error("invalid image transformation for 'pad'");
    };

    if (/^\d+$/.test(val)) {
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 1) throw new Error("value has to be greater than 0");

        return { top: num, left: num, bottom: num, right: num }
    }

    const matchesArr = [...val.matchAll(/(t|l|b|r)(\d+)/g)];
    if (matchesArr.length === 0) throw new Error(`Invalid pad transformation: ${val}`);

    const content = {};
    for (const [_, mode, val] of matchesArr) {
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 1) throw new Error("value has to be greater than 0");

        if (mode === "t") content.top = num;
        else if (mode === "l") content.left = num;
        else if (mode === "b") content.bottom = num;
        else if (mode === "r") content.right = num;
    };

    return content;
};

function extractImageHandler(val: string) {
    if (!val || val.trim() === "") {
        console.error("extract_image_handler: parameter required after `extr`");
        throw new Error("invalid image transformation");
    };
    const out: any = {};
    const matchesArr = [...val.matchAll(/(x|y|w|h)(\d+)/g)]; // x100-y100-w300-h400

    if (matchesArr.length === 0) throw new Error(`Invalid extract transformation: ${val}`);

    for (const [_, mode, vals] of matchesArr) {
        const num = parseInt(vals, 10);
        if (isNaN(num) || num < 1) throw new Error("value has to be greate than 0");

        if (mode === "x") out.left = num;
        else if (mode === "y") out.top = num;
        else if (mode === "w") out.width = num;
        else if (mode === "h") out.height = num;
    };

    return out;
};

function fitImageHandler(val: string, kwargs?: Record<string, any>) { // e.g prt
    if (!val) throw new Error("fit_image_handler: parameter required after `fit`");

    const match = val.match(/^(p|in|out|fill)(.*)$/)
    if (!match) throw new Error(`Invalid fit transformation: ${val}`);

    const positionMap = {
        t: "top",
        rt: "right top",
        r: "right",
        rb: "right bottom",
        b: "bottom",
        lb: "left bottom",
        l: "left",
        lt: "left top",
    };

    const [_, mode, position] = match;
    switch (mode) {
        case "p": {
            const pos = positionMap[position];
            return { fit: "contain", ...(pos && { position: pos }) };
        };
        case "fill": {
            return { fit: "fill" };
        }
        case "in": {
            return { fit: "inside" };
        }
        case "out": {
            return { fit: "outside" };
        }
        default: throw new Error(`Unknown fit mode: ${mode}`);
    };
};


function resizeImageHandler(vals: string) {
    if (!vals) throw new Error("resize_image_handler: parameter required after `rs`");

    const out: { width?: number, height?: number } = {};

    for (const [_, key, val] of vals.matchAll(/(w|h)(\d+)/g)) {
        if (key === "w") out.width = parseInt(val, 10);
        if (key === "h") out.height = parseInt(val, 10);
    };

    return out;
};
