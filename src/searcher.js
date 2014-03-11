define(function () {
    var matchedPhrase = "";
    return {
        re: null,
        IPAsearch: false,
        fieldName: '',
        areDifferent: false,    
        adapt: function (word, whole) {
            this.areDifferent = false;
            matchedPhrase = "";
            var regexpSearch = !/[.?]$/.test(word) && !/^\w+$/i.test(word);
            try {
                new RegExp(word);
            } catch (e) {
                regexpSearch = false;
            }
            this.IPAsearch = /[\u0250-\u02AF]/.test(word);
            this.fieldName = this.IPAsearch ? 'transcription' : 'phrase';
            if (!regexpSearch) {
                word = word.replace(/./g, function (c) { return "\\u" + ("000" + c.charCodeAt(0).toString(16)).slice(-4); });
            } else {
                word = word.replace(/\\(\d+)/g, function (m, d) { return "\\" + (+d+2); });
            }
            this.regexpSearch = regexpSearch;
            this.re = (whole && !regexpSearch) ?
                new RegExp("(^| )(" + word + ")([ ,.:;?!]|$)", 'ig') :
                new RegExp("()(" + word + ")()", 'ig');
        },
        match: function (cut) {
            var m = cut[this.fieldName].match(this.re);
            if (!m) return false;
            if (!matchedPhrase) {
                matchedPhrase = m[0];
            } else {
                if (matchedPhrase !== m[0]) {
                    this.areDifferent = true;
                }
            }
            return true;
        }
    };
});
