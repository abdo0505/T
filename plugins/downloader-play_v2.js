import axios from 'axios';
import yts from 'yt-search'; // مكتبة البحث
import fs from 'fs';
import path from 'path';

class Fuck extends Error {
    constructor(msg) {
        super(msg);
        this.name = "Fuck";
    }
}

class API {
    constructor(details, downloads) {
        this.endpoints = { info: details, download: downloads };
    }

    headers(custom = {}) {
        return {
            'Content-Type': 'application/json',
            'User-Agent': 'Postify/1.0.0',
            'Referer': 'https://ytiz.xyz/',
            ...custom
        };
    }

    handleError(error, context) {
        const errors = error.response ? JSON.stringify(error.response.data || error.errors) : error.errors;
        console.error(`Error in ${context}:`, errors);
        throw new Fuck(errors);
    }
}

class YTMP3 extends API {
    constructor() { 
        super('https://m8.fly.dev/api/info', 'https://m8.fly.dev/api/download'); 
    }

    async request(endpoint, payload) {
        try {
            const { data } = await axios.post(this.endpoints[endpoint], payload, { headers: this.headers() });
            return data;
        } catch (error) { 
            this.handleError(error, endpoint); 
        }
    }

    async fetchDetails(videoUrl, format) {
        return this.request('info', { url: videoUrl, format, startTime: 0, endTime: 0 });
    }

    async downloadAudio(videoUrl, quality, filename, randomID, format) {
        return this.request('download', {
            url: videoUrl,
            quality,
            metadata: true,
            filename,
            randID: randomID,
            trim: false,
            startTime: 0,
            endTime: 0,
            format
        });
    }

    validParams(format, quality) {
        const formats = ['m4a', 'mp3', 'flac'];
        const qualities = ['32', '64', '128', '192', '256', '320'];

        if (!formats.includes(format)) {
            throw new Error(`Salah! Pilih salah satu opsi ini : ${formats.join(', ')}`);
        }

        if (!qualities.includes(quality)) {
            throw new Error(`Salah! Pilih salah satu opsi ini : ${qualities.join(', ')}`);
        }
    }

    async exec(videoUrl, format = 'mp3') {
        const quality = '128';  // تحديد الجودة لتكون 32 فقط

        const videoInfo = await this.fetchDetails(videoUrl, format);
        const audioData = await this.downloadAudio(videoUrl, quality, videoInfo.filename, videoInfo.randID, format);
        console.log(audioData);

        // إرسال الطلب للحصول على بيانات الفيديو
        const response = await axios.post('https://m8.fly.dev/api/file_send', {
            filepath: audioData.filepath,
            randID: audioData.randID
        }, { responseType: 'arraybuffer' });

        return {
            buffer: Buffer.from(response.data), // إرجاع بيانات الصوت
            thumbnail: videoInfo.thumbnail, // تضمين صورة الفيديو المصغرة
            title: videoInfo.title // تضمين عنوان الفيديو
        };
    }

    static async download(videoUrl, format = 'mp3') {
        const downloader = new YTMP3();
        return await downloader.exec(videoUrl, format).catch(err => {
            console.error(err.errors);
        });
    }
}

// Handler function for WhatsApp bot
let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `استخدام الأمر: ${usedPrefix + command} <الكلمة المفتاحية>`;

    try {
        conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
        
        // البحث عن الفيديو باستخدام yt-search
        const { videos } = await yts(text.trim());  // البحث عن الفيديوهات باستخدام الكلمة المفتاحية
        if (videos.length === 0) throw 'لم يتم العثور على أي فيديوهات للبحث عن الكلمة المفتاحية.';

        // أخذ أول فيديو مقترح
        const videoUrl = videos[0].url;
        const format = 'mp3';  // التنسيق الافتراضي يمكن تعديله

        // تحميل الفيديو باستخدام الرابط الأول الذي تم الحصول عليه
        const { buffer: audioBuffer, thumbnail, title } = await YTMP3.download(videoUrl, format);

        if (!audioBuffer) throw '❌ فشل تحميل الصوت!';

        const doc = {
            audio: audioBuffer,
            mimetype: 'audio/mp4', // تغيير mimetype إذا لزم الأمر
            fileName: `${title}`,
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    mediaType: 2,
                    mediaUrl: videoUrl,
                    title: title,
                    sourceUrl: videoUrl,
                    thumbnail: await (await conn.getFile(thumbnail)).data
                }
            }
        };

        await conn.sendMessage(m.chat, doc, { quoted: m });

    } catch (e) {
        console.error(e);
        throw '❌ فشل في تنزيل الصوت!';
    }
}

handler.help = ["ytmp3"];
handler.tags = ["downloader"];
handler.command = ['ply'];

export default handler;