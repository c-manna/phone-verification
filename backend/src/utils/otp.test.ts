import { compareOtp, generateOtp, hashOtp } from './otp';

describe('otp utils', () => {
  it('generates a 6-digit numeric code', () => {
    const code = generateOtp();
    expect(code).toMatch(/^\d{6}$/);
  });

  it('hashes and verifies otp values', async () => {
    const code = '123456';
    const hash = await hashOtp(code);

    await expect(compareOtp(code, hash)).resolves.toBe(true);
    await expect(compareOtp('654321', hash)).resolves.toBe(false);
  });
});
