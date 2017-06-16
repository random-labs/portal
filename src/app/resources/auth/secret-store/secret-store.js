/**
 * Created by istrauss on 4/24/2017.
 */

import {PLATFORM} from 'aurelia-pal';
import {inject} from 'aurelia-framework';
import {ModalService, StellarServer, AppStore, AlertToaster} from 'global-resources';
import {InactivityTracker} from '../inactivity-tracker';

@inject(ModalService, StellarServer, AppStore, AlertToaster, InactivityTracker)
export class SecretStore {

    constructor(modalService, stellarServer, appStore, alertToaster, inactivityTracker) {
        this.modalService = modalService;
        this.stellarServer = stellarServer;
        this.appStore = appStore;
        this.alertToaster = alertToaster;
        this.inactivityTracker = inactivityTracker;
    }

    async sign(transaction) {
        let keypair;
        if (!this._keypair) {
            const result = await this.modalService.open(PLATFORM.moduleName('app/resources/auth/secret-store/identify-user-modal/identify-user-modal'),
                {
                    title: 'Authenticate',
                    action: 'authenticate'
                },
                {
                    modalClass: 'md'
                }
            );

            keypair = this.stellarServer.sdk.Keypair.fromSecret(result.secret);

            const account = this.appStore.getState().account;

            if (!account) {
                this.alertToaster.error('You cannot authenticate with your secret key before logging in. Please log in and try again.');
                throw new Error('You cannot authenticate with your secret key before logging in. Please log in and try again.');
            }
            if (account.id !== keypair.publicKey()) {
                this.alertToaster.error('Sorry, the secret key provided did not match your account. Please try again.');
                return this.sign(transaction);
            }

            if (result.remember) {
                this.remember(keypair);
            }
        }
        else {
            keypair = this._keypair;
        }

        transaction.sign(keypair);

        return transaction;
    }

    remember(keypair) {
        this.unsubscribeFromInactivityTracker = this.inactivityTracker.subscribe(this.forget.bind(this));

        this._keypair = keypair;
    }

    async forget(pastDue) {
        if (!pastDue) {
            try {
                await this.modalService.open(PLATFORM.moduleName('app/resources/auth/secret-store/timeout-modal/timeout-modal'), {}, {modalClass: 'sm'});
                //If the modal does not throw then that means the user selected not to forget the secret.
                return;
            }
            catch(e) {}
        }
        this._secret = undefined;
        this.alertToaster.primary('Secret key has been removed from memory.');
        this.unsubscribeFromInactivityTracker();
    }
}