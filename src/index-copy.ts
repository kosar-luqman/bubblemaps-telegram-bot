import { Telegraf } from "telegraf"
import dotenv from "dotenv"
import fs from "fs"
import { generateScreenshot } from "./services/screenshot.service"
import { fetchTokenData } from "./services/token.service"
import { formatTokenInfo } from "./utils/formatter"
import { getDecentralizationScore } from "./services/getDecentralizationScore.service"
import { isValidAddress } from "./utils/isValidAddress"

dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN!)

bot.start((ctx) =>
  ctx.reply("Send me a token contract address to get its info!")
)

bot.on("text", async (ctx) => {
  const contract = ctx.message.text.trim()

  if (!isValidAddress(contract)) {
    return ctx.reply(
      "❌ Invalid address. Please send a valid contract address."
    )
  }

  await ctx.reply("⏳ Generating map and fetching token data...")

  try {
    const tokenData = await fetchTokenData(contract)

    if (!tokenData) {
      return ctx.reply(
        "❌ Unsupported blockchain. Please send a valid contract address."
      )
    }

    const image = await generateScreenshot(contract, tokenData.chainId)

    const decentralizationScore = await getDecentralizationScore(
      contract,
      tokenData.chainId
    )

    const caption = formatTokenInfo(tokenData, decentralizationScore)

    await ctx.replyWithPhoto({ source: image }, { caption })

    // remove the image after sending
    fs.unlink(image, (err) => {
      if (err) {
        console.error("Error deleting file:", err)
      } else {
        console.log("File deleted successfully")
      }
    })
  } catch (err) {
    console.error(err)
    ctx.reply("❌ Could not retrieve data. Make sure the address is supported.")
  }
})

bot.launch()
