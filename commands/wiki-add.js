const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

// JSONファイルのパス
const jsonFilePath = './wikiData.json';

// JSONファイルを読み込む関数
function loadJsonDataFromFile() {
  try {
    const data = fs.readFileSync(jsonFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// JSONファイルにデータを書き込む関数
function writeJsonDataToFile(data) {
  fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wiki-add')
    .setDescription('新しいWikiを作成します。')
    .addStringOption(option => option.setName('title').setDescription('Wikiのタイトルを指定してください。').setRequired(true))
    .addStringOption(option => option.setName('content').setDescription('Wikiの内容を指定してください。').setRequired(true)),

  async execute(interaction) {
    try {
      const title = interaction.options.getString('title');
      const content = interaction.options.getString('content');

      const wikiData = loadJsonDataFromFile(); // JSONファイルを読み込む

      if (wikiData[title]) {
        await interaction.reply('指定したタイトルのWikiは既に存在します。');
        return;
      }

      // 新しいWikiを追加
      wikiData[title] = {
        content: content,
        createdAt: new Date().toUTCString(),
      };

      // JSONファイルにデータを書き込む
      writeJsonDataToFile(wikiData);

      await interaction.reply(`新しいWiki「${title}」が作成されました！`);
    } catch (error) {
      console.error(error);
      await interaction.reply('コマンドの実行中にエラーが発生しました。');
    }
  },
};
