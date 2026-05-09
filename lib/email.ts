interface EmailPayload {
  to: string
  subject: string
  html: string
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'Sports NextUp <noreply@yourdomain.com>',
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
  const e = escapeHtml
  return `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111;">
  <h1 style="font-size:28px;margin-bottom:4px;">${e(opts.sportIcon)} You're invited!</h1>
  <p style="color:#666;margin-top:0"><strong>${e(opts.senderName)}</strong> invited you to play ${e(opts.sportName)}</p>

  <div style="background:#f4f4f5;border-radius:12px;padding:16px;margin:20px 0;">
    <h2 style="margin:0 0 12px;font-size:18px;">${e(opts.gameTitle)}</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:4px 0;color:#666;width:80px;">📅 Date</td><td>${e(opts.dateStr)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">🕐 Time</td><td>${e(opts.timeStr)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">📍 Location</td><td>${e(opts.location)}</td></tr>
    </table>
  </div>

  <a href="${e(opts.acceptUrl)}"
     style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">
    View &amp; Accept Invite →
  </a>

  <p style="color:#999;font-size:12px;margin-top:24px;">
    You received this because someone invited you to a game on Sports NextUp.
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
  const e = escapeHtml
  return `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111;">
  <h1 style="font-size:28px;margin-bottom:4px;">${e(opts.sportIcon)} New player joined!</h1>
  <p style="color:#666;margin-top:0">
    <strong>${e(opts.joinerName)}</strong> joined <strong>${e(opts.gameTitle)}</strong>.
    Roster is now ${opts.currentCount}/${opts.capacity}.
  </p>

  <a href="${e(opts.gameUrl)}"
     style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
    View Game →
  </a>
</body>
</html>`
}
