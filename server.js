// server.js
const express = require('express');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/scan', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = { logLevel: 'info', output: 'json', port: chrome.port };
    const result = await lighthouse(url, options);
    await chrome.kill();

    const audits = result.lhr.audits;
    const issues = Object.values(audits)
      .filter(a => a.score !== null && a.score < 0.9)
      .map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
      }));

    res.json({ issues });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scan failed' });
  }
});

app.get('/', (_, res) => res.send('BugBounty Scan API is running'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
