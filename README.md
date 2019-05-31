# fiojs
FIO JS Library

# How to install/setup
npm install
tsc 

# Errors Installing?
if you don’t have tsc, install it:
npm install -g typescript

# How to Test
The mock tests run under `npm run test` and those don't require a node.. That will probably cover most of the changes we make.
The `test-node` target needs a node with a specific key with Bob and Alice accounts. Unless your merging patches or changing something internal you may not need to run the node test at all. I just wanted to make sure we had that option preserved. You could try it on you own node with something like this:
#test_privkey=5JuH9fCXmU3xbj8nRmhPZaVrxxXrdPaRmZLW1cznNTmTQR2Kg5Z
test_pubkey=EOS7bxrQUTbQ4mqcoefhWPz1aFieN4fA9RQAiozRz7FrUChHZ7Rb8
cleos create account eosio bob $test_pubkey
cleos create account eosio alice $test_pubkey
cleos transfer eosio.token bob '1000 SYS'
cleos transfer eosio.token alice '1000 SYS'

# example of rpc call
This is a full example that includes the external rpc code you plan to use outside of the `Fio` instance:

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

    expect(Object.keys(json)).toContain('transaction_id');