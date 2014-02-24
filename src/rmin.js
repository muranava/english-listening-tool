(function (global) {
    'use strict';
    var _deps = {},
        queue = [];
    function depsResolved (deps) {
        return deps.every(function (n) { return _deps[n]; });
    }
    function depsMap (deps) {
        return deps.map(function (n) { return _deps[n]; });
    }
    function resolveQueue () {
        var i, j,
            len, q;
        do {
            for (i = 0, j = 0, len = queue.length; i < len;) {
                if (i !== j) { queue[j] = queue[i]; }
                q = queue[i];
                if (depsResolved(q.deps)) {
                    if (!(_deps[q.name] = q.init.apply(global, depsMap(q.deps)))) {
                        console.warn(q.name + " dependency is empty!");
                    }
                } else {
                    j++;
                }
                i++;
            }
            if (i !== j) { queue[j] = queue[i]; }
            queue.length = j;
        } while (queue.length !== len);
    }
    function backtrackQueue () {
/*        var i,
            len = queue.length,
            mentioned = {},
            resolved = {};
        for (i = 0; i < len; i++) {
            
        }*/
    }
    var depsGraph = {},
        timer = null;
    (global.define = function (name, deps, init) {
        if (typeof name !== 'string') throw new TypeError("Name should be a string");
        if (!Array.isArray(deps)) throw new TypeError("Deps should be an array");
        if (typeof init !== 'function') throw new TypeError("Init should be a function");
        if (deps.length !== init.length) throw new RangeError("init arguments for " + name + " don't match dependencies");
        if (_deps[name]) {
            console.warn("Duplicate definition of " + name);
        }
        queue.push({
            name: name,
            deps: deps,
            init: init
        });
        depsGraph[name] = deps;
        resolveQueue();
        backtrackQueue();
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () {
            var stack = [],
                q = [],
                bti = [],
                i = 0;
            function enqueueDeps (name, i) {
                depsGraph[name].forEach(function (d) {
                    if (_deps[d]) return;
                    q.push(d);
                    bti.push(i);
                });
            }
            if (queue.length) {
                q.push(queue[0].name);
                bti.push(-1);
                for (i = 0; i < q.length; i++) {
                    enqueueDeps(q[i], i);
                    if (q.indexOf(q[i], 0) < i) {
                        while (i != -1) {
                            stack.push(q[i]);
                            i = bti[i];
                        }
                        console.warn("Circular dependency: ", stack.reverse().join(" <- "));
                        return;
                    }
                }
            }
        }, 50);
    })._reset = function () {
        _deps = {};
    };
}(this));
