import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!';

export class GenericDatasourceQueryCtrl extends QueryCtrl {
    constructor($scope, $injector, uiSegmentSrv)  {
        super($scope, $injector);

        this.scope = $scope;
        this.uiSegmentSrv = uiSegmentSrv;
        this.target.target = this.target.target || 'select * from metrics';
    }
}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
