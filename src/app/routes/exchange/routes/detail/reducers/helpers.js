/**
 * Created by istrauss on 9/18/2017.
 */

import BigNumber from 'bignumber.js';
import {validStellarNumber} from 'app-resources';

export function isNewAssetPair(oldAssetPair, newAssetPair) {
    return oldAssetPair && newAssetPair &&
        !(
            oldAssetPair.buying.code === newAssetPair.buying.code &&
            oldAssetPair.buying.issuer === newAssetPair.buying.issuer &&
            oldAssetPair.selling.code === newAssetPair.selling.code &&
            oldAssetPair.selling.issuer === newAssetPair.selling.issuer
        );
}

export function calculateNewOrder(newState, oldState) {
    let clonedNewState;

    try {
        clonedNewState = Object.keys(newState).reduce((ns, key) => {
            return {
                ...ns,
                [key]: validStellarNumber(newState[key])
            }
        }, {});
    }
    catch(e) {
        // new BigNumber can throw if newState has a value that is not a number.
        // In that case, assume it is a lone negative sign or decimal and just return the new state without calculating anything new.
        return {
            ...oldState,
            ...newState
        };
    }

    if (clonedNewState.price) {
        const sellingAmount = clonedNewState.sellingAmount || oldState.sellingAmount;
        if (sellingAmount) {
            clonedNewState.buyingAmount = validStellarNumber(
                (new BigNumber(sellingAmount)).times(clonedNewState.price)
            );
        }
        else {
            const buyingAmount = newState.buyingAmount || oldState.buyingAmount;
            if (buyingAmount) {
                clonedNewState.sellingAmount = validStellarNumber(
                    (new BigNumber(buyingAmount)).dividedBy(clonedNewState.price)
                );
            }
        }
    }

    else if (clonedNewState.sellingAmount) {
        // Don't both looking for sellingAmount on clonedNewState, we know it doesn't exist there
        if (oldState.price) {
            clonedNewState.buyingAmount = validStellarNumber(
                (new BigNumber(clonedNewState.sellingAmount)).times(oldState.price)
            );
        }
        else {
            const buyingAmount = clonedNewState.buyingAmount || oldState.buyingAmount;
            if (buyingAmount) {
                clonedNewState.price = validStellarNumber(
                    (new BigNumber(buyingAmount)).dividedBy(clonedNewState.sellingAmount)
                );
            }
        }
    }
    else if (clonedNewState.buyingAmount) {
        // Don't both looking for price on clonedNewState, we know it doesn't exist there
        if (oldState.price) {
            clonedNewState.sellingAmount = validStellarNumber(
                (new BigNumber(clonedNewState.buyingAmount)).dividedBy(oldState.price)
            );
        }
        // Don't both looking for sellingAmount on clonedNewState, we know it doesn't exist there
        else if (oldState.sellingAmount) {
            clonedNewState.price = validStellarNumber(
                (new BigNumber(clonedNewState.buyingAmount)).dividedBy(oldState.sellingAmount)
            );
        }
    }
    
    return {
        ...oldState,
        ...clonedNewState
    };
}

