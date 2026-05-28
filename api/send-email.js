import { Resend } from 'resend';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const title = body?.title || 'No title';
  const description = body?.description || 'No description';
  const userEmail = body?.userEmail || 'Anonymous';
  const fileUrl = body?.fileUrl || null;

  const resendApiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

  if (!resendApiKey) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY environment variable' });
  }

  const resend = new Resend(resendApiKey);

  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'fantuan0203@gmail.com',
      subject: `[Bug Report] ${title}`,
      html: `<h2>Bug Report - The Chicken Whisper</h2>
        <p><b>Tieu de:</b> ${title}</p>
        <p><b>Mo ta:</b> ${description}</p>
        <p><b>Nguoi gui:</b> ${userEmail}</p>
        <p><b>Thoi gian:</b> ${new Date().toLocaleString('vi-VN')}</p>
        ${fileUrl ? `<p><b>Anh dinh kem:</b> <a href="${fileUrl}">${fileUrl}</a></p><br/><img src="${fileUrl}" style="max-width:500px;border:1px solid #ccc;" />` : ''}`,
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
