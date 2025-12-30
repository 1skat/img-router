import fs from "fs"
import path from "path"
import sharp from "sharp"
const buf = fs.readFileSync(path.join(__dirname, "./images/audi/original.png"))

// const inst = sharp(buf).rotate(180).extract({ width: 400, height: 200, left: 400, top: 500 })
const inst = sharp(buf).rotate(180).extract({ width: 400, height: 200, left: 400, top: 500 });
console.log(inst.options)

inst.toFile(path.join(__dirname, "./auid-new.png"));
