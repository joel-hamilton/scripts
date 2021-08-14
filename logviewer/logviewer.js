let Tail = require('tail').Tail;
let prettyjson = require('prettyjson');
let moment = require('moment');
let filename = process.argv.slice(2)[0];
let tail = new Tail(filename);

var options = {
    keysColor: 'magenta',
    dashColor: 'magenta',
    numberColor: 'blue'
};

tail.on("line", function(data) {
        try {
            console.log(`[${moment().format('YYYY-MM-DD HH:mm:mm')}]`)
            console.log(prettyjson.render(JSON.parse(data), options))
        } catch (e) {
            console.log(e);
        }
});

tail.on("error", function(error) {
    console.log('ERROR: ', error);
});
