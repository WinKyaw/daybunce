const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add additional asset extensions for Myanmar fonts and other assets
config.resolver.assetExts.push(
  // Fonts
  'otf',
  'ttf',
  'woff',
  'woff2',
  // Images
  'svg',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  // Documents
  'pdf',
  'doc',
  'docx'
);

// Add Myanmar font support
config.resolver.platforms = ['ios', 'android', 'web'];

module.exports = config;
