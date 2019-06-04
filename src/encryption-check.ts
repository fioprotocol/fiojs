/**
 * @module Encryption
 */
 import * as crypto from 'browserify-aes'

const randomBytes = require('randombytes')
const createHmac = require('create-hmac')
const createHash = require('create-hash')

/**
    AES-based encryption with HMAC.

    The CBC cipher has good platform native compatability.

    @arg {Buffer} secret - See PrivateKey.getSharedSecret()
    @arg {Buffer} message - plaintext
    @arg {Buffer} [IV = randomBytes(16)] - Unit tests may provide this value

    @see https://security.stackexchange.com/a/63134
*/
export function checkEncrypt(secret: Buffer, message: Buffer, IV?: Buffer) : Buffer {
    const K = createHash('sha512').update(secret).digest();
    const Ke = K.slice(0, 32); // Encryption
    const Km = K.slice(32); // MAC
    if(IV == null) {
        IV = randomBytes(16);
    } else {
        if(IV.length !== 16) {
            throw new TypeError('IV must be 16 bytes');
        }
    }

    // Cipher performs PKCS#5 padded automatically
    const cipher = crypto.createCipheriv('aes-256-cbc', Ke, IV);
    const C = Buffer.concat([cipher.update(message), cipher.final()]);
    const M = createHmac('sha256', Km).update(Buffer.concat([IV, C])).digest(); // AuthTag

    return Buffer.concat([IV, C, M]);
}

/**
    AES-based decryption with HMAC.

    The CBC cipher has good platform native compatability.

    @arg {Buffer} secret - See PrivateKey.getSharedSecret()
    @arg {Buffer} message - ciphertext

    @see https://security.stackexchange.com/a/63134
*/
export function checkDecrypt(secret: Buffer, message: Buffer) : Buffer {
    const K = createHash('sha512').update(secret).digest();
    const Ke = K.slice(0, 32); // Encryption
    const Km = K.slice(32); // MAC
    const IV = message.slice(0, 16);
    const C = message.slice(16, message.length - 32);
    const M = message.slice(message.length - 32);

    // Side-channel attack protection: First verify the HMAC, then and only then proceed to the decryption step
    const Mc = createHmac('sha256', Km).update(Buffer.concat([IV, C])).digest();

    if(Buffer.compare(M, Mc) !== 0) {
        throw new Error('decrypt failed');
    }

    // Cipher performs PKCS#5 padded automatically
    const cipher = crypto.createDecipheriv('aes-256-cbc', Ke, IV);
    return Buffer.concat([cipher.update(C, 'binary'), cipher.final()]);
}
