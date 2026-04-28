import { encodeBase64, hashPassword, comparePassword, encryptAES, decryptAES } from './crypto.util';

describe('CryptoUtil', () => {
  it('should encode string to base64', () => {
    expect(encodeBase64('hello')).toBe('aGVsbG8=');
  });

  it('should hash and compare password', async () => {
    const password = 'secret123';
    const hashed = await hashPassword(password);
    expect(hashed).not.toBe(password);
    expect(await comparePassword(password, hashed)).toBe(true);
  });

  it('should encrypt and decrypt AES', () => {
    const text = 'sensitive data';
    const key = '12345678901234567890123456789012'; // 32 chars
    const encrypted = encryptAES(text, key);
    expect(encrypted).not.toBe(text);
    expect(decryptAES(encrypted, key)).toBe(text);
  });
});
