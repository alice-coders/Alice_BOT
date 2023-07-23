const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('BOTの情報を取得します。'),

  async execute(interaction) {
    try {
      await interaction.deferReply(); // 応答をdeferする

      // Node.jsバージョンを取得
      const nodeVersion = process.versions.node;

      // OSバージョンを取得
      const osVersion = os.version();

      // CPU利用率を取得
      const cpuUsage = process.cpuUsage().user;

      // 使用メモリ量を取得
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;

      // BOTの応答速度を計測
      const startTime = Date.now();
      await interaction.editReply('計測中...');

      // Embedメッセージを作成
      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('BOTの情報')
        .addField('Node.jsバージョン', nodeVersion)
        .addField('OSバージョン', osVersion)
        .addField('CPU利用率', `${cpuUsage / 1000}ms`)
        .addField('使用メモリ量', `${usedMemory / 1024 / 1024}MB / ${totalMemory / 1024 / 1024}MB`);

      // BOTの応答速度を計測
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 応答をEmbedメッセージに編集して送信
      embed.addField('応答速度', `${responseTime}ms`);
      await interaction.editReply({ content: '計測完了!!', embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply('BOTの情報を取得する際にエラーが発生しました。');
    }
  },
};
