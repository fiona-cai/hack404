import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, body: string) {
  if (!accountSid || !authToken || !fromNumber) throw new Error('Twilio env vars missing');
  return client.messages.create({
    body,
    from: fromNumber,
    to
  });
}
