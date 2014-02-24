define('model', ['event'], function (Event) {
    return window.model = {
        cuts: [],
        titles: [],
        titleSewers: {},
        sewerIndex: 0,
        matchedCuts: [],
        series: {
            endeavour: ['1_1', '1_2', '1_3', '1_4'],
            sherlock: ['1_1', '1_2', '1_3', '2_1', '2_2', '2_3', '3_1'],
            numbers: ['1_1', '1_2', '1_3', '1_4', '1_5', '1_7', '1_8'],
            breakingbad: ['1_1', '1_2', '1_3', '1_4', '1_5', '1_6', '1_7'],
            person: ['1_1', '1_2', '1_3', '1_4', '1_5', '1_6', '1_7', '1_8', '1_9']
        },
        getFullPath: function (path) {
            return "media/" + path.match(/^\w+_s\d{2}e\d{2}/)[0] + "/" + path;
        },
        load: function (data, name) {
            function processRecord (name, rec) {
                this.cuts.push({
                    fileName: rec[0],
                    phrase: rec[1],
                    transcription: rec[2],
                    title: name
                });
            }
            this.titleSewers[name] = data;
            while ((data = this.titleSewers[name = this.titles[this.sewerIndex]])) {
                data.forEach(processRecord.bind(this, name));
                this.sewerIndex++;
                var percent = this.sewerIndex / this.titles.length;
                Event.fire('load.progress', { percent: percent });
                if (percent === 1) {
                    Event.fire('load.finished');
                }
            }
        }
    };
});
