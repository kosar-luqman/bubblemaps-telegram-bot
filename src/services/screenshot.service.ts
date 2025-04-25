import puppeteer from "puppeteer"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Create a shared browser instance that can be reused
let browserInstance: any | null = null

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Avoid issues on cloud environments
        "--disable-gpu",
        "--disable-extensions",
      ],
    })
  }
  return browserInstance
}

export async function generateScreenshot(
  contract: string,
  blockchain: string
): Promise<string> {
  const url = `https://app.bubblemaps.io/${blockchain}/token/${contract}`
  const filePath = path.resolve(`./screenshot-${contract}-${uuidv4()}.png`)

  const browser = await getBrowser()
  const page = await browser.newPage()

  // Set a lower resolution to speed up rendering
  await page.setViewport({
    width: 1600,
    height: 1200,
    deviceScaleFactor: 1,
  })

  // Optimize page navigation
  await page.goto(url, {
    waitUntil: "domcontentloaded", // Less strict than networkidle2
    timeout: 30000, // 30 second timeout
  })

  // Wait for just the essential element with a timeout
  try {
    await page.waitForSelector("#svg", { timeout: 30000 })
  } catch (error) {
    console.error("Timeout waiting for SVG element")
    // Take screenshot anyway to see what's happening
  }

  await page.screenshot({ path: filePath })
  await page.close() // Close page but keep browser running

  return filePath
}

// Add a function to cleanly close the browser when your application shuts down
export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
  }
}
