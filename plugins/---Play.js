import yts from 'yt-search';
import axios from 'axios';

const handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) throw `Use example: ${usedPrefix}${command} <search term>`;

  // البحث عن الفيديو باستخدام yt-search
  const search = await yts(text);
  const vid = search.videos[0]; // اختيار أول فيديو في النتائج
  if (!vid) throw 'Video not found, try another title';

  const { title, thumbnail, url } = vid;

  // إرسال رسالة انتظار مع الصورة المصغرة
  await conn.sendMessage(m.chat, {
    image: { url: thumbnail },
    caption: `🩵*_${title}_*🩶`,
  }, { quoted: m });

  try {
    // الحصول على رابط التحميل للصوت
    const response = await axios.get(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(url)}`);
    const downloadUrl = response.data.url;

    if (!downloadUrl) throw new Error('Audio URL not found');

    // إرسال الصوت مباشرة كـ PTT (Voice Note)
    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      ptt: true, // إرسال كـ Voice Note
    }, { quoted: m });
  } catch (error) {
    console.error('Error:', error.message);
    throw `Error: ${error.message}. Please check the URL and try again.`;
  }
};

handler.help = ['play'].map((v) => v + ' <query>');
handler.tags = ['downloader'];
handler.command = /^(py)$/i;

handler.register = false;
handler.disable = false;

export default handler;