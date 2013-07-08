var keysleft = (function () {

	var getUrlVars = function(url) {
		var vars = [], hash;
        var hashes = url.slice(url.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            if (hash[1] != undefined) {
                var n = hash[1].indexOf('#');
                hash[1] = hash[1].substring(0, n != -1 ? n : hash[1].length);
            }
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
	};

	return {
		getFromUrl: function (name, url) {
			return getUrlVars(url)[name];
		}
	};
}());