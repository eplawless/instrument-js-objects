var collection = [];
function test() {
    {}
}
setInterval(function() {
    function bar() { return function() {} }
    for (var idx = 0; idx < 10; ++idx) {
        collection.push({
            get x() { return 1; },
            y: {
                z: 2
            },
            w: [{v:[]},{u:{}}]
        });
    }
}, 0)

function Foo() {}

var q = {
    y: new Foo,
    get x() { return 1 }
}
