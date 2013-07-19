// wrap all unit testing code in an self executing anonymous function,
// to avoid adding things to the global object and naming collisions.

(function () {

	var url;
	var urlWithoutParameters;

	module('url-tests', {
		setup: function () {
			url = 'http://www.keysleft.com?age=99&wpm=15#';
			urlWithoutParameters = 'http://www.keysleft.com';
		},
		teardown: function () {
			url = null;
			urlWithoutParameters = null;
		}
	});

	test('get age from url', function () {

		var age = keysleft.getFromUrl('age', url);

		equal(age, '99');
	});

	test('get wpm from url', function () {

		var wpm = keysleft.getFromUrl('wpm', url);

		equal(wpm, '15');
	});

	test('get no age value from url', function () {

		var age = keysleft.getFromUrl('age', urlWithoutParameters);

		equal(age, undefined);
	});

	test('get no wpm value from url', function () {

		var wpm = keysleft.getFromUrl('wpm', urlWithoutParameters);

		equal(wpm, undefined);
	});

}());