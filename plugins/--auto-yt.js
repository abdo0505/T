import axios from "axios";
import yts from "yt-search";

const handler = async (m, { conn, text }) => {
    if (!text) return; // إذا كانت الرسالة فارغة، تجاهلها

    m.reply("يرجى الانتظار قليلاً...");

    let videoUrl;

    // إذا كان النص رابط يوتيوب
    if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(text)) {
        videoUrl = text.trim();
    } else {
        // إذا كان النص عبارة عن كلمات بحث
        let result = await yts(text);
        videoUrl = result.videos[0]?.url; // اختيار أول فيديو
        if (!videoUrl) {
            return m.reply("لم يتم العثور على فيديو يطابق البحث.");
        }
    }

    // ترميز الرابط لاستخدامه في طلب API
    const encodedUrl = encodeURIComponent(videoUrl);
    const apiUrl = `https://Ikygantengbangetanjay-api.hf.space/yt?query=${encodedUrl}`;

    try {
        console.log(`إرسال طلب إلى API: ${apiUrl}`); // طباعة رابط API
        let response = await axios.get(apiUrl);
        console.log(`استجابة API:`, response.data); // طباعة استجابة API

        let data = response.data;

        // التحقق من النتائج
        if (!data.success || !data.result) {
            return m.reply("لم يتم العثور على نتائج.");
        }

        let videoData = data.result;
        let cap = `*乂 Y T M P 4 - D O W N L O A D*\n\n` +
                  `◦ العنوان : ${videoData.title}\n` +
                  `◦ رابط الفيديو : ${videoData.url}\n` +
                  `◦ المدة : ${videoData.timestamp}\n` +
                  `◦ الكاتب : ${videoData.author.name}\n` +
                  `◦ المشاهدات : ${videoData.views}\n` +
                  `◦ منذ : ${videoData.ago}`;

        await conn.sendMessage(m.chat, { text: cap }, { quoted: m });

        // تنزيل الفيديو
        const videoResponse = await axios.get(videoData.download.video, { responseType: 'arraybuffer' });
        const videoBuffer = Buffer.from(videoResponse.data, 'binary');

        // إرسال الفيديو كرسالة وسائط
        await conn.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            fileName: `${videoData.title}.mp4`,
            caption: cap
        }, { quoted: m });

    } catch (error) {
        console.error("حدث خطأ:", error); // طباعة الخطأ
        m.reply("حدث خطأ أثناء تنزيل الفيديو. يرجى التحقق من السجل لمزيد من التفاصيل.");
    }
};

export default handler;