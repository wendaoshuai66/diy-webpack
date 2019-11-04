  (function(modules) {

      var installedModules = {};

      function __webpack_require__(moduleId) {

          if (installedModules[moduleId]) {
              return installedModules[moduleId].exports;
          }
          var module = installedModules[moduleId] = {
              exports: {}
          };
          modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);


          return module.exports;
      }

      return __webpack_require__("./src/index.js");
  })
  ({

      "./src/async1.js":

          (function(module, __webpack_exports__, __webpack_require__) {
          const async = `hello nihao`;
          __webpack_exports__["default"] = (async)

      }),

      "./src/index.js":

          (function(module, __webpack_exports__, __webpack_require__) {
          var _async1__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/async1.js");
          //import 就相当于 var async1 = __webpack_require__(\"./src/async1.js\");
          console.log(_async1__WEBPACK_IMPORTED_MODULE_0__["default"])

      })

  });