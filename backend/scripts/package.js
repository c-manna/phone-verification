const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const outputPath = path.join(distDir, 'lambda.zip');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function archiveEntry(archive, entryName) {
  const absPath = path.join(rootDir, entryName);
  if (!fs.existsSync(absPath)) {
    return;
  }

  const stat = fs.statSync(absPath);
  if (stat.isDirectory()) {
    archive.directory(absPath, entryName);
    return;
  }

  archive.file(absPath, { name: entryName });
}

async function main() {
  ensureDir(distDir);

  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`Created ${outputPath} (${archive.pointer()} bytes)`);
  });

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn(err);
    } else {
      throw err;
    }
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  archiveEntry(archive, 'dist');
  archiveEntry(archive, 'node_modules');
  archiveEntry(archive, 'package.json');
  archiveEntry(archive, 'package-lock.json');

  await archive.finalize();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
