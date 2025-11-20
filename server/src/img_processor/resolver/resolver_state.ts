import type { ImageState } from "./image_state";

export interface TransformationResolverState {
    state: ImageState;
    accountSettings: any;
    transformsReq: Record<string, any>;
    sharpInstructions: Record<string, any>;
};
