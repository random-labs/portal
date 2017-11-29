import {bindable, inject} from 'aurelia-framework';
import * as StellarSdk from 'stellar-sdk';
import {Store} from 'au-redux';
import StellarLedger from 'stellar-ledger-api';

@inject(Store)
export class SignWithLedgerCustomElement {
    @bindable() transactionSigned;
    @bindable() transaction;
    @bindable() back;

    constructor(store) {
        this.store = store;
    }

    activate(params) {
        this.modalVM = params.modalVM;
    }

    async sign() {
        const account = this.store.getState().myAccount;

        if (!account) {
            this.errorMessage = 'Hey, you aren\'t logged in. You can\'t create a transaction without being logged in first silly. Please login and try again.';
            return;
        }

        const keypair = StellarSdk.Keypair.fromPublicKey(account.accountId);
        const bip32Path = this.store.getState().bip32Path;
        const Comm = StellarLedger.comm;

        await new StellarLedger.Api(
            new Comm(60)
        )
            .signTx_async(bip32Path, this.transaction)
            .then((result) => {
                this.transaction.signatures.push(
                    new StellarSdk.xdr.DecoratedSignature({
                        hint: keypair.signatureHint(),
                        signature: result.signature
                    })
                );

                this.transactionSigned({
                    signedTransaction: this.transaction
                });
            })
            .catch((err) => {
                console.error(err);
                this.errorMessage = err;
            });
    }
}
