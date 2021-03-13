/**
 * data folder contains 4321 txt files.
 * each file contains pcp data of a single lat long combination
 * it contains 2 columns having pcp data from 19820101, the second column corresponds to the pcp data
 * each file should contain 14245 rows + 1 header + 1 empty footer line
 * data is in mail - Mar 05 2021
 *
 * note: a preprocessor script was run on the initial data, because the format was different.
 */

const fs = require('fs');
let counter = 0;
readFiles('./data1/');

function readFiles(dirname) {
    const filenames = fs.readdirSync(dirname);
    console.log('total files - ' + filenames.length);
    for (let i = 0; i < filenames.length; i++) {
        const filename = filenames[i];
        const content = fs.readFileSync(dirname + filename);
        onFileContent(filename, content.toString());
    }
}

function onFileContent(filename, content) {
    let lines = content.split('\r\n');
    if (lines.length === 1) {
        lines = content.split('\n');
    }

    // lines[0] = filename;
    if (lines.length !== 14247) {
        console.log('filename = [' + filename + '] length: [' + lines.length + ']');
    }

    writeToCSV(lines);
    counter++;
    console.log('processing file - ' + filename + ' -completed ' + counter);
}

function writeToCSV(columnData) {
    let csv = [];
    let ctr = 0;

    const content = fs.readFileSync('./total.csv');
    let totalLines = content.toString().split('\n');

    for (let i = 0; i < totalLines.length; i++) {
        csv[ctr++] = totalLines[i] + ',' + columnData[i];
    }
    csv = csv.join('\n');
    fs.writeFileSync('./total.csv', csv);
}
