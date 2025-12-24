import type sharp from "sharp";

type ExtractContent = {
    left: number | null;
    top: number | null;
    width: number;
    height: number;
};

type ResizeContent = {
    width?: number;
    height?: number;
};

export type AddInstructionType = {
    extract: ExtractContent,
    resize: ResizeContent,
};
