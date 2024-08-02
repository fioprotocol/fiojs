import { TextDecoder, TextEncoder } from "text-encoding";
import * as Fio from "../fio-api";
import * as _ from "lodash";

const rawAbi = {
    // tslint:disable-next-line:max-line-length
    abi: "DmVvc2lvOjphYmkvMS4wAQxhY2NvdW50X25hbWUEbmFtZQUIdHJhbnNmZXIABARmcm9tDGFjY291bnRfbmFtZQJ0bwxhY2NvdW50X25hbWUIcXVhbnRpdHkFYXNzZXQEbWVtbwZzdHJpbmcGY3JlYXRlAAIGaXNzdWVyDGFjY291bnRfbmFtZQ5tYXhpbXVtX3N1cHBseQVhc3NldAVpc3N1ZQADAnRvDGFjY291bnRfbmFtZQhxdWFudGl0eQVhc3NldARtZW1vBnN0cmluZwdhY2NvdW50AAEHYmFsYW5jZQVhc3NldA5jdXJyZW5jeV9zdGF0cwADBnN1cHBseQVhc3NldAptYXhfc3VwcGx5BWFzc2V0Bmlzc3VlcgxhY2NvdW50X25hbWUDAAAAVy08zc0IdHJhbnNmZXLnBSMjIFRyYW5zZmVyIFRlcm1zICYgQ29uZGl0aW9ucwoKSSwge3tmcm9tfX0sIGNlcnRpZnkgdGhlIGZvbGxvd2luZyB0byBiZSB0cnVlIHRvIHRoZSBiZXN0IG9mIG15IGtub3dsZWRnZToKCjEuIEkgY2VydGlmeSB0aGF0IHt7cXVhbnRpdHl9fSBpcyBub3QgdGhlIHByb2NlZWRzIG9mIGZyYXVkdWxlbnQgb3IgdmlvbGVudCBhY3Rpdml0aWVzLgoyLiBJIGNlcnRpZnkgdGhhdCwgdG8gdGhlIGJlc3Qgb2YgbXkga25vd2xlZGdlLCB7e3RvfX0gaXMgbm90IHN1cHBvcnRpbmcgaW5pdGlhdGlvbiBvZiB2aW9sZW5jZSBhZ2FpbnN0IG90aGVycy4KMy4gSSBoYXZlIGRpc2Nsb3NlZCBhbnkgY29udHJhY3R1YWwgdGVybXMgJiBjb25kaXRpb25zIHdpdGggcmVzcGVjdCB0byB7e3F1YW50aXR5fX0gdG8ge3t0b319LgoKSSB1bmRlcnN0YW5kIHRoYXQgZnVuZHMgdHJhbnNmZXJzIGFyZSBub3QgcmV2ZXJzaWJsZSBhZnRlciB0aGUge3t0cmFuc2FjdGlvbi5kZWxheX19IHNlY29uZHMgb3Igb3RoZXIgZGVsYXkgYXMgY29uZmlndXJlZCBieSB7e2Zyb219fSdzIHBlcm1pc3Npb25zLgoKSWYgdGhpcyBhY3Rpb24gZmFpbHMgdG8gYmUgaXJyZXZlcnNpYmx5IGNvbmZpcm1lZCBhZnRlciByZWNlaXZpbmcgZ29vZHMgb3Igc2VydmljZXMgZnJvbSAne3t0b319JywgSSBhZ3JlZSB0byBlaXRoZXIgcmV0dXJuIHRoZSBnb29kcyBvciBzZXJ2aWNlcyBvciByZXNlbmQge3txdWFudGl0eX19IGluIGEgdGltZWx5IG1hbm5lci4KAAAAAAClMXYFaXNzdWUAAAAAAKhs1EUGY3JlYXRlAAIAAAA4T00RMgNpNjQBCGN1cnJlbmN5AQZ1aW50NjQHYWNjb3VudAAAAAAAkE3GA2k2NAEIY3VycmVuY3kBBnVpbnQ2NA5jdXJyZW5jeV9zdGF0cwAAAA===",
    abi_hash: "0000000000000000000000000000000000000000000000000000000000000000",
    account_name: "testeostoken",
    code_hash: "0000000000000000000000000000000000000000000000000000000000000000",
};

const transaction = {
    actions: [
        {
            account: "testeostoken",
            authorization: [
                {
                    actor: "thegazelle",
                    permission: "active",
                },
            ],
            data: {
                from: "thegazelle",
                memo: "For a secure future.",
                quantity: "1.0000 FIO",
                to: "remasteryoda",
            },
            name: "transfer",
        },
    ],
    context_free_actions: [] as any,
    delay_sec: 0,
    expiration: "2018-09-04T18:42:49",
    max_cpu_usage_ms: 0,
    max_net_usage_words: 0,
    ref_block_num: 38096,
    ref_block_prefix: 505360011,
    transaction_extensions: [] as any,
};

const preparedTransactionResult = {
    compression: 0,
    packed_context_free_data: "",
    // tslint:disable-next-line:max-line-length
    packed_trx: "29d28e5bd0948b2e1f1e00000000013015a4195395b1ca000000572d3ccdcd0100808a517dc354cb00000000a8ed32323500808a517dc354cb6012f557656ca4ba10270000000000000446494f0000000014466f72206120736563757265206675747572652e00",
    // tslint:disable-next-line:max-line-length
    signatures: ["SIG_K1_KWkhnM37vJF83QYgStN8z5wyKVcpa6RCKNsvy6mbF46TBksYXVgP4u4Zv3EZc7pH7aUoUL52zuE5vtuWeCUSfVF1MzdsmS"],
};

describe("FIO", () => {
    it("prepares transaction", async () => {

        const chainId = "038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca";
        const privateKeys = ["5JtUScZK2XEp3g9gh7F8bwtPTRAkASmNrrftmx4AxDKD5K4zDnr"];

        const abiMap = new Map<string, any>();
        abiMap.set("testeostoken", rawAbi);

        const signedTransaction = await Fio.prepareTransaction({
            abiMap, chainId, privateKeys, textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(), transaction,
        });

        // console.log(JSON.stringify(signedTransaction))
        expect(_.isEqual(signedTransaction, preparedTransactionResult)).toBeTruthy();
    });
});
