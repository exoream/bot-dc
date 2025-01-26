const express = require("express")
const { initializeBot } = require("./discord-bot")

const app = express()
const port = process.env.PORT || 3000

let botInitialized = false

app.get("/", async (req, res) => {
  if (!botInitialized) {
    console.log("Initializing bot...")
    const success = await initializeBot()
    if (success) {
      botInitialized = true
      console.log("Bot initialized successfully")
    } else {
      console.error("Failed to initialize bot")
      return res.status(500).json({ error: "Failed to initialize bot" })
    }
  }
  res.json({ message: "Bot is running", initialized: botInitialized })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

