describe('Minr implementation', function () {
    beforeEach(function() {
        define._reset();
    });
    describe('Simple dependencies', function () {
        it('module with no dependencies resolved instantly', function () {
            var init = false;
            define('test', [], function () { init = true; return 1; });
            expect(init).toEqual(true);
        });
        it('module with defined dependency resolved', function () {
            var init1 = false,
                init2 = false;
            define('test1', [], function () { init1 = true; return 1; });
            define('test2', ['test1'], function (test1) { init2 = true; return 1; });
            expect(init1).toEqual(true);
            expect(init2).toEqual(true);
        });
        it('module resolved after dependency resolution', function () {
            var init = false;
            define('test2', ['test1'], function (t1) {
                init = true;
                return init;
            });
            expect(init).toEqual(false);
            define('test1', [], function () { return true; });
            expect(init).toEqual(true);
        });
        it('module gets correct dependencies', function () {
            define('test1', [], function () { return (init = { flag: false }); });
            expect(init.flag).toEqual(false);
            define('test2', ['test1'], function (init) { init.flag = true; return 1; });
            expect(init.flag).toEqual(true);
        });
    });
    describe('Complex dependencies', function () {
        it('all dependent modules are resolved', function () {
            var init1 = false,
                init2 = false,
                init3 = false;
            define('test1', ['test'], function (t) { init1 = true; return 1; });
            define('test2', ['test'], function (t) { init2 = true; return 1; });
            define('test3', ['test'], function (t) { init3 = true; return 1; });
            define('test', [], function () { return true; });
            expect(init1).toEqual(true);
            expect(init2).toEqual(true);
            expect(init3).toEqual(true);
        });
        it('diamond dependencies', function () {
            var init1 = false,
                init2 = false,
                init3 = false;
            define('test3', ['test1', 'test2'], function (t1, t2) { init3 = true; return 1; });
            define('test1', ['test'], function (t) { init1 = true; return 1; });
            define('test2', ['test'], function (t) { init2 = true; return 1; });
            define('test', [], function () { return true; });
            expect(init1).toEqual(true);
            expect(init2).toEqual(true);
            expect(init3).toEqual(true);
        });
        it('rainbow/cascade dependencies', function () {
            var init1 = false,
                init2 = false,
                init3 = false;
            define('test3', ['test0', 'test1', 'test2'], function (t0, t1, t2) { init3 = true; return 1; });
            define('test2', ['test0', 'test1'], function (t0, t1) { init1 = true; return 1; });
            define('test1', ['test0'], function (t0) { init2 = true; return 1; });
            define('test0', [], function () { return true; });
            expect(init1).toEqual(true);
            expect(init2).toEqual(true);
            expect(init3).toEqual(true);
        });
    });
});
