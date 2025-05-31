// server.js
import express from 'express';
import cors from 'cors';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.post('/scan', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL. Must start with http/https' });
  }

  try {
    console.log('Launching headless browser...');
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    console.log('Opening new page...');
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });

    console.log('Extracting page metrics...');
    const metrics = await page.metrics();

    await browser.close();

    res.json({
      url,
      metrics,
      message: 'Scan completed successfully!'
    });
  } catch (error) {
    console.error('Error during scan:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('BugBounty backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
