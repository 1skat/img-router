import { test, expect, describe, beforeAll } from "bun:test";
import fs from "fs";
import sharp from "sharp";
import { ImageState } from "../image_state";
import { TransformationResolver } from "@/img_processor/resolver/main";

const testTransformations = JSON.parse(fs.readFileSync("./test-transformations.json", "utf-8"));

describe("resolveResize", async () => {
    const imagePaths = ["./audi.png"];
    const imgBuffers = imagePaths.map(imgPath => fs.readFileSync(imgPath));
    const imagesMeta = await Promise.all(imgBuffers.map(async (buf) => await sharp(buf).metadata()));
    const images = imagesMeta.map(meta => new ImageState(meta));

    for (const { name, chain, expected } of testTransformations) {
        test(name, () => {
            for (const img of images) {
                const resolver = new TransformationResolver(img);
                const sharpIx = resolver.resolveChain(chain);
                expect(sharpIx).toEqual(expected);
            };
        });
    };
});
