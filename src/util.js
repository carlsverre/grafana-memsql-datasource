import moment from 'moment';

export function parseInterval(interval) {
    var intervalPattern = /^([\d]+)(ms|ns|y|M|w|d|h|m|s)$/g;
    var momentInterval = intervalPattern.exec(interval);
    return moment.duration(Number(momentInterval[1]), momentInterval[2]).valueOf();
}
