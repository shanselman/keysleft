var url = 'http://www.keysleft.com?age=99&wpm=15#';
var urlWithoutParameters = 'http://www.keysleft.com';

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