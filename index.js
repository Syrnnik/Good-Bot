const Discord = require('discord.js')
const bot = new Discord.Client()
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
        if (!reason) reason = `Because ${msg.member} wants`

        // Check user permissions
        if (msg.member.hasPermission('ADMINISTRATOR') /* || msg.member.hasPermission('MANAGE_ROLES')*/ ) {
            console.log(`${member.displayName} was muted by ${msg.member.displayName} for ${time} minutes.`)
            member.roles.add(muteRole)
            setTimeout(() => member.roles.remove(muteRole), time * 60 * 1000)
            msg.channel.send(`${member} was muted by ${msg.member} for ${time} minutes.\nReason: ${reason}`)
        }
    }

    // Unmute user on server
    if (msg.content.startsWith(prefix + "unmute")) {

        member = msg.mentions.members
        // Some member was mentioned
        if (!member || member.size == 0 || typeof (member) != 'object') return msg.channel.send(`You need to mention member in command.`)
        // Was mentioned more than 1 members
        else if (member.size > 1) return msg.channel.send(`You need to mention only one member in command.`)
        member = member.first()

        // Check user permissions
        if (msg.member.hasPermission('ADMINISTRATOR') /* || msg.member.hasPermission('MANAGE_ROLES') */ ) {
            console.log(`${member.displayName} was unmuted by ${msg.member.displayName}.`)
            member.roles.remove(muteRole)
            msg.channel.send(`${member} was unmuted by ${msg.member}.`)
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
        if (!reason) reason = `Because ${msg.member} wants`

        // Check user permissions
        if (msg.member.hasPermission('ADMINISTRATOR') || msg.member.hasPermission('KICK_MEMBERS')) {
            console.log(`${member.displayName} was kicked by ${msg.member.displayName}.`)
            member.kick(reason)
            msg.channel.send(`${member} was kicked by ${msg.member}.\nReason: ${reason}.`)
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

        time = Number(msg.content.split(' ')[2])
        // Set default time
        if (!time || typeof (time) != 'number') time = 0

        reason = msg.content.split('"')[1]
        // Some informative reason
        if (!reason) reason = `Because ${msg.member} wants`

        // Check user permissions
        if (msg.member.hasPermission('ADMINISTRATOR') || msg.member.hasPermission('BAN_MEMBERS')) {
            console.log(`${member.displayName} was banned by ${msg.member.displayName}.`)
            member.ban({
                days: time,
                reason: reason
            })
            msg.channel.send(`${member} was banned by ${msg.member}.\nReason: ${reason}.`)
        }
    }


    // Help menu
    if (msg.content.startsWith(prefix + "help")) {

        command = msg.content.split(' ')[1]

        // Help menu patterns
        helpMenu = new Discord.MessageEmbed()
            .setAuthor(`Help menu for ${command} command`, bot.user.avatarURL())

        // Check user permissions
        if (msg.member.hasPermission('ADMINISTRATOR') || msg.member.hasPermission('BAN_MEMBERS')) {
            // Help menu for '/mute' command
            if (command == 'mute') {
                helpMenu.setColor('GRAY')
                helpMenu.addField('/mute <member> <time> [reason]', 'Mute member on server for a while.')
            }
            // Help menu for '/unmute' command
            else if (command == 'unmute') {
                helpMenu.setColor('BLUE')
                helpMenu.addField('/unmute <member>', 'Unmute member on server.')
            }
            // Help menu for '/kick' command
            else if (command == 'kick') {
                helpMenu.setColor('GREEN')
                helpMenu.addField('/kick <member> [reason]', 'Kick member from server.')
            }
            // Help menu for '/mute' command
            else if (command == 'ban') {
                helpMenu.setColor('RED')
                helpMenu.addField('/ban <member> [reason]', 'Ban member on server.')
            }
            // Help menu for '/ban' command
            else if (!command) {
                helpMenu.setAuthor('Help menu for all commands', bot.user.avatarURL())
                helpMenu.setColor('WHITE')
                helpMenu.addField('/mute <member> <time> [reason]', 'Mute member on server for a while.')
                helpMenu.addField('/unmute <member>', 'Unmute member on server.')
                helpMenu.addField('/kick <member> [reason]', 'Kick member from server.')
                helpMenu.addField('/ban <member> [reason]', 'Ban member on server.')
            }
            // Unknown command for help menu
            else helpMenu = `Unknown command: \`${command}\`.`
            helpMenu.addField('/help [command]', 'Help menu for commands.')

            msg.channel.send(helpMenu)
        }
    }

})

bot.login(token)