var assertEquals = assertEquals || function (a, b, m) { if (a !== b) { throw new Error(m || "assertion error"); } },
    assert = assert || function (a, m) { if (!a) { throw new Error(m || "assertion error"); } };
function testMatchingRe () {
    var re = searchRegExp('can');
    assert(re.test("I can"));
    assert(!re.test("I can't"));
}
