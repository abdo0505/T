import yts from 'yt-search';
import axios from 'axios';

let handler = async (m, { conn }) => {
    // تعريف تعبير منتظم للتحقق من روابط يوتيوب
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?(youtube\.com|youtu\.be)\/[^\s]+/;
    const match = m.text.match(urlRegex);

    if (!match) return; // إذا لم يتم العثور على رابط، لا يتم تنفيذ أي شيء

    try {
        conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        // استخراج معرف الفيديو من الرابط
        const videoId = extractVid(match[0]);
        if (!videoId) throw new Error('الرابط غير صالح.');

        // جلب معلومات الفيديو
        const links = await downloadLinks(videoId);

        // التحقق من وجود جودة 360p
        if (!links.mp4['360p']) throw new Error('فيديو بجودة 360p غير متوفر.');
        const videoLink = await links.mp4['360p']();

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        // إرسال الفيديو مباشرة
        await conn.sendFile(
            m.chat,
            videoLink.url,
            `${videoId}.mp4`,
            `*تم التنزيل بنجاح:*`,
            m,
            null,
            {
                mimetype: 'video/mp4',
            }
        );
    } catch (e) {
        m.reply('خطأ: ' + e.message);
    }
};

// الدوال المساعدة
const extractVid = (data) => {
    const match = /(?:youtu\.be\/|youtube\.com(?:.*[?&]v=|.*\/))([^?&]+)/.exec(data);
    return match ? match[1] : null;
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

// إعدادات المعالج
handler.tags = ["downloader"];
handler.customPrefix = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/; // تشغيل تلقائي عند وجود رابط يوتيوب
handler.command = new RegExp;

export default handler;