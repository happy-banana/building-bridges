'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

if (!(typeof window !== 'undefined' && window)) {
  var requireNode = require;
} else {
  var requireNode = window.requireNode;
}

var fs = requireNode('fs-promise');
var path = requireNode('path');

var getFileProperties = function getFileProperties(filePath) {
  var _fd = void 0,
      _o = void 0;
  return fs.open(filePath, 'r').then(function (fd) {
    _fd = fd;
    return fd;
  }).then(function (fd) {
    return fs.fstat(fd);
  }).then(function (o) {
    _o = o;
    return _o;
  }).then(function (o) {
    return fs.close(_fd);
  }).then(function () {
    return {
      path: filePath,
      isDirectory: _o.isDirectory(),
      isFile: _o.isFile()
    };
  });
};

var SlidesFolderParser = function () {
  function SlidesFolderParser() {
    _classCallCheck(this, SlidesFolderParser);
  }

  _createClass(SlidesFolderParser, [{
    key: 'parse',
    value: function parse(presentationPath, slidesFolderPath) {
      var _this = this;

      //read the contents of the slides directory
      return fs.readdir(slidesFolderPath).then(function (result) {
        return result.filter(function (name) {
          return name.indexOf('.') > 0;
        });
      }).then(function (result) {
        return result.map(function (name) {
          return path.resolve(slidesFolderPath, name);
        });
      }).then(function (result) {
        return Promise.all(result.map(function (filePath) {
          return getFileProperties(filePath);
        }));
      }).then(function (result) {
        var data = {
          slides: []
        };
        var slidesByName = {};
        result.forEach(function (props) {
          var slide = _this.createSlideObjectBasedOnFileProperties(props, presentationPath, slidesByName);
          if (!slidesByName[slide.name]) {
            data.slides.push(slide);
          }
          slidesByName[slide.name] = slide;
        });
        console.log(data.slides);
        return data;
      });
    }
  }, {
    key: 'getPresentationVersionIfExists',
    value: function getPresentationVersionIfExists(fileProperties, presentationPath, slidesByName) {
      var ext = path.extname(fileProperties.path);
      var pathWithoutExtension = fileProperties.path.substr(0, fileProperties.path.length - ext.length);
      var typeExt = path.extname(pathWithoutExtension);
      if (typeExt === '.mobile') {
        //this might be an alternative mobile view of an existing slide
        var nameOfPresentationVersionWithoutExtension = path.basename(pathWithoutExtension.substr(0, pathWithoutExtension.length - typeExt.length));
        return slidesByName[nameOfPresentationVersionWithoutExtension];
      }
      return false;
    }
  }, {
    key: 'getMobileVersionIfExists',
    value: function getMobileVersionIfExists(fileProperties, presentationPath, slidesByName) {
      var ext = path.extname(fileProperties.path);
      var pathWithoutExtension = fileProperties.path.substr(0, fileProperties.path.length - ext.length);
      var nameOfMobileVersionWithoutExtension = path.basename(pathWithoutExtension) + '.mobile';
      return slidesByName[nameOfMobileVersionWithoutExtension];
    }
  }, {
    key: 'createSlideObjectBasedOnFileProperties',
    value: function createSlideObjectBasedOnFileProperties(fileProperties, presentationPath, slidesByName) {
      var ext = path.extname(fileProperties.path);
      var nameWithoutExtension = path.basename(fileProperties.path.substr(0, fileProperties.path.length - ext.length));
      var slide = {
        path: fileProperties.path,
        name: nameWithoutExtension,
        presentation: {
          url: path.relative(presentationPath, fileProperties.path)
        },
        mobile: {
          url: path.relative(presentationPath, fileProperties.path)
        }
      };

      if (ext === '.jpg' || ext === '.gif' || ext === '.png') {
        slide.presentation.url = 'slides-builtin/image.html?image=' + slide.presentation.url;
      }
      if (ext === '.mp4') {
        slide.presentation.url = 'slides-builtin/video.html?video=' + slide.presentation.url;
      }
      slide.mobile.url = slide.presentation.url;

      var presentationVersion = this.getPresentationVersionIfExists(fileProperties, presentationPath, slidesByName);
      if (presentationVersion) {
        presentationVersion.mobile.url = slide.mobile.url;
        return presentationVersion;
      }
      var mobileVersion = this.getMobileVersionIfExists(fileProperties, presentationPath, slidesByName);
      if (mobileVersion) {
        mobileVersion.presentation.url = slide.presentation.url;
        return mobileVersion;
      }

      return slide;
    }
  }]);

  return SlidesFolderParser;
}();

exports.default = SlidesFolderParser;