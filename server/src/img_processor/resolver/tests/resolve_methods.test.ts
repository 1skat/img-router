import { test, expect, describe, beforeAll } from "bun:test";
import fs from "fs";
import sharp from "sharp";
import { ImageState } from "../image_state";
import { TransformationResolver } from "@/img_processor/resolver/main";
import path from "path";

async function getTestSuite() {
    const testSuite: Record<string, any> = {};
    const imageDirs = fs.readdirSync("./images");
    for (const dirName of imageDirs) {
        const dirPath = `./images/${dirName}`;

        const imgFile = fs.readdirSync(dirPath).find(f => f.startsWith("original."));
        if (!imgFile) throw new Error(`original image not found in ${dirPath}`);

        const trasformationFile = fs.readdirSync(dirPath).find(f => f === "resize_test.json");
        if (!trasformationFile) throw new Error(`resize.json file not found in ${dirPath}`);

        const transformations = JSON.parse(fs.readFileSync(path.join(dirPath, trasformationFile), "utf8"));
        const buf = fs.readFileSync(path.join(dirPath, imgFile));
        const meta = await sharp(buf).metadata();
        testSuite[dirName] = { meta, transformations };
    };

    return testSuite;
};

const testSuite = await getTestSuite();

describe("pure resize functions", () => {
    for (const [imgName, suite] of Object.entries(testSuite)) {
        const { meta, transformations } = suite;
        for (const { name, input, expected } of transformations) {
            test(`${imgName}:${meta.width}x${meta.height} -> ${name}`, () => {
                const img = new ImageState(meta);
                const resolver = new TransformationResolver(img);

                if ("error" in expected) {
                    expect(() => resolver.resolveChain(input)).toThrow(expected.error);
                    return;
                };

                const sharpIx = resolver.resolveChain(input);

                expect(sharpIx.length).toBeGreaterThan(0);
                expect(sharpIx[0]?.content.width).toBe(expected.content.width)
                expect(sharpIx[0]?.content.height).toBe(expected.content.height)
            });
        };
    };
});


// test(`original:${img.origWidth}x${img.origHeight} -> ${name}`, () => {
//     const resolver = new TransformationResolver(img);
//     if ("error" in expected) {
//         expect(() => resolver.resolveChain(chain)).toThrow(expected.error);
//         return;
//     };

//     const sharpIx = resolver.resolveChain(chain);

//     expect(sharpIx.length).toBeGreaterThan(0);
//     expect(sharpIx[0]?.content.width).toBe(expected.content.width)
//     expect(sharpIx[0]?.content.height).toBe(expected.content.height)
//     expect(sharpIx[0]?.content.fit).toBeUndefined();
//     expect(sharpIx[0]?.content.position).toBeUndefined();
//     expect(sharpIx[0]?.content.background).toBeUndefined();
// });
// for (const { path, name, chain, expected } of testTransformations) {
//     const img = imageStates[path];
//     if (!img) throw new Error(`image not found: ${path}`);
//     test(`original:${img.origWidth}x${img.origHeight} -> ${name}`, () => {
//         const resolver = new TransformationResolver(img);
//         if ("error" in expected) {
//             expect(() => resolver.resolveChain(chain)).toThrow(expected.error);
//             return;
//         };

//         const sharpIx = resolver.resolveChain(chain);

//         expect(sharpIx.length).toBeGreaterThan(0);
//         expect(sharpIx[0]?.content.width).toBe(expected.content.width)
//         expect(sharpIx[0]?.content.height).toBe(expected.content.height)
//         expect(sharpIx[0]?.content.fit).toBeUndefined();
//         expect(sharpIx[0]?.content.position).toBeUndefined();
//         expect(sharpIx[0]?.content.background).toBeUndefined();
//     });
// };
