import yts from "yt-search";
import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
    if (!text) throw 'Please enter a YouTube title or link!';

    try {
        const search = await yts(text);
        if (!search || !search.all || search.all.length === 0) {
            throw 'No results found for your query!';
        }

        const videoInfo = search.all[0];
        const videoUrl = videoInfo.url;
        const thumbnailUrl = videoInfo.thumbnail;
        const title = videoInfo.title;

        // إرسال الصورة المصغرة مع العنوان والرابط
        await conn.sendMessage(m.chat, {
            image: { url: thumbnailUrl },
            caption: `*Title:* ${title}\n*Link:* ${videoUrl}`,
        }, { quoted: m });

        // استخراج رابط mp3 باستخدام الدالة ytdl
        const response = await ytdl(videoUrl);
        const mp3Url = response.data.mp3;
        if (!mp3Url) {
            throw 'Failed to retrieve the mp3 link!';
        }

        // إرسال المقطع الصوتي على شكل رسالة صوتية (PTT)
        await conn.sendMessage(m.chat, {
            audio: { url: mp3Url },
            mimetype: "audio/mpeg",
            fileName: "audio.mp3",
            ptt: true,
            contextInfo: {
                forwardingScore: 100,
                isForwarded: false,
                externalAdReply: {
                    showAdAttribution: true,
                    title: title,
                    sourceUrl: videoUrl,
                    thumbnailUrl: thumbnailUrl,
                }
            }
        }, { quoted: m });

    } catch (e) {
        conn.reply(m.chat, `*Error:* ${e.message}`, m);
    }
};

handler.command = ['play'];
handler.helprompt = ['play'];
handler.tags = ['downloader'];
handler.exp = 0;
handler.limit = false;
handler.premium = false;

export default handler;

// دالة لجلب رابط mp3 باستخدام API خارجي
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
        throw new Error(`Failed to fetch audio: HTTP status ${response.status}`);
    }

    const data = await response.json();
    return data;
}