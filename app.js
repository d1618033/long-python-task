var express = require('express');
var bodyParser = require('body-parser');
var PythonShell = require('python-shell');
var sse = require('./sse');

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

var get_progress_func = sse.add_stream(app, "/events/");

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