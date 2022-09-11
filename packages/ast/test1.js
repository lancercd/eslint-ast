const esprima = require('esprima');
const estraverse = require('estraverse');
const escodegen = require('escodegen');

let code = `function aaa() {}`;

const ast = esprima.parseScript(code);
console.log(ast);

estraverse.traverse(ast, {
    enter(node) {
        if (node.type === 'FunctionDeclaration') {
            node.id.name = 'bbb';
        }
    },
    leave(node) {

    }
})

const transCode = escodegen.generate(ast);
console.log(transCode);
