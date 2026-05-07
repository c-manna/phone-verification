import Twilio from 'twilio';
import { env } from '../config/env';

let client: ReturnType<typeof Twilio> | null = null;

function getClient(): ReturnType<typeof Twilio> | null {
  if (client) {
    return client;
  }

  if (!env.twilioAccountSid || !env.twilioAuthToken) {
    return null;
  }

  client = Twilio(env.twilioAccountSid, env.twilioAuthToken);
  return client;
}

export async function sendVerificationSms(phone: string, code: string): Promise<void> {
  if (env.nodeEnv !== 'production') {
    console.log(`[DEV OTP] Send to ${phone}: ${code}`);
  }

  const smsClient = getClient();
  if (!smsClient || !env.twilioPhoneNumber) {
    return;
  }

  await smsClient.messages.create({
    from: env.twilioPhoneNumber,
    to: phone,
    body: `Your verification code is ${code}. It expires in 2 minutes.`
  });
}
