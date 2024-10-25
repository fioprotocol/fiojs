import {checkDecrypt, checkEncrypt} from "./encryption-check";

const {PublicKey, PrivateKey} = require("./ecc");

export function eccEncrypt(privateKey: any, publicKey: any, message: Buffer, IV?: Buffer): Buffer {
    privateKey = PrivateKey(privateKey);
    publicKey = PublicKey(publicKey);
    const sharedSecret = privateKey.getSharedSecret(publicKey);
    return checkEncrypt(sharedSecret, message, IV);
}

export function eccDecrypt(privateKey: any, publicKey: any, message: Buffer): Buffer {
    privateKey = PrivateKey(privateKey);
    publicKey = PublicKey(publicKey);
    const sharedSecret = privateKey.getSharedSecret(publicKey);
    return checkDecrypt(sharedSecret, message);
}
