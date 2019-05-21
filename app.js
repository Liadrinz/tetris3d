var nodeCmd = require('node-cmd');
var express = require('express');

function run() {
    var app = express();
    app.use(express.static('public'));
    app.listen(3000, () => {
        console.log('listening at 3000...');
    })
}

if (process.argv[2] === 'run') {
    run()
} else if (process.argv[2] === 'build') {
    nodeCmd.get('webpack', (err, data) => {
        if (err) {
            console.log('error', err);
        } else {
            console.log(data);
            console.log('Build done!');
        }
    });
} else {
    nodeCmd.get('webpack', (err, data) => {
        if (err) {
            console.log('error', err);
        } else {
            console.log(data);
            console.log('Build done!');
        }
    });
    run();
}