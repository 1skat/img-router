// Resizing map
export interface AspectRatioParams { wRatio?: number; hRatio?: number };
export interface ZoomParams { zoom?: number; x?: number; y?: number };
export interface BackgroundParams { r: number; g: number; b: number; alpha: number };
export interface PaddingParams { top?: number; left?: number; bottom?: number; right?: number };
export interface FitParams { fit: "contain" | "fill" | "inside" | "outside"; position?: string };
export interface ResizeParams { width?: number; height?: number };
export interface PosType { x?: number, y?: number };

// Encoding map
export interface QualityParams { quality?: number };
export interface FormatParams { format?: string };
