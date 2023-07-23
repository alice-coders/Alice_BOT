const fs = require('fs');
const path = require('path');

const tvListPath = path.join(__dirname, 'tv_list.txt');

module.exports = {
  data: {
    name: 'tv-list',
    description: '登録されているテレビ局のリストを表示します。',
  },
  async execute(interaction) {
    try {
      const data = await fs.promises.readFile(tvListPath, 'utf8');
      const tvList = JSON.parse(data);

      if (tvList.length === 0) {
        await interaction.reply('登録されているテレビ局はありません。');
        return;
      }

      const tvListText = tvList
        .map(tv => `**${tv.name}**\nコールサイン: ${tv.callsign}\n親局チャンネル: ${tv.parentChannel}`)
        .join('\n\n');

      await interaction.reply(`登録されているテレビ局:\n\n${tvListText}`);
    } catch (error) {
      console.error(error);
      await interaction.reply('テレビ局リストの読み込み中にエラーが発生しました。');
    }
  },
};
