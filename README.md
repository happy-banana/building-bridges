#Building Bridges

Interactive presentation built with electron & nodejs. (Using electron 0.30.4 on iojs v2.3.1)
Run on windows, as there is native binding to the MS Kinect SDK.

  cd presentation
  npm start

## dependencies

### presentation

Don't forget to install the presentation dependencies.

  cd presentation
  npm install

Native addons will need to be recompiled for electron 0.30.4

  ./node_modules/.bin/electron-rebuild
