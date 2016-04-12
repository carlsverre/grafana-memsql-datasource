"use strict";

System.register(["./util", "lodash", "moment"], function (_export, _context) {
    var parseInterval, _, moment, _createClass, GenericDatasource;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    // taken from grafana source
    // attempt at sanitizing user defined values
    function luceneEscape(value) {
        return value.replace(/([\!\*\+\-\=<>\s\&\|\(\)\[\]\{\}\^\~\?\:\\/"])/g, "\\$1");
    }

    return {
        setters: [function (_util) {
            parseInterval = _util.parseInterval;
        }, function (_lodash) {
            _ = _lodash.default;
        }, function (_moment) {
            moment = _moment.default;
        }],
        execute: function () {
            _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            _export("GenericDatasource", GenericDatasource = function () {
                function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
                    _classCallCheck(this, GenericDatasource);

                    this.type = instanceSettings.type;
                    this.url = instanceSettings.url;
                    this.name = instanceSettings.name;
                    this.q = $q;
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                }

                // Used for testing datasource in datasource configuration pange


                _createClass(GenericDatasource, [{
                    key: "testDatasource",
                    value: function testDatasource() {
                        return this.backendSrv.datasourceRequest({
                            url: this.url + '/grafana/',
                            method: 'GET'
                        }).then(function (response) {
                            if (response.status === 200) {
                                var data = response.data;
                                if (data && data.service === "Memlytics Grafana") {
                                    return {
                                        status: "success",
                                        title: "Success",
                                        message: "Connected to MemSQL analytics proxy."
                                    };
                                }
                            }

                            return {
                                status: "error",
                                title: "Connection failed",
                                message: "Failed to find MemSQL analytics proxy at the provided url."
                            };
                        }, function () {
                            return {
                                status: "error",
                                title: "Connection failed",
                                message: "Could not connect to a MemSQL analytics proxy at the provided url."
                            };
                        });
                    }
                }, {
                    key: "query",
                    value: function query(options) {
                        var _this = this;

                        console.debug(options);
                        var queries = _(options.targets).filter(function (t) {
                            return !t.hide && t.target;
                        }).map(function (t) {
                            return {
                                alias: t.alias || t.refId,
                                sql: _this.templateSrv.replace(t.target, t.scopedVars, _this.formatValue.bind(_this))
                            };
                        }).value();

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
                }, {
                    key: "annotationQuery",
                    value: function annotationQuery(options) {
                        console.debug(options);
                        return this.backendSrv.datasourceRequest({
                            url: this.url + '/grafana/raw/',
                            data: {
                                query: options.annotation.query,
                                args: {
                                    from: options.range.from.utc().format(),
                                    to: options.range.to.utc().format()
                                },
                                columnTypes: ["time", "string", "string", "string"]
                            },
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        }).then(function (result) {
                            return _.map(result.data, function (d) {
                                return {
                                    annotation: options.annotation,
                                    time: moment.utc(d[0]).valueOf(),
                                    title: d[1],
                                    tags: d.length >= 2 ? d[2] : "",
                                    text: d.length >= 3 ? d[3] : ""
                                };
                            });
                        });
                    }
                }, {
                    key: "metricFindQuery",
                    value: function metricFindQuery(query) {
                        return this.backendSrv.datasourceRequest({
                            url: this.url + '/grafana/raw/',
                            data: {
                                query: query,
                                columnTypes: ["string"]
                            },
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        }).then(function (result) {
                            return _.map(result.data, function (d, i) {
                                return {
                                    text: d[0],
                                    value: i
                                };
                            });
                        });
                    }
                }, {
                    key: "metricsQuery",
                    value: function metricsQuery() {
                        return this.backendSrv.datasourceRequest({
                            url: this.url + '/grafana/raw/',
                            data: {
                                query: "\n                    SELECT name\n                    FROM analytics_cache\n                    GROUP BY 1\n                    ORDER BY 1\n                ",
                                columnTypes: ["string"]
                            },
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        }).then(function (result) {
                            return _.map(result.data, function (d) {
                                return d[0];
                            });
                        });
                    }
                }, {
                    key: "metricValueQuery",
                    value: function metricValueQuery(metric) {
                        return this.backendSrv.datasourceRequest({
                            url: this.url + '/grafana/raw/',
                            data: {
                                query: "\n                    SELECT value\n                    FROM analytics_cache\n                    WHERE name = :name\n                    ORDER BY 1\n                ",
                                args: { name: metric },
                                columnTypes: ["string"]
                            },
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        }).then(function (result) {
                            return _.map(result.data, function (d) {
                                return d[0];
                            });
                        });
                    }
                }, {
                    key: "formatValue",
                    value: function formatValue(value) {
                        if (typeof value === 'string') {
                            return "\"" + luceneEscape(value) + "\"";
                        }

                        // serialize array to in-list
                        return "(" + _.map(value, this.formatValue).join(",") + ")";
                    }
                }]);

                return GenericDatasource;
            }());

            _export("GenericDatasource", GenericDatasource);
        }
    };
});
//# sourceMappingURL=datasource.js.map
