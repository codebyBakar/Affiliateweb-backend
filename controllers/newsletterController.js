import validator from 'validator';

// Subscribe an email to the Mailchimp audience.
// Mailchimp credentials are read from env so the API key never reaches the client.
export const subscribe = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const apiKey = process.env.MAILCHIMP_API_KEY;
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
    // Server prefix (e.g. "us21") — derive from the key suffix if not set explicitly.
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX || apiKey?.split('-')[1];

    if (!apiKey || !audienceId || !serverPrefix) {
      return res.status(503).json({
        message: 'Newsletter is not configured yet. Please try again later.',
      });
    }

    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`;
    const auth = Buffer.from(`anystring:${apiKey}`).toString('base64');

    const mcRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({ email_address: email, status: 'subscribed' }),
    });

    const data = await mcRes.json().catch(() => ({}));

    if (mcRes.ok) {
      return res.status(201).json({ message: 'Thanks for subscribing! ✨' });
    }

    // Already on the list — treat as a friendly success, not an error.
    if (data.title === 'Member Exists') {
      return res.status(200).json({ message: "You're already subscribed — thank you!" });
    }

    return res.status(400).json({
      message: data.detail || 'Could not subscribe right now. Please try again.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
