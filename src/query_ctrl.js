import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!';

const DEFAULT_QUERY = `
SELECT (ts - (ts % :interval)) AS TS, AVG(value) AS Value, metric AS Segment
FROM analytics
WHERE
    ts >= :from AND ts <= :to AND metric = ""
GROUP BY 1
`.trim();

export class GenericDatasourceQueryCtrl extends QueryCtrl {
    constructor($scope, $injector, uiSegmentSrv)  {
        super($scope, $injector);
        this.target.target = this.target.target || DEFAULT_QUERY;
        this.uiSegmentSrv = uiSegmentSrv;
        this.metricSearchSegment = uiSegmentSrv.newSelectMetric();
        this.metricValueSegment = uiSegmentSrv.newSelectTagValue();
    }

    refresh() {
        this.panelCtrl.refresh();
    }

    getMetrics() {
        return this.datasource.metricsQuery().then(res => {
            return res.map(c => this.uiSegmentSrv.newSegment({
                value: c,
                expandable: false,
            }));
        });
    }

    getMetricValues() {
        var metric = this.metricSearchSegment.value;
        return this.datasource.metricValueQuery(metric).then(res => {
            return res.map(c => this.uiSegmentSrv.newSegment({
                value: c,
                expandable: false,
            }));
        });
    }
}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
