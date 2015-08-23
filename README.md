#Building Bridges

Interactive presentation built with electron & nodejs. (Using electron 0.30.4 on iojs v2.3.1)
Run on windows, as there is native binding to the MS Kinect SDK.

	electron presentation

## dependencies

### presentation

Don't forget to install the presentation dependencies.

  cd presentation
  npm install

Native addons will need to be recompiled for electron 0.30.4

  cd addon_dir
  node-gyp rebuild --target=0.30.4 --arch=x64 --dist-url=https://atom.io/download/atom-shell

### node child apps

Some of the examples run a separate nodejs process, with external dependencies. Don't forget to npm install those:

  cd child-app\node
  npm install
