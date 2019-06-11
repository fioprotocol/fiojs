# Message Encryption
The following methods are used to encrypt and decrypt FIO messages for storage on a public blockchain.

### Shared Secret
Diffie Hellman shared secret per the Elliptic Curve Integrated Encryption Scheme (ECIES) is used to create one key used for encryption and decryption (the shared secret). Both the sender and recipient can create this shared-secret using their FIO private active key and the other parties' FIO public active key.

```bash
> bob_private=Fio.Ecc.seedPrivate('bob')
'5JoQtsKQuH8hC9MyvfJAqo6qmKLm8ePYNucs7tPu2YxG12trzBt'

> bob_public=Fio.Ecc.privateToPublic(bob_private)
'EOS5VE6Dgy9FUmd1mFotXwF88HkQN1KysCWLPqpVnDMjRvGRi1YrM'

> alice_private=Fio.Ecc.seedPrivate('alice')
'5J9bWm2ThenDm3tjvmUgHtWCVMUdjRR1pxnRtnJjvKA4b2ut5WK'

> alice_public=Fio.Ecc.privateToPublic(alice_private)
'EOS7zsqi7QUAjTAdyynd6DVe8uv4K8gCTRHnAoMN9w9CA1xLCTDVv'

> Fio.Ecc.PrivateKey(bob_private).getSharedSecret(alice_public)
<Buffer a7 1b 4e c5 a9 57 79 26 a1 d2 aa 1d 9d 99 32 7f d3 b6 8f 6a 1e a5 97 20 0a 0d 89 0b d3 33 1d f3 00 a2 d4 9f ec 0b 2b 3e 69 69 ce 92 63 c5 d6 cf 47 c1 ... 14 more bytes>

> Fio.Ecc.PrivateKey(alice_private).getSharedSecret(bob_public)
<Buffer a7 1b 4e c5 a9 57 79 26 a1 d2 aa 1d 9d 99 32 7f d3 b6 8f 6a 1e a5 97 20 0a 0d 89 0b d3 33 1d f3 00 a2 d4 9f ec 0b 2b 3e 69 69 ce 92 63 c5 d6 cf 47 c1 ... 14 more bytes>
```

### Cipher
The AES-CBC cipher is used for message encryption and decryption.  The cipher has requirements on its IV (specifically, that they be unpredictable) which go beyond the usual requirement of uniqueness expected of nonces (a number used only once). The easiest way to create an Initialization Vector is to use random data from a secure pseudo-random number generator PRNG.

### Message Authentication Code
A message authentication code (MAC) is calculated after encryption (referred to as Encrypt-then-MAC) and added to the message. This ensures that the message and IV can’t be altered without detection.  This is a **H**ash-**B**ased **M**essage **A**uthentication **C**ode referred to as a HMAC.  The HMAC is a well-known way of hashing, therefore many libraries should provide this by name.

The HMAC allows the decrypting algorithm to know if the wrong key was used to decrypt the message.  It also makes the message tamper-resistant because an attacker who can access encrypted data can modify the bytes, thereby impacting the cleartext data (though the encryption makes the task a bit harder for the attacker). Without the HMAC, the decrypted plaintext must be inspected and a guess must be made to know if decryption failed also leaving the opportunity for a modification to slip by.

# Implementation

Message encryption: `src/encryption-check.ts` and `src/tests/encryption-check.test.ts`

Message serialization and encryption: `src/encryption-fio.ts` and `src/tests/encryption-fio.test.ts`

See `src/encryption-fio.abi.json` for other message types like `new_funds_content`.

# Encrypt-then-MAC
This ensures that any message on its own can’t be altered while encrypted without detection.

Although encrypted messages may initially appear in signed transactions it may not be wise to assume this is adequate to authenticate the message:
* Messages do not depend on transactions and could be used outside or in the absence of a transaction.
* It is less desirable to use larger transactions to validate that the message has not been altered.

Encrypting first then calculating the authentication code (Encrypt-then-MAC) means the MAC can not also server as the IV.  So those fields must be separate and will create a slightly larger message.  This however avoids several well known attacks made famous by TLS security vulnerabilities.  TLS security problems causing them to create an [alternative](https://tools.ietf.org/html/rfc7366) scheme using Encrypt-then-MAC.

Additionally Encrypt-then-MAC avoids side-channel attack vulnerabilities by protecting the cipher algorithm from analysis tools.  The protection comes in the decryption phase when the MAC code is tested first and only if it passes allowing the decryption logic to proceed.  Noise from the decryption algorithm forms the bases of the side-channel attack because it can be collected during repeated decryption attempts and used to eventually derive the private key.

More about Encrypt-then-MAC
https://crypto.stackexchange.com/a/205
