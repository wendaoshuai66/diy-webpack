//分析ast包 acorn   
const parser = require('babylon')
const traverse = require('@babel/traverse').default;
//文本小包
const MagicString = require('magic-string');
const entryPonint = "./src/index.js";
const fs = require('fs');
const path = require('path');
const ejs = require('ejs')
    //  全局的依赖项
const dependencies = [];

function parse(filename) {
    const contant = fs.readFileSync(filename, 'utf-8');
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

for (let item of garphArray) {
    parse(item)
}
console.log(dependencies)
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
fs.writeFileSync("./dist/main.js", result)