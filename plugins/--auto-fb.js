import axios from 'axios';

export async function before(m) {
    // التحقق مما إذا كانت الرسالة تحتوي على رابط فيسبوك
    if (!m.text || !m.text.includes('facebook.com')) return false;

    const url = m.text.match(/(https?:\/\/[^\s]+)/)?.[0];
    if (!url) return;

    await m.reply('wait');

    try {
        // استدعاء API لتنزيل الفيديو
        let response = await axios.get(`https://vkrdownloader.vercel.app/server?vkr=${url}`);
        let data = response.data.data;

        // الحصول على عنوان الفيديو
        const title = data.title || "Video"; // تأكد من أن لديك عنوانًا افتراضيًا في حال عدم وجود عنوان

        // إرسال الفيديو مع العنوان
        let downloads = data.downloads.map(d => d.url);
        for (let downloadUrl of downloads) {
            await conn.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                caption: title // إضافة العنوان كتعليق
            }, { quoted: m });
        }
    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: `An error occurred while downloading the video.` }, { quoted: m });
    }
}

export const disabled = false;