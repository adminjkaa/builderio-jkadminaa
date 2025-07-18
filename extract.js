const fs = require("fs");
const path = require("path");

// Try to extract using Node.js
const AdmZip = require("adm-zip");

try {
  const zip = new AdmZip("downloaded_file.zip");
  const zipEntries = zip.getEntries();

  console.log("Contents of the zip file:");
  zipEntries.forEach((entry) => {
    console.log(entry.entryName);
  });

  // Extract to extracted_content directory
  zip.extractAllTo("extracted_content", true);
  console.log("Extraction complete!");
} catch (error) {
  console.error("Error:", error.message);

  // Try alternative approach using built-in modules
  try {
    const { execSync } = require("child_process");
    execSync("mkdir -p extracted_content");
    execSync(
      "cd extracted_content && node -e \"const fs=require('fs');const data=fs.readFileSync('../downloaded_file.zip');console.log('File size:', data.length);\"",
    );
  } catch (e) {
    console.error("Alternative approach failed:", e.message);
  }
}
