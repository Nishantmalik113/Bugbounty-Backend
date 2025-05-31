import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/scan", async (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: chromium.path, // Correct usage
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Block images, stylesheets, and fonts for faster load
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["image", "stylesheet", "font"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Increased timeout to 2 minutes
    await page.goto(url, { waitUntil: "load", timeout: 120000 });

    const title = await page.title();
    const metrics = await page.metrics();

    await browser.close();

    res.json({
      url,
      title,
      metrics,
    });
  } catch (error) {
    console.error("Error during scan:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
