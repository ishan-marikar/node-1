var One   = require('../index.js');
var async = require('async');
var util  = require('util');

function inspect(obj, depth, multiLine) {
    var res = util.inspect(obj, false, depth || 10, true);

    if (!multiLine) {
        res = res.replace(/(\r\n|\n|\r)/gm, ' ');
    }

    return res.replace(/\s+/g, ' ');
}

var one = new One();

var chan = 'somechan';

// you can either use events or callbacks to handle the node
one.on('join', function (cluster) {
    console.log('joined cluster:', cluster);
});

one.on('leave', function (cluster) {
    console.log('left cluster:', cluster);
});

one.on('advertise_start', function (adInfo) {
    console.log('started advertising:', inspect(adInfo));
});

one.on('advertise_stop', function (adInfo) {
    console.log('stopped advertising:', inspect(adInfo));
});

one.on('subscribe', function (channel) {
    console.log('subscribed:', channel);
});

one.on('unsubscribe', function (channel) {
    console.log('unsubscribed:', channel);
});

one.on('node_up', function (node) {
    console.log('node up:', inspect(node));
});

one.on('node_down', function (node) {
    console.log('node down:', inspect(node));
});

one.on('message', function (chan, payload) {
    console.log('msg:', chan + ':', payload);
});

one.on('error', function (err) {
    console.error('ERROR: ', err);
});

async.waterfall([
    function (next) {
        one.join(function (err, cluster) {
            next();
        });
    },
    function (next) {
        one.startAdvertise(function (err, adInfo) {
            next();
        }); // TODO: try subscribing before any node is advertising, and then advertise, to check if the node gets the messages
    },
    function (next) {
        one.subscribe(chan, function (err, chan) {
            next();
        });
    }
], function (err, result) {
    if (err) {
        console.error('Error creating cluster:', err);
        process.exit(1);
    }

    console.log('going to create timers');

    var pubTimer = setInterval(function () {
        one.publish(chan, 'I\'m a rabbit on caffeine!!');
    }, 100);

    

    setTimeout(function () {
        clearInterval(pubTimer);

        one.leave(function () {

        });
    }, 2000);


});

