import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true});
};

function extractTableRow(varData) {
    let index = varData.loc.start.line;
    let type = varData.type;
    let name = varData.id.name;
    let value = varData.init == null ? '' : varData.init.value;
    let row = '<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>'.format(index, type, name, value);
    return row;
}

function convertNodeToRows(parsedCode) {
    let outputRows = '';
    if(parsedCode.type === 'Program') {
        for(let i = 0; i < parsedCode.body.length; i++) {
            outputRows += convertNodeToRows(parsedCode.body[i])
        }
    }
    else if(parsedCode.type === 'VariableDeclaration'){
        for(let i = 0; i < parsedCode.declarations.length; i++) {
            outputRows += convertNodeToRows(parsedCode.declarations[i]);
        }
    }
    else if(parsedCode.type === 'VariableDeclarator') {
        let index = parsedCode.loc.start.line;
        let type = parsedCode.type;
        let name  = parsedCode.id.name;
        let value = parsedCode.init == null ? '' : parsedCode.init.value;
        outputRows += '<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>'.format(index, type, name, value);
    }
    else if(parsedCode.type === 'ExpressionStatement') {
        outputRows += convertNodeToRows(parsedCode.expression);
    }
    else if(parsedCode.type === 'AssignmentExpression') {
        let index = parsedCode.loc.start.line;
        let type = parsedCode.type;
        let left =  evalExpression(parsedCode.left);
        let right =  evalExpression(parsedCode.right);
        outputRows += '<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>'.format(index, type, left, right);
    }

    return outputRows;
}

function evalExpression(expression){
    if(expression.type === 'Identifier'){
        return expression.name;
    }
    else if(expression.type === 'MemberExpression'){
        let member = evalExpression(expression.object);
        let property = evalExpression(expression.property);
        return member +'[' + property + ']';
    }
    else if(expression.type === 'Literal'){
        return expression.value;
    }
    else if(expression.type === 'CallExpression'){
        let callee = evalExpression(expression.callee);
        let args = [];
        for(let i = 0; i < expression.arguments.length; i++) {
            args.push(evalExpression(expression.arguments[i]));
        }
        return callee +'(' + args.join(',') + ')';
    }
}

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] !== 'undefined' ? args[i++] : '';
    });
};

export {parseCode, convertNodeToRows};
