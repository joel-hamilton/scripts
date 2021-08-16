var fs = require('fs');
var moment = require('moment');
var parse = require('csv-parse/lib/sync');
var stringify = require('csv-stringify');
var homedir = require('os').homedir();
var categories = require('./categories');

var tempCSVArray = [];

// iterate through transaction CSVs (must be in Downloads)
fs.readdir(homedir + '/Downloads', (err, files) => {
    // only non-hidden files
    files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item)).forEach(file => {
        var path = homedir + '/Downloads/' + file;
        if ((file.includes('accountactivity'))) {
            formatCSV(path, 'TD')
        } else if ((file.includes('transaction_download'))) {
            formatCSV(path, 'Capital One');
        }
    });

    if (tempCSVArray) {
        var sortedCSVArray = tempCSVArray.sort((a, b) => {
            return a[1] < b[1] ? 1 : -1;
        });

        // save file with new format
        stringify(sortedCSVArray, function(err, output) {
            var newPath = homedir + '/Downloads/transactions.csv';
            fs.writeFileSync(newPath, output);
            console.log('CSV created at: ' + newPath + "\n");
        });
    } else {
        console.log('Illegal type: ' + type + ' submitted');
    }

});

function formatCSV(path, type) {
    let dataString = fs.readFileSync(path, { encoding: 'utf8' })
        .split("\n")
        .filter(line => !!line)
        .join("\n");

    let data = parse(dataString);

    data.forEach((row, i) => {
        var amt;

        if (type === 'TD') { // bank account statements
            amt = row[2] ? -row[2] : row[3];

            tempCSVArray.push([
                '', // blank row
                row[0], // date
                row[1], // desc
                getCategory(row[1], amt), // category
                parseFloat(amt).toFixed(2), // amount
                'TD ALL INCLUSIVE BANKING PLAN',
                'xxxx1828',
                'TD Canada Trust (Canada) - Banking',
                moment(row[0], 'MM/DD/YYYY').format('YYYY-MM-01'), // month
                moment(row[0], 'MM/DD/YYYY').isoWeekday(0).format('YYYY-MM-DD'), // week (date of the monday)
                parseInt(Math.random() * 100000000000), // transaction ID
                '', // Check Number
                row[1], // full desc
                moment().format("MM/DD/YYYY") // date added
            ]);
        } else if (type === "Capital One") { // credit card statements
            if (i === 0) return; // header

            amt = row[5] ? -row[5] : row[6];

            tempCSVArray.push([
                '', // blank row
                moment(row[0]).format('MM/DD/YYYY'), // date
                row[3], // desc
                getCategory(row[3], amt), // category
                parseFloat(amt).toFixed(2), // amount
                'Aspire Travel World Elite Mastercard',
                'xxxx' + row[2],
                'Capital One Credit Cards',
                moment(row[0]).format('YYYY-MM-01'), // month
                moment(row[0]).isoWeekday(0).format('YYYY-MM-DD'), // week (date of the monday)
                parseInt(Math.random() * 100000000000), // transaction ID
                '', // Check Number
                row[3], // full desc
                moment().format("MM/DD/YYYY") // date added
            ]);
        }
    });
}

// use logic from `categories.js`
function getCategory(desc, amt) {
    var category = '';
    // simple category match based on substring match
    Object.keys(categories.simple).forEach(cat => {
        categories.simple[cat].forEach(key => {
            if (normalize(desc).indexOf(normalize(key)) !== -1) {
                category = cat;
            }
        });
    });

    if (category) return category;

    // test custom category functions
    for (let test of categories.tests) {
        if (!category) category = test(normalize(desc), parseFloat(amt));
    }

    return category || '--UNCATEGORIZED--';
}

function normalize(string) {
    return string.toLowerCase().replace(/[^a-z]/g, '');
}