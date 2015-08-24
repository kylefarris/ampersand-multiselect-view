# Tape-Suite

Super simple test suites for tape.

```
var suite = require('tape-suite');

suite('Test stuff', function (t) {
    t.beforeEach(function () {
        //do stuff before each test
    });

    t.afterEach(function () {
        //do stuff after each test
    });

    t.test('use like a normal tape test', function (t) {
        t.ok(true);
        t.end();
    });

    //also t.test.only
    t.test.only('only this test will run', function (t) {
        t.ok(false);
        t.end();
    });
});
```

Doesn't support:
* Nested suites
* Before/after all
* Possibly more
