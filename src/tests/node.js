const { Fio, RpcError, Api } = require('../../dist');
const { JsSignatureProvider } = require('../../dist/chain-jssig');
const { JsonRpc } = require('../../dist/chain-jsonrpc');
const { TextEncoder, TextDecoder } = require('util');
const fetch = require('node-fetch');

const privateKeys = ['5JuH9fCXmU3xbj8nRmhPZaVrxxXrdPaRmZLW1cznNTmTQR2Kg5Z']; // replace with "bob" account private key
/* new accounts for testing can be created by unlocking a cleos wallet then calling:
 * 1) cleos create key --to-console (copy this privateKey & publicKey)
 * 2) cleos wallet import
 * 3) cleos create account bob publicKey
 * 4) cleos create account alice publicKey
 */

const signatureProvider = new JsSignatureProvider(privateKeys);
const httpEndpoint = 'http://localhost:8888';
const rpc = new JsonRpc(httpEndpoint, { fetch });
const abiProvider = authorityProvider = rpc;
const chainId = 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f';

const api = new Api({ rpc, chainId, abiProvider, authorityProvider, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

const broadcastTransaction = async () => {
    const info = await rpc.get_info();
    const blockInfo = await rpc.get_block(info.last_irreversible_block_num);
    const currentDate = new Date();
    const timePlusTen = currentDate.getTime() + 10000;
    const timeInISOString = (new Date(timePlusTen)).toISOString();
    const expiration = timeInISOString.substr(0, timeInISOString.length - 1);

    const transaction = {
        expiration,
        ref_block_num: blockInfo.block_num & 0xffff,
        ref_block_prefix: blockInfo.ref_block_prefix,
        actions: [{
            account: 'eosio.token',
            name: 'transfer',
            authorization: [{
                actor: 'bob',
                permission: 'active',
            }],
            data: {
                from: 'bob',
                to: 'alice',
                quantity: '0.0001 SYS',
                memo: '',
            },
        }]
    };

    const abiMap = new Map()
    const tokenRawAbi = await rpc.get_raw_abi('eosio.token')
    abiMap.set('eosio.token', tokenRawAbi)

    const tx = await Fio.prepareTransaction({transaction, chainId, privateKeys, abiMap,
    textDecoder: new TextDecoder(), textEncoder: new TextEncoder()});

    const pushResult = await fetch(httpEndpoint + '/v1/chain/push_transaction', {
        body: JSON.stringify(tx),
        method: 'POST',
    });

    const json = await pushResult.json()
    if (json.processed && json.processed.except) {
        throw new RpcError(json);
    }
    return json;
};



const broadcastResult = async (signaturesAndPackedTransaction) => await api.pushSignedTransaction(signaturesAndPackedTransaction);

const transactShouldFail = async () => await api.transact({
    actions: [{
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{
            actor: 'bob',
            permission: 'active',
        }],
        data: {
            from: 'bob',
            to: 'alice',
            quantity: '0.0001 SYS',
            memo: '',
        },
    }]
});

const rpcShouldFail = async () => await rpc.get_block(-1);

module.exports = {
    broadcastTransaction,
    broadcastResult,
    transactShouldFail,
    rpcShouldFail
};
