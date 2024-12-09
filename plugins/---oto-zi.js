import axios from 'axios';

const handler = async (m, { conn }) => {
  try {
    const text = m.text;
    if (!text) return; // تجاهل الرسائل الفارغة

    // إرسال رسالة مؤقتة أثناء المعالجة
    await conn.sendMessage(m.chat, { text: 'إنتظر...' }, { quoted: m });

    // نص المحفز (Prompt) المخصص
    const prompt = `إسمك هو محمد، وصانعك هو EL KOBY، وخصمك هو ${await conn.getName(m.sender)}. أجب بمتعة وأستخدم في إجابتك رموز تعبيرية.`;

    // استدعاء API لمعالجة النص
    const result = await luminAi(text, m.sender, prompt);

    // إرسال النتيجة إلى المستخدم
    await m.reply(result);
  } catch (error) {
    console.error('حدث خطأ:', error);
    await m.reply(`حدث خطأ: ${error.message}`);
  }
};

// وظيفة لمعالجة الرسائل بشكل تلقائي
export async function before(m) {
  const text = m.text;

  // التحقق من الشروط:
  if (!text || text.startsWith('.') || /(https?:\/\/[^\s]+)/.test(text)) return; 
  // تجاهل الرسائل التي:
  // - فارغة
  // - تبدأ بنقطة (.)
  // - تحتوي على رابط

  await handler(m, { conn: m.conn }); // استدعاء المعالج
}

// تفعيل الوظيفة تلقائيًا
export const disabled = false;

// وظيفة لمعالجة طلب الذكاء الاصطناعي
async function luminAi(teks, pengguna = null, prompt = null, modePencarianWeb = false) {
  try {
    const data = { content: teks };
    if (pengguna !== null) data.user = pengguna;
    if (prompt !== null) data.prompt = prompt;
    data.webSearchMode = modePencarianWeb;

    // استدعاء API
    const { data: res } = await axios.post("https://luminai.my.id/", data);
    return res.result;
  } catch (error) {
    console.error('حدث خطأ أثناء طلب الذكاء الاصطناعي:', error);
    throw error;
  }
}