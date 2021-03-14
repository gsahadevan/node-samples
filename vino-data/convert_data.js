const fs = require('fs');

let header;
const data = {};
const ifilename = './data/8.csv';
const ofilename = './data/_8.csv';

convertData();

function convertData() {
    const filecontent = fs.readFileSync(ifilename);
    breakFileContents(filecontent.toString());
    writeToCSV();
}

function breakFileContents(filecontent) {
    const lines = filecontent.split('\r\n');
    for (let i = 0; i < lines.length; i++) {
        if (i === 0) {
            header = lines[i];
        } else {
            processContent(lines[i]);
        }
    }
}

function processContent(content) {
    if (!content) {
        return;
    }
    const columns = content.split(';');
    for (let i = 0; i < columns.length; i++) {
        const date = columns[0].substring(0, 7);
        if (i === 0) {
            if (!data[date]) {
                data[date] = [];
            }
        } else {
            data[date][i - 1] = data[date][i - 1]
                ? parseFloat(data[date][i - 1]) + parseFloat(columns[i])
                : parseFloat(columns[i]);
        }
    }
}

function writeToCSV() {
    let csv = [];
    let ctr = 0;
    for (let key of Object.keys(data)) {
        csv[ctr++] = key + ';' + data[key].join(';');
    }
    csv.unshift(header);
    csv = csv.join('\r\n');
    fs.writeFileSync(ofilename, csv);
}
