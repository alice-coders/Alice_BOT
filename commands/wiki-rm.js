const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wiki-rm')
    .setDescription('指定したタイトルのWikiを削除します。')
    .addStringOption(option => option.setName('title').setDescription('削除するWikiのタイトルを指定してください。').setRequired(true)),

  async execute(interaction) {
    try {
      const title = interaction.options.getString('title');

      // JSONから既存のデータを読み込む処理を実装
      const jsonData = loadJsonDataFromFile();

      // 指定したタイトルのWikiを削除
      if (jsonData.hasOwnProperty(title)) {
        delete jsonData[title];

        // JSONデータをファイルに保存する処理を実装
        saveJsonDataToFile(jsonData);

        await interaction.reply(`${title} のWikiを削除しました。`);
      } else {
        await interaction.reply('指定したタイトルのWikiが見つかりませんでした。');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply('コマンドの実行中にエラーが発生しました。');
    }
  },
};
