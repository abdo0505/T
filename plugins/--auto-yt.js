import axios from 'axios';
import fs from 'fs';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';

let handler = async (m, { conn }) => {
  // تعريف تعبير منتظم للتحقق من روابط يوتيوب
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?(youtube\.com|youtu\.be)\/[^\s]+/;
  const match = m.text.match(urlRegex);

  if (!match) return; // إذا لم يتم العثور على رابط، لا يتم تنفيذ أي شيء

  const videoUrl = match[0];
  const resolution = '360'; // الدقة الافتراضية

  // URL API للحصول على رابط التنزيل
  const apiUrl = `https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(videoUrl)}&reso=${resolution}`;

  try {
    // إرسال رد فعل البداية (⏳)
    conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    // الحصول على رابط الفيديو
    const response = await axios.get(apiUrl);
    const { url: videoStreamUrl, filename } = response.data;

    if (!videoStreamUrl) throw 'Video URL not found in API response.';

    // تحديد المسار المؤقت واسم الملف
    const tmpDir = os.tmpdir();
    const filePath = `${tmpDir}/${filename}`;

    // تنزيل الفيديو إلى ملف محلي
    const writer = fs.createWriteStream(filePath);
    const downloadResponse = await axios({
      url: videoStreamUrl,
      method: 'GET',
      responseType: 'stream',
    });

    downloadResponse.data.pipe(writer);

    // انتظار اكتمال التنزيل
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // معالجة الفيديو باستخدام ffmpeg
    const outputFilePath = `${tmpDir}/${filename.replace('.mp4', '_fixed.mp4')}`;

    await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .outputOptions('-c copy') // إصلاح البيانات الوصفية دون إعادة ترميز
        .output(outputFilePath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // إرسال الفيديو مع رسالة نجاح
    const caption = `تم التنزيل بنجاح! ✅\n\nاسم الملف: ${filename}`;
    await conn.sendMessage(
      m.chat,
      {
        video: { url: outputFilePath },
        mimetype: 'video/mp4',
        fileName: filename,
        caption,
      },
      { quoted: m }
    );

    // إرسال رد فعل النجاح (✅)
    conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    // حذف الملفات المؤقتة
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Failed to delete original video file: ${err}`);
    });

    fs.unlink(outputFilePath, (err) => {
      if (err) console.error(`Failed to delete processed video file: ${err}`);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    conn.sendMessage(m.chat, { text: `حدث خطأ أثناء تنزيل الفيديو: ${error.message}` });
  }
};

// إعدادات المعالج
handler.tags = ['downloader'];
handler.customPrefix = /(?:https?:\/\/)?(?:www\.)?(youtube\.com|youtu\.be)\/[^\s]+/; // تشغيل تلقائي عند وجود رابط يوتيوب
handler.command = new RegExp();

export default handler;