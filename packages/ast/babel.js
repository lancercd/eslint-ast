const esprima = require('esprima');
const estraverse = require('estraverse');
const escodegen = require('escodegen');

const babel = require('@babel/core');
const types = require('@babel/types');

function getThisPath(path) {
    let arr = [];
    path.traverse({
        ThisExpression(p) {
            arr.push(p);
        }
    });

    return arr;
}

function hoistFunctionEnv(path) {
    const thisEnv = path.findParent((parent) => (parent.isFunction() && !parent.isArrowFunctionExpression()) || parent.isProgram());

    const bingingThis = '_this';

    const thisPaths = getThisPath(path);

    thisPaths.forEach(p => {
        p.replaceWith(types.identifier(bingingThis));
    });
    // console.log(types.thisExpression());

    thisEnv.scope.push({
        id: types.identifier(bingingThis),
        init: types.thisExpression(),
    });
}

const transformFunction = {
    visitor: {
        ArrowFunctionExpression(path) {
            const { node } = path;
            node.type = "FunctionExpression";

            hoistFunctionEnv(path);

            const { body } = node;
            if (!types.isBlockStatement(body)) {
                node.body = types.blockStatement([types.returnStatement(body)]);
            }
        },
    }
}


const code = `
const sum = () => console.log(this)
const bb = () => console.log(this)
function aa() {
    console.log(this);
}
`;

const res = babel.transform(code, {
    plugins: [transformFunction],
});

console.log(res.code);

