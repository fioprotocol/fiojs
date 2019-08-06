import * as AccountName from '../accountname'

describe('accountname', () => {
    it('matches', () => {
        const samplekey = "FIO7isxEua78KPVbGzKemH4nj2bWE52gqj8Hkac3tc7jKNvpfWzYS";
        const accountHash = AccountName.accountHash(samplekey);
        expect(accountHash).toEqual('p4hc54ppiofx');
    })
})
