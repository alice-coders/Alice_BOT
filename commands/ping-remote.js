const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

// Function to check if the input is a valid IP address
function isValidIPAddress(input) {
  // Regular expression to validate IP address
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipRegex.test(input);
}

// Function to check if the IP address is in the reserved range
function isReservedIP(ip) {
  // Check if IP address is 0.0.0.0 or in the 127.0.0.0/8 range
  if (ip === '0.0.0.0' || /^127\./.test(ip)) {
    return true;
  }

  // Check if IP address is in the local IP address range (A, B, or C class)
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(ip)) {
    return true;
  }

  return false;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pingremote')
    .setDescription('指定したIPアドレスやドメインの可用性を確認します。')
    .addStringOption(option =>
      option
        .setName('target')
        .setDescription('Ping送信先のIPアドレスやドメインを指定してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getString('target');
    
    // Check if the target is a valid URL
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      await interaction.reply('無効なURLです。http:// または https:// から始まるURLを指定してください。');
      return;
    }

    // Check if the target is a valid IP address or a domain
    const isIP = isValidIPAddress(target);

    // Check if the target IP address is in the reserved range or localhost
    if ((isIP && isReservedIP(target)) || target === 'localhost') {
      await interaction.reply(`指定したIPアドレスには送信できません。\nIPアドレス/ドメイン: ${target}`);
      return;
    }

    try {
      const startTime = Date.now();
      const response = await fetch(target);
      const endTime = Date.now();
      const status = response.status;
      const responseTime = endTime - startTime;
      let result = '';

      // Check if "Server" field is present in the response headers
      if (response.headers.has('server') && response.headers.get('server').includes('cloudflare')) {
        result += 'このサイトは、Cloudflareを利用しています。\n';
      }

      if (status === 200) {
        const text = await response.text();

        if (text.includes('Misskey') || text.includes('CherryPick')) {
          const nodeInfoUrl = `${target}/nodeinfo/2.0`;
          const nodeInfoResponse = await fetch(nodeInfoUrl);
          const nodeInfoData = await nodeInfoResponse.json();

          if (nodeInfoData.software && nodeInfoData.software.name && nodeInfoData.software.version) {
            const name = nodeInfoData.software.name;
            const version = nodeInfoData.software.version;

            result += `このサイトは、Misskeyを利用したinstanceです。\nSoftware名: ${name}\nVersion: ${version}\n`;

            if (nodeInfoData.metadata) {
              if (nodeInfoData.metadata.nodeName) {
                result += `Instance名: ${nodeInfoData.metadata.nodeName}\n`;
              }

              if (nodeInfoData.metadata.maintainer && nodeInfoData.metadata.maintainer.name) {
                result += `管理者名: ${nodeInfoData.metadata.maintainer.name}\n`;
              }

              if (nodeInfoData.metadata.maintainer && nodeInfoData.metadata.maintainer.email) {
                result += `お問い合わせメール: ${nodeInfoData.metadata.maintainer.email}\n`;
              }

              if (nodeInfoData.metadata.tosUrl) {
                result += `利用規約URL: ${nodeInfoData.metadata.tosUrl}\n`;
              }

              if (nodeInfoData.metadata.repositoryUrl) {
                result += `リポジトリURL: ${nodeInfoData.metadata.repositoryUrl}\n`;
              }

              if (nodeInfoData.metadata.feedbackUrl) {
                result += `フィードバックURL: ${nodeInfoData.metadata.feedbackUrl}\n`;
              }

              if (nodeInfoData.metadata.openRegistrations !== undefined) {
                result += `登録が可能: ${nodeInfoData.metadata.openRegistrations}\n`;
              }
            }
          }
        } else {
          // MisskeyやCherryPickの文字列が見つからない場合
          result += 'このサイトは、MisskeyやCherryPickを利用したinstanceではありません。\n';
        }

        result = `Ping結果:\nステータスコード: ${status}\nドメイン: ${target}\n応答時間: ${responseTime}ミリ秒\n\n${result}`;

        // Create and send an Embed with the information
        const embed = new MessageEmbed()
          .setTitle('Ping結果')
          .setColor('#FF0000')
          .setDescription(result);

        await interaction.reply({ embeds: [embed] });
      } else if (status === 418) {
        result = `Ping結果:\nステータスコード: ${status}\nドメイン: ${target}\nメッセージ: I'm a teapot`;

        // Create and send an Embed with the information
        const embed = new MessageEmbed()
          .setTitle('Ping結果')
          .setColor('#FF0000')
          .setDescription(result);

        await interaction.reply({ embeds: [embed] });
      } else {
        result = `Ping結果:\nステータスコード: ${status}\nドメイン: ${target}\nサイトがアクティブではありません`;

        // Create and send an Embed with the information
        const embed = new MessageEmbed()
          .setTitle('Ping結果')
          .setColor('#FF0000')
          .setDescription(result);

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply('Pingの送信中にエラーが発生しました。');
    }
  },
};
