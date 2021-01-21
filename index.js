const Discord = require("discord.js");

const { prefix, token } = require("./config.json");

const ytdl = require("ytdl-core");

const client = new Discord.Client();

client.login(token);

client.once("ready", () => {
  console.log("Ready!");
});
client.once("reconnecting", () => {
  console.log("Reconnecting!");
});
client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}award`)) {
    execute(message,serverQueue,"https://www.youtube.com/watch?v=AGET71Vi2WU",1);
    return;
  } else if (message.content.startsWith(`${prefix}clap`)) {
    execute(message,serverQueue,"https://www.youtube.com/watch?v=a9NIZOvfKpc&feature=youtu.be",2);
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  } else {
    message.channel.send("Habla bien conchudo");
  }
});

const queue = new Map();

async function execute(message, serverQueue, link, command) {

  const voiceChannel = message.member.voice.channel;
  
  if (!voiceChannel)
    return message.channel.send(
      "Metete a un canal para formar parte del premio!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send("Mi papa no me deja.");
  }
  const songInfo = await ytdl.getInfo(link);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };
  if (!serverQueue) {
  } else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }

  const queueContruct = {
    textChannel: message.channel,
    voiceChannel: voiceChannel,
    connection: null,
    songs: [],
    volume: 5,
    playing: true,
  };
  // Setting the queue using our contract
  queue.set(message.guild.id, queueContruct);
  // Pushing the song to our songs array
  queueContruct.songs.push(song);

  try {
    // Here we try to join the voicechat and save our connection into our object.
    var connection = await voiceChannel.join();
    queueContruct.connection = connection;
    // Calling the play function to start a song
    play(message.guild, queueContruct.songs[0],command);
  } catch (err) {
    // Printing the error message if the bot fails to join the voicechat
    console.log(err);
    queue.delete(message.guild.id);
    return message.channel.send(err);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "No ves que no puedo laburar si no estas en un channel?"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "No ves que no puedo laburar si no estas en un channel?"
    );

  if (!serverQueue)
    return message.channel.send("No puedo laburar si no hay nada para frenar.");

  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song, command) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", (error) => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  switch(command){
      case 1: serverQueue.textChannel.send('Vamos Campeón, Winner!');break;
      case 2: serverQueue.textChannel.send('UN FUERTE APLAUSO!');break
  }   
}

client.login(token);
