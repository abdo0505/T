import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import fetch from 'node-fetch';

const handler = async (m, { conn }) => {
  const urlRegex = /https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/i;
  const match = m.text.match(urlRegex);

  if (!match) {
    return; // لا يوجد رابط إنستغرام
  }

  const videoUrl = match[0];
  await m.reply(wait);

  try {
    // استدعاء API لتنزيل الفيديو
    const api = await fetch(`https://deliriussapi-oficial.vercel.app/download/instagram?url=${videoUrl}`);
    const json = await api.json();
    const { data } = json;

    for (let item of data) {
      const mediaUrl = item.url;

      if (item.type === 'image') {
        // إرسال الصورة
        await conn.sendMessage(m.chat, { image: { url: mediaUrl } }, { quoted: m });
      } else if (item.type === 'video') {
        // إرسال الفيديو
        await conn.sendMessage(m.chat, { video: { url: mediaUrl } }, { quoted: m });

        // تنزيل الفيديو محليًا لتحويله إلى MP3
        const baseFilePath = `./src/tmp/${m.sender}`;
        const inputPath = await downloadMedia(mediaUrl, baseFilePath, 'mp4');
        const outputPath = inputPath.replace(/\.mp4$/, '.mp3'); // استبدال الامتداد بـ mp3

        // تحويل الفيديو إلى MP3
        await convertToMp3(inputPath, outputPath);

        // قراءة ملف MP3
        const mp3Buffer = fs.readFileSync(outputPath);

        // إرسال ملف MP3
        await conn.sendMessage(
          m.chat,
          { audio: mp3Buffer, fileName: `output.mp3`, mimetype: 'audio/mpeg', ptt: true },
          { quoted: m }
        );

        // تنظيف الملفات المؤقتة
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      }
    }
  } catch (error) {
    console.error(error);
    await m.reply('❌ حدث خطأ أثناء معالجة الطلب.');
  }
};

handler.tags = ['downloader'];
handler.customPrefix = /https?:\/\/(?:www\.)?instagram\.com\//i;
handler.command = new RegExp;

export default handler;

// وظائف مساعدة
async function downloadMedia(url, basePath, extension) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  const filePath = await getUniqueFileName(basePath, extension);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

async function getUniqueFileName(basePath, extension) {
  let fileName = `${basePath}.${extension}`;
  let counter = 1;
  while (fs.existsSync(fileName)) {
    fileName = `${basePath}_${counter}.${extension}`;
    counter++;
  }
  return fileName;
}

function convertToMp3(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('mp3')
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });
}