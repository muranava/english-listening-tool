define(function () {
    function Cut (rec, title) {
        this.fileName = rec[0];
        this.phrase = rec[1];
        this.transcription = rec[2];
        this.title = title;
    }
    Cut.prototype = {
        getFullPath: function () {
            var path = this.fileName;
            return "media/" + path.match(/^\w+_s\d{2}e\d{2}/)[0] + "/" + path;
        },
        play: function (audio) {
            audio.src = this.getFullPath;
            audio.play();
        }
    };
    return Cut; 
});
