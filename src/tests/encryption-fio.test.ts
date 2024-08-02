import { TextDecoder, TextEncoder } from "text-encoding";
import * as ser from "../chain-serialize";
import * as _ from "lodash";

const { PrivateKey } = require("../ecc");
const { serialize, deserialize, createSharedCipher } = require("../encryption-fio");

const textEncoder: TextEncoder = new TextEncoder();
const textDecoder: TextDecoder = new TextDecoder();

describe("Encryption FIO", () => {
    const newFundsContent: null|any = {
        amount: "1",
        chain_code: "FIO",
        hash: null,
        memo: null,
        offline_url: null,
        payee_public_address: "purse.alice",
        token_code: "FIO",
    };

    const newFundsContentHex = "0B70757273652E616C69636501310346494F0346494F000000";

    it("serialize", () => {
        const buffer = new ser.SerialBuffer({ textEncoder, textDecoder });
        serialize(buffer, "new_funds_content", newFundsContent);
        expect(ser.arrayToHex(buffer.asUint8Array())).toEqual(newFundsContentHex);
    });

    it("deserialize", () => {
        const array = ser.hexToUint8Array(newFundsContentHex);
        const buffer = new ser.SerialBuffer({ array, textEncoder, textDecoder });
        const newFundsContentRes = deserialize(buffer, "new_funds_content");
        expect(_.isEqual(newFundsContentRes, newFundsContent)).toBeTruthy();
    });

    describe("Diffie Cipher", () => {
        const privateKeyAlice = PrivateKey.fromSeed("alice");
        const publicKeyAlice = privateKeyAlice.toPublic();
        const privateKeyBob = PrivateKey.fromSeed("bob");
        const publicKeyBob = privateKeyBob.toPublic();

        const IV = Buffer.from("f300888ca4f512cebdc0020ff0f7224c", "hex");
        // tslint:disable-next-line:max-line-length
        const newFundsContentCipherBase64 = "8wCIjKT1Es69wAIP8PciTOB8F09qqDGdsq0XriIWcOkqpZe9q4FwKu3SGILtnAWtJGETbcAqd3zX7NDptPUQsS1ZfEPiK6Hv0nJyNbxwiQc=";

        it("encrypt", () => {
            const cipherAlice = createSharedCipher({
                privateKey: privateKeyAlice,
                publicKey: publicKeyBob,
                textDecoder,
                textEncoder,
            });
            const cipherAliceBase64 = cipherAlice.encrypt("new_funds_content", newFundsContent, IV);
            expect(cipherAliceBase64).toEqual(newFundsContentCipherBase64);

            const cipherBob = createSharedCipher({
                privateKey:
                privateKeyBob,
                publicKey: publicKeyAlice,
                textDecoder,
                textEncoder,
            });
            const cipherBobBase64 = cipherBob.encrypt("new_funds_content", newFundsContent, IV);
            expect(_.isEqual(cipherBobBase64, newFundsContentCipherBase64)).toBeTruthy();
        });

        it("decrypt", () => {
            const cipherAlice = createSharedCipher({
                privateKey: privateKeyAlice,
                publicKey: publicKeyBob,
                textDecoder,
                textEncoder,
            });
            const newFundsContentAlice = cipherAlice.decrypt("new_funds_content", newFundsContentCipherBase64);

            expect(_.isEqual(newFundsContentAlice, newFundsContent)).toBeTruthy();

            const cipherBob = createSharedCipher({
                privateKey: privateKeyBob,
                publicKey: publicKeyAlice,
                textDecoder,
                textEncoder,
            });
            const newFundsContentBob = cipherBob.decrypt("new_funds_content", newFundsContentCipherBase64);
            expect(_.isEqual(newFundsContentBob, newFundsContent)).toBeTruthy();
        });

        it("hashA", () => {
            const privateKey = PrivateKey.fromSeed("");
            const publicKey = privateKey.toPublic();
            const cipher = createSharedCipher({privateKey, publicKey});
            expect(cipher.hashA("")).toEqual("0x7a5de2d59c72b94c67a192a9009484ef");
            expect(cipher.hashA(Buffer.from(""))).toEqual("0x7a5de2d59c72b94c67a192a9009484ef");
            expect(cipher.hashA(publicKey.toBuffer())).toEqual("0x2521bccef77d48793a7a80716e79a46d");
        });
    });

});
