import fs from "fs";
import path from "path";
import { test } from "bun:test";
import sharp from "sharp";

const buf = fs.readFileSync("./images/audi/original.png");
const img = sharp(buf)
    .extract({ width: 700, height: 450, left: 0, top: 0 })
    .resize({ width: 400, height: 250 })
    .extract({ width: 200, height: 200, left: 0, top: 0 })
    .resize({ width: 800, height: 700 })

console.log(img.options)

img.toFile("./new_audi.png");
