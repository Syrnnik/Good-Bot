const Discord = require('discord.js');
const config = require('./config.json');
const bot = new Discord.Client();
const prefix = config.prefix;
const token = config.token;
const ytdl = require('ytdl-core');
const ServerName = "Maksimo4ka's SubServer";
const BotName = "Good Bot";
const BotAvatar = "https://i.imgur.com/VL4ZMtk.jpg";
const Seed = " ";
const IP = config.ip;
const queue = new Map();

async function execute(message, serverQueue) {
    const args = message.content.split(' ');

    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) return message.channel.send('Вы должын быть в голосовом канале!!');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return message.channel.send('У меня нет прав...Помогите!!');
    }
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.title,
        url: songInfo.video_url,
    };

    if (!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
        };

        queue.set(message.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0]);
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        console.log(serverQueue.songs);
        return message.channel.send(`${song.title} добавленав очередь!!`);
    }

}

function skip(message, serverQueue) {
    if (!message.member.voiceChannel) return message.channel.send('Вы должын быть в голосовом канале!!');
    if (!serverQueue) return message.channel.send('Очередь пуста, пропустить трек невозможно!!');
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voiceChannel) return message.channel.send('Вы должын быть в голосовом канале!!');
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
        .on('end', () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on('error', error => {
            console.error(error);
        });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

//Start
bot.on("ready", () => {
    console.log("I'm ready!");
    bot.user.setPresence({ status: "nearly", game: { name: "Нолики и Единички", type: 0 } });
})
//Error
bot.on('error', (err) => {
    console.log(err.message);
});


bot.on("message", async message => {

    reason = message.content.split(" ")[2];
    if (reason == null) reason = "просто так";

    ///Служебное///
    //Seed//
    if (message.content.toLowerCase().startsWith(prefix + "seed") |
        message.content.toLowerCase().startsWith("seed") |
        message.content.toLowerCase().startsWith("сид")) {
        message.channel.send(`Вот сид сервера: **${Seed}**`);
    }

    //IP//
    if (message.content.toLowerCase().startsWith(prefix + "ip") |
        message.content.toLowerCase().startsWith(prefix + "ип") |
        message.content.toLowerCase().startsWith(prefix + "айпи")) {
        message.channel.send(`**Дежите, но никому не давайте ^3^\n**` + IP);
        // function dell() {
        //     message.channel.fetchMessages({ limit: 3 })
        //         .then(messages => message.channel.bulkDelete(messages))
        // }
        // setTimeout(dell, 1000);
    }

    //Bad_Words
    // if (message.content.toLowerCase().startsWith(badwords)) {
    //     console.log("ff")
    //     message.delete().then(() => {
    //         message.reply(`**Не надо так писать!**`)
    //     }).catch(e => {
    //         message.channel.send(`**Я не смог что-либо сделать, но я вижу здесь плохие слова!**`);
    //         return
    //     })
    // }

    ///Ignor///
    if (message.author.bot) return;

    ///Mute///
    if (message.content.toLowerCase().startsWith(prefix + "mute")) {
        member = message.mentions.members.first();
        adminRole = message.guild.roles.get(config.adminID);
        muted = message.guild.roles.get(config.mutedID);
        if (message.member.roles.has(adminRole.id)) {
            member.addRole(muted).then(() => {
                message.channel.send(`**Пользователь успешно замучен[досмерти :3]!!\nПричина: ${reason}.**`);
                member.send(`**Подумай над своим поведением!!\n\nВы были замучены!\nСервер:  "${ServerName}".\nПричина:  "${reason}".\nBy:  ${message.author.username}.**`);
            }).catch(e => {
                message.channel.send(`**Мне не удалось замутить  **` + member.displayName + `**\nC причиной: **` + reason + `**!!**`);
                console.log(e);
            })
        }
    }


    ///UnMute///
    if (message.content.toLowerCase().startsWith(prefix + "unmute")) {
        member = message.mentions.members.first();
        adminRole = message.guild.roles.get(config.adminID);
        muted = message.guild.roles.get(config.mutedID);
        if (message.member.roles.has(adminRole.id)) {
            member.removeRole(muted).then(() => {
                message.channel.send(`**Пользователь успешно размучен!!**`);
                member.send(`**Ладно, не парься. Тебя размутили!\n\nВы были размучены!\nСервер:  "${ServerName}".\nПричина:  "${reason}".\nBy:  ${message.author.username}.**`);
            }).catch(e => {
                message.channel.send(`**Мне не удалось размутить  **` + member.displayName + `**!!**`);
                console.log(e);
            })
        }
    }


    ///Kick///
    if (message.content.toLowerCase().startsWith(prefix + "kick")) {
        member = message.mentions.members.first();
        adminRole = message.guild.roles.get(config.adminID);
        if (message.member.roles.has(adminRole.id)) {
            member.kick().then(() => {
                message.channel.send(member.displayName + `**  успешно кикнут by  **` + message.author.username + `**\nПричина: **` + reason + `**!!**`);
                member.send(`**Подумай над своим поведением!!\n\nВы были кикнуты!\nСервер:  "${ServerName}".\nПричина:  "${reason}".\nBy:  ${message.author.username}.**`);
            }).catch(e => {
                message.channel.send(`**Мне не удалось кикнуть  **` + member.displayName + `**!!**`);
                console.log(e);
            })
        }
    }


    ///Ban///
    if (message.content.toLowerCase().startsWith(prefix + "ban")) {
        member = message.mentions.members.first();
        reason = message.content.split(" ")[2];
        adminRole = message.guild.roles.get(config.adminID);
        if (message.member.roles.has(adminRole.id)) {
            member.ban(reason).then(() => {
                message.channel.send(member.displayName + `**  успешно забанен by  **` + message.author.username + `**\nПричина: **` + reason + `**!!**`);
                member.send(`**Подумай над своим поведением!!\n\nВы были забанены!\nСервер:  "${ServerName}".\nПричина:  "${reason}".\nBy:  ${message.author.username}.**`);
            }).catch(e => {
                message.channel.send(`**Мне не удалось забанить  **` + member.displayName + `**!!**`);
                console.log(e);
            })
        }
    }


    ///GetAdmin///
    if (message.content.toLowerCase().startsWith(prefix + "getadmin")) {
        member = message.mentions.members.first();
        creatorRole = message.guild.roles.get(config.creatorID);
        adminRole = message.guild.roles.get(config.adminID);
        if (message.member.roles.has(creatorRole.id)) {
            member.addRole(adminRole).then(() => {
                message.channel.send(member.displayName + `**  успешно добавлен в группу Админов by  **` + message.author.username + `** !!**`);
            }).catch(e => {
                message.channel.send(`**Не удалось пополнить команду админов...**`);
                console.log(e);
            })
        }
    }


    ///DelAdmin///
    if (message.content.toLowerCase().startsWith(prefix + "deladmin")) {
        member = message.mentions.members.first();
        creatorRole = message.guild.roles.get(config.creatorID);
        adminRole = message.guild.roles.get(config.adminID);
        if (message.member.roles.has(creatorRole.id)) {
            member.removeRole(adminRole.id).then(() => {
                message.channel.send(member.displayName + `**  выбыл из команды Админов!!**`);
            }).catch(e => {
                message.channel.send(`**Не удалось почистить команду админов...**`);
                console.log(e);
            })
        }
    }


    ///Spam///
    if (message.content.toLowerCase().startsWith(prefix + "spam")) {
        adminRole = message.guild.roles.get(config.adminID);
        numb = message.content.split(" ")[1];
        if (isNaN(numb)) {
            message.channel.send(`**Ошибка синтаксиса!!\nПравильно: !spam [число]**`);
        }
        if (message.member.roles.has(adminRole.id)) {
            for (i = 1; i <= numb; i++) {
                message.channel.send("Квадрат числа %d равен %d " + i + "\n");
            }
        }
    }


    // ///DelMsg///
    // //case `${prefix}delmsg`:
    // if (message.content.toLowerCase().startsWith(prefix + "delmsg")) {
    //      adminRole = message.guild.roles.get(config.adminID);
    //     if (message.member.roles.has(adminRole.id)) {
    //          number = message.content.split(" ")[1];
    //         if (isNaN(number)) {
    //             message.channel.send(`**Ошибка синтаксиса!\nДолжно быть:"!delmsg [число]"**`)
    //         } else {
    //              messagecount = parseInt(number) + 1;
    //             message.channel.fetchMessages({ limit: messagecount })
    //                 .then(messages => message.channel.bulkDelete(messages));
    //         }
    //     }
    // }
    // //break;


    ///New Player///
    if (message.content.toLowerCase().startsWith(prefix + "new")) {
        member = message.mentions.members.first();
        new_player = message.guild.roles.get(config.new_player);
        adminRole = message.guild.roles.get(config.adminID);
        if (message.member.roles.has(adminRole.id)) {
            member.addRole(new_player.id).then(() => {
                message.channel.send(member.displayName + `**  успешно помечен как Новичек :3 !!**`);
            }).catch(e => {
                message.channel.send(`**Не удалось добавить новичка...**`);
                console.log(e);
            })
        }
    }


    ///Music///

    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${prefix}play`)) {
        execute(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}skip`)) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}stop`)) {
        stop(message, serverQueue);
        return;
    }


    ///Kotleta///
    if (message.content.toLowerCase().startsWith(prefix + "call")) {
        member = message.mentions.members.first();
        member.send(`**Вам Котлета от ${message.author}:baby_chick:\n:stuffed_flatbread::stuffed_flatbread::stuffed_flatbread::stuffed_flatbread:**`);
    }


    ///Embed///
    if (message.content.toLowerCase().startsWith(prefix + "help member")) {
        embed = new Discord.RichEmbed()
            .setColor(0x61FF05)
            .setAuthor(BotName + ":  helping for admins.")
            //.setThumbnail()
            .setDescription("   %помощь любопытным пользователям :3%")
            .addField("Команда: !call [кто-то]", "Отправляет пользователю 4 котлетки в личные сообщения :3")
            .addField("Команды для Музыки", "Написать: !help music", true)
        //.setTimestamp();
        message.channel.send({ embed });
    }
    if (message.content.toLowerCase().startsWith(prefix + "help admin")) {
        embed = new Discord.RichEmbed()
            .setColor(0x00CCFF)
            .setAuthor(BotName + ":  helping for admins.")
            //.setThumbnail()
            .setDescription("   %помощь забывчивым админам :3%")
            .addField("Команда: !mute [кто-то] [причина]", "Выдает роль Muted, мутит пользователя.")
            .addField("Команда: !unmute [кто-то]", "Забирает роли Muted, размучивает пользователя.", true)
            .addField("Команда: !kick [кто-то] [причина]", "Кикает пользователя из сервера.[!причину указывать обязательно!]", true)
            .addField("Команда: !ban [кто-то] [причина]", "Банит пользователя.[!причину указывать обязательно!]", true)
            .addField("Команда: !delmsg [число]", "Очистка сообщений в канале.", true)
            .addField("Команда: !giverole [кто-то] [какую(нужно дословно, список скоро будет)]", "Очистка сообщений в канале.", true)
        //.setTimestamp();
        message.channel.send({ embed });
    }

    if (message.content.toLowerCase().startsWith(prefix + "help music")) {
        embed = new Discord.RichEmbed()
            .setColor(0xCC00FF)
            .setAuthor(BotName + ": helping with music.")
            //.setThumbnail()
            .setDescription("%помощь любителям мызуки :3%")
            .addField("Команда: !got [ссылка на трек(youtube)]", "Начать проигрыванье музыки.")
            .addField("Команда: !arrive", "Остановить проигрыванье музыки.", true)
        //.setTimestamp();
        message.channel.send({ embed });
    }

    //default: //Обычный !help
    if (message.content.toLowerCase() == (prefix + "help")) {
        embed = new Discord.RichEmbed()
            .setColor(0xFFFFFF)
            .setAuthor(BotName + ":  helping menu.")
            //.setThumbnail(BotAvatar)
            .setDescription("%список возможных меню помощи%")
            .addField("Помощь Администраторам:", "Написать: !help admin.")
            .addField("Помощь участникам:", "Написать: !help member.", true)
            .addField("Команды для Музыки", "Написать: !help music", true)
            .addField("Префикс бота", 'Префикс бота:  "!"', true)
            .addField("Узнать сид", "Написать: !seed | !сид", true)
        //.setTimestamp();
        message.channel.send({ embed });
    }


    ///Chating///
    //Приветы//
    privety = ["Привет! :)", "Хай", "Да, привет!\nКак дела?)", "Хехеей, приветики!))", "Дарова)", "Здрасте.", "Здарово!\nКак сам?  Как джип Nissan?)", "Здравствуй!"];
    // priv = ["хай","кусь","прив","хелоу","хэлоу","hello","hi","hey","кус","йй","qq"];
    rand = Math.floor(Math.random() * privety.length);
    if (message.content.toLowerCase().includes("хай" || "кусь" || "прив" || "хелоу" || "хэлоу" || "кус" || "йй" || "qq")) {
        message.channel.send(`**${privety[rand]}**`);
        message.channel.send(`**re**`);
    }
    //Обращение//
    wha = ["Чтоооо", "Да, чего?", "Что случилось?)", "Да да", "ААА!! ШОООО ГДЕ ТЫЫЫ O_O\n\n\nА привет) не заметил...Чего хотел?"];
    rand = Math.floor(Math.random() * wha.length);
    if (message.content.toLowerCase().includes("эй" || "бот" || "||bot" || "good" || "хээ")) {
        message.channel.send(`**${wha[rand]}**`);
    }
    //Хаха//
    answ = ["Ахах))", "Хаха", "Хехе", "Хех", "ахахахаха", ":joy:", ":joy::joy::joy::joy:", ":sweat_smile:", ":sweat_smile::sweat_smile:"];
    // mess = ["хаха", "хах", "ахах", "хехе", "хех", ":joy:", ":sweat_smile:", ":joy:"];
    rand = Math.floor(Math.random() * answ.length);
    if (message.content.toLowerCase().includes("хах", "хех")) {
        message.channel.send(`**${answ[rand]}**`);
    }
    //Ура//
    ura = ["Ураа, хехе", "Ееее, молодец!", "Что там?!))", "УУУУРРААААА", "Что?\nЧто-то хорошее сделал?)"];
    rand = Math.floor(Math.random() * ura.length);
    if (message.content.toLowerCase().includes("ура")) {
        message.channel.send(`**${ura[rand]}**`);
    }
    //Хорошо//
    horo = ["Идеально!", "Классно)", "Очень хорошечно!!)"];
    rand = Math.floor(Math.random() * horo.length);
    if (message.content.toLowerCase().includes("хорошо" || "классно" || "идеально" || "как вам")) {
        message.channel.send(`**${horo[rand]}**`);
    }

});

// Для музыки проверка: !play https://www.youtube.com/watch?v=3unzo7X-J34
bot.login(token);