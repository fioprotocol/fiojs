
import { Api, signAllAuthorityProvider } from './chain-api';
import { JsSignatureProvider } from './chain-jssig';
import { base64ToBinary, arrayToHex } from './chain-numeric';
import { AbiProvider, BinaryAbi } from './chain-api-interfaces';

/** @return a packed and signed transaction formatted ready to be pushed to chain. */
export async function prepareTransaction(
    {transaction, chainId, privateKeys, abiMap, textDecoder, textEncoder} : {
    transaction: any,
    chainId: string,
    privateKeys: string[],
    abiMap: Map<string, any>,
    textDecoder?: TextDecoder,
    textEncoder?: TextEncoder,
}) {
    const signatureProvider = new JsSignatureProvider(privateKeys);
    const authorityProvider = signAllAuthorityProvider;

    const abiProvider : AbiProvider = {
        getRawAbi: async function(accountName) {
            const rawAbi = abiMap.get(accountName);
            if(!rawAbi) {
                throw new Error(`Missing ABI for account ${accountName}`);
            }
            const abi = base64ToBinary(rawAbi.abi);
            const binaryAbi : BinaryAbi = { accountName: rawAbi.account_name, abi };
            return binaryAbi;
        }
    };

    const api = new Api({
        signatureProvider, authorityProvider, abiProvider, chainId, textDecoder, textEncoder
    });

    const {signatures, serializedTransaction, serializedContextFreeData} = await api.transact(transaction);

    return {
        signatures,
        compression: 0,
        packed_context_free_data: arrayToHex(serializedContextFreeData || new Uint8Array(0)),
        packed_trx: arrayToHex(serializedTransaction),
    }
}
