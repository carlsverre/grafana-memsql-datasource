"use strict";

System.register(["./util", "lodash"], function (_export, _context) {
    var parseInterval, _, _createClass, GenericDatasource;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [function (_util) {
            parseInterval = _util.parseInterval;
        }, function (_lodash) {
            _ = _lodash.default;
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
                        }, function (err) {
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

                        console.log(options);
                        var queries = _(options.targets).filter(function (t) {
                            return !t.hide && t.target;
                        }).map(function (t) {
                            return {
                                alias: t.alias || t.refId,
                                sql: _this.templateSrv.replace(t.target)
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
                }]);

                return GenericDatasource;
            }());

            _export("GenericDatasource", GenericDatasource);
        }
    };
});
//# sourceMappingURL=datasource.js.map
