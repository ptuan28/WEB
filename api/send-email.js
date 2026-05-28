import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, description, userEmail } = req.body;

  const resend = new Resend(process.env.VITE_RESEND_API_KEY);

  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'fantuan0203@gmail.com',
      subject: `[Bug Report] ${title || 'No title'}`,
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
