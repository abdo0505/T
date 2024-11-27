import axios from "axios";

const handler = async (m, { conn }) => {
    // تعريف تعبير منتظم للتحقق من روابط يوتيوب
    const urlRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+$/i;
    const match = m.text.match(urlRegex);

    if (!match) {
        return; // لا يوجد رابط يوتيوب في الرسالة
    }

    const videoUrl = match[0];
    await m.reply(wait;

    try {
        // استدعاء API للحصول على بيانات الفيديو
        const apiUrl = `https://Ikygantengbangetanjay-api.hf.space/yt?query=${encodeURIComponent(videoUrl)}`;
        console.log(`إرسال طلب إلى API: ${apiUrl}`);
        const { data } = await axios.get(apiUrl);
        console.log(`استجابة API:`, data);

        // التحقق من استجابة API
        if (!data.success || !data.result) {
            return m.reply("حدث خطأ أثناء جلب معلومات الفيديو. حاول لاحقًا.");
        }

        const videoData = data.result;
        const caption = `*乂 Y T M P 4  🩵 D O W N L O A D*\n\n` +
                        `◦ العنوان : ${videoData.title}\n` +
                        `◦ المدة : ${videoData.timestamp}\n` +
                        `◦ الكاتب : ${videoData.author.name}\n` +
                        `◦ المشاهدات : ${videoData.views}\n` +
                        `◦ منذ : ${videoData.ago}`;

        // تنزيل الفيديو
        const videoResponse = await axios.get(videoData.download.video, { responseType: 'arraybuffer' });
        const videoBuffer = Buffer.from(videoResponse.data, 'binary');

        // إرسال الفيديو للمستخدم
        await conn.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            fileName: `${videoData.title}.mp4`,
            caption: caption
        }, { quoted: m });

    } catch (error) {
        console.error("حدث خطأ أثناء تنزيل الفيديو:", error);
        m.reply("حدث خطأ أثناء تنزيل الفيديو. حاول لاحقًا.");
    }
};

// تعريف الأوامر والعلامات
handler.tags = ["downloader"];
handler.customPrefix = /https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i;
handler.command = new RegExp;

export default handler;