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
    UnaryExpression: evalUnaryExpression,
    LogicalExpression: evalBinaryExpression,
    UpdateExpression: evalUpdateExpression,
    ArrayExpression : evalArrayExpression,
    AssignmentExpression: parseAssignmentExpression,

};

let parseFunctions = {
    BlockStatement: parseBlockStatement,
    Program: parseBlockStatement,
    VariableDeclaration: parseVariableDeclaration,
    VariableDeclarator: parseVariableDeclarator,
    ExpressionStatement: parseExpressionStatement,
    FunctionDeclaration: parseFunctionDeclaration,

    WhileStatement: parseWhileStatement,
    IfStatement: parseIfStatement,

    ReturnStatement: parseReturnStatement,
    ForStatement: parseForStatement,
    SwitchStatement : parseSwitchStatement,
    SwitchCase : parseSwitchCase,
    BreakStatement  : parseBreakStatement,
    ContinueStatement  : parseContinueStatement,
    ForInStatement   : parseForInStatement ,
    DoWhileStatement    : parseWhileStatement ,
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
    let value = evalExpression(parsedCode.init);
    return createTableRow(index, convertTypeToName(parsedCode.type), name, '', value);
}

function convertTypeToName(nodeType) {
    return nodeType.split(/(?=[A-Z])/).join(' ').toLowerCase();
}

function parseExpressionStatement(parsedCode, inIfStatement) {
    let index = parsedCode.loc.start.line;
    let outputRows = '';
    if (inIfStatement)
        outputRows += createTableRow(parsedCode.loc.start.line - 1, 'else statement', '', '', '');
    return outputRows + createTableRow(index, convertTypeToName(parsedCode.expression.type), '','',evalExpression(parsedCode.expression));
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

function baseLoopParse(parsedCode, condition) {
    let index = parsedCode.loc.start.line;
    let outputRows = createTableRow(index, convertTypeToName(parsedCode.type), '', condition, '');
    return outputRows + parseStatement(parsedCode.body);
}

function parseWhileStatement(parsedCode) {
    return baseLoopParse(parsedCode, evalExpression(parsedCode.test));
}

function parseForInStatement(parsedCode) {
    let left = evalExpression(parsedCode.left);
    let right = evalExpression(parsedCode.right);
    return baseLoopParse(parsedCode, '{} in {}'.format(left, right));
}

function parseForStatement(parsedCode) {
    let index = parsedCode.loc.start.line;
    let condition = evalExpression(parsedCode.test);
    let outputRows = createTableRow(index, convertTypeToName(parsedCode.type), '', condition, '');
    outputRows += parseStatement(parsedCode.init);
    outputRows += createTableRow(index, convertTypeToName(parsedCode.update.type), '', '', evalExpression(parsedCode.update));
    return outputRows + parseStatement(parsedCode.body);
}

function parseIfStatement(parsedCode, inIfStatement) {
    let index = parsedCode.loc.start.line;
    let condition = evalExpression(parsedCode.test);
    let outputRows = '';
    if (inIfStatement)
        outputRows += createTableRow(index, 'else if statement', '', condition, '');
    else
        outputRows += createTableRow(index, 'if statement', '', condition, '');
    outputRows += parseStatement(parsedCode.consequent);
    outputRows += parseStatement(parsedCode.alternate, true);
    return outputRows;
}

function parseReturnStatement(parsedCode) {
    let index = parsedCode.loc.start.line;
    let value = evalExpression(parsedCode.argument);
    return createTableRow(index, 'return statement', '', '', value);
}

function parseSwitchStatement(parsedCode) {
    let index = parsedCode.loc.start.line;
    let discriminant = evalExpression(parsedCode.discriminant);
    let outputRows =  createTableRow(index, 'switch statement', '', discriminant, '');
    return outputRows + parseStatementList(parsedCode.cases);
}

function parseSwitchCase(parsedCode) {
    let index = parsedCode.loc.start.line;
    let test = evalExpression(parsedCode.test);
    test = test === '' ? 'default' : test;
    let outputRows = createTableRow(index, 'switch case', '', test, '');
    return outputRows + parseStatementList(parsedCode.consequent);
}

function parseBreakStatement(parsedCode) {
    let index = parsedCode.loc.start.line;
    return createTableRow(index, 'break statement', '', '', '');
}

function parseContinueStatement(parsedCode) {
    let index = parsedCode.loc.start.line;
    return createTableRow(index, 'continue statement', '', '', '');
}

function parseStatement(parsedCode, inIfStatement = false) {
    if (parsedCode !== null && parsedCode.type in parseFunctions)
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
    return expression.raw;
}

function evalElementList(elements) {
    let args = [];
    for (let i = 0; i < elements.length; i++) {
        args.push(evalExpression(elements[i]));
    }
    return args;
}

function evalCallExpression(expression) {
    let callee = evalExpression(expression.callee);
    let args = evalElementList(expression.arguments);
    return callee + '({})'.format(args.join(','));
}

function evalArrayExpression(expression) {
    let args = evalElementList(expression.elements);
    return '[{}]'.format(args.join(','));
}

function evalBinaryExpression(expression, inBinaryExpression) {
    let left = evalExpression(expression.left, true);
    let right = evalExpression(expression.right, true);
    if (inBinaryExpression)
        return '({}{}{})'.format(left, expression.operator, right);
    else
        return '{}{}{}'.format(left, expression.operator, right);
}

function parseAssignmentExpression(parsedCode) {
    let left = evalExpression(parsedCode.left);
    let right = evalExpression(parsedCode.right);
    return '{}{}{}'.format(left,parsedCode.operator, right);
}

function evalIdentifier(expression) {
    return expression.name;
}

function evalUnaryExpression(expression) {
    return '{}{}'.format(expression.operator, evalExpression(expression.argument));
}

function evalUpdateExpression(expression) {
    return '{}{}'.format(evalExpression(expression.argument), expression.operator);
}

function evalExpression(expression, inBinaryExpression = false) {
    if (expression !== null && expression.type in evalFunctions)
        return evalFunctions[expression.type](expression, inBinaryExpression);
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
