import axios from 'axios';
import yts from "yt-search";
import fetch from 'node-fetch';

export async function before(m) {
    // التحقق مما إذا كانت الرسالة تحتوي على رابط يوتيوب
    if (!m.text || !m.text.match(/youtube\.com|youtu\.be/i)) return false;

    const url = m.text.match(/(https?:\/\/[^\s]+)/)?.[0];
    if (!url) return;

    await m.reply("جاري البحث عن الفيديو، يرجى الانتظار...");

    try {
        // البحث عن الفيديو باستخدام مكتبة yt-search
        const search = await yts(url);
        if (!search || !search.all || search.all.length === 0) {
            await conn.sendMessage(m.chat, { text: 'لم يتم العثور على نتائج لطلبك!' }, { quoted: m });
            return;
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

        // تنزيل الفيديو باستخدام دالة ytdl
        const response = await ytdl(videoUrl);
        const videoDownloadUrl = response.data.mp4;
        if (!videoDownloadUrl) {
            throw new Error('فشل في استرداد رابط الفيديو!');
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
        console.error(e);
        await conn.sendMessage(m.chat, { text: `*خطأ:* ${e.message}` }, { quoted: m });
    }
}

// دالة ytdl لتنزيل الفيديو
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

export const disabled = false;