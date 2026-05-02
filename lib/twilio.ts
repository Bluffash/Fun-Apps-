export async function sendSMS(to: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!sid || !token || !from) return false

  try {
    const twilio = (await import('twilio')).default
    const client = twilio(sid, token)
    await client.messages.create({ from, to, body })
    return true
  } catch (err) {
    console.error('Twilio error:', err)
    return false
  }
}
