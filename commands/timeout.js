module.exports = {
  data: {
    name: 'timeout',
    description: 'ユーザーをタイムアウトします。',
    options: [
      {
        name: 'user',
        type: 'USER',
        description: 'タイムアウトするユーザーを選択してください。',
        required: true,
      },
      {
        name: 'duration',
        type: 'INTEGER',
        description: 'タイムアウトの秒数を指定してください。',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');

    if (!user || !duration) {
      await interaction.reply('ユーザーとタイムアウトの秒数を正しく指定してください。');
      return;
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      await interaction.reply('指定されたユーザーが見つかりません。');
      return;
    }

    // タイムアウトまでの時間を計算する
    const timeoutDuration = duration * 1000;
    const timeoutTime = Date.now() + timeoutDuration;

    try {
      // タイムアウトを設定
      await member.timeout({ duration: timeoutDuration, reason: 'タイムアウトの理由' });
      await interaction.reply(`${user.tag} を ${duration} 秒間タイムアウトしました。`);
    } catch (error) {
      console.error('タイムアウト中にエラーが発生しました:', error);
      await interaction.reply('タイムアウト中にエラーが発生しました。');
    }

    // タイムアウト終了時に自動的に解除するタイマーを設定する
    setTimeout(async () => {
      try {
        // タイムアウトを解除
        await member.timeout({ duration: 0, reason: 'タイムアウトの解除' });
      } catch (error) {
        console.error('タイムアウト解除中にエラーが発生しました:', error);
      }
    }, timeoutTime - Date.now());
  },
};
