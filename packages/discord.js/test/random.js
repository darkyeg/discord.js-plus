/* eslint-disable */

'use strict';

const { token } = require('./auth.js');
const { Client } = require('../src');
const { ChannelType, GatewayIntentBits } = require('discord-api-types/v10');

console.time('magic');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
});

client
  .login(token)
  .then(() => console.log('logged in'))
  .catch(console.error);

// Fetch all members in a new guild
client.on('guildCreate', guild =>
  guild.members.fetch().catch(err => console.log(`Failed to fetch all members: ${err}\n${err.stack}`)),
);

// Fetch all members in a newly available guild
client.on('guildUpdate', (oldGuild, newGuild) =>
  !oldGuild.available && newGuild.available
    ? newGuild.members.fetch().catch(err => console.log(`Failed to fetch all members: ${err}\n${err.stack}`))
    : Promise.resolve(),
);

client.on('ready', async () => {
  // Fetch all members for initially available guilds
  try {
    const promises = client.guilds.cache.map(guild => (guild.available ? guild.members.fetch() : Promise.resolve()));
    await Promise.all(promises);
  } catch (err) {
    console.log(`Failed to fetch all members before ready! ${err}\n${err.stack}`);
  }

  console.log(`ready with ${client.users.cache.size} users`);
  console.timeEnd('magic');
});

client.on('debug', console.log);

client.on('error', m => console.log('debug', new Error(m).stack));
client.on('reconnecting', m => console.log('reconnecting', m));

client.on('messageCreate', message => {
  if (true) {
    if (message.content === 'makechann') {
      if (message.channel.guild) {
        message.channel.guild.channels.create('hi', { type: ChannelType.GuildText }).then(console.log);
      }
    }

    if (message.content === 'imma queue pls') {
      let count = 0;
      let ecount = 0;
      for (let x = 0; x < 4_000; x++) {
        message.channel
          .send(`this is message ${x} of 3999`)
          .then(m => {
            count++;
            console.log('reached', count, ecount);
          })
          .catch(e => {
            console.error(e);
            ecount++;
            console.log('reached', count, ecount);
          });
      }
    }

    if (message.content === 'myperms?') {
      message.channel.send(
        `Your permissions are:\n${JSON.stringify(message.channel.permissionsFor(message.author).serialize(), null, 4)}`,
      );
    }

    if (message.content === 'delchann') {
      message.channel.delete().then(chan => console.log('selfDelChann', chan.name));
    }

    if (message.content.startsWith('setname')) {
      message.channel.setName(message.content.substr(8));
    }

    if (message.content.startsWith('botname')) {
      client.user.setUsername(message.content.substr(8));
    }

    if (message.content.startsWith('botavatar')) {
      fetch('url')
        .then(result => result.arrayBuffer())
        .then(buffer => client.user.setAvatar(buffer))
        .then(() => message.channel.send('Done!'), console.error);
    }

    if (message.content.startsWith('gn')) {
      message.guild
        .setName(message.content.substr(3))
        .then(guild => console.log('guild updated to', guild.name))
        .catch(console.error);
    }

    if (message.content === 'leave') {
      message.guild
        .leave()
        .then(guild => console.log('left guild', guild.name))
        .catch(console.error);
    }

    if (message.content === 'stats') {
      let m = '';
      m += `I am aware of ${message.guild.channels.cache.size} channels\n`;
      m += `I am aware of ${message.guild.members.cache.size} members\n`;
      m += `I am aware of ${client.channels.cache.size} channels overall\n`;
      m += `I am aware of ${client.guilds.cache.size} guilds overall\n`;
      m += `I am aware of ${client.users.cache.size} users overall\n`;
      message.channel
        .send(m)
        .then(msg => msg.edit('nah'))
        .catch(console.error);
    }

    if (message.content === 'messageme!') {
      message.author.send('oh, hi there!').catch(e => console.log(e.stack));
    }

    if (message.content === "don't dm me") {
      message.author.deleteDM();
    }

    if (message.content.startsWith('kick')) {
      message.guild.members
        .resolve(message.mentions.users.first())
        .kick()
        .then(member => {
          console.log(member);
          message.channel.send(`Kicked!${member.user.username}`);
        })
        .catch(console.error);
    }

    if (message.content === 'ratelimittest') {
      let i = 1;
      const start = Date.now();
      while (i <= 20) {
        message.channel.send(`Testing my rates, item ${i} of 20`);
        i++;
      }
      message.channel.send('last one...').then(m => {
        const diff = Date.now() - start;
        m.channel.send(`Each message took ${diff / 21}ms to send`);
      });
    }

    if (message.content === 'makerole') {
      message.guild.roles
        .create()
        .then(role => {
          message.channel.send(`Made role ${role.name}`);
        })
        .catch(console.error);
    }
  }
});

function nameLoop(user) {
  // user.setUsername(user.username + 'a').then(nameLoop).catch(console.error);
}

function chanLoop(channel) {
  channel.setName(`${channel.name}a`).then(chanLoop).catch(console.error);
}

client.on('messageCreate', msg => {
  if (msg.content.startsWith('?raw')) {
    msg.channel.send(`\`\`\`${msg.content}\`\`\``);
  }

  if (msg.content.startsWith('#eval') && msg.author.id === '66564597481480192') {
    try {
      const com = eval(msg.content.split(' ').slice(1).join(' '));
      msg.channel.send(`\`\`\`\n${com}\`\`\``);
    } catch (e) {
      msg.channel.send(`\`\`\`\n${e}\`\`\``);
    }
  }
});

client.on('messageReactionAdd', (reaction, user) => {
  if (reaction.message.channelId !== '222086648706498562') return;
  reaction.message.channel.send(`${user.username} added reaction ${reaction.emoji}, count is now ${reaction.count}`);
});

client.on('messageReactionRemove', (reaction, user) => {
  if (reaction.message.channelId !== '222086648706498562') return;
  reaction.message.channel.send(`${user.username} removed reaction ${reaction.emoji}, count is now ${reaction.count}`);
});

client.on('messageCreate', m => {
  if (m.content.startsWith('#reactions')) {
    const mId = m.content.split(' ')[1];
    m.channel.messages.fetch(mId).then(rM => {
      for (const reaction of rM.reactions.cache.values()) {
        reaction.users.fetch().then(users => {
          m.channel.send(
            `The following gave that message ${reaction.emoji}:\n` +
              `${users
                .map(u => u.username)
                .map(t => `- ${t}`)
                .join('\n')}`,
          );
        });
      }
    });
  }
});
