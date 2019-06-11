# fiojs
FIO JS Library

# How to install/setup
```js
npm install
tsc
```

# Errors Installing?
if you don’t have tsc, install it:
```js
npm install -g typescript
```

# Import
```js
const { Fio, Ecc } = require('fiojs');
const { TextEncoder, TextDecoder } = require('util');                   // node only; native TextEncoder/Decoder
const { TextEncoder, TextDecoder } = require('text-encoding');          // React Native, IE11, and Edge Browsers only
```

# How to Test
The mock tests run under `npm run test` and those don't require nodeosd.. That will cover most of the changes made.
The `npm run test-node` target needs a node with a specific key with Bob and Alice accounts. Unless your merging patches or changing something internal you may not need to run the node test at all.  You could try it on you own node with something like this:

```bash
#test_privkey=5JuH9fCXmU3xbj8nRmhPZaVrxxXrdPaRmZLW1cznNTmTQR2Kg5Z
test_pubkey=EOS7bxrQUTbQ4mqcoefhWPz1aFieN4fA9RQAiozRz7FrUChHZ7Rb8
cleos create account eosio bob $test_pubkey
cleos create account eosio alice $test_pubkey
cleos transfer eosio.token bob '1000 SYS'
cleos transfer eosio.token alice '1000 SYS'
```

# prepareTransaction

Client-side serialization and signing.  This is a full example that includes the external RPC code you plan to use outside of the `Fio` instance:
```js
info = await rpc.get_info();
blockInfo = await rpc.get_block(info.last_irreversible_block_num);
currentDate = new Date();
timePlusTen = currentDate.getTime() + 10000;
timeInISOString = (new Date(timePlusTen)).toISOString();
expiration = timeInISOString.substr(0, timeInISOString.length - 1);

transaction = {
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

abiMap = new Map()
tokenRawAbi = await rpc.get_raw_abi('eosio.token')
abiMap.set('eosio.token', tokenRawAbi)

tx = await Fio.prepareTransaction({transaction, chainId, privateKeys, abiMap,
textDecoder: new TextDecoder(), textEncoder: new TextEncoder()});

pushResult = await fetch(httpEndpoint + '/v1/chain/push_transaction', {
    body: JSON.stringify(tx),
    method: 'POST',
});

json = await pushResult.json()
if (json.processed && json.processed.except) {
    throw new RpcError(json);
}

expect(Object.keys(json)).toContain('transaction_id');
```

# accountHash

Hashes public key to an on-chain Fio account name.

```js
const accountHash = Fio.accountHash('EOS7bxrQUTbQ4mqcoefhWPz1aFieN4fA9RQAiozRz7FrUChHZ7Rb8');
expect(accountHash).toEqual('5kmx4qbqlpld');
```

# createSharedCipher

Encrypted Messages

Alice sends a new_funds_request to Bob.  In the `new_funds_request` there is a
`content` field.  The `content` field is encrypted by Alice and decrypted by Bob.

```js
newFundsContent = {
    payee_public_address: 'purse.alice',
    amount: '1',
    token_code: 'fio.reqobt',
    memo: null,
    hash: null,
    offline_url: null
}

privateKeyAlice = '5J9bWm2ThenDm3tjvmUgHtWCVMUdjRR1pxnRtnJjvKA4b2ut5WK';
publicKeyAlice = 'EOS7zsqi7QUAjTAdyynd6DVe8uv4K8gCTRHnAoMN9w9CA1xLCTDVv';
privateKeyBob = '5JoQtsKQuH8hC9MyvfJAqo6qmKLm8ePYNucs7tPu2YxG12trzBt';
publicKeyBob = 'EOS5VE6Dgy9FUmd1mFotXwF88HkQN1KysCWLPqpVnDMjRvGRi1YrM';

cipherAlice = Fio.createSharedCipher({privateKey: privateKeyAlice, publicKey: publicKeyBob, textEncoder: new TextEncoder(), textDecoder: new TextDecoder()});
cipherAliceHex = cipherAlice.encrypt('new_funds_content', newFundsContent);

// Alice sends cipherAliceHex to Bob via new_funds_request

cipherBob = Fio.createSharedCipher({privateKey: privateKeyBob, publicKey: publicKeyAlice, textEncoder: new TextEncoder(), textDecoder: new TextDecoder()});
newFundsContentBob = cipherBob.decrypt('new_funds_content', cipherAliceHex);
expect(newFundsContentBob).toEqual(newFundsContent);
```

See `src/encryption-fio.abi.json` for other message types like `new_funds_content`.
