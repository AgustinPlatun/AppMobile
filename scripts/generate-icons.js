// Simple icon generator for Expo using sharp
// Input: assets/source-icon.png (prefer 1024x1024)
// Outputs:
//  - assets/icon.png (1024x1024)
//  - assets/adaptive-icon.png (1024x1024)
//  - assets/favicon.png (256x256)

const fs = require('fs');
const path = require('path');

async function main() {
  const src = path.resolve(__dirname, '..', 'assets', 'source-icon.png');
  const outIcon = path.resolve(__dirname, '..', 'assets', 'icon.png');
  const outAdaptive = path.resolve(__dirname, '..', 'assets', 'adaptive-icon.png');
  const outFavicon = path.resolve(__dirname, '..', 'assets', 'favicon.png');
  const outSplash = path.resolve(__dirname, '..', 'assets', 'splash-icon.png');

  if (!fs.existsSync(src)) {
    console.error('No se encontró assets/source-icon.png. Colocá tu imagen de origen ahí y volvé a ejecutar.');
    process.exit(1);
  }

  // Lazy-load sharp to avoid requiring it when just reading the repo
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('Falta la dependencia "sharp". Instalá con: npm i -D sharp');
    process.exit(1);
  }

  try {
    // Icono base 1024x1024
    await sharp(src)
      .resize(1024, 1024, { fit: 'cover' })
      .png()
      .toFile(outIcon);

    // Adaptive foreground 1024x1024 (ideal con fondo transparente)
    await sharp(src)
      .resize(1024, 1024, { fit: 'cover' })
      .png()
      .toFile(outAdaptive);

    // Favicon 256x256
    await sharp(src)
      .resize(256, 256, { fit: 'cover' })
      .png()
      .toFile(outFavicon);

    // Splash image (bigger square). With resizeMode: 'contain' and backgroundColor set in app.json
    await sharp(src)
      .resize(2048, 2048, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outSplash);

    console.log('Listo! Generados icon.png, adaptive-icon.png, favicon.png y splash-icon.png en assets/.');
  } catch (err) {
    console.error('Error generando íconos:', err);
    process.exit(1);
  }
}

main();
