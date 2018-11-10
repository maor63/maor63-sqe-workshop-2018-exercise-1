import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {convertStatementToRows} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    // it('is parsing an empty function correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('')),
    //         '{"type":"Program","body":[],"sourceType":"script"}'
    //     );
    // });
    //
    // it('is parsing a simple variable declaration correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('let a = 1;')),
    //         '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
    //     );
    // });

    it('is parsing an empty string to no table rows', () => {
        assert.equal(
            convertStatementToRows(parseCode('')),
            ''
        );
    });

    it('is parsing a simple variable declaration to 1 table row', () => {
        assert.equal(
            convertStatementToRows(parseCode('let a = 1;')),
            '<tr><td>1</td><td>VariableDeclarator</td><td>a</td><td></td><td>1</td></tr>'
        );
    });

    it('is parsing a 3 simple variable declaration to 3 table row', () => {
        assert.equal(
            convertStatementToRows(parseCode('let a = 1;\nlet b = 4;\nlet c = 1;')),
            '<tr><td>1</td><td>VariableDeclarator</td><td>a</td><td></td><td>1</td></tr>' +
            '<tr><td>2</td><td>VariableDeclarator</td><td>b</td><td></td><td>4</td></tr>' +
            '<tr><td>3</td><td>VariableDeclarator</td><td>c</td><td></td><td>1</td></tr>'
        );
    });

    it('is parsing a simple variable declaration no init to 1 table row', () => {
        assert.equal(
            convertStatementToRows(parseCode('let a;')),
            '<tr><td>1</td><td>VariableDeclarator</td><td>a</td><td></td><td></td></tr>'
        );
    });

    it('is parsing a 3 simple variable declaration no init to 3 table row', () => {
        assert.equal(
            convertStatementToRows(parseCode('let a;\nlet b;\nlet c;')),
            '<tr><td>1</td><td>VariableDeclarator</td><td>a</td><td></td><td></td></tr>' +
            '<tr><td>2</td><td>VariableDeclarator</td><td>b</td><td></td><td></td></tr>' +
            '<tr><td>3</td><td>VariableDeclarator</td><td>c</td><td></td><td></td></tr>'
        );
    });

    it('is parsing a 3 simple variable declaration 2 no init 1 with init to 3 table row', () => {
        assert.equal(
            convertStatementToRows(parseCode('let a, g;\nlet b = 6;\nlet c;')),
            '<tr><td>1</td><td>VariableDeclarator</td><td>a</td><td></td><td></td></tr>' +
            '<tr><td>1</td><td>VariableDeclarator</td><td>g</td><td></td><td></td></tr>' +
            '<tr><td>2</td><td>VariableDeclarator</td><td>b</td><td></td><td>6</td></tr>' +
            '<tr><td>3</td><td>VariableDeclarator</td><td>c</td><td></td><td></td></tr>'
        );
    });

    it('is parsing a simple function no body', () => {
        assert.equal(
            convertStatementToRows(parseCode(
                `function foo(){
            }`)),
            '<tr><td>1</td><td>FunctionDeclaration</td><td>foo</td><td></td><td></td></tr>'
        );
    });

    it('is parsing a simple function 1 line body', () => {
        assert.equal(
            convertStatementToRows(parseCode(
                `function foo(){
                let a = 'd';
            }`)),
            '<tr><td>1</td><td>FunctionDeclaration</td><td>foo</td><td></td><td></td></tr>' +
            '<tr><td>2</td><td>VariableDeclarator</td><td>a</td><td></td><td>d</td></tr>'
        );
    });

    it('is parsing a simple function 2 line body and var declarations', () => {
        assert.equal(
            convertStatementToRows(parseCode(
                `let c, g;
                function foo(){
                let id = 1;
                let name = 'maor';
            }`)),
            '<tr><td>1</td><td>VariableDeclarator</td><td>c</td><td></td><td></td></tr>' +
            '<tr><td>1</td><td>VariableDeclarator</td><td>g</td><td></td><td></td></tr>' +
            '<tr><td>2</td><td>FunctionDeclaration</td><td>foo</td><td></td><td></td></tr>' +
            '<tr><td>3</td><td>VariableDeclarator</td><td>id</td><td></td><td>1</td></tr>' +
            '<tr><td>4</td><td>VariableDeclarator</td><td>name</td><td></td><td>maor</td></tr>'
        );
    });

    it('is parse simple assignment expression', () => {
        assert.equal(
            convertStatementToRows(parseCode(
                `let c;
                c = 34;
            `)),
            '<tr><td>1</td><td>VariableDeclarator</td><td>c</td><td></td><td></td></tr>' +
            '<tr><td>2</td><td>AssignmentExpression</td><td>c</td><td></td><td>34</td></tr>'
        );
    });
});
