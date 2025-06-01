// server.js
import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.post('/scan', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL. Must start with http/https' });
  }

  let browser;
  try {
    console.log('Launching headless browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('Running Lighthouse audit...');
    const { lhr } = await lighthouse(url, {
      port: new URL(browser.wsEndpoint()).port,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices']
    });

    const issues = Object.values(lhr.audits).filter(audit => audit.score !== null && audit.score < 0.9);

    res.json({
      url,
      issues: issues.map(issue => ({
        title: issue.title,
        description: issue.description,
        score: issue.score
      })),
      metrics: lhr.audits.metrics,
      message: 'Scan completed successfully!'
    });
  } catch (error) {
    console.error('Error during scan:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.get('/', (req, res) => {
  res.send('BugBounty backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
