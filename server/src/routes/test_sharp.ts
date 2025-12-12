import path from "path";
import sharp from "sharp";
import fs from "fs";

async function testChain(inputPath, outputPath, displayHeight) {
    try {
        let img = sharp(inputPath);

        // 1) Resize
        img = img.resize({ height: displayHeight }); // e.g. 800

        // 2) Check metadata to ensure the crop will fit
        const meta = await img.metadata();
        console.log("after resize metadata:", meta.width, "x", meta.height);

        // validate extract fits
        const extract = { left: 0, top: 0, width: 200, height: 700 };
        if (extract.left < 0 || extract.top < 0) throw new Error("Negative extract coords");
        if (extract.left + extract.width > meta.width || extract.top + extract.height > meta.height) {
            throw new Error(`Extract ${extract.width}x${extract.height}@(${extract.left},${extract.top}) out of bounds for ${meta.width}x${meta.height}`);
        };

        // 3) Extract and second resize
        img = img.extract(extract).resize({ width: 100, height: 400 });

        // 4) Write file and inspect resulting metadata
        await img.toFile(outputPath);
        const outMeta = await sharp(outputPath).metadata();
        console.log("output file metadata:", outMeta.width, "x", outMeta.height);
    } catch (err) {
        console.error("sharp chain error:", err);
    }
}

const imgPath = path.join(import.meta.dir, "audi_main.png");
const imgPathOut = path.join(import.meta.dir, "audi_main_out.png");
await testChain(imgPath, imgPathOut, 750);
