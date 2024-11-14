import yts from "yt-search";
import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
    if (!text) throw 'يرجى إدخال عنوان أو رابط يوتيوب!';

    try {
        const search = await yts(text);
        if (!search || !search.all || search.all.length === 0) {
            throw 'لم يتم العثور على نتائج لطلبك!';
        }

        const video = search.all[0];
        const videoUrl = video.url;
        const videoTitle = video.title;
        const videoThumbnail = video.thumbnail;

        // إرسال المعلومات الأولية: العنوان، الرابط، والصورة المصغرة
        await conn.sendMessage(m.chat, {
            image: { url: videoThumbnail },
            caption: `*العنوان:* ${videoTitle}\n*الرابط:* ${videoUrl}`,
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    title: videoTitle,
                    sourceUrl: videoUrl,
                    thumbnailUrl: videoThumbnail,
                }
            }
        }, { quoted: m });

        // تنزيل الفيديو باستخدام الدالة ytdl
        const response = await ytdl(videoUrl);
        const videoDownloadUrl = response.data.mp4;
        if (!videoDownloadUrl) {
            throw 'فشل في استرداد رابط الفيديو!';
        }

        // إرسال الفيديو بصيغة mp4
        await conn.sendMessage(m.chat, {
            video: { url: videoDownloadUrl },
            mimetype: "video/mp4",
            fileName: "video.mp4",
            caption: `*العنوان:* ${videoTitle}`,
            contextInfo: {
                forwardingScore: 100,
                isForwarded: false,
                externalAdReply: {
                    showAdAttribution: true,
                    title: videoTitle,
                    sourceUrl: videoUrl,
                    thumbnailUrl: videoThumbnail,
                }
            }
        }, { quoted: m });

    } catch (e) {
        conn.reply(m.chat, `*خطأ:* ${e.message}`, m);
    }
};

handler.command = ['play'];
handler.help = ['play'];
handler.tags = ['downloader'];
handler.exp = 0;
handler.limit = false;
handler.premium = false;

export default handler;

async function ytdl(url) {
    const response = await fetch('https://shinoa.us.kg/api/download/ytdl', {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'api_key': 'free',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: url })
    });

    if (!response.ok) {
        throw new Error(`فشل في تحميل الفيديو: HTTP status ${response.status}`);
    }

    const data = await response.json();
    return data;
}