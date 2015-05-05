var openConnections = {};

module.exports.add_stream = function (app, stream_name) {
    app.get(stream_name, function (req, res) {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        res.write("retry: 10000\n");
        res.write('\n');
        if (openConnections[stream_name] === undefined) {
            openConnections[stream_name] = [];
        }
        openConnections[stream_name].push(res);
        write_message(res, openConnections[stream_name].length-1, "id");

        req.on("close", function() {
            var toRemove;
            for (var j =0 ; j < openConnections[stream_name].length ; j++) {
                if (openConnections[stream_name][j] == res) {
                    toRemove =j;
                    break;
                }
            }
            openConnections[stream_name].splice(j,1);
            console.log(openConnections[stream_name].length);
        });
    });
    return function (id) {
        return get_write_message_func(stream_name, id);
    };
};


function write_message(res, message, event) {
    var d = new Date();
    res.write('id: ' + d.getMilliseconds() + '\n');
    res.write('event: ' + event + '\n');
    res.write('data:' +  message + '\n\n'); // Note the extra newline
}


function get_write_message_func(stream_name, id){
    var res = openConnections[stream_name][id];
    return function (event, message) {
        write_message(res, message, event);
    };
}
