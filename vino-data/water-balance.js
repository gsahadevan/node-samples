/**
 *
 * 
                Weekly Waterbalance-Thornthwaite-method
  8.1099_77.4473               1981                          AWHC= 120.0 mm
 ---------------------------------------------------------------------------
 WEEK    PPT     PET     SM      AET     SPL     DEF     MAI     DIV     SMI
        (mm)    (mm)    (mm)    (mm)    (mm)    (mm)
 ---------------------------------------------------------------------------
   1     0.2    27.5     0.0     0.2     0.0    27.3    0.01    0.99    0.00
   2     8.4    30.8     0.0     8.4     0.0    22.4    0.27    0.73    0.00
   3     4.2    32.6     0.0     4.2     0.0    28.4    0.13    0.87    0.00
 * 
 * file contains data like above
 * there are 165 files
 * each file represents one lat long
 * each file contains data from 1981 to 2017
 * every year contains 52 weeks worth of data
 * data is in mail - Apr 05, 2020
 * 
 */

const fs = require("fs");

const args = process.argv.slice(2);

const waterBalances = [];
const folder = args[0] || "./data/watbal/";
const files = fs.readdirSync(folder);

readFiles();

function waterBalance(latlong, year, wb) {
	this.latlong = latlong;
	this.year = year;
	this.week = wb[1];
	this.ppt = wb[2];
	this.pet = wb[3];
	this.sm = wb[4];
	this.aet = wb[5];
	this.spl = wb[6];
	this.def = wb[7];
	this.mai = wb[8];
	this.div = wb[9];
	this.smi = wb[10];
}

function readFiles() {
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		// if (file === 'WATB_8.1099_77.4473.txt') {
		const fileContents = fs.readFileSync(folder + file);
		onFileContent(file, fileContents.toString());
		// }
	}
	consolidateContents();
}

function onFileContent(file, fileContents) {
	const valLatLong = file.replace("WATB_", "").replace(".txt", "");
	let year;
	let lines = fileContents.split("\n");
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].indexOf(valLatLong) > -1) {
			year = lines[i].split(/ +/)[2];
		}
		const values = lines[i].split(/ +/);
		if (values.length > 9 && lines[i].indexOf("WEEK") === -1) {
			var wb = new waterBalance(valLatLong, year, values);
			waterBalances.push(wb);
		}
	}
}

function consolidateContents() {
	const consolidatedContents = [];
	for (let i = 0; i < waterBalances.length; i++) {
		const wb = waterBalances[i];
		const cc = {};
		cc.year = wb.year;
		cc.latlong = wb.latlong;

		const ppt = {};
		ppt.key = wb.week;
		ppt.val = wb.ppt;

		const pet = {};
		pet.key = wb.week;
		pet.val = wb.pet;

		const sm = {};
		sm.key = wb.week;
		sm.val = wb.sm;

		const aet = {};
		aet.key = wb.week;
		aet.val = wb.aet;

		const spl = {};
		spl.key = wb.week;
		spl.val = wb.spl;

		const def = {};
		def.key = wb.week;
		def.val = wb.def;

		const mai = {};
		mai.key = wb.week;
		mai.val = wb.mai;

		const div = {};
		div.key = wb.week;
		div.val = wb.div;

		const smi = {};
		smi.key = wb.week;
		smi.val = wb.smi;

		const element = consolidatedContents.find(
			(item) => item.year === cc.year && item.latlong === cc.latlong
		);
		if (element) {
			element.ppt.push(ppt);
			element.pet.push(pet);
			element.sm.push(sm);
			element.aet.push(aet);
			element.spl.push(spl);
			element.def.push(def);
			element.mai.push(mai);
			element.div.push(div);
			element.smi.push(smi);
		} else {
			cc.ppt = [ppt];
			cc.pet = [pet];
			cc.sm = [sm];
			cc.aet = [aet];
			cc.spl = [spl];
			cc.def = [def];
			cc.mai = [mai];
			cc.div = [div];
			cc.smi = [smi];
			consolidatedContents.push(cc);
		}
	}

	const values = [
		"ppt",
		"pet",
		"sm",
		"aet",
		"spl",
		"def",
		"mai",
		"div",
		"smi",
	];
	values.forEach((value) => splitIntoKeys(consolidatedContents, value));
}

function splitIntoKeys(contents, key) {
	const ks = [];
	contents.forEach((content) => {
		const k = {};
		k.year = content.year;
		k.latlong = content.latlong;
		content[key].forEach((item) => (k[item.key] = item.val));
		ks.push(k);
	});

	writeToCSV(ks, key + ".csv");
}

function writeToCSV(contents, name) {
	const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
	const header = Object.keys(contents[0]);
	let csv = contents.map((row) =>
		header
			.map((fieldName) => JSON.stringify(row[fieldName], replacer))
			.join(",")
	);
	csv.unshift(header.join(","));
	csv = csv.join("\r\n");

	const file = folder + name;
	fs.writeFileSync(file, csv);
}
