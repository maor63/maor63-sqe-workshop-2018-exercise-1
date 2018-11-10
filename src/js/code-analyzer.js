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

function getTableRow(index, type, name, condition, value) {
    return '<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>'.format(index, type, name, condition, value);
}

function convertStatementToRows(parsedCode) {
    let outputRows = '';
    if (parsedCode.type === 'Program' || parsedCode.type === 'BlockStatement') {
        for (let i = 0; i < parsedCode.body.length; i++) {
            outputRows += convertStatementToRows(parsedCode.body[i]);
        }
    }
    else if (parsedCode.type === 'VariableDeclaration') {
        for (let i = 0; i < parsedCode.declarations.length; i++) {
            outputRows += convertStatementToRows(parsedCode.declarations[i]);
        }
    }
    else if (parsedCode.type === 'VariableDeclarator') {
        let index = parsedCode.loc.start.line;
        let type = parsedCode.type;
        let name = evalExpression(parsedCode.id);
        let value = parsedCode.init == null ? '' : parsedCode.init.value;
        outputRows += getTableRow(index, type, name, '', value);
    }
    else if (parsedCode.type === 'ExpressionStatement') {
        outputRows += convertStatementToRows(parsedCode.expression);
    }
    else if (parsedCode.type === 'FunctionDeclaration') {
        let index = parsedCode.loc.start.line;
        let type = parsedCode.type;
        let name = evalExpression(parsedCode.id);
        outputRows += getTableRow(index, type, name, '', '');
        for (let i = 0; i < parsedCode.params.length; i++) {
            let type = 'VariableDeclarator';
            let paramName = evalExpression(parsedCode.params[i]);
            outputRows += getTableRow(index, type, paramName, '', '');
        }
        outputRows += convertStatementToRows(parsedCode.body);
    }
    else if (parsedCode.type === 'AssignmentExpression') {
        let index = parsedCode.loc.start.line;
        let type = parsedCode.type;
        let left = evalExpression(parsedCode.left);
        let right = evalExpression(parsedCode.right);
        outputRows += getTableRow(index, type, left, '', right);
    }

    return outputRows;
}

function evalExpression(expression) {
    if (expression.type === 'Identifier') {
        return expression.name;
    }
    else if (expression.type === 'MemberExpression') {
        let member = evalExpression(expression.object);
        let property = evalExpression(expression.property);
        return member + '[' + property + ']';
    }
    else if (expression.type === 'Literal') {
        return expression.value;
    }
    else if (expression.type === 'CallExpression') {
        let callee = evalExpression(expression.callee);
        let args = [];
        for (let i = 0; i < expression.arguments.length; i++) {
            args.push(evalExpression(expression.arguments[i]));
        }
        return callee + '(' + args.join(',') + ')';
    }
}

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] !== 'undefined' ? args[i++] : '';
    });
};

export {parseCode, convertStatementToRows};
