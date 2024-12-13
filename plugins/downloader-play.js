import yts from 'yt-search';
import axios from 'axios';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `استخدام الأمر:\n${usedPrefix + command} <الكلمة المفتاحية>\n\nمثال:\n${usedPrefix + command} أغنية`;

  try {
    conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    const videos = await search(text);
    if (videos.length === 0) throw new Error('لم يتم العثور على نتائج.');

    // اختيار أول فيديو
    const video = videos[0];
    const links = await downloadLinks(video.id);

    // التحقق من وجود جودة صوت MP3
    if (!links.mp3['128kbps']) throw new Error('الصوت بجودة 128kbps غير متوفر.');
    const audioLink = await links.mp3['128kbps']();

    // إعداد النصوص مع معلومات الفيديو (بدون عدد المشاهدات)
    const cap = `*乂 Y T M P 3 ♻️- P L A Y*\n\n` +
                `◦ العنوان: ${video.title}\n` +
                `◦ الرابط: ${video.url}`;

    // تحميل الصورة المصغرة
    const imageUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary');

    // إرسال الصورة مع النصوص
    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: cap
    }, { quoted: m });

    // تنزيل ملف الفيديو
    const tempFilePath = `./src/tmp/${m.sender}`;
    const inputPath = await downloadFile(audioLink.url, tempFilePath + '.mp4');
    const outputPath = inputPath.replace(/\.[^.]+$/, '.mp3'); // استبدال الامتداد بـ mp3

    // تحويل الفيديو إلى MP3
    await convertToMp3(inputPath, outputPath);

    // إرسال ملف MP3
    const mp3Buffer = fs.readFileSync(outputPath);
    await conn.sendMessage(
      m.chat,
      { audio: mp3Buffer, fileName: `${video.title}.mp3`, mimetype: 'audio/mpeg' },
      { quoted: m }
    );

    // تنظيف الملفات المؤقتة
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  } catch (e) {
    m.reply('خطأ: ' + e.message);
  }
};

handler.help = ["yta <query>"];
handler.tags = ["downloader"];
handler.command = /^(play)$/i;

export default handler;

// الدوال المساعدة
const search = async (query) => {
  const videos = await yts(query).then(v => v.videos);
  return videos.map(({ videoId, url, title }) => ({
    title, id: videoId, url,
  }));
};

const downloadLinks = async (id) => {
  const headers = {
    Accept: "*/*",
    Origin: "https://id-y2mate.com",
    Referer: `https://id-y2mate.com/${id}`,
    'User-Agent': 'Postify/1.0.0',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const response = await axios.post('https://id-y2mate.com/mates/analyzeV2/ajax', new URLSearchParams({
    k_query: `https://youtube.com/watch?v=${id}`,
    k_page: 'home',
    q_auto: 0,
  }), { headers });

  if (!response.data || !response.data.links) throw new Error('لم يتم الحصول على رد من API.');

  return Object.entries(response.data.links).reduce((acc, [format, links]) => {
    acc[format] = Object.fromEntries(Object.values(links).map(option => [
      option.q || option.f,
      async () => {
        const res = await axios.post('https://id-y2mate.com/mates/convertV2/index', new URLSearchParams({ vid: id, k: option.k }), { headers });
        if (res.data.status !== 'ok') throw new Error('خطأ في التحويل.');
        return { size: option.size, format: option.f, url: res.data.dlink };
      }
    ]));
    return acc;
  }, { mp3: {}, mp4: {} });
};

async function downloadFile(url, outputPath) {
  const response = await axios({ url, method: 'GET', responseType: 'stream' });
  const writer = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', () => resolve(outputPath));
    writer.on('error', reject);
  });
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