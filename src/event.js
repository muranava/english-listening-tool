define ('event', [], function () {
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
            var value = data;
            if (Object(data) !== data) {
                data = { valueOf: function () { return value; } };
            }
            data.type = type;
            (handlers[type] || []).forEach(function (cb) { cb(data); });
        }
    };
});
