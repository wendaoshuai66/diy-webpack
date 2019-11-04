
  (function (modules) {

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

    
        "./src/index.js":
        (function (module, __webpack_exports__, __webpack_require__) {
               var async=__webpack_require__("./src/async1.js").default
//import 就相当于 var async1 = __webpack_require__("./src/async1.js");
console.log(async)
            }),
    
        "./src/async1.js":
        (function (module, __webpack_exports__, __webpack_require__) {
               const async = `hello nihao`;
__webpack_exports__["default"]=async
            }),
    
  });
