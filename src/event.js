define (function () {
    var handlers = {};
    return {
        on: function (type, callback) {
            if (typeof type !== 'string') {
                return type.forEach(function (type) {
                    this.on(type, callback);
                }, this);
            }
            if (!(type in handlers)) handlers[type] = [];
            handlers[type].push(callback);
        },
        fire: function (type, data) {
            (handlers[type] || []).forEach(function (cb) { cb(data); });
        }
    };
});
