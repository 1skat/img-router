
type ExtractContent = {
    left: number | undefined;
    top: number | undefined;
    width: number;
    height: number;
};

type ResizeContent = {
    width?: number;
    height?: number;
};

export type AddInstructionType = {
    preExtract: ExtractContent,
    postExtract: ExtractContent,
    extract: ExtractContent,
    resize: ResizeContent,

};
