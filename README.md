#Building Bridges

Interactive presentation built with electron & nodejs. (Using electron 0.37.4 on node 4.2.2)
Run on windows, as there is native binding to the MS Kinect SDK.

```bash
cd presentation
npm start
```

## dependencies

### presentation

Don't forget to install the presentation dependencies.

```bash
cd presentation
npm install
cd nms
npm install
```

Native addons will need to be recompiled for electron

```
./node_modules/.bin/electron-rebuild
cd node_modules/kinect2
node tools/electronbuild.js --target=0.37.4 --arch=x64
```

## building

Project is built using gulp. Make sure you have a global gulp install and run gulp in the root of this repo.