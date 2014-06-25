var collection = [];
function test() {
    {}
}
setInterval(function() {
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

var q = {
    get x() { return 1 }
}
