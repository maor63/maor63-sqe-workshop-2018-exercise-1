import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true});
};

function getTableRow(index, type, name, condition, value) {
    return '<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>'.format(index, type, name, condition, value);
}

function convertStatementToRows(parsedCode) {
    let outputRows = '';
    let index = parsedCode.loc.start.line;
    let type = parsedCode.type;
    if (parsedCode.type === 'Program' || parsedCode.type === 'BlockStatement') {
        for (let i = 0; i < parsedCode.body.length; i++) {
            outputRows += convertStatementToRows(parsedCode.body[i]);
        }
    }
    else if (parsedCode.type === 'VariableDeclaration') {
        let statementList = parsedCode.declarations;
        for (let i = 0; i < statementList.length; i++) {
            outputRows += convertStatementToRows(statementList[i]);
        }
    }
    else if (parsedCode.type === 'VariableDeclarator') {
        let name = evalExpression(parsedCode.id);
        let value = parsedCode.init == null ? '' : evalExpression(parsedCode.init);
        outputRows += getTableRow(index, type, name, '', value);
    }
    else if (parsedCode.type === 'ExpressionStatement') {
        outputRows += convertStatementToRows(parsedCode.expression);
    }
    else if (parsedCode.type === 'FunctionDeclaration') {
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
        let left = evalExpression(parsedCode.left);
        let right = evalExpression(parsedCode.right);
        outputRows += getTableRow(index, type, left, '', right);
    }
    else if (parsedCode.type === 'WhileStatement') {
        let condition = evalExpression(parsedCode.test);
        outputRows += getTableRow(index, type, '', condition, '');
        outputRows += convertStatementToRows(parsedCode.body);
    }
    else if (parsedCode.type === 'IfStatement') {
        let condition = evalExpression(parsedCode.test);
        outputRows += getTableRow(index, type, '', condition, '');
        outputRows += convertStatementToRows(parsedCode.consequent);
        if (parsedCode.alternate !== null){
            outputRows += convertStatementToRows(parsedCode.alternate);
        }
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
    else if (expression.type === 'BinaryExpression') {
        let left = evalExpression(expression.left);
        let right = evalExpression(expression.right);
        let operator = expression.operator;
        return '{}{}{}'.format(left, operator, right);
    }
}

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] !== 'undefined' ? args[i++] : '';
    });
};

export {parseCode, convertStatementToRows};
