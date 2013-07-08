var keysleft = (function () {

	var getUrlVars = function(url) {
            var vars = [], hash;
            var hashes = url.slice(url.indexOf('?') + 1).split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
	};

	var getValueFromUrl = function (name, url) {
		var val = getUrlVars(url)[name];

        if (val) {
            val = val.replace('#', '');
		}

		return val;
	};

	return {
		getFromUrl: getValueFromUrl
	};
}());