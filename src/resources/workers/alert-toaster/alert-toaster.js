/**
 * Created by istrauss on 10/9/2016.
 */

import {inject, bindable} from 'aurelia-framework';
import { MdToastService } from 'aurelia-materialize-bridge';

const defaultOptions = {
    timeout: 10000
};

@inject(MdToastService)
export class AlertToaster {

    constructor(toastService) {
        this.toastService = toastService;
    }

    error(text, options = {}) {
        options.type = 'error';
        this.toast(text, options);
    }

    warning(text, options = {}) {
        options.type = 'warning';
        this.toast(text, options);
    }

    primary(text, options = {}) {
        options.type = 'primary';
        this.toast(text, options);
    }

    info(text, options = {}) {
        options.type = 'info';
        this.toast(text, options);
    }

    success(text, options = {}) {
        options.type = 'success';
        options.timeout = options.timeout || 3000;
        this.toast(text, options);
    }

    toast(text, options) {
        const _options = Object.assign({}, defaultOptions, options);
        this.toastService.show(text, _options.timeout, _options.type);
    }
}