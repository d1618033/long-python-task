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
            })
            .always(enable_button);
    });
    var source = new EventSource("/events/");
    source.addEventListener('message', function(e) {
        var data = JSON.parse(e.data);
        console.log(data);
        if (data.id !== undefined) {
            id = data.id;
            enable_button();
        } else if (data.total !== undefined) {
            set_max_progress_bar(data.total);
        } else if (data.progress !== undefined) {
            set_progress_bar_value(data.progress);
        } else if (data.result !== undefined) {
            set_result(data.result);
        }
    }, false);
});