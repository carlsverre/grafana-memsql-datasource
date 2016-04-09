'use strict';

System.register(['moment'], function (_export, _context) {
    var moment;
    return {
        setters: [function (_moment) {
            moment = _moment.default;
        }],
        execute: function () {
            function parseInterval(interval) {
                var intervalPattern = /^([\d]+)(ms|ns|y|M|w|d|h|m|s)$/g;
                var momentInterval = intervalPattern.exec(interval);
                return moment.duration(Number(momentInterval[1]), momentInterval[2]).valueOf();
            }

            _export('parseInterval', parseInterval);
        }
    };
});
//# sourceMappingURL=util.js.map
