import puppeteer from "puppeteer"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function generateScreenshot(
  contract: string,
  blockchain: string
): Promise<string> {
  const url = `https://app.bubblemaps.io/${blockchain}/token/${contract}`

  const filePath = path.resolve(
    `./images/screenshot-${contract}-${uuidv4()}.png`
  )

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })
  const page = await browser.newPage()
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  })

  await page.goto(url, { waitUntil: "networkidle2" })
  // await page.setDefaultTimeout(10000)

  // Wait for the map to load
  await page.waitForFunction(
    () => {
      return document.querySelector("#svg") !== null
    },
    { timeout: 0 }
  )

  await page.screenshot({ path: filePath })
  await browser.close()

  return filePath
}
