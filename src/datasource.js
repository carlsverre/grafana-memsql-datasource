import {parseInterval} from "./util";
import _ from "lodash";
import moment from "moment";

// taken from grafana source
// attempt at sanitizing user defined values
function luceneEscape(value) {
    return value.replace(/([\!\*\+\-\=<>\s\&\|\(\)\[\]\{\}\^\~\?\:\\/"])/g, "\\$1");
}

export class GenericDatasource {
    constructor(instanceSettings, $q, backendSrv, templateSrv) {
        this.type = instanceSettings.type;
        this.url = instanceSettings.url;
        this.name = instanceSettings.name;
        this.q = $q;
        this.backendSrv = backendSrv;
        this.templateSrv = templateSrv;
    }

    // Used for testing datasource in datasource configuration pange
    testDatasource() {
        return this.backendSrv.datasourceRequest({
            url: this.url + '/grafana/',
            method: 'GET'
        }).then(
            response => {
                if (response.status === 200) {
                    var data = response.data;
                    if (data && data.service === "Memlytics Grafana") {
                        return {
                            status: "success",
                            title: "Success",
                            message: "Connected to MemSQL analytics proxy.",
                        };
                    }
                }

                return {
                    status: "error",
                    title: "Connection failed",
                    message: "Failed to find MemSQL analytics proxy at the provided url.",
                };
            },
            () => ({
                status: "error",
                title: "Connection failed",
                message: "Could not connect to a MemSQL analytics proxy at the provided url.",
            })
        );
    }

    query(options) {
        console.debug(options);
        var queries = _(options.targets)
            .filter(t => !t.hide && t.target)
            .map(t => ({
                alias: t.alias || t.refId,
                sql: this.templateSrv.replace(t.target, t.scopedVars, this.formatValue.bind(this)),
            }))
            .value();

        if (queries.length === 0) {
            return this.q.when({ data: [] });
        }

        return this.backendSrv.datasourceRequest({
            url: this.url + '/grafana/query/',
            data: {
                queries: queries,
                timeWindow: {
                    // convert timestamps to milliseconds since epoch
                    from: options.range.from.valueOf(),
                    to: options.range.to.valueOf(),
                    interval: parseInterval(options.interval)
                }
            },
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    }

    annotationQuery(options) {
        console.debug(options);
        return this.backendSrv.datasourceRequest({
            url: this.url + '/grafana/raw/',
            data: {
                query: options.annotation.query,
                args: {
                    from: options.range.from.utc().format(),
                    to: options.range.to.utc().format()
                },
                columnTypes: [ "time", "string", "string", "string" ]
            },
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }).then(result => {
            return _.map(result.data, d => ({
                annotation: options.annotation,
                time: moment.utc(d[0]).valueOf(),
                title: d[1],
                tags: d.length >= 2 ? d[2] : "",
                text: d.length >= 3 ? d[3] : "",
            }));
        });
    }

    metricFindQuery(query) {
        return this.backendSrv.datasourceRequest({
            url: this.url + '/grafana/raw/',
            data: {
                query,
                columnTypes: [ "string" ]
            },
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }).then(result => {
            return _.map(result.data, (d, i) => ({
                text: d[0],
                value: d[0]
            }));
        });
    }

    metricsQuery() {
        return this.backendSrv.datasourceRequest({
            url: this.url + '/grafana/raw/',
            data: {
                query: `
                    SELECT name
                    FROM analytics_cache
                    GROUP BY 1
                    ORDER BY 1
                `,
                columnTypes: [ "string" ]
            },
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }).then(result => {
            return _.map(result.data, d => d[0]);
        });
    }

    metricValueQuery(metric) {
        return this.backendSrv.datasourceRequest({
            url: this.url + '/grafana/raw/',
            data: {
                query: `
                    SELECT value
                    FROM analytics_cache
                    WHERE name = :name
                    ORDER BY 1
                `,
                args: { name: metric },
                columnTypes: [ "string" ]
            },
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }).then(result => {
            return _.map(result.data, d => d[0]);
        });
    }

    formatValue(value) {
        if (typeof value === 'string') {
            return `"${luceneEscape(value)}"`;
        }

        // serialize array to in-list
        return "(" + _.map(value, this.formatValue).join(",") + ")";
    }
}
