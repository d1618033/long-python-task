var express = require('express');
var bodyParser = require('body-parser');
var sleep = require('sleep');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/static', express.static(__dirname + '/static'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/', function (req, res){
    var number = req.body.number;
    var id = req.body.id;
    console.log("got:" + JSON.stringify(req.body));
    res.json({status: "ok"});
    setTimeout(function () {
        calculate_sum(id, number);
    }, 1);
});

var openConnections = [];

app.get('/events/', function (req, res) {
    req.socket.setTimeout(Infinity);
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');
    openConnections.push(res);
    write_message(res, {id: openConnections.length-1});

    req.on("close", function() {
        var toRemove;
        for (var j =0 ; j < openConnections.length ; j++) {
            if (openConnections[j] == res) {
                toRemove =j;
                break;
            }
        }
        openConnections.splice(j,1);
        console.log(openConnections.length);
    });
});

function write_message(res, message) {
    var d = new Date();
    res.write('id: ' + d.getMilliseconds() + '\n');
    res.write('data:' + JSON.stringify(message) +   '\n\n'); // Note the extra newline
}

function get_progress_func(id) {
    var res = openConnections[id];
    return function (progress) {
        write_message(res, progress);
    }
}

function calculate_sum(id, number) {
    sum_func(number, get_progress_func(id));
}

function sum_func(number, progress_func) {
    var s = 0;
    progress_func({total: number});
    for (var i = 0; i < number; i++) {
        progress_func({progress: i+1});
        sleep.usleep(10000);
        s += i;
    }
    progress_func({result: s});
}

app.listen(process.env.PORT || 3000);