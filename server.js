import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Basic health check
app.get('/', (req, res) => {
  res.send('BugBounty backend is live!');
});

// POST endpoint to run scan
app.post('/scan', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    // Launch puppeteer with bundled Chromium
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Run a basic performance audit
    const metrics = await page.metrics();

    await browser.close();

    res.json({
      message: 'Scan successful',
      url,
      metrics
    });
  } catch (err) {
    console.error('Error during scan:', err);
    res.status(500).json({ error: 'Scan failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
