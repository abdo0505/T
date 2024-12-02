import axios from "axios";
import yts from "yt-search";

const handler = async (m, { conn, usedPrefix, command, text }) => {
    // Memastikan ada input teks
    if (!text) {
        throw `*• Contoh :* ${usedPrefix + command} *<query>*`;
    }

    m.reply(wait);

    let videoUrl;

    // Mencari video berdasarkan teks
    let result = await yts(text);
    videoUrl = result.videos[0]?.url; // Ambil URL video pertama
    if (!videoUrl) {
        return m.reply("Tidak ada video ditemukan dengan pencarian tersebut.");
    }

    // Encode URL untuk digunakan dalam permintaan API
    const encodedUrl = encodeURIComponent(videoUrl);
    const apiUrl = `https://Ikygantengbangetanjay-api.hf.space/yt?query=${encodedUrl}`;

    try {
        console.log(`Mengirim permintaan ke API: ${apiUrl}`); // Log URL API
        let response = await axios.get(apiUrl);
        console.log(`Respons dari API:`, response.data); // Log respons dari API

        let data = response.data;

        // Memeriksa apakah hasil valid
        if (!data.success || !data.result) {
            return m.reply("Tidak ada hasil ditemukan.");
        }

        let videoData = data.result;
        let cap = `*乂 Y T M P 3 ♻️- P L A Y*\n\n` +
                  `◦ Judul : ${videoData.title}\n` +
                  `◦ Link Video : ${videoData.url}\n` +
                  `◦ Durasi : ${videoData.timestamp}\n` +
                  `◦ Penulis : ${videoData.author.name}\n` +
                  `◦ Views : ${videoData.views}\n` +
                  `◦ Diunggah : ${videoData.ago}`;

        // تحميل الصورة من الرابط وتحويلها إلى Buffer
        const imageUrl = "https://qu.ax/NkKUn.jpg";
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');

        // إرسال الصورة مع النصوص
        await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: cap
        }, { quoted: m });

        // Mengunduh audio
        const audioResponse = await axios.get(videoData.download.audio, { responseType: 'arraybuffer' });
        const audioBuffer = Buffer.from(audioResponse.data, 'binary');

        // Kirim audio sebagai pesan media
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${videoData.title}.mp3`,
            caption: cap
        }, { quoted: m });

    } catch (error) {
        console.error("Terjadi kesalahan:", error); // Log kesalahan
        m.reply("Terjadi kesalahan saat memproses permintaan. Silakan periksa log untuk detail.");
    }
};

handler.help = ["ytmp3", "yta", "play"].map(a => a + " *[query]*");
handler.tags = ["downloader"];
handler.command = ["play"];

export default handler;