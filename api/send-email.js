export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, description, userEmail } = req.body;

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
        subject: `🚨 Báo lỗi mới: ${title}`,
        html: `
          <h2>Báo lỗi mới từ The Chicken's Whisper</h2>
          <p><b>Tiêu đề:</b> ${title}</p>
          <p><b>Mô tả:</b> ${description}</p>
          <p><b>Người gửi:</b> ${userEmail || 'Ẩn danh'}</p>
          <p><b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}</p>
        `,
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}