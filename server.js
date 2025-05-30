// server.js
import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.post('/scan', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Launch puppeteer (it will download and use Chromium automatically)
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Example: capture a screenshot (can replace with your actual scan logic)
    const screenshotBuffer = await page.screenshot({ fullPage: true });

    await browser.close();

    res.status(200).json({
      message: 'Scan completed!',
      screenshot: screenshotBuffer.toString('base64') // send as base64 string
    });
  } catch (err) {
    console.error('Error during scan:', err);
    res.status(500).json({ error: 'Scan failed', details: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
