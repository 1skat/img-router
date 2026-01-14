import { test, expect, describe, beforeAll } from "bun:test";
import fs from "fs";
import path from "path";
import type { Sharp, SharpOptions } from "sharp";

import { tryCatch } from "@/utils/try-catch";
import { buildSharpTransformer } from "@/img_processor/ix_builder/build_transform";
import sharp from "sharp";
import { getFinalSharpInstance, resolveSharpInstructions, TransformationResolver } from "@/img_processor/resolver/resolver";

interface SharpWithOptions extends Sharp {
    options: any,
};

const RESIZE_PADDING_TEST_FILE = "resize_padding.json"

async function getTestSuite() {
    const testObj: Record<string, any> = {};
    const imageDirs = fs.readdirSync("./images");
    for (const dirName of imageDirs) {
        const dirPath = `./images/${dirName}`;

        const imgFile = fs.readdirSync(dirPath).find(f => f.startsWith("original."));
        if (!imgFile) {
            console.warn("image not found", dirPath);
            continue
        };

        const testFile = fs.readdirSync(dirPath).find(f => f === RESIZE_PADDING_TEST_FILE);
        if (!testFile) {
            console.warn("transform file not found", dirPath);
            continue
        };

        const testSuite = JSON.parse(fs.readFileSync(path.join(dirPath, testFile), "utf8"));
        const buf = fs.readFileSync(path.join(dirPath, imgFile));
        const meta = await sharp(buf).metadata();
        testObj[dirName] = { buf, meta, testSuite };
    };

    return testObj;
};

const testSuite = await getTestSuite();

describe("resize + padding functions", () => {
    for (const [imgName, testObj] of Object.entries(testSuite)) {
        const { buf, meta, testSuite } = testObj;
        for (const { name, input, expected } of testSuite) {
            test(`${imgName}:${meta.width}x${meta.height} -> ${name}`, async () => {
                const defaultSettings = {
                    format: undefined,
                    quality: 80,
                };

                if ("error" in expected) {
                    const resolver = new TransformationResolver(defaultSettings);
                    const sharpInst = await getFinalSharpInstance(buf, input, resolver);
                    expect(() => resolveSharpInstructions(buf, input, defaultSettings)).toThrow(expected.error);
                    return;
                };

                const resolver = new TransformationResolver(defaultSettings);
                let sharpInst = sharp() as SharpWithOptions;
                for (const chain of input) {
                    sharpInst = await getFinalSharpInstance(buf, chain, resolver);
                };

                expect(sharpInst.options.leftOffsetPre).toBe(expected.leftOffsetPre);
                expect(sharpInst.options.topOffsetPre).toBe(expected.topOffsetPre);
                expect(sharpInst.options.widthPre).toBe(expected.widthPre);
                expect(sharpInst.options.heightPre).toBe(expected.heightPre);

                expect(sharpInst.options.leftOffsetPost).toBe(expected.leftOffsetPost);
                expect(sharpInst.options.topOffsetPost).toBe(expected.topOffsetPost);
                expect(sharpInst.options.widthPost).toBe(expected.widthPost);
                expect(sharpInst.options.heightPost).toBe(expected.heightPost);

                expect(sharpInst.options.width).toBe(expected.width);
                expect(sharpInst.options.height).toBe(expected.height);
            });
        };
    };
});
