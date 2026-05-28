export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {}

  const title = body?.title || 'Khong co tieu de';
  const description = body?.description || 'Khong co mo ta';
  const userEmail = body?.userEmail || 'An danh';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'fantuan0203@gmail.com',
        subject: `[Bug Report] ${title}`,
        html: `<h2>Bug Report - The Chicken Whisper</h2>
          <p><b>Tieu de:</b> ${title}</p>
          <p><b>Mo ta:</b> ${description}</p>
          <p><b>Nguoi gui:</b> ${userEmail}</p>
          <p><b>Thoi gian:</b> ${new Date().toLocaleString('vi-VN')}</p>`,
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}