interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'SportsPick <noreply@yourdomain.com>',
      to,
      subject,
      html,
    })
    return true
  } catch (err) {
    console.error('Email error:', err)
    return false
  }
}

export function inviteEmailHtml(opts: {
  senderName: string
  sportName: string
  sportIcon: string
  gameTitle: string
  location: string
  dateStr: string
  timeStr: string
  acceptUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111;">
  <h1 style="font-size:28px;margin-bottom:4px;">${opts.sportIcon} You're invited!</h1>
  <p style="color:#666;margin-top:0"><strong>${opts.senderName}</strong> invited you to play ${opts.sportName}</p>

  <div style="background:#f4f4f5;border-radius:12px;padding:16px;margin:20px 0;">
    <h2 style="margin:0 0 12px;font-size:18px;">${opts.gameTitle}</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:4px 0;color:#666;width:80px;">📅 Date</td><td>${opts.dateStr}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">🕐 Time</td><td>${opts.timeStr}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">📍 Location</td><td>${opts.location}</td></tr>
    </table>
  </div>

  <a href="${opts.acceptUrl}"
     style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">
    View &amp; Accept Invite →
  </a>

  <p style="color:#999;font-size:12px;margin-top:24px;">
    You received this because someone invited you to a game on SportsPick.
  </p>
</body>
</html>`
}

export function gameJoinedEmailHtml(opts: {
  joinerName: string
  sportIcon: string
  gameTitle: string
  currentCount: number
  capacity: number
  gameUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111;">
  <h1 style="font-size:28px;margin-bottom:4px;">${opts.sportIcon} New player joined!</h1>
  <p style="color:#666;margin-top:0">
    <strong>${opts.joinerName}</strong> joined <strong>${opts.gameTitle}</strong>.
    Roster is now ${opts.currentCount}/${opts.capacity}.
  </p>

  <a href="${opts.gameUrl}"
     style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
    View Game →
  </a>
</body>
</html>`
}
