const fs = require("fs");
const path = require('path');
const mkdirp = require('mkdirp');

var dir = '';

var filesWithErrors = new Set();
var correspondingDirectories = new Set();

readParentDirectory('./data1/nambiyar/');

// This file is for sum of rainfall and average of the rest of the params

function readParentDirectory(source) {
	const listOfDirectories = fs.readdirSync(source)
		.map(name => source + name + '/')
		.filter(source => fs.lstatSync(source).isDirectory());

	for (let i = 0; i < listOfDirectories.length; i++) {
		const dirname = listOfDirectories[i];
		dir = dirname.replace('data', 'results');
		readFiles(dirname);
	}

	// console.log(filesWithErrors);
	// console.log(correspondingDirectories);
}

function readFiles(dirname) {
	const filenames = fs.readdirSync(dirname);
	for (let i = 0; i < filenames.length; i++) {
		const filename = filenames[i];
		const content = fs.readFileSync(dirname + filename);
		onFileContent(filename, content.toString());
	}
}

function onFileContent(filename, content) {
	const rainfallList = [];
	let lines = content.split("\r\n");
	if (lines.length === 1) {
		lines = content.split("\n");
	}

	lines.forEach(item => {
		const rainData = item.split("  ");

		const rainFall = {};
		if (rainData.length > 9) {
			filesWithErrors.add(filename);
			correspondingDirectories.add(dir);

			// Errors in the file. There is an extra column before rainfall column
			// Thus skipping rainData[6]

			rainFall.date = rainData[0];
			rainFall.latitude = rainData[1];
			rainFall.longitude = rainData[2];
			rainFall.solarRadiation = parseFloat(rainData[3]);
			rainFall.temperatureMin = parseFloat(rainData[5]);
			rainFall.temperatureMax = parseFloat(rainData[4]);
			rainFall.rainfall = Math.abs(parseFloat(rainData[7]));
			rainFall.windspeed = parseFloat(rainData[8]);
			rainFall.relativeHumidity = parseFloat(rainData[9]);
		} else {
			rainFall.date = rainData[0];
			rainFall.latitude = rainData[1];
			rainFall.longitude = rainData[2];
			rainFall.solarRadiation = parseFloat(rainData[3]);
			rainFall.temperatureMin = parseFloat(rainData[5]);
			rainFall.temperatureMax = parseFloat(rainData[4]);
			rainFall.rainfall = Math.abs(parseFloat(rainData[6]));
			rainFall.windspeed = parseFloat(rainData[7]);
			rainFall.relativeHumidity = parseFloat(rainData[8]);
		}

		if (rainFall.date !== '') {
			rainfallList.push(rainFall);
		}
	});

	const isAvgRequired = true;
	
	calculateMonthly(filename, rainfallList, isAvgRequired);
	calculateWeekly(filename, rainfallList, isAvgRequired);
}

function calculateMonthly(filename, rainfallList, isAvgRequired) {
	const weeklyData = [];
	let sumSolarRadiation = 0;
	let sumTemperatureMin = 0;
	let sumTemperatureMax = 0;
	let sumRainfall = 0;
	let sumWindspeed = 0;
	let sumRelativeHumidity = 0;

	let numberOfDays = 0;
	let currMonth = rainfallList[0].date.substring(0, 6);
	let nextMonth = "";

	const year = rainfallList[0].date.substring(0, 4);

	for (let i = 0; i < rainfallList.length; i++) {
		sumSolarRadiation += rainfallList[i].solarRadiation;
		sumTemperatureMax += rainfallList[i].temperatureMax;
		sumTemperatureMin += rainfallList[i].temperatureMin;
		sumRainfall += rainfallList[i].rainfall;
		sumWindspeed += rainfallList[i].windspeed;
		sumRelativeHumidity += rainfallList[i].relativeHumidity;

		numberOfDays++;
		
		let consolidateData = false;

		if (i + 1 < rainfallList.length) {
			nextMonth = rainfallList[i + 1].date.substring(0, 6);
			if (nextMonth !== currMonth) {
				consolidateData = true;
			}
		} else {
			consolidateData = true;
		}

		if (consolidateData) {
			if (currMonth === '') {
				continue;
			}
			const tempWeeklyData = {};
			tempWeeklyData.month = currMonth;
			tempWeeklyData.latitude = rainfallList[i].latitude;
			tempWeeklyData.longitude = rainfallList[i].longitude;

			if (isAvgRequired) {
				tempWeeklyData.solarRadiation = (sumSolarRadiation / numberOfDays).toFixed(2);
				tempWeeklyData.temperatureMax = (sumTemperatureMax / numberOfDays).toFixed(2);
				tempWeeklyData.temperatureMin = (sumTemperatureMin / numberOfDays).toFixed(2);
				// tempWeeklyData.rainfall = (sumRainfall / numberOfDays).toFixed(2);
				tempWeeklyData.rainfall = sumRainfall.toFixed(2);
				tempWeeklyData.windspeed = (sumWindspeed / numberOfDays).toFixed(2);
				tempWeeklyData.relativeHumidity = (sumRelativeHumidity / numberOfDays).toFixed(2);
			} else {
				tempWeeklyData.solarRadiation = sumSolarRadiation.toFixed(2);
				tempWeeklyData.temperatureMax = sumTemperatureMax.toFixed(2);
				tempWeeklyData.temperatureMin = sumTemperatureMin.toFixed(2);
				// tempWeeklyData.rainfall = sumRainfall.toFixed(2);
				tempWeeklyData.windspeed = sumWindspeed.toFixed(2);
				tempWeeklyData.relativeHumidity = sumRelativeHumidity.toFixed(2);
			}

			weeklyData.push(tempWeeklyData);

			sumSolarRadiation = 0;
			sumTemperatureMax = 0;
			sumTemperatureMin = 0;
			sumRainfall = 0;
			sumWindspeed = 0;
			sumRelativeHumidity = 0;

			numberOfDays = 0;
			currMonth = nextMonth;
		}
	}

	if (isAvgRequired) {
		writeToCSV(weeklyData, filename + "_avg_monthly.csv");
	} else {
		writeToCSV(weeklyData, filename + "_sum_monthly.csv");
	}
}

