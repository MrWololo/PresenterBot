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
  if (message.author.bot) return;
  if (!message.content.startsWith(`${prefix}`)) return;
  if (message.content.startsWith(`${prefix}stop`)) {
    dispatcher.destroy();
    voiceChannel.leave();
  }
  if (message.content.startsWith(`${prefix}award`)) {
    playAudio(message, songMap.award);
  }
  if (message.content.startsWith(`${prefix}clap`)) {
    playAudio(message, songMap.clap);
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