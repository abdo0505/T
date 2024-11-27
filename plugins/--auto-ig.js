import axios from 'axios';

const handler = async (m, { conn }) => {
    // تعريف تعبير منتظم للتحقق من روابط إنستغرام
    const urlRegex = /https?:\/\/(www\.)?instagram\.com\/(reel|reels|p|stories|tv|s)\/[a-zA-Z0-9_-]+/i;
    const match = m.text.match(urlRegex);

    if (!match) {
        return; // لا يوجد رابط إنستغرام في الرسالة
    }

    const instagramUrl = match[0];
    await m.reply(wait);

    try {
        const result = await instagram(instagramUrl);
        if (!result.status) {
            return m.reply(`حدث خطأ أثناء تنزيل الوسائط:\n${result.msg}`);
        }

        // إرسال الوسائط إلى المستخدم
        if (result.data.length > 1) {
            for (let item of result.data) {
                await conn.sendFile(m.chat, item.url, "", "", m);
            }
        } else {
            const media = result.data[0];
            const fileName = media.type === "video" ? "instagram.mp4" : "instagram.jpg";
            await conn.sendFile(m.chat, media.url, fileName, "*♻️Instagram 💜Downloader♻️*", m);
        }

    } catch (error) {
        console.error("حدث خطأ أثناء تنزيل الوسائط:", error);
        m.reply("حدث خطأ أثناء تنزيل الوسائط. حاول لاحقًا.");
    }
};

// تعريف الأوامر والعلامات
handler.tags = ["downloader"];
handler.customPrefix = /https?:\/\/(www\.)?instagram\.com\/(reel|reels|p|stories|tv|s)\//i;
handler.command = new RegExp;

export default handler;

// Instagram Scraper Function
async function instagram(url) {
    return new Promise(async (resolve, reject) => {
        if (!url.match(/\/(reel|reels|p|stories|tv|s)\/[a-zA-Z0-9_-]+/i)) {
            return reject({ status: false, msg: "رابط غير صالح" });
        }

        try {
            let jobId = await (await axios.post("https://app.publer.io/hooks/media", {
                url: url,
                iphone: false,
            }, {
                headers: {
                    Accept: "*/*",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Cache-Control": "no-cache",
                    Origin: "https://publer.io",
                    Pragma: "no-cache",
                    Priority: "u=1, i",
                    Referer: "https://publer.io/",
                    "Sec-CH-UA": '"Chromium";v="128", "Not A Brand";v="24", "Google Chrome";v="128"',
                    "Sec-CH-UA-Mobile": "?0",
                    "Sec-CH-UA-Platform": "Windows",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                },
            })).data.job_id;

            let status = "working";
            let response;
            while (status !== "complete") {
                response = await axios.get(`https://app.publer.io/api/v1/job_status/${jobId}`, {
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Accept-Encoding": "gzip, deflate, br, zstd",
                        "Accept-Language": "en-US,en;q=0.9",
                        "Cache-Control": "no-cache",
                        Origin: "https://publer.io",
                        Pragma: "no-cache",
                        Priority: "u=1, i",
                        Referer: "https://publer.io/",
                        "Sec-CH-UA": '"Chromium";v="128", "Not A Brand";v="24", "Google Chrome";v="128"',
                        "Sec-CH-UA-Mobile": "?0",
                        "Sec-CH-UA-Platform": "Windows",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                    }
                });
                status = response.data.status;
            }

            let data = response.data.payload.map(item => ({
                type: item.type === "photo" ? "image" : "video",
                url: item.path,
            }));
            resolve({ status: true, data });

        } catch (error) {
            reject({ status: false, msg: error.message });
        }
    });
}