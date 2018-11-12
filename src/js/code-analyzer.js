import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true});
};


let evalFunctions = {
    MemberExpression: evalMemberExpression,
    Literal: evalLiteral,
    CallExpression: evalCallExpression,
    BinaryExpression: evalBinaryExpression,
    Identifier: evalIdentifier,
};

let parseFunctions = {
    BlockStatement: parseBlockStatement,
    Program: parseBlockStatement,
    VariableDeclaration: parseVariableDeclaration,
    VariableDeclarator: parseVariableDeclarator,
    ExpressionStatement: parseExpressionStatement,
    FunctionDeclaration: parseFunctionDeclaration,
    AssignmentExpression: parseAssignmentExpression,
    WhileStatement: parseWhileStatement,
    IfStatement: parseIfStatement,
    CallExpression: parseCallExpression,
};

function createTableRow(index, type, name, condition, value) {
    return '<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>'.format(index, type, name, condition, value);
}

function parseStatementList(statementList, inIfStatement) {
    let outputRows = '';
    for (let i = 0; i < statementList.length; i++) {
        outputRows += parseStatement(statementList[i], inIfStatement);
    }
    return outputRows;
}


function parseBlockStatement(parsedCode, inIfStatement) {
    return parseStatementList(parsedCode.body, inIfStatement);
}

function parseVariableDeclaration(parsedCode) {
    return parseStatementList(parsedCode.declarations);
}

function parseVariableDeclarator(parsedCode) {
    let index = parsedCode.loc.start.line;
    let name = evalExpression(parsedCode.id);
    let value = parsedCode.init == null ? '' : evalExpression(parsedCode.init);
    return createTableRow(index, 'variable declarator', name, '', value);
}

function parseExpressionStatement(parsedCode, inIfStatement) {
    let outputRows = '';
    if (inIfStatement)
        outputRows += createTableRow(parsedCode.loc.start.line - 1, 'else statement', '', '', '');
    return outputRows + parseStatement(parsedCode.expression);
}

function parseFunctionDeclaration(parsedCode) {
    let index = parsedCode.loc.start.line;
    let name = evalExpression(parsedCode.id);
    let outputRows = createTableRow(index, 'function declaration', name, '', '');
    for (let i = 0; i < parsedCode.params.length; i++) {
        let paramName = evalExpression(parsedCode.params[i]);
        outputRows += createTableRow(index, 'variable declarator', paramName, '', '');
    }
    outputRows += parseStatement(parsedCode.body);
    return outputRows;
}

function parseAssignmentExpression(parsedCode) {
    let index = parsedCode.loc.start.line;
    let left = evalExpression(parsedCode.left);
    let right = evalExpression(parsedCode.right);
    return createTableRow(index, 'assignment expression', left, '', right);
}

function parseWhileStatement(parsedCode) {
    let index = parsedCode.loc.start.line;
    let condition = evalExpression(parsedCode.test);
    let outputRows = createTableRow(index, 'while statement', '', condition, '');
    return outputRows + parseStatement(parsedCode.body);
}

function parseIfStatement(parsedCode, inIfStatement) {
    let index = parsedCode.loc.start.line;
    let type = parsedCode.type;
    let condition = evalExpression(parsedCode.test);
    let outputRows = '';
    if (inIfStatement)
        outputRows += createTableRow(index, 'else if statement', '', condition, '');
    else
        outputRows += createTableRow(index, 'if statement', '', condition, '');
    outputRows += parseStatement(parsedCode.consequent);
    if (parsedCode.alternate !== null) {
        outputRows += parseStatement(parsedCode.alternate, true);
    }
    return outputRows;
}

function parseCallExpression(parsedCode) {
    let index = parsedCode.loc.start.line;
    let name = evalExpression(parsedCode);
    return createTableRow(index, 'call expression', name, '', '');
}

function parseStatement(parsedCode, inIfStatement = false) {
    if (parsedCode.type in parseFunctions)
        return parseFunctions[parsedCode.type](parsedCode, inIfStatement);
    else
        return '';
}

function evalMemberExpression(expression) {
    let member = evalExpression(expression.object);
    let property = evalExpression(expression.property);
    return member + '[' + property + ']';
}

function evalLiteral(expression) {
    return expression.value;
}

function evalCallExpression(expression) {
    let callee = evalExpression(expression.callee);
    let args = [];
    for (let i = 0; i < expression.arguments.length; i++) {
        args.push(evalExpression(expression.arguments[i]));
    }
    return callee + '(' + args.join(',') + ')';
}

function evalBinaryExpression(expression) {
    let left = evalExpression(expression.left);
    let right = evalExpression(expression.right);
    let operator = expression.operator;
    return '{}{}{}'.format(left, operator, right);
}

function evalIdentifier(expression) {
    return expression.name;
}

function evalExpression(expression) {
    if (expression.type in evalFunctions)
        return evalFunctions[expression.type](expression);
    else
        return '';
}

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] !== 'undefined' ? args[i++] : '';
    });
};

export {parseCode, parseStatement};
