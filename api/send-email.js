import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Body received:', JSON.stringify(req.body));

  const title = req.body?.title ?? 'No title';
  const description = req.body?.description ?? 'No description';
  const userEmail = req.body?.userEmail ?? 'Anonymous';

  const resend = new Resend(process.env.VITE_RESEND_API_KEY);

  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'fantuan0203@gmail.com',
      subject: `[Bug Report] ${title}`,
      html: `<h2>Bug Report - The Chicken Whisper</h2>
        <p><b>Tieu de:</b> ${title}</p>
        <p><b>Mo ta:</b> ${description}</p>
        <p><b>Nguoi gui:</b> ${userEmail}</p>
        <p><b>Thoi gian:</b> ${new Date().toLocaleString('vi-VN')}</p>`,
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
