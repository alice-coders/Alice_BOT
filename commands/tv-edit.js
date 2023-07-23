const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('@discordjs/builders');

const tvListPath = path.resolve(__dirname, 'tv_list.txt');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tv-edit')
    .setDescription('登録したテレビ局の情報を編集します。')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('テレビ局名')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('callsign')
        .setDescription('コールサイン')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('parentchannel')
        .setDescription('親局チャンネル')
        .setRequired(true)
    ),

  async execute(interaction) {
    const name = interaction.options.getString('name');
    const callsign = interaction.options.getString('callsign');
    const parentChannel = interaction.options.getString('parentchannel');

    const newData = {
      name: name,
      callsign: callsign,
      parentChannel: parentChannel,
    };

    try {
      let tvList = [];
      if (fs.existsSync(tvListPath)) {
        const tvListData = fs.readFileSync(tvListPath, 'utf8');
        tvList = JSON.parse(tvListData);
      }

      const existingIndex = tvList.findIndex(tv => tv.name === name);
      if (existingIndex !== -1) {
        tvList[existingIndex] = newData;
        fs.writeFileSync(tvListPath, JSON.stringify(tvList, null, 2));
        await interaction.reply(`${name} の情報を編集しました！`);
      } else {
        await interaction.reply(`${name} は登録されていません。`);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'テレビ局の情報編集中にエラーが発生しました。',
        ephemeral: true,
      });
    }
  },
};