function calculateWeekly(filename, rainfallList, isAvgRequired) {
	const weeklyData = [];
	let sumSolarRadiation = 0;
	let sumTemperatureMin = 0;
	let sumTemperatureMax = 0;
	let sumRainfall = 0;
	let sumWindspeed = 0;
	let sumRelativeHumidity = 0;

	const year = rainfallList[0].date.substring(0, 4);

	for (let i = 0; i < rainfallList.length; i++) {
		sumSolarRadiation += rainfallList[i].solarRadiation;
		sumTemperatureMax += rainfallList[i].temperatureMax;
		sumTemperatureMin += rainfallList[i].temperatureMin;
		sumRainfall += rainfallList[i].rainfall;
		sumWindspeed += rainfallList[i].windspeed;
		sumRelativeHumidity += rainfallList[i].relativeHumidity;

		if (i !== 0 && (i + 1) % 7 === 0) {
			const tempWeeklyData = {};
			tempWeeklyData.week = (i + 1) / 7;
			tempWeeklyData.latitude = rainfallList[i].latitude;
			tempWeeklyData.longitude = rainfallList[i].longitude;

			if (isAvgRequired) {
				tempWeeklyData.solarRadiation = (sumSolarRadiation / 7).toFixed(2);
				tempWeeklyData.temperatureMax = (sumTemperatureMax / 7).toFixed(2);
				tempWeeklyData.temperatureMin = (sumTemperatureMin / 7).toFixed(2);
				// tempWeeklyData.rainfall = (sumRainfall / 7).toFixed(2);
				tempWeeklyData.rainfall = sumRainfall.toFixed(2);
				tempWeeklyData.windspeed = (sumWindspeed / 7).toFixed(2);
				tempWeeklyData.relativeHumidity = (sumRelativeHumidity / 7).toFixed(2);
			} else {
				tempWeeklyData.solarRadiation = sumSolarRadiation.toFixed(2);
				tempWeeklyData.temperatureMax = sumTemperatureMax.toFixed(2);
				tempWeeklyData.temperatureMin = sumTemperatureMin.toFixed(2);
				// tempWeeklyData.rainfall = sumRainfall.toFixed(2);
				tempWeeklyData.windspeed = sumWindspeed.toFixed(2);
				tempWeeklyData.relativeHumidity = sumRelativeHumidity.toFixed(2);
			}

			weeklyData.push(tempWeeklyData);

			sumSolarRadiation = 0;
			sumTemperatureMax = 0;
			sumTemperatureMin = 0;
			sumRainfall = 0;
			sumWindspeed = 0;
			sumRelativeHumidity = 0;
		}
	}

	if (isAvgRequired) {
		writeToCSV(weeklyData, filename + "_avg_weekly.csv");
	} else {
		writeToCSV(weeklyData, filename + "_sum_weekly.csv");
	}
}

function writeToCSV(contents, filename) {
	const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
	const header = Object.keys(contents[0]);
	let csv = contents.map(row =>
		header
			.map(fieldName => JSON.stringify(row[fieldName], replacer))
			.join(",")
	);
	csv.unshift(header.join(","));
	csv = csv.join("\r\n");

	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}

	const finalFilePath = dir + filename;
	fs.writeFileSync(finalFilePath, csv);
}