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

    // Necessary roles
    muteRole = msg.guild.roles.cache.find(r => r.name.toLowerCase().startsWith("mute"))
    // Role position under bot role(because permissions)
    // pos = msg.guild.roles.cache.find(r => r.name == bot.user.username).position
    // Create mute role
    if (!muteRole) {
        msg.guild.roles.create({
            data: {
                name: "Muted",
                color: 'GRAY',
            }
        })
        // .setPosition(pos-1)
    }
    // // Move mute role to top
    // if (muteRole.position != pos-1) {
    //     muteRole.setPosition(pos-1)
    // }


    // Mute user on server
    if (msg.content.startsWith(prefix + "mute")) {

        member = msg.mentions.members
        // Some member was mentioned
        if (!member || member.size == 0 || typeof (member) != 'object') return msg.channel.send(`You need to mention member in command.`)
        // Was mentioned more than 1 members
        else if (member.size > 1) return msg.channel.send(`You need to mention only one member in command.`)
        member = member.first()

        time = Number(msg.content.split(' ')[2])
        // Set default time
        if (!time || typeof (time) != 'number') time = 10

        reason = msg.content.split('"')[1]
        // Some informative reason
        if (!reason) reason = `Because ${msg.member.displayName} wants.`

        // Check user for necessary permissions
        if (msg.member.hasPermission('ADMINISTRATOR') || msg.member.hasPermission('MANAGE_ROLES')) {
            console.log(`${member.displayName} was muted by ${msg.member.displayName} for ${time} minutes.\nReason: ${reason}`)
            member.roles.add(muteRole)
            msg.channel.send(`${member.displayName} was muted by ${msg.member.displayName} for ${time} minutes.\nReason: ${reason}`)
        }
    }

    // Kick user from server
    if (msg.content.startsWith(prefix + "kick")) {

        members = msg.mentions.members
        // Some member was mentioned
        if (!members || members.size == 0 || typeof (members) != 'object') return msg.channel.send(`You need to mention member in command.`)
        // Was mentioned more than 1 members
        else if (members.size > 1) return msg.channel.send(`You need to mention only one member in command.`)
        member = members.first()

        reason = msg.content.split('"')[1]
        // Some informative reason
        if (!reason) reason = `Because ${msg.member.displayName} wants.`

        // Check user for necessary permissions
        if (msg.member.hasPermission('ADMINISTRATOR') || msg.member.hasPermission('KICK_MEMBERS')) {
            console.log(`${member.displayName} was kicked by ${msg.member.displayName}.\nReason: ${reason}`)
            member.kick(reason)
            msg.channel.send(`${member.displayName} was kicked by ${msg.member.displayName}.\nReason: ${reason}`)
        }
    }

    // Ban user from server
    if (msg.content.startsWith(prefix + "ban")) {

        member = msg.mentions.members
        // Some member was mentioned
        if (!member || member.size == 0 || typeof (member) != 'object') return msg.channel.send(`You need to mention member in command.`)
        // Was mentioned more than 1 members
        else if (member.size > 1) return msg.channel.send(`You need to mention only one member in command.`)
        member = member.first()

        reason = msg.content.split('"')[1]
        // Some informative reason
        if (!reason) reason = `Because ${msg.member.displayName} wants.`

        // Check user for necessary permissions
        if (msg.member.hasPermission('ADMINISTRATOR') || msg.member.hasPermission('BAN_MEMBERS')) {
            console.log(`${member.displayName} was banned by ${msg.member.displayName}.\nReason: ${reason}`)
            member.ban(reason)
            msg.channel.send(`${member.displayName} was banned by ${msg.member.displayName}.\nReason: ${reason}`)
        }
    }

})

bot.login(token)