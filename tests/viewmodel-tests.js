// A fake knockout object, added to the global object.
// This one will be used by the KeysLeftViewModel when executed from the unit tests.
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

// wrap all unit testing code in an self executing anonymous function,
// to avoid adding things to the global object and naming collisions.

(function () {

    var age;
    var wpm;
    var viewModel;

    module('viewModel-tests', {
        setup: function () {
            age = 39;
            wpm = 60;
            viewModel = new KeysLeftViewModel(age, wpm);
        },
        teardown: function () {
            age = null;
            wpm = null;
            viewModel = null;
        }
    });

    test('view model has default values', function () {
        ok(viewModel.dead, 'expecting: viewModel.dead');
        ok(viewModel.hoursTyping, 'expecting: viewModel.hoursTyping');
        ok(viewModel.averageWordLength, 'expecting: viewModel.averageWordLength');
        ok(viewModel.weeksInAYear, 'expecting: viewModel.weeksInAYear');

        ok(viewModel.novelLength, 'expecting: viewModel.novelLength');
        ok(viewModel.programSize, 'expecting: viewModel.programSize');
        ok(viewModel.secondsPerYear, 'expecting: viewModel.secondsPerYear');
    });

    test('years left', function () {
        var expected = viewModel.dead - age;

        equal(viewModel.yearsLeft(), expected);
    });

    test('keystrokes left', function () {
        var maxAge = viewModel.dead;
        var weeksInAYear = viewModel.weeksInAYear;
        var hoursTyping = viewModel.hoursTyping;
        var averageWordLength = viewModel.averageWordLength;

        var expected = ((maxAge - age) *
            weeksInAYear *
            hoursTyping * 60 *
            wpm *
            averageWordLength);

        equal(viewModel.keystrokesLeft(), expected);
    });

    test('char per second should return 0', function () {
        viewModel.secondsPerYear = 0;

        equal(viewModel.charPerSecond(), 0);
    });

    test('char per second', function () {
        var expected = viewModel.keystrokesLeft() /
            (viewModel.secondsPerYear * viewModel.yearsLeft());

        equal(viewModel.charPerSecond(), expected);
    });

}());