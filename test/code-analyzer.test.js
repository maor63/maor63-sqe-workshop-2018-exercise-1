import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {parseStatement} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty string to no table rows', () => {
        assert.equal(
            parseStatement(parseCode('')),
            ''
        );
    });

    it('is parsing a simple variable declaration to 1 table row', () => {
        assert.equal(
            parseStatement(parseCode('let a = 1;')),
            '<tr><td>1</td><td>variable declarator</td><td>a</td><td></td><td>1</td></tr>'
        );
    });

    it('is parsing a 3 simple variable declaration to 3 table row', () => {
        assert.equal(
            parseStatement(parseCode('let a = 1;\nlet b = 4;\nlet c = 1;')),
            '<tr><td>1</td><td>variable declarator</td><td>a</td><td></td><td>1</td></tr>' +
            '<tr><td>2</td><td>variable declarator</td><td>b</td><td></td><td>4</td></tr>' +
            '<tr><td>3</td><td>variable declarator</td><td>c</td><td></td><td>1</td></tr>'
        );
    });

    it('is parsing a simple variable declaration no init to 1 table row', () => {
        assert.equal(
            parseStatement(parseCode('let a;')),
            '<tr><td>1</td><td>variable declarator</td><td>a</td><td></td><td></td></tr>'
        );
    });

    it('is parsing a 3 simple variable declaration no init to 3 table row', () => {
        assert.equal(
            parseStatement(parseCode('let a;\nlet b;\nlet c;')),
            '<tr><td>1</td><td>variable declarator</td><td>a</td><td></td><td></td></tr>' +
            '<tr><td>2</td><td>variable declarator</td><td>b</td><td></td><td></td></tr>' +
            '<tr><td>3</td><td>variable declarator</td><td>c</td><td></td><td></td></tr>'
        );
    });

    it('is parsing a 3 simple variable declaration 2 no init 1 with init to 3 table row', () => {
        assert.equal(
            parseStatement(parseCode('let a, g;\nlet b = 6;\nlet c;')),
            '<tr><td>1</td><td>variable declarator</td><td>a</td><td></td><td></td></tr>' +
            '<tr><td>1</td><td>variable declarator</td><td>g</td><td></td><td></td></tr>' +
            '<tr><td>2</td><td>variable declarator</td><td>b</td><td></td><td>6</td></tr>' +
            '<tr><td>3</td><td>variable declarator</td><td>c</td><td></td><td></td></tr>'
        );
    });

    it('is parsing a simple function no body', () => {
        assert.equal(
            parseStatement(parseCode(
                `function foo(){
            }`)),
            '<tr><td>1</td><td>function declaration</td><td>foo</td><td></td><td></td></tr>'
        );
    });

    it('is parsing a simple function 1 line body', () => {
        assert.equal(
            parseStatement(parseCode(
                `function foo(){
                let a = 'd';
            }`)),
            '<tr><td>1</td><td>function declaration</td><td>foo</td><td></td><td></td></tr>' +
            '<tr><td>2</td><td>variable declarator</td><td>a</td><td></td><td>d</td></tr>'
        );
    });

    it('is parsing a simple function 2 line body and var declarations', () => {
        assert.equal(
            parseStatement(parseCode(
                `let c, g;
                function foo(){
                let id = 1;
                let name = 'maor';
            }`)),
            '<tr><td>1</td><td>variable declarator</td><td>c</td><td></td><td></td></tr>' +
            '<tr><td>1</td><td>variable declarator</td><td>g</td><td></td><td></td></tr>' +
            '<tr><td>2</td><td>function declaration</td><td>foo</td><td></td><td></td></tr>' +
            '<tr><td>3</td><td>variable declarator</td><td>id</td><td></td><td>1</td></tr>' +
            '<tr><td>4</td><td>variable declarator</td><td>name</td><td></td><td>maor</td></tr>'
        );
    });

    it('is parse simple assignment expression', () => {
        assert.equal(
            parseStatement(parseCode(
                `let c;
                c = 34;
            `)),
            '<tr><td>1</td><td>variable declarator</td><td>c</td><td></td><td></td></tr>' +
            '<tr><td>2</td><td>assignment expression</td><td>c</td><td></td><td>34</td></tr>'
        );
    });

    it('is parsing a function with args 2 line body and var declarations', () => {
        assert.equal(
            parseStatement(parseCode(
                `let c, g;
                function foo(a, b){
                let id = a; 
                let name = b;
            }`)),
            '<tr><td>1</td><td>variable declarator</td><td>c</td><td></td><td></td></tr>' +
            '<tr><td>1</td><td>variable declarator</td><td>g</td><td></td><td></td></tr>' +
            '<tr><td>2</td><td>function declaration</td><td>foo</td><td></td><td></td></tr>' +
            '<tr><td>2</td><td>variable declarator</td><td>a</td><td></td><td></td></tr>' +
            '<tr><td>2</td><td>variable declarator</td><td>b</td><td></td><td></td></tr>' +
            '<tr><td>3</td><td>variable declarator</td><td>id</td><td></td><td>a</td></tr>' +
            '<tr><td>4</td><td>variable declarator</td><td>name</td><td></td><td>b</td></tr>'
        );
    });

    it('is parsing a simple while loop', () => {
        assert.equal(
            parseStatement(parseCode(
                `while(true){};
            `)),
            '<tr><td>1</td><td>while statement</td><td></td><td>true</td><td></td></tr>'
        );
    });

    it('is parsing a while loop with condition and body', () => {
        assert.equal(
            parseStatement(parseCode(
                `while(a < 3){
                    a=5;
                };
            `)),
            '<tr><td>1</td><td>while statement</td><td></td><td>a<3</td><td></td></tr>' +
            '<tr><td>2</td><td>assignment expression</td><td>a</td><td></td><td>5</td></tr>'
        );
    });

    it('is parsing a simple if statement', () => {
        assert.equal(
            parseStatement(parseCode(
                `if(true){};
            `)),
            '<tr><td>1</td><td>if statement</td><td></td><td>true</td><td></td></tr>'
        );
    });

    it('is parsing a simple if statement', () => {
        assert.equal(
            parseStatement(parseCode(
                `if(a < 6){
                    a = 8;
                };
            `)),
            '<tr><td>1</td><td>if statement</td><td></td><td>a<6</td><td></td></tr>' +
            '<tr><td>2</td><td>assignment expression</td><td>a</td><td></td><td>8</td></tr>'
        );
    });
    it('is parsing a simple if statement with else', () => {
        assert.equal(
            parseStatement(parseCode(
                `if(a < 6){
                    a = 8;
                }
                else{
                a=2;
                }
            `)),
            '<tr><td>1</td><td>if statement</td><td></td><td>a<6</td><td></td></tr>' +
            '<tr><td>2</td><td>assignment expression</td><td>a</td><td></td><td>8</td></tr>' +
            '<tr><td>4</td><td>else statement</td><td></td><td></td><td></td></tr>' +
            '<tr><td>5</td><td>assignment expression</td><td>a</td><td></td><td>2</td></tr>'
        );
    });

    it('is parsing a if statement with else and else if', () => {
        assert.equal(
            parseStatement(parseCode(
                `if (a < 2)
                    high = mid - 1
                else if (X > V)
                    low = mid + 1;
                else
                    mid = 4;
            `)),
            '<tr><td>1</td><td>if statement</td><td></td><td>a<2</td><td></td></tr>' +
            '<tr><td>2</td><td>assignment expression</td><td>high</td><td></td><td>mid-1</td></tr>' +
            '<tr><td>3</td><td>else if statement</td><td></td><td>X>V</td><td></td></tr>' +
            '<tr><td>4</td><td>assignment expression</td><td>low</td><td></td><td>mid+1</td></tr>' +
            '<tr><td>5</td><td>else statement</td><td></td><td></td><td></td></tr>' +
            '<tr><td>6</td><td>assignment expression</td><td>mid</td><td></td><td>4</td></tr>'
        );
    });

    it('is parsing a if statement with else if', () => {
        assert.equal(
            parseStatement(parseCode(
                `if (a < 2)
                    high = mid - 1
                else if (X > V)
                    low = mid + 1;
            `)),
            '<tr><td>1</td><td>if statement</td><td></td><td>a<2</td><td></td></tr>' +
            '<tr><td>2</td><td>assignment expression</td><td>high</td><td></td><td>mid-1</td></tr>' +
            '<tr><td>3</td><td>else if statement</td><td></td><td>X>V</td><td></td></tr>' +
            '<tr><td>4</td><td>assignment expression</td><td>low</td><td></td><td>mid+1</td></tr>'
        );
    });

    it('is parsing a member statement ', () => {
        assert.equal(
            parseStatement(parseCode(
                `mid[2]= 3;
            `)),
            '<tr><td>1</td><td>assignment expression</td><td>mid[2]</td><td></td><td>3</td></tr>'
        );
    });

    it('is parsing a function call statement ', () => {
        assert.equal(
            parseStatement(parseCode(
                `mid(2);
            `)),
            '<tr><td>1</td><td>call expression</td><td>mid(2)</td><td></td><td></td></tr>'
        );
    });

    it('is parsing a assign variable function call statement ', () => {
        assert.equal(
            parseStatement(parseCode(
                `let a = mid(2);
            `)),
            '<tr><td>1</td><td>variable declarator</td><td>a</td><td></td><td>mid(2)</td></tr>'
        );
    });

    it('is parsing a function statement with return', () => {
        assert.equal(
            parseStatement(parseCode(
                `function foo(){
                    return 2;
                }
            `)),
            '<tr><td>1</td><td>function declaration</td><td>foo</td><td></td><td></td></tr>' +
            '<tr><td>2</td><td>return statement</td><td></td><td></td><td>2</td></tr>'
        );
    });

    it('is parsing a function statement with return with unary expression', () => {
        assert.equal(
            parseStatement(parseCode(
                `function foo(){
                    return -2;
                }
            `)),
            '<tr><td>1</td><td>function declaration</td><td>foo</td><td></td><td></td></tr>' +
            '<tr><td>2</td><td>return statement</td><td></td><td></td><td>-2</td></tr>'
        );
    });

    it('is parsing a binary expression inside binary expression', () => {
        assert.equal(
            parseStatement(parseCode(
                `let a = (2+3)/6
            `)),
            '<tr><td>1</td><td>variable declarator</td><td>a</td><td></td><td>(2+3)/6</td></tr>'
        );
    });

    it('is parsing a logical expression', () => {
        assert.equal(
            parseStatement(parseCode(
                `let a = true || false && true;
            `)),
            '<tr><td>1</td><td>variable declarator</td><td>a</td><td></td><td>true||(false&&true)</td></tr>'
        );
    });

    it('is parsing a logical expression with parenthesis', () => {
        assert.equal(
            parseStatement(parseCode(
                `let a = (true || false) && true;
            `)),
            '<tr><td>1</td><td>variable declarator</td><td>a</td><td></td><td>(true||false)&&true</td></tr>'
        );
    });

    it('is parsing a for statement with continue', () => {
        assert.equal(
            parseStatement(parseCode(
                `for(let i = 0; i < 10; i++){
                    continue;
                }
            `)),
            '<tr><td>1</td><td>for statement</td><td></td><td>i<10</td><td></td></tr>' +
            '<tr><td>1</td><td>variable declarator</td><td>i</td><td></td><td>0</td></tr>' +
            '<tr><td>1</td><td>update expression</td><td></td><td></td><td>i++</td></tr>' +
            '<tr><td>2</td><td>continue statement</td><td></td><td></td><td></td></tr>'
        );
    });

    it('is parsing a array statement', () => {
        assert.equal(
            parseStatement(parseCode(
                `let a=[1,2];
            `)),
            '<tr><td>1</td><td>variable declarator</td><td>a</td><td></td><td>[1,2]</td></tr>'
        );
    });

    it('is parsing a switch case statement', () => {
        assert.equal(
            parseStatement(parseCode(
                `switch (varName)
                {
                   case "afshin":
                   case "saeed":
                   case "larry": 
                       alert('Hey');
                       break;
                
                   default: 
                       alert('Default case');
                }
            `)),
            '<tr><td>1</td><td>switch statement</td><td></td><td>varName</td><td></td></tr>' +
            '<tr><td>3</td><td>switch case</td><td></td><td>afshin</td><td></td></tr>' +
            '<tr><td>4</td><td>switch case</td><td></td><td>saeed</td><td></td></tr>' +
            '<tr><td>5</td><td>switch case</td><td></td><td>larry</td><td></td></tr>' +
            '<tr><td>6</td><td>call expression</td><td>alert(Hey)</td><td></td><td></td></tr>' +
            '<tr><td>7</td><td>break statement</td><td></td><td></td><td></td></tr>' +
            '<tr><td>9</td><td>switch case</td><td></td><td>default</td><td></td></tr>' +
            '<tr><td>10</td><td>call expression</td><td>alert(Default case)</td><td></td><td></td></tr>'
        );
    });

    it('is format function working well', () => {
        assert.equal(
            'hello {}'.format(undefined) + '{} fun world'.format('nice'),
            'hello nice fun world'
        );
    });
});
