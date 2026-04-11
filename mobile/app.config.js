const path = require('path');

const brandIcon = path.resolve(
  __dirname,
  '..',
  'assets',
  'brand',
  'clara-code-logo-voice-v3.png'
);

module.exports = {
  expo: {
    name: 'Clara Code',
    slug: 'clara-code-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: brandIcon,
    scheme: 'clara-code',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    splash: {
      image: brandIcon,
      resizeMode: 'contain',
      backgroundColor: '#0D1117',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.claracode.mobile',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: brandIcon,
        backgroundColor: '#0D1117',
      },
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
    },
  },
};
