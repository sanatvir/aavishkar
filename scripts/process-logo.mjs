import sharp from "sharp";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const fullLogoSource = join(
  "C:",
  "Users",
  "dell",
  ".cursor",
  "projects",
  "c-Users-dell-Downloads-aavishkar-launchpad-main",
  "assets",
  "c__Users_dell_AppData_Roaming_Cursor_User_workspaceStorage_91f29bd522a297119704ba1843911d11_images_169593-13e68764-784f-4414-bdce-88a6e5b6bc37.png",
);

async function writeFullLogo(input, output) {
  const inputBuffer = readFileSync(input);
  mkdirSync(dirname(output), { recursive: true });
  await sharp(inputBuffer).png({ compressionLevel: 9 }).toFile(output);
  console.log(`Wrote ${output}`);
}

async function writeFaviconFromLogo(input) {
  const inputBuffer = readFileSync(input);
  const meta = await sharp(inputBuffer).metadata();
  const cropHeight = Math.round(meta.height * 0.42);
  const output = join(publicDir, "favicon.png");

  await sharp(inputBuffer)
    .extract({ left: 0, top: 0, width: meta.width, height: cropHeight })
    .resize(512, 512, { fit: "contain" })
    .png({ compressionLevel: 9 })
    .toFile(output);

  console.log(`Wrote ${output}`);
}

await writeFullLogo(fullLogoSource, join(publicDir, "aavishkar-logo-full.png"));
await writeFaviconFromLogo(fullLogoSource);
