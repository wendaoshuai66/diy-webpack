#Webpack系列手写模块打包代码

##Webpack 打包后文件分析

```
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
          //import 就相当于 var async1 = __webpack_require__("./src/async1.js");
          console.log(_async1__WEBPACK_IMPORTED_MODULE_0__["default"])

      })

  });
```

上述代码主要由以下几个部分组成：

最外层是一个自执行函数

自执行函数会传递一个 modules 参数，这个参数是一个对象，{key: 文件路径,value: 函数}，value 中的函数内部是打包前模块的 js 代码。

内部自定义一个 webpack_require 执行器，用来执行导入的文件，并导出 exports。

实现了common.js规范，不发网络请求，把包打包到了自己身上 eval编译快执行快

##手写一个模块打包器

###整体流程分析

1.读取入口文件

2.将内容转换为ast树

3.深度遍历语法树，找到所有的依赖，并加入到一个数组中。

4.将ast树转换为可执行js的代码

5编写__webpack_require__函数，根据入口文件自动执行完所有的依赖。


根据上述步骤开始写代码😊

代码层分为四层


一层读取入口文件，将内容转化为ast（抽象语法树）树，遍历语法树并将import xxx from './xxx.js' 转化为var xxx = __webpack_require__("xxx"); 将export default xxx 转化为 __webpack_exports__["default"] = xxx 


```
function parse(filename) {
    const contant = fs.readFileSync(filename, 'utf-8');
    //将字符串转换为ast抽象语法树
    const ast = parser.parse(contant, {
            sourceType: 'module'
        })
        // console.log(ast)
    const code = new MagicString(contant);
    //遍历抽象语法树
    traverse(ast, {
        ExportDeclaration({
            node
        }) {
            const {
                start,
                end,
                declaration,
            } = node;
            code.overwrite(start, end,
                `__webpack_exports__["default"]=${declaration.name}`
            )
        },
        ImportDeclaration({
            node
        }) {
            // console.log('🌟🌟', node)
            const {
                start,
                end,
                specifiers,
                source
            } = node;
            const newFile = "./src/" + path.join(source.value) + '.js';
            code.overwrite(start, end,
                `var ${specifiers[0].local.name}=__webpack_require__("${newFile}").default`
            )
        }
    })
    const _code = code.toString()
}

```

二层 深度遍历语法树，找到所有依赖并放入数组中，生成所有资源对象数组。


```
    //  全局的依赖项
const dependencies = [];

function parse(filename) {
    const contant = fs.readFileSync(filename, 'utf-8');
    //获取当前的依赖
    const garphArray = [];
    //将字符串转换为ast抽象语法树
    const ast = parser.parse(contant, {
            sourceType: 'module'
        })
        // console.log(ast)
    const code = new MagicString(contant);
    //遍历抽象语法树
    traverse(ast, {
        ExportDeclaration({
            node
        }) {
            const {
                start,
                end,
                declaration,
            } = node;
            code.overwrite(start, end,
                `__webpack_exports__["default"]=${declaration.name}`
            )
        },
        ImportDeclaration({
            node
        }) {
            // console.log('🌟🌟', node)
            const {
                start,
                end,
                specifiers,
                source
            } = node;
            const newFile = "./src/" + path.join(source.value) + '.js';
            code.overwrite(start, end,
                `var ${specifiers[0].local.name}=__webpack_require__("${newFile}").default`
            )
            garphArray.push(newFile);
        }
    })
    const _code = code.toString()
    dependencies.push({
        filename,
        _code
    });
    return garphArray;
}
let garphArray = parse(entryPonint);
//对其进行递归
for (let item of garphArray) {
    parse(item)
}
console.log(dependencies)

```

三层 封装自执行函数，创建 __webpack_require__ 方法，处理文件相互依赖，该处引入ejs对模版处理

```
const template = `
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
      return __webpack_require__("${entryPonint}");
  })
  ({

    <% for(var i = 0; i < dependencies.length; i++){ %>
        "<%-dependencies[i]["filename"]%>":
        (function (module, __webpack_exports__, __webpack_require__) {
               <%-dependencies[i]["_code"]%>
            }),
    <% } %>
  });
`;

let result = ejs.render(template, {
    dependencies
})
```

四层 将其result 模版 写出

```
fs.writeFileSync("./dist/main.js", result)
```

##运行

```
npm i 

npm run diy
```