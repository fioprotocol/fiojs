import { TextDecoder, TextEncoder } from 'text-encoding';
import * as ser from '../chain-serialize';

const { PrivateKey } = require('../ecc');
const { serialize, deserialize, createSharedCipher } = require('../encryption-fio');

const textEncoder: TextEncoder = new TextEncoder();
const textDecoder: TextDecoder = new TextDecoder();

describe('Encryption FIO', () => {
    const newFundsContent : null|any = {
        payee_public_address: 'purse.alice',
        amount: '1',
        token_code: 'fio.reqobt',
        memo: null,
        hash: null,
        offline_url: null
    }

    const newFundsContentHex = '0B70757273652E616C69636501310A66696F2E7265716F6274000000';

    it('serialize', function() {
        const buffer = new ser.SerialBuffer({ textEncoder, textDecoder });
        serialize(buffer, 'new_funds_content', newFundsContent);
        expect(ser.arrayToHex(buffer.asUint8Array())).toEqual(newFundsContentHex);
    })

    it('deserialize', function() {
        const array = ser.hexToUint8Array(newFundsContentHex);
        const buffer = new ser.SerialBuffer({ array, textEncoder, textDecoder });
        const newFundsContent = deserialize(buffer, 'new_funds_content');
        expect(newFundsContent).toEqual(newFundsContent);
    })

    describe('Diffie Cipher', function () {
        const privateKeyAlice = PrivateKey.fromSeed('alice');
        const publicKeyAlice = privateKeyAlice.toPublic();
        const privateKeyBob = PrivateKey.fromSeed('bob');
        const publicKeyBob = privateKeyBob.toPublic();

        const IV = Buffer.from('f300888ca4f512cebdc0020ff0f7224c', 'hex');
        const newFundsContentCipherHex = 'f300888ca4f512cebdc0020ff0f7224c0db2984c4ad9afb12629f01a8c6a76328bbde17405655dc4e3cb30dad272996fb1dea8e662e640be193e25d41147a904c571b664a7381ab41ef062448ac1e205';

        it('encrypt', function() {
            const cipherAlice = createSharedCipher({privateKey: privateKeyAlice, publicKey: publicKeyBob, textEncoder, textDecoder});
            const cipherAliceHex = cipherAlice.encrypt('new_funds_content', newFundsContent, IV);
            expect(cipherAliceHex).toEqual(newFundsContentCipherHex);

            const cipherBob = createSharedCipher({privateKey: privateKeyBob, publicKey: publicKeyAlice, textEncoder, textDecoder});
            const cipherBobHex = cipherBob.encrypt('new_funds_content', newFundsContent, IV);
            expect(cipherBobHex).toEqual(newFundsContentCipherHex);
        })

        it('decrypt', function() {
            const cipherAlice = createSharedCipher({privateKey: privateKeyAlice, publicKey: publicKeyBob, textEncoder, textDecoder});
            const newFundsContentAlice = cipherAlice.decrypt('new_funds_content', newFundsContentCipherHex);
            expect(newFundsContentAlice).toEqual(newFundsContent);

            const cipherBob = createSharedCipher({privateKey: privateKeyBob, publicKey: publicKeyAlice, textEncoder, textDecoder});
            const newFundsContentBob = cipherBob.decrypt('new_funds_content', newFundsContentCipherHex);
            expect(newFundsContentBob).toEqual(newFundsContent);
        })

        it('hashA', function() {
            const privateKey = PrivateKey.fromSeed('')
            const publicKey = privateKey.toPublic()
            const cipher = createSharedCipher({privateKey, publicKey})
            expect(cipher.hashA('')).toEqual('0x7a5de2d59c72b94c67a192a9009484ef')
            expect(cipher.hashA(Buffer.from(''))).toEqual('0x7a5de2d59c72b94c67a192a9009484ef')
            expect(cipher.hashA(publicKey.toBuffer())).toEqual('0x2521bccef77d48793a7a80716e79a46d')
        })
    })

})
