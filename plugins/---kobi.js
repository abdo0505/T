import axios from 'axios';

const handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text) return m.reply(`Masukan prompt! \n\nContoh: \n${usedPrefix + command} Selamat pagi`);
    await conn.sendMessage(m.chat, { text: 'إنتظر...' }, { quoted: m });
    let result = await luminAi(text, m.sender, `إسمك هو محمد، وصانعك هو EL KOBY، وخصمك هو  ${await conn.getName(m.sender)}, أجب بمتعة وأستخدم في إجابتك رموز تعبيرية `);
    await m.reply(result);
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  }
};

handler.help = ['openai'];
handler.tags = ['ai'];
handler.command = /^kobi$/i;
handler.limit = false;

export default handler;

async function luminAi(teks, pengguna = null, prompt = null, modePencarianWeb = false) {
  try {
    const data = { content: teks };
    if (pengguna !== null) data.user = pengguna;
    if (prompt !== null) data.prompt = prompt;
    data.webSearchMode = modePencarianWeb;
    const { data: res } = await axios.post("https://luminai.my.id/", data);
    return res.result;
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    throw error;
  }
}