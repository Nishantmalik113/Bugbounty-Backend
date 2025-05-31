import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/scan', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Example scan logic: get page title
    
    const title = await page.title();

    // Example audit: collect performance metrics
    const metrics = await page.metrics();

    await browser.close();

    res.json({
      url,
      title,
      metrics
    });
  } catch (err) {
    console.error('Error during scan:', err.message);
    res.status(500).json({ error: 'Scan failed' });
  }
});

app.get('/', (req, res) => {
  res.send('BugBounty Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
