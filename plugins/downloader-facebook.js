import axios from 'axios';

let handler = async (m, { conn, text, args, command, usedPrefix }) => {
  if (!args[0]) {
    return m.reply(`❌ يرجى تقديم رابط Instagram صالح.\n• *الاستخدام:* ${usedPrefix}${command} <الرابط>`);
  }

  const url = args[0];
  if (
    !(
      url.includes('instagram.com/p/') ||
      url.includes('instagram.com/reel/') ||
      url.includes('instagram.com/tv/')
    )
  ) {
    return m.reply('❌ الرابط غير صالح! فقط منشورات Instagram أو Reels أو TV يمكن معالجتها.');
  }

  m.reply('⏳ جاري معالجة الرابط...');

  try {
    const { data } = await axios.get(`https://weeb-api.vercel.app/insta?url=${url}`);
    if (data.urls && data.urls.length > 0) {
      for (const { url: mediaUrl, type } of data.urls) {
        const mediaType = type === 'image' ? 'image' : 'video';
        await conn.sendMessage(m.chat, {
          [mediaType]: { url: mediaUrl },
          caption: '✔️ تم استخراج الوسائط بنجاح.',
        }, { quoted: m });
      }
    } else {
      return m.reply('❌ لم يتم العثور على بيانات وسائط للرابط المقدم.');
    }
  } catch (error) {
    console.error(error);
    return m.reply(`❌ حدث خطأ أثناء معالجة الرابط: ${error.message}`);
  }
};

handler.help = ['insta <url>'];
handler.tags = ['downloader'];
handler.command = /^(ig)$/i;

export default handler;