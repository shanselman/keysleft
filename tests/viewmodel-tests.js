// fake knockout object
var ko = {
    observable: function (val) {
        return function () {
            return val;
        };
    },
    computed: function (callback, context) {
        return function () {
            return callback.call(context);
        };
    }
};

var age = 39;
var wpm = 60;
var maxAge = 90;

var viewModel = new KeysLeftViewModel(age, wpm);

test('years left', function () {
    var expected = maxAge - age;

    equal(viewModel.yearsLeft(), expected);
});