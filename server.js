// server.js
import express from 'express';
import cors from 'cors';
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

app.post('/scan', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  let browser;
  try {
    // Launch headless Chrome
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
    const { lhr } = await lighthouse(url, {
      port: new URL(browser.wsEndpoint()).port,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'seo'],
    });
    const issues = Object.values(lhr.audits)
      .filter((audit) => audit.score !== null && audit.score < 0.9)
      .map((audit) => ({
        id: audit.id,
        title: audit.title,
        description: audit.description,
        details: audit.details,
      }));

    res.json({
      url: lhr.finalUrl,
      performance: lhr.categories.performance.score,
      accessibility: lhr.categories.accessibility.score,
      seo: lhr.categories.seo.score,
      issues,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scan failed', details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.get('/', (req, res) => {
  res.send('BugBounty Backend: Use POST /scan');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
