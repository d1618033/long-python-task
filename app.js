var express = require('express');
var bodyParser = require('body-parser');
var PythonShell = require('python-shell');


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
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write("retry: 10000\n");
    res.write('\n');
    openConnections.push(res);
    write_message(res, openConnections.length-1, "id");

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

function write_message(res, message, event) {
    var d = new Date();
    res.write('id: ' + d.getMilliseconds() + '\n');
    res.write('event: ' + event + '\n');
    res.write('data:' +  message + '\n\n'); // Note the extra newline
}

function get_progress_func(id) {
    var res = openConnections[id];
    return function (name, value) {
        write_message(res, value, name);
    }
}

function calculate_sum(id, number) {
    py_sum_func(number, get_progress_func(id));
}

function py_sum_func(number, progress_func) {
    var pyshell = new PythonShell('tasks.py', {
        scriptPath: __dirname,
        args: [number],
        pythonOptions: ['-u']
    });

    pyshell.on('message', function (message) {
        console.log(message);
        var parsed_message = JSON.parse(message);
        progress_func(parsed_message.name, parsed_message.value);
    });

    pyshell.end(function (err) {
        if (err) throw err;
        console.log('finished');
    });
}

app.listen(process.env.PORT || 3000);