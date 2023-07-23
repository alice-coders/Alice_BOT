const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

const tvListPath = path.resolve(__dirname, 'tv_list.txt');

const data = new SlashCommandBuilder()
  .setName('tv-register')
  .setDescription('テレビ局を登録します。')
  .addStringOption(option =>
    option.setName('tv-station')
      .setDescription('テレビ局名')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('call-sign')
      .setDescription('コールサイン')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('parent-channel')
      .setDescription('親局チャンネル')
      .setRequired(true)
  );

module.exports = {
  data,

  async execute(interaction) {
    const tvStation = interaction.options.getString('tv-station');
    const callSign = interaction.options.getString('call-sign');
    const parentChannel = interaction.options.getString('parent-channel');

    if (!tvStation || !callSign || !parentChannel) {
      await interaction.reply('入力された値が無効です。もう一度試してください。');
      return;
    }

    const newData = {
      name: tvStation,
      callsign: callSign,
      parentChannel: parentChannel,
    };

    try {
      let tvList = [];
      if (fs.existsSync(tvListPath)) {
        const tvListData = fs.readFileSync(tvListPath, 'utf8');
        tvList = JSON.parse(tvListData);
      }

      tvList.push(newData);

      fs.writeFileSync(tvListPath, JSON.stringify(tvList, null, 2));

      await interaction.reply(`${tvStation} を登録しました！`);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'テレビ局の登録中にエラーが発生しました。',
        ephemeral: true,
      });
    }
  },
};
