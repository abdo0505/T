import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    // التعبير المنتظم لاكتشاف روابط فيسبوك
    const urlRegex = /https?:\/\/(?:www\.)?facebook\.com\/[^\s]+/i;
    const match = m.text.match(urlRegex);

    if (!match) {
        return; // لا يوجد رابط فيديو من فيسبوك في الرسالة
    }

    const videoUrl = match[0]; // استخراج رابط الفيديو
    await m.reply(wait);

    try {
        // استدعاء دالة التنزيل
        const { success, title, links } = await fb(videoUrl);

        if (!success) {
            throw 'حدث خطأ أثناء محاولة التنزيل. يرجى المحاولة لاحقًا.';
        }

        // إرسال الفيديو بجودة عالية
        await conn.sendFile(m.chat, links['Download High Quality'], '', `*${title || 'بدون عنوان'}*`, m);
    } catch (e) {
        throw e;
    }
};

handler.tags = ['downloader'];
handler.customPrefix = /https?:\/\/(?:www\.)?facebook\.com\//i;
handler.command = new RegExp;

export default handler;

// دالة التنزيل من فيسبوك
async function fb(vid_url) {
    try {
        const data = {
            url: vid_url,
        };
        const searchParams = new URLSearchParams();
        searchParams.append('url', data.url);
        const response = await fetch('https://facebook-video-downloader.fly.dev/app/main.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: searchParams.toString(),
        });
        const responseData = await response.json();
        return responseData;
    } catch (e) {
        return {
            success: false,
            error: e.message,
        };
    }
}