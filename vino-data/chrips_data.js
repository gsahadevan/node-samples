/**
 * data/chirps contains 4321 txt files.
 * each file contains pcp data of a single lat long combination
 * it contains 1 column having pcp data from 19810101
 * each file should contain 14610 rows
 * the first row, first column is always 19810101
 * data is in mail - Oct 21, 2020
 */

const fs = require('fs');
let counter = 0;
readFiles('./data/Chirps/Chirps1/');

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

    lines[0] = filename;
    if (lines.length !== 14611) {
        console.log('filename = [' + filename + '] length: [' + lines.length + ']');
    }

    writeToCSV(lines);
    counter++;
    console.log('processing file - ' + filename + ' -completed ' + counter);
}

function writeToCSV(columnData) {
    let csv = [];
    let ctr = 0;

    const content = fs.readFileSync('./data/Chirps/total2.csv');
    let totalLines = content.toString().split('\r\n');

    for (let i = 0; i < totalLines.length; i++) {
        csv[ctr++] = totalLines[i] + ',' + columnData[i];
    }
    csv = csv.join('\r\n');

    fs.writeFileSync('./data/Chirps/total2.csv', csv);
}
