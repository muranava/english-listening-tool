define ('view/error', ['dom', 'event'], function (dom, Event) {
    var ErrorView = {
        showError: function (msg) {
            dom('<div.error>', document.body).innerHTML = msg;
        }
    };
    Event.on('error', function (data) {
        ErrorView.showError(data.msg);
    });
    return ErrorView;
});
