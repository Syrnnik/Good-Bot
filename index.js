const discord = require('discord.js')
const bot = new discord.Client()
let config = require('./botConf.json')
let token = config.token
let prefix = config.prefix

// OnReady Event
// Bot is started
bot.on('ready', () => {
    console.log(`${bot.user.username} is ready!!`)
})

// OnMessage Event
// Bot get message from user
bot.on('message', (msg) => {

    // Message from this or other bot
    if (msg.author.bot || msg.author == bot.user) return



})

bot.login(token)