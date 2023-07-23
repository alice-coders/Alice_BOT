const fetch = require('node-fetch');

// 震度を取得する関数
function getIntensity(scale) {
  if (scale >= 10 && scale < 20) return '1';
  if (scale >= 20 && scale < 30) return '2';
  if (scale >= 30 && scale < 40) return '3';
  if (scale >= 40 && scale < 45) return '4';
  if (scale >= 45 && scale < 50) return '5弱';
  if (scale >= 50 && scale < 55) return '5強';
  if (scale >= 55 && scale < 60) return '6弱';
  if (scale >= 60 && scale < 70) return '6強';
  if (scale >= 70) return '7';
  return '不明';
}

async function getEarthquakeInfo(interaction) {
  try {
    const response = await fetch('https://api.p2pquake.net/v2/history?codes=551&limit=1');
    const data = await response.json();

    // 地震情報を処理する
    const earthquake = data[0]?.earthquake;
    if (!earthquake) {
      throw new Error('地震情報が見つかりませんでした。');
    }
    const magnitude = earthquake.hypocenter?.magnitude ?? '不明';
    const intensity = getIntensity(earthquake.maxScale);
    const depth = earthquake.hypocenter?.depth ?? '不明';
    const location = earthquake.hypocenter?.name ?? '不明';

    // 地図のURLを生成
    const mapUrl = `https://www.openstreetmap.org/?mlat=${earthquake.hypocenter?.latitude}&mlon=${earthquake.hypocenter?.longitude}#map=10/${earthquake.hypocenter?.latitude}/${earthquake.hypocenter?.longitude}`;

    // チャンネルに地震情報と地図を送信する
    await interaction.reply(
      `最新の地震情報\n\nマグニチュード: ${magnitude}\n震度: ${intensity}\n震源地: ${location}\n深さ: ${depth} km\n\n[震央の地図を表示する](${mapUrl})`
    );
  } catch (error) {
    console.error(error);
    await interaction.reply('地震情報を取得できませんでした。');
  }
}

module.exports = {
  data: {
    name: 'earthquake',
    description: '最新の地震情報を表示します。',
  },
  execute(interaction) {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'earthquake') {
      getEarthquakeInfo(interaction);
    }
  },
};
