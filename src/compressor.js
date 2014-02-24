define ('compressor', [], function () {
    var i = 64, abc = [], abci = [];
    for (;i--;) abci[abc[i]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charCodeAt(i)] = i;
    function toBase64(n) {
        var a = [];
        while (n) { a.push(abc[n % base]); n = Math.floor(n / base); }
        return String.prototype.apply(null, a.reverse());
    }
    function fromBase64(s) {
        var n = 0, i;
        for (i = 0; i < s.length; i++) n = n * 64 + abci[s.charCodeAt(i)];
        return n;
    }
    function parseTime(m) { return ((m[0]*60 + m[1]) * 60 + m[2]) * 1000 + (+m[3]); }
    function toTime(t) { return new Date(t).toJSON().slice(12,-1).replace(/:/g,'.'); }
    return {
        deflate: function (cutChunk) {
            var prefix, out;
            cutChunk.forEach(function (cut) {
                var m = cut.fileName.match(/^(\w+s\d{2}e\d{2})_1_(\d)\.(\d{2})\.(\d{2})\.(\d{3})-(\d)\.(\d{2})\.(\d{2})\.(\d{3})\.mp3$/);
                if (!prefix) out.push(prefix = m[1]);
                if (prefix != m[1]) throw new Error("Uncommon prefix");
                var t1 = parseTime(m.slice(1, 5)),
                    t2 = parseTime(m.slice(5, 9)) - t1;
                out.push(toBase64(t1) + '-' + toBase64(t2-t1) + ':' + cut.phrase);
            });
            return out.join("\t");
        },
        inflate: function (str) {
            var parts = str.split("\t"),
                prefix = parts[0];
            return parts.slice(1).map(function (s) {
                var m = s.match(/^([\w\/+]+)-([\w\/+]+):(.+)$/);
                var t1 = fromBase64(m[1]),
                    t2 = fromBase64(m[2]);
                return {
                    fileName: prefix + '_1_' + toTime(t1) + '-' + toTime(t2+t1) + '.mp3',
                    phrase: m[3],
                    transcription: ""
                };
            });
        }
    };
});
