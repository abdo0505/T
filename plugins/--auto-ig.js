import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    // التعبير المنتظم لاكتشاف روابط إنستغرام
    const urlRegex = /https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/i;
    const match = m.text.match(urlRegex);

    if (!match) {
        return; //  يوجد رابط فيديو من إنستغرام في الرسالة
    }

    const videoUrl = match[0]; // استخراج رابط الفيديو
    await m.reply(wait);

    try {
        // استدعاء واجهة برمجة التطبيقات لتنزيل الفيديو
        let api = await fetch(`https://deliriussapi-oficial.vercel.app/download/instagram?url=${videoUrl}`);
        let json = await api.json();
        let { data } = json;
        let JT = data;

        // إرسال الوسائط (صور/فيديوهات)
        for (let i = 0; i < JT.length; i++) {
            let HFC = JT[i];
            if (HFC.type === "image") {
                await conn.sendMessage(m.chat, { image: { url: HFC.url } }, { quoted: m });
            } else if (HFC.type === "video") {
                await conn.sendMessage(m.chat, { video: { url: HFC.url } }, { quoted: m });
            }
        }
    } catch (error) {
        console.error(error);
        await m.reply("حدث خطأ أثناء محاولة تنزيل الفيديو.");
    }
};

// إعدادات المعالج
handler.tags = ['downloader'];
handler.customPrefix = /https?:\/\/(?:www\.)?instagram\.com\//i;
handler.command = new RegExp;

export default handler;