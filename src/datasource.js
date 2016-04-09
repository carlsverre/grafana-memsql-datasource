import {parseInterval} from "./util";
import _ from "lodash";

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
            err => ({
                status: "error",
                title: "Connection failed",
                message: "Could not connect to a MemSQL analytics proxy at the provided url.",
            })
        );
    }

    query(options) {
        console.log(options);
        var queries = _(options.targets)
            .filter(t => !t.hide && t.target)
            .map(t => ({
                alias: t.alias || t.refId,
                sql: this.templateSrv.replace(t.target),
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
}
