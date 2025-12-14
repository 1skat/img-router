import tinycolor from "tinycolor2";
export const functionHandlers = {
    extract: {
        w: resizeHandler,
        h: resizeHandler,
        opts: {
            x: axisHandler,
            y: axisHandler,
        },
    },
    zoom: {
        z: zoomImageHandler,
        opts: {
            t: zoomPaddingHandler,
            l: zoomPaddingHandler,
            b: zoomPaddingHandler,
            r: zoomPaddingHandler,
        },
    },
    resize: {
        w: resizeHandler,
        h: resizeHandler,
        opts: {
            x: axisHandler,
            y: axisHandler,
            fit: fitImageHandler,
            bg: backgroundHandler,
        },
    },
};

function axisHandler(vals: string) {
    if (!vals.trim()) throw new Error("x_axis_image_handler: parameter required after `x`");

    const match = vals.match(/^\d+$/); // e.g 130
    if (!match) throw new Error("x value undefined");

    const num = parseInt(match[0], 10);
    if (isNaN(num) || num < 0) throw new Error("x must be >= 0");

    return num;
};

function resizeHandler(vals: string) {
    if (!vals.trim()) throw new Error("resize_image_handler: parameter required after `rs`");

    const match = vals.match(/^\d+$/); // e.g 350
    if (!match) throw new Error("height undefined");

    const num = parseInt(match[0], 10);
    if (isNaN(num) || num < 1) throw new Error("height must be >= 1");

    return num;
};

function fitImageHandler(vals: string) {
    if (!vals.trim()) throw new Error("fit_image_handler: parameter required after `fit`");

    const match = vals.match(/^(p|in|out|fill)(.*)$/); // e.g 'prt' (padding right top) 
    if (!match) throw new Error(`Invalid fit transformation: ${vals}`);

    const [_, mode, position] = match;
    switch (mode) {
        case "p": {
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
            const pos = positionMap[position?.trim()];

            return { mode: "contain", ...(pos && { position: pos }) };
        };
        case "fill": {
            return { mode: "fill" };
        }
        case "in": {
            return { mode: "inside" };
        }
        case "out": {
            return { mode: "outside" };
        }
        default: throw new Error(`Unknown fit mode: ${mode}`);
    };
};

function backgroundHandler(val: string) {
    if (!val.trim()) {
        console.error("pad_image_handler: parameter required after `bg`");
        throw new Error("invalid image transformation for 'bg'");
    };

    const color = tinycolor(val);
    if (!color.isValid()) throw new Error(`Invalid color format: ${val}`);

    const rgb = color.toRgb();

    return { r: rgb.r, g: rgb.g, b: rgb.b, alpha: rgb.a };
};

function zoomImageHandler(vals: string) {
    if (!vals.trim()) throw new Error("zoom_image_handler: parameter required after `z`");
    const out = {};

    const match = vals.match(/^([1-9]\d*(?:\.\d+)?)$/);
    if (!match) throw new Error(`invalid zoom parameters: ${vals}`)
    const [_, z] = match;
    const zoomNum = z ? parseFloat(z) : 1;

    if (zoomNum < 1) throw new Error("Zoom factor must be >= 1");

    return zoomNum;
};

function zoomPaddingHandler(vals: string) {
    if (!vals.trim()) throw new Error("zoom_padding_handler: parameter required");
    const match = vals.match(/^([1-9]\d*)$/);
    if (!match) throw new Error(`invalid zoom parameters: ${vals}`);

    const [_, p] = match;
    const pNum = parseFloat(p);

    return pNum;
};
