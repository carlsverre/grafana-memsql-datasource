'use strict';

System.register(['app/plugins/sdk', './css/query-editor.css!'], function (_export, _context) {
    var QueryCtrl, _createClass, DEFAULT_QUERY, GenericDatasourceQueryCtrl;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    return {
        setters: [function (_appPluginsSdk) {
            QueryCtrl = _appPluginsSdk.QueryCtrl;
        }, function (_cssQueryEditorCss) {}],
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

            DEFAULT_QUERY = '\nSELECT (ts - (ts % :interval)) AS TS, AVG(value) AS Value, metric AS Segment\nFROM analytics\nWHERE\n    ts >= :from AND ts <= :to AND metric = ""\nGROUP BY 1\n'.trim();

            _export('GenericDatasourceQueryCtrl', GenericDatasourceQueryCtrl = function (_QueryCtrl) {
                _inherits(GenericDatasourceQueryCtrl, _QueryCtrl);

                function GenericDatasourceQueryCtrl($scope, $injector, uiSegmentSrv) {
                    _classCallCheck(this, GenericDatasourceQueryCtrl);

                    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GenericDatasourceQueryCtrl).call(this, $scope, $injector));

                    _this.target.target = _this.target.target || DEFAULT_QUERY;
                    _this.uiSegmentSrv = uiSegmentSrv;
                    _this.metricSearchSegment = uiSegmentSrv.newSelectMetric();
                    _this.metricValueSegment = uiSegmentSrv.newSelectTagValue();
                    return _this;
                }

                _createClass(GenericDatasourceQueryCtrl, [{
                    key: 'refresh',
                    value: function refresh() {
                        this.panelCtrl.refresh();
                    }
                }, {
                    key: 'getMetrics',
                    value: function getMetrics() {
                        var _this2 = this;

                        return this.datasource.metricsQuery().then(function (res) {
                            return res.map(function (c) {
                                return _this2.uiSegmentSrv.newSegment({
                                    value: c,
                                    expandable: false
                                });
                            });
                        });
                    }
                }, {
                    key: 'getMetricValues',
                    value: function getMetricValues() {
                        var _this3 = this;

                        var metric = this.metricSearchSegment.value;
                        return this.datasource.metricValueQuery(metric).then(function (res) {
                            return res.map(function (c) {
                                return _this3.uiSegmentSrv.newSegment({
                                    value: c,
                                    expandable: false
                                });
                            });
                        });
                    }
                }]);

                return GenericDatasourceQueryCtrl;
            }(QueryCtrl));

            _export('GenericDatasourceQueryCtrl', GenericDatasourceQueryCtrl);

            GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
        }
    };
});
//# sourceMappingURL=query_ctrl.js.map
