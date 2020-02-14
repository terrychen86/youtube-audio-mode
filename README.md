# 🎧 Youtube Audio Mode
Turn on song mode to save internet bandwidth and enjoy music!

[![Build Status](https://img.shields.io/travis/terrychen86/youtube-audio-mode?style=flat-square)](https://travis-ci.org/terrychen86/youtube-audio-mode) [![dependencies Status](https://img.shields.io/david/terrychen86/youtube-audio-mode?style=flat-square)](https://david-dm.org/terrychen86/youtube-audio-mode) [![devDependencies Status](https://img.shields.io/david/dev/terrychen86/youtube-audio-mode?style=flat-square)](https://david-dm.org/terrychen86/youtube-audio-mode?type=dev) ![Types](https://img.shields.io/npm/types/typescript?style=flat-square "https://github.com/microsoft/TypeScript")

![Hero Image](https://i.imgur.com/RjPbXwX.png)

## Getting it

This extension has not yet published on Chrome Web Store.

The easiest way to install it is: 
1. Download the extension [here](https://github.com/terrychen86/youtube-audio-mode/releases/tag/v0.0.1-alpha)
2. Go to [chrome://extensions](chrome://extensions) and check the box for `Developer mode` at the top right.
3. Manually load the unpacked extension.


## Building From Source

If you want to install it from source, make sure your development environment meets the requirement.

### Requirements

- [Node.js](nodejs.org) >= 12
- [Yarn](https://github.com/yarnpkg/yarn)

### Clone
```
$ git clone https://github.com/terrychen86/youtube-audio-mode.git
$ cd youtube-audio-mode
```

### Setup

```
$ yarn install
```

### Build
Use build script to run Webpack and create a production build.

```
$ yarn build
```

After getting the success message from Webpack, you should have the extension (unpacked) in the `dist` folder just created.

## Contributing
This project is still ongoing, so more bug fixes and improvements will come; however please feel free to play around and hack it.

### Developing
1. Use the following script to open a Webpack running in watch mode.

  ```
  $ yarn start
  ```

2. Go to [chrome://extensions](chrome://extensions) and manually load the `dist` folder as an unpacked extension.

3. Hack away. All changes should be hot-reloaded to Chrome.


## Attribution
Check [ATTRIBUTION.md](https://github.com/terrychen86/youtube-audio-mode/blob/master/ATTRIBUTION.md)

## License
WIP...
