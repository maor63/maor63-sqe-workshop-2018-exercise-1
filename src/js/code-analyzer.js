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

function convertToTableRows(parsedCode) {
    let outputRows = '';
    for (let i = 0; i < parsedCode.body.length; i++) {
        if(parsedCode.body[i].type === 'VariableDeclaration') {
            for(let j = 0; j < parsedCode.body[i].declarations.length; j++) {
                let varData = parsedCode.body[i].declarations[j];
                outputRows += extractTableRow(varData);
            }
        }
        else if(parsedCode.body[i].type === 'FunctionDeclaration'){
            let varData = parsedCode.body[i];
            outputRows += extractTableRow(varData);
            outputRows += convertToTableRows(parsedCode.body[i].body);
        }
        else if(parsedCode.body[i].type === 'AssignmentExpression'){
            let varData = parsedCode.body[i];
            outputRows += extractTableRow(varData);
           
        }
    }

    return outputRows;
}

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] !== 'undefined' ? args[i++] : '';
    });
};

export {parseCode, convertToTableRows};
