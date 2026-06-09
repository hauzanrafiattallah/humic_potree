const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const POTREE_ZIP_URL = 'https://github.com/potree/potree/releases/download/1.8.2/Potree_1.8.2.zip';
const TEMP_ZIP_PATH = path.join(__dirname, '..', 'storage', 'potree-temp.zip');
const EXTRACT_DIR = path.join(__dirname, '..', 'storage', 'potree-extracted');
const DEST_DIR = path.join(__dirname, '..', 'public', 'potree');

async function main() {
  try {
    // Ensure storage directory exists
    const storageDir = path.join(__dirname, '..', 'storage');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    // Check if target files already exist
    if (fs.existsSync(path.join(DEST_DIR, 'build', 'potree', 'potree.js'))) {
      console.log('Potree runtime already exists in public/potree. Skipping.');
      return;
    }

    console.log('Downloading Potree 1.8.2 runtime... This may take a moment (approx. 60MB)');
    
    // Download using Node.js native fetch (available in Node.js 18+)
    const response = await fetch(POTREE_ZIP_URL);
    if (!response.ok) {
      throw new Error(`Failed to download Potree assets: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(TEMP_ZIP_PATH, Buffer.from(arrayBuffer));
    console.log('Download complete. Extracting files...');

    // Ensure extraction directory exists and is clean
    if (fs.existsSync(EXTRACT_DIR)) {
      fs.rmSync(EXTRACT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(EXTRACT_DIR, { recursive: true });

    // Extract the ZIP using system utilities
    try {
      if (process.platform === 'win32') {
        execSync(`tar -xf "${TEMP_ZIP_PATH}" -C "${EXTRACT_DIR}"`);
      } else {
        execSync(`unzip -q "${TEMP_ZIP_PATH}" -d "${EXTRACT_DIR}"`);
      }
    } catch (err) {
      throw new Error(`Extraction failed. Ensure tar or unzip is installed on your system. Details: ${err.message}`);
    }

    // Find the source folder (sometimes the zip has a root directory like Potree_1.8.2)
    let srcDir = EXTRACT_DIR;
    const files = fs.readdirSync(EXTRACT_DIR);
    const subDir = files.find(f => f.toLowerCase().startsWith('potree'));
    if (subDir && fs.statSync(path.join(EXTRACT_DIR, subDir)).isDirectory()) {
      srcDir = path.join(EXTRACT_DIR, subDir);
    }

    // Ensure DEST_DIR exists and is clean
    if (fs.existsSync(DEST_DIR)) {
      fs.rmSync(DEST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(DEST_DIR, { recursive: true });

    // Copy folder contents
    const foldersToCopy = ['build', 'libs', 'resources'];
    for (const folder of foldersToCopy) {
      const srcFolder = path.join(srcDir, folder);
      const destFolder = path.join(DEST_DIR, folder);
      if (fs.existsSync(srcFolder)) {
        console.log(`Copying ${folder} to public/potree...`);
        fs.cpSync(srcFolder, destFolder, { recursive: true });
      }
    }

    console.log('Potree runtime successfully installed in public/potree!');
  } catch (error) {
    console.error('Error setting up Potree:', error.message);
  } finally {
    // Cleanup temporary files
    if (fs.existsSync(TEMP_ZIP_PATH)) {
      fs.unlinkSync(TEMP_ZIP_PATH);
    }
    if (fs.existsSync(EXTRACT_DIR)) {
      fs.rmSync(EXTRACT_DIR, { recursive: true, force: true });
    }
  }
}

main();
