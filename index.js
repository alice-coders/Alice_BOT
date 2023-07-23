express = require('express');
const { Client, Intents } = require('discord.js');
const fs = require('fs');

const app = express();
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Map();

const statusMessages = ['β稼働中', 'Ver0.1 Beta', 'Made by @alice_coders'];
let currentStatus = '';

// Discord.jsのコマンドの読み込み
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data) {
    client.commands.set(command.data.name, command);
  }
}

const useGlobalCommands = true; // true: グローバルコマンド, false: ギルドコマンド
const guildId = '836142496563068929'; // ギルドIDを指定

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  updateStatus();
  registerCommands();
});

function updateStatus() {
  const randomIndex = Math.floor(Math.random() * statusMessages.length);
  const newStatus = statusMessages[randomIndex];

  if (newStatus !== currentStatus) {
    client.user.setActivity(newStatus);
    currentStatus = newStatus;
  }

  const interval = Math.floor(Math.random() * 10000) + 5000; // ランダムな間隔でStatusを更新
  setTimeout(updateStatus, interval);
}

async function registerCommands() {
  let commands;
  if (useGlobalCommands) {
    commands = Array.from(client.commands.values()).map(command => command.data);
  } else {
    commands = Array.from(client.commands.values()).map(command => command.data.toJSON());
  }

  try {
    if (useGlobalCommands) {
      await client.application.commands.set(commands);
      console.log('Global slash commands registered.');
    } else {
      await client.guilds.cache.get(guildId)?.commands.set(commands);
      console.log('Guild slash commands registered.');
    }
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    // エラーが発生した場合にログをテキストファイルに保存する
    fs.appendFileSync('error.log', `[${new Date()}] ${error.stack}\n`);

    await interaction.reply({
      content: 'コマンドの実行中にエラーが発生しました。',
      ephemeral: true
    });

    // エラーが発生した場合に自動的に再起動する
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
});

client.login('TOKEN');

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
////Copyright © 2014-2023 dev-aix All Rights Reserved.