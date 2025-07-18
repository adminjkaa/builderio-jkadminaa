import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Read the zip file
const zipData = fs.readFileSync("downloaded_file.zip");

console.log("File size:", zipData.length);

// Check if it's a valid ZIP file by looking for ZIP signature
const zipSignature = zipData.slice(0, 4);
console.log(
  "First 4 bytes:",
  Array.from(zipSignature)
    .map((b) => `0x${b.toString(16).padStart(2, "0")}`)
    .join(" "),
);

// ZIP files start with 'PK' (0x504B)
if (zipSignature[0] === 0x50 && zipSignature[1] === 0x4b) {
  console.log("This is a valid ZIP file");

  // Try to use the adm-zip library
  try {
    const AdmZip = require("adm-zip");
    const zip = new AdmZip(zipData);
    const zipEntries = zip.getEntries();

    console.log("ZIP contents:");
    zipEntries.forEach((entry) => {
      console.log(
        `${entry.isDirectory ? "DIR:" : "FILE:"} ${entry.entryName} (${entry.header.size} bytes)`,
      );
    });

    // Create extraction directory
    if (!fs.existsSync("extracted_content")) {
      fs.mkdirSync("extracted_content", { recursive: true });
    }

    // Extract all files
    zipEntries.forEach((entry) => {
      if (!entry.isDirectory) {
        const outputPath = path.join("extracted_content", entry.entryName);
        const outputDir = path.dirname(outputPath);

        // Create directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        // Extract file content
        const fileData = entry.getData();
        fs.writeFileSync(outputPath, fileData);
        console.log(`Extracted: ${entry.entryName}`);
      } else {
        // Create directory
        const dirPath = path.join("extracted_content", entry.entryName);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        console.log(`Created directory: ${entry.entryName}`);
      }
    });

    console.log("Extraction completed successfully!");
  } catch (error) {
    console.error("Error during extraction:", error.message);
  }
} else {
  console.log("This doesn't appear to be a valid ZIP file");
  console.log(
    "First 20 bytes:",
    Array.from(zipData.slice(0, 20))
      .map((b) => `0x${b.toString(16).padStart(2, "0")}`)
      .join(" "),
  );
}
