import $ from 'jquery';
import {parseCode, parseStatement} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        let tableHeader = '<table><tr><td>Line</td><td>Type</td><td>Name</td><td>Condition</td><td>Value</td></tr>{}</table>';
        $('#codeParseResults').html(tableHeader.format(parseStatement(parsedCode)));

    });
});


