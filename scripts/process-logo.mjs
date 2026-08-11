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
  "c__Users_dell_AppData_Roaming_Cursor_User_workspaceStorage_91f29bd522a297119704ba1843911d11_images_ChatGPT_Image_Aug_11__2026__10_06_34_AM-removebg-preview__1_-removebg-preview-Photoroom-40a72cb2-b7f3-449c-b08a-e4f808724632.png",
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
  const cropHeight = Math.round(meta.height * 0.58);
  const output = join(publicDir, "favicon.png");

  await sharp(inputBuffer)
    .extract({ left: 0, top: 0, width: meta.width, height: cropHeight })
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(output);

  console.log(`Wrote ${output}`);
}

await writeFullLogo(fullLogoSource, join(publicDir, "aavishkar-logo-full.png"));
await writeFaviconFromLogo(fullLogoSource);
