import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!';

const DEFAULT_QUERY = `
SELECT (ts - (ts % :interval)) AS TS, AVG(value) AS Value
FROM analytics
WHERE
    ts >= :from AND ts <= :to AND metric = ""
GROUP BY 1
`.trim();

export class GenericDatasourceQueryCtrl extends QueryCtrl {
    constructor($scope, $injector)  {
        super($scope, $injector);
        this.target.target = this.target.target || DEFAULT_QUERY;
    }

    refresh() {
        this.panelCtrl.refresh(); // Asks the panel to refresh data.
    }
}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
