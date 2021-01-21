const Discord = require("discord.js");
const bot = new Discord.Client();
const { prefix, token } = require('./config.json');

let dispatcher;
let voiceChannel;


class Song {
  constructor(file, message) {
    this.file = file;
    this.message = message;
  }
}

let songMap = {
  'award': new Song('./award.mp3', 'Felicidades Capo'),
  'clap': new Song('./aplausos.mp3', 'Un aplauso...'),
};

bot.login(token);
bot.on("ready", () => {
  console.log("Ready!");
})
bot.on("message", async (message) => {
  voiceChannel = message.member.voice.channel
  let role = message.guild.roles.cache.find(r => r.name == "Presentadores");

  if (message.author.bot) return;

  if (message.member.roles.cache.has(role.id)) {
    if (!message.content.startsWith(`${prefix}`)) return;
    else if (message.content.startsWith(`${prefix}stop`)) {
      dispatcher.destroy();
      voiceChannel.leave();
    }
    else if (message.content.startsWith(`${prefix}award`)) {
      playAudio(message, songMap.award);
    }
    else if (message.content.startsWith(`${prefix}clap`)) {
      playAudio(message, songMap.clap);
    } else {
      message.channel.send('Habla bien pelotudo');
    }
  } else {
    message.channel.send('Y vos quien carajos sos? Sali de aca')
  }
})

function playAudio(message, song) {
  voiceChannel.join().then(connection => {
    dispatcher = connection.play(song.file);
    dispatcher.on('start', () => {
      message.channel.send(song.message);
    })
    dispatcher.on('finish', () => {
      console.log('AAAAHH MI PICHULA');
      playAudio();
    })
  }).catch(e => {
    console.error(e);
  })
}