var id;
function set_result(result) {
    $("#result").text(result);
}
function set_max_progress_bar(max) {
    $("progress").attr("max", max);
}
function set_progress_bar_value(value) {
    $("progress").attr("value", value);
}
function disable_button() {
    $("button").attr("disabled", true);
}
function enable_button() {
    $("button").removeAttr("disabled");
}
$(document).ready(function () {
    var button = $("button");
    disable_button();
    button.click(function () {
        var number = $("input[name='number']").val();
        disable_button();
        $.post("/", {
            "number": number,
            "id": id
        })
        .fail(function() {
            console.log( "error" );
            enable_button();
        });
    });
    var source = new EventSource("/events/");
    function addEventListener(source, event, callback) {
        source.addEventListener(event, function(e) {
            console.log(event);
            console.log(e.data);
            var data = e.data;
            callback(data);
        }, false);
    }
    addEventListener(source, 'id', function(data) {
        id = data;
        enable_button();
    });
    addEventListener(source, 'total', function(data) {
        set_max_progress_bar(data);
    });
    addEventListener(source, 'progress', function(data) {
        set_progress_bar_value(data);
    });
    addEventListener(source, 'result', function(data) {
        set_result(data);
        enable_button();
    });
});