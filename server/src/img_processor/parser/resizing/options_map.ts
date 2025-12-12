import tinycolor from "tinycolor2";
export const optionHandlers = {
    w: {
        k: "resize",
        handler: resizeWidthHandler,
    },
    h: {
        k: "resize",
        handler: resizeHeightHandler,
    },
    x: {
        k: "position",
        handler: xAxisHandler,
    },
    y: {
        k: "position",
        handler: yAxisHandler,
    },
    fit: {
        k: "fit",
        handler: fitImageHandler,
    },
    bg: {
        k: "background",
        handler: backgroundHandler,
    },
    z: {
        k: "zoom",
        handler: zoomImageHandler,
    },
};

function xAxisHandler(vals: string) {
    if (!vals.trim()) throw new Error("x_axis_image_handler: parameter required after `x`");

    const match = vals.match(/^\d+$/); // e.g 130
    if (!match) throw new Error("x value undefined");

    const num = parseInt(match[0], 10);
    if (isNaN(num) || num < 0) throw new Error("x must be >= 0");

    return { x: num };
}

function yAxisHandler(vals: string) {
    if (!vals.trim()) throw new Error("y_axis_image_handler: parameter required after `y`");

    const match = vals.match(/^\d+$/); // e.g 150
    if (!match) throw new Error("y value undefined");

    const num = parseInt(match[0], 10);
    if (isNaN(num) || num < 0) throw new Error("y must be >= 0");

    return { y: num };
}

function resizeWidthHandler(vals: string) {
    if (!vals.trim()) throw new Error("resize_image_handler: parameter required after `rs`");

    const match = vals.match(/^\d+$/); // e.g 400
    if (!match) throw new Error(`invalid input format. expected: , got: ${vals}`);

    const num = parseInt(match[0], 10);
    if (isNaN(num) || num < 1) throw new Error("width must be >= 1");

    return { width: num };
};

function resizeHeightHandler(vals: string) {
    if (!vals.trim()) throw new Error("resize_image_handler: parameter required after `rs`");

    const match = vals.match(/^\d+$/); // e.g 350
    if (!match) throw new Error("height undefined");

    const num = parseInt(match[0], 10);
    if (isNaN(num) || num < 1) throw new Error("height must be >= 1");

    return { height: num };
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

function backgroundHandler(val: string) {
    if (!val.trim()) {
        console.error("pad_image_handler: parameter required after `bg`");
        throw new Error("invalid image transformation for 'bg'");
    };

    const color = tinycolor(val);
    if (!color.isValid()) throw new Error(`Invalid color format: ${val}`);

    const rgb = color.toRgb();

    return { bg: { r: rgb.r, g: rgb.g, b: rgb.b, alpha: rgb.a } };
};

function zoomImageHandler(vals: string) {
    if (!vals.trim()) throw new Error("zoom_image_handler: parameter required after `z`");
    const out = {};

    const match = vals.match(/^([1-9]\d*(?:\.\d+)?)$/);
    if (!match) throw new Error(`invalid zoom parameters: ${vals}`)
    const [_, z] = match;
    const zoomNum = z ? parseFloat(z) : 1;

    if (zoomNum < 1) throw new Error("Zoom factor must be >= 1");

    return { zoom: zoomNum };
};
