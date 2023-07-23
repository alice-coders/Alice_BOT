const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

// JSONファイルのパス
const jsonFilePath = './wikiData.json';

// JSONファイルが存在しない場合に初期化する関数
function initializeJSON() {
  if (!fs.existsSync(jsonFilePath)) {
    fs.writeFileSync(jsonFilePath, JSON.stringify({}));
  }
}

// JSONファイルを読み込む関数
function readJSON() {
  const data = fs.readFileSync(jsonFilePath, 'utf8');
  return JSON.parse(data);
}

// JSONファイルにデータを書き込む関数
function writeJSON(data) {
  fs.writeFileSync(jsonFilePath, JSON.stringify(data));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wiki')
    .setDescription('指定したタイトルのWikiを表示します。')
    .addStringOption(option => option.setName('title').setDescription('Wikiのタイトルを指定してください。')),

  async execute(interaction) {
    try {
      initializeJSON(); // JSONファイルの初期化

      const title = interaction.options.getString('title');
      const wikiData = readJSON(); // JSONファイルからデータを読み込む

      // 指定したタイトルのWiki内容を取得する
      const wikiContent = wikiData[title];

      if (!wikiContent) {
        await interaction.reply('指定したタイトルのWikiが見つかりませんでした。');
        return;
      }

      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`${title} のWiki`)
        .setDescription(wikiContent.content)
        .addField('作成日', wikiContent.createdAt);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('コマンドの実行中にエラーが発生しました。');
    }
  },
};
