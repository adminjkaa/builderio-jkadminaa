import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

try {
  const AdmZip = require("adm-zip");
  const zip = new AdmZip("downloaded_file.zip");
  const zipEntries = zip.getEntries();

  console.log("Contents of the zip file:");
  zipEntries.forEach((entry) => {
    console.log(`${entry.isDirectory ? "DIR:" : "FILE:"} ${entry.entryName}`);
  });

  // Create extracted_content directory
  if (!fs.existsSync("extracted_content")) {
    fs.mkdirSync("extracted_content", { recursive: true });
  }

  // Extract files
  zipEntries.forEach((entry) => {
    if (!entry.isDirectory) {
      const outputPath = `extracted_content/${entry.entryName}`;
      const outputDir = outputPath.substring(0, outputPath.lastIndexOf("/"));

      if (outputDir && !fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, entry.getData());
      console.log(`Extracted: ${entry.entryName}`);
    }
  });

  console.log("Extraction complete!");
} catch (error) {
  console.error("Error:", error.message);
}
