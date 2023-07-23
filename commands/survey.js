const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');

module.exports = {
  data: {
    name: 'survey',
    description: 'アンケートを実施します。',
    options: [
      {
        name: 'question',
        type: 'STRING',
        description: '質問を入力してください。',
        required: true,
      },
      {
        name: 'choices',
        type: 'STRING',
        description: '選択肢をカンマで区切って入力してください。',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const choices = interaction.options.getString('choices')?.split(',');

    if (!question || !choices || choices.length < 2) {
      await interaction.reply('質問と選択肢が正しく指定されていません。');
      return;
    }

    const optionValues = choices.map((choice, index) => ({
      label: choice.trim(),
      value: index.toString(),
    }));

    const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('survey_select')
          .setPlaceholder('選択肢を選んでください。')
          .addOptions(optionValues)
      );

    const surveyAuthor = interaction.user;
    const surveyEmbed = new MessageEmbed()
      .setTitle('アンケート回答')
      .setDescription(question)
      .addField('選択肢', choices.join(', '));

    await interaction.reply({ content: 'アンケートを作成しました。', embeds: [surveyEmbed], components: [row] });

    const results = initializeResults(choices);

    interaction.client.on('interactionCreate', async (interaction) => {
      if (interaction.isSelectMenu() && interaction.customId === 'survey_select') {
        const selectedChoice = interaction.values[0];
        const voter = interaction.user.tag;

        // アンケート結果を更新
        results[selectedChoice]++;

        const resultEmbed = createResultEmbed(question, choices, results);
        const resultMessage = `回答がありました！\n\n質問: ${question}\n投票者: ${voter}\n選択肢: ${choices[selectedChoice]}\n投票数: ${results[selectedChoice]}`;

        const dmChannel = await surveyAuthor.createDM();
        dmChannel.send(resultMessage);
        dmChannel.send({ embeds: [resultEmbed] });
      }
    });
  },
};

function initializeResults(choices) {
  const results = {};

  choices.forEach((_, index) => {
    results[index] = 0;
  });

  return results;
}

function createResultEmbed(question, choices, results) {
  const totalResponses = Object.values(results).reduce((sum, count) => sum + count, 0);

  const resultFields = choices.map((choice, index) => {
    const choiceCount = results[index];
    const choicePercentage = ((choiceCount / totalResponses) * 100).toFixed(2);

    return {
      name: choice,
      value: `回答数: ${choiceCount}\n割合: ${choicePercentage}%`,
      inline: true,
    };
  });

  const resultEmbed = new MessageEmbed()
    .setTitle('アンケート結果')
    .setDescription(`質問: ${question}`)
    .addFields(resultFields)
    .setColor('#00ff00');

  return resultEmbed;
}
