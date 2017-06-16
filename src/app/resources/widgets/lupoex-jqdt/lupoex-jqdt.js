/**
 * Created by istrauss on 5/9/2017.
 */

import {inject, bindable} from 'aurelia-framework';

export class LupoexJqdtCustomElement {

    @bindable config = {};
    @bindable additionalFilterParams = {};
    @bindable resource;

    pageNum = 1;

    bind() {
        this._config = {
            ...{
                lengthMenu: [ 10, 25, 100, 500 ],
                searchable: true
                //pagingType: 'first_last_numbers '
            },
            ...this.config,
            ...{
                rowId: 'id',
                serverSide: true,
                ajax: this.ajax.bind(this)
            }
        };
    }

    refresh() {
        if (this.jqueryDataTable && this.resource) {
            this.jqueryDataTable.dataTable.api().ajax.reload();
        }
    }

    async ajax(data, callback, settings) {
        const tableData = await this.resource.getDataTable(data, settings, this.additionalFilterParams);

        callback(tableData);
    }
}