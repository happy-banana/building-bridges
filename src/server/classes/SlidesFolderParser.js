if(!(typeof window !== 'undefined' && window)) {
  var requireNode = require;
} else {
  var requireNode = window.requireNode;
}

const fs = requireNode('fs-promise');
const path = requireNode('path');

const getFileProperties = filePath => {
  let _fd, _o;
  return fs.open(filePath, 'r')
    .then(fd => {
      _fd = fd;
      return fd;
    })
    .then(fd => fs.fstat(fd))
    .then(o => {
      _o = o;
      return _o;
    })
    .then(o => fs.close(_fd))
    .then(() => {
      return {
        path: filePath,
        isDirectory: _o.isDirectory(),
        isFile: _o.isFile()
      };
    });
};
export default class SlidesFolderParser {
  constructor() {
  }
  parse(presentationPath, slidesFolderPath) {
    //read the contents of the slides directory
    return fs.readdir(slidesFolderPath)
      .then(result => result.filter(name => name.indexOf('.') > 0))
      .then(result => result.map(name => path.resolve(slidesFolderPath, name)))
      .then(result => Promise.all(result.map(filePath => getFileProperties(filePath))))
      .then(result => {
        let data = {
          slides: []
        };
        let slidesByName = {};
        result.forEach(props => {
          let slide = this.createSlideObjectBasedOnFileProperties(props, presentationPath, slidesByName);
          if(!slidesByName[slide.name]) {
            data.slides.push(slide);
          }
          slidesByName[slide.name] = slide;
        });
        console.log(data.slides);
        return data;
      });
  }

  getPresentationVersionIfExists(fileProperties, presentationPath, slidesByName){
    let ext = path.extname(fileProperties.path);
    let pathWithoutExtension = fileProperties.path.substr(0, fileProperties.path.length - ext.length);
    let typeExt = path.extname(pathWithoutExtension);
    if(typeExt === '.mobile') {
      //this might be an alternative mobile view of an existing slide
      let nameOfPresentationVersionWithoutExtension = path.basename(pathWithoutExtension.substr(0, pathWithoutExtension.length - typeExt.length));
      return slidesByName[nameOfPresentationVersionWithoutExtension];
    }
    return false;
  }

  getMobileVersionIfExists(fileProperties, presentationPath, slidesByName){
    let ext = path.extname(fileProperties.path);
    let pathWithoutExtension = fileProperties.path.substr(0, fileProperties.path.length - ext.length);
    let nameOfMobileVersionWithoutExtension = path.basename(pathWithoutExtension) + '.mobile';
    return slidesByName[nameOfMobileVersionWithoutExtension];
  }

  createSlideObjectBasedOnFileProperties(fileProperties, presentationPath, slidesByName) {
    let ext = path.extname(fileProperties.path);
    let nameWithoutExtension = path.basename(fileProperties.path.substr(0, fileProperties.path.length - ext.length));
    let slide = {
      path: fileProperties.path,
      name: nameWithoutExtension,
      presentation: {
        url: path.relative(presentationPath, fileProperties.path),
      },
      mobile: {
        url: path.relative(presentationPath, fileProperties.path),
      }
    };

    if(ext === '.jpg' || ext === '.gif' || ext === '.png') {
      slide.presentation.url = 'slides-builtin/image.html?image=' + slide.presentation.url;
    }
    if(ext === '.mp4') {
      slide.presentation.url = 'slides-builtin/video.html?video=' + slide.presentation.url;
    }
    slide.mobile.url = slide.presentation.url;

    let presentationVersion = this.getPresentationVersionIfExists(fileProperties, presentationPath, slidesByName);
    if(presentationVersion) {
      presentationVersion.mobile.url = slide.mobile.url;
      return presentationVersion;
    }
    let mobileVersion = this.getMobileVersionIfExists(fileProperties, presentationPath, slidesByName);
    if(mobileVersion) {
      mobileVersion.presentation.url = slide.presentation.url;
      return mobileVersion;
    }

    return slide;
  }
}
