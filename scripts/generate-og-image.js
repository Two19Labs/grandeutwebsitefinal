const sharp = require('sharp');

async function makeOgImage() {
  const logoMeta = await sharp('logo-white.png').metadata();
  const targetLogoWidth = 650;
  const targetLogoHeight = Math.round((logoMeta.height / logoMeta.width) * targetLogoWidth);
  const logo = await sharp('logo-white.png').resize({ width: targetLogoWidth }).toBuffer();

  const svgText = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#080C14" />
        <stop offset="100%" stop-color="#0F172A" />
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#F59E0B" />
        <stop offset="100%" stop-color="#D97706" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="600" cy="200" r="300" fill="#1E293B" opacity="0.2" />
    <text x="600" y="475" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="700" letter-spacing="1" text-anchor="middle">The Premier Consulting &amp; Knowledge Cell</text>
    <text x="600" y="525" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500" letter-spacing="3" text-anchor="middle">SHAHEED SUKHDEV COLLEGE OF BUSINESS STUDIES</text>
  </svg>`;

  const base = await sharp(Buffer.from(svgText)).png().toBuffer();

  const logoLeft = Math.round((1200 - targetLogoWidth) / 2);
  const logoTop = Math.round((420 - targetLogoHeight) / 2) + 20;

  await sharp(base)
    .composite([{
      input: logo,
      top: logoTop,
      left: logoLeft
    }])
    .toFile('og-image.png');

  console.log('Generated og-image.png (1200x630)!');
}

makeOgImage();
