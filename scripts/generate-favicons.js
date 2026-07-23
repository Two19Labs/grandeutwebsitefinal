const sharp = require('sharp');

async function makeFavicons() {
  // Extract Grandeur emblem mark
  const emblem = await sharp('logo.png')
    .extract({ left: 12, top: 24, width: 478, height: 400 })
    .toBuffer();

  // Create 512x512 square canvas with centered emblem
  const canvas = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{
    input: emblem,
    top: 56, // centered vertically
    left: 17 // centered horizontally
  }])
  .png()
  .toBuffer();

  await sharp(canvas).resize(512, 512).toFile('favicon.png');
  await sharp(canvas).resize(180, 180).toFile('apple-touch-icon.png');
  await sharp(canvas).resize(32, 32).toFile('favicon-32x32.png');
  await sharp(canvas).resize(16, 16).toFile('favicon-16x16.png');
  await sharp(canvas).resize(32, 32).toFile('favicon.ico');

  console.log('Favicon assets generated successfully.');
}

makeFavicons();
