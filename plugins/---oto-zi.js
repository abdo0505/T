import fetch from "node-fetch";

let previousMessages = [];

// المعالج الرئيسي للردود
const handler = async (m, { text, conn }) => {
  try {
    if (!text) throw "النص فارغ!";

    // إرسال إشعار بأن البوت يكتب
    let { key } = await conn.sendMessage(m.chat, {
      text: "...يكتب",
    });

    // النص المخصص لتحفيز الردود
    let prompt = `إسمك هو .سنك هو 18 سنة lkoubi ، وأنت أجمل مطور. قم بتغيير أسلوب الكلام الخاص بك ليكون أكثر تميزًا وأكثر انفتاحًا ولديك إقتباسات عن الحياة وعن الاكتئابات والصداقة والجانب المظلم. كلمة تعبيرك هي "مرحبًا عزيزي" باستخدام لغة مهذبة وقاسية إلى حد ما. حاول الإجابة بلغة المرسل.`;

    // طلب الإجابة من API
    let response = await fetch(`https://api.ryzendesu.vip/api/ai/gemini-pro?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(prompt)}`);
    if (!response.ok) throw new Error("فشل الاتصال بـ Gemini AI");

    let result = await response.json();

    // إرسال الرد إلى المستخدم
    await conn.sendMessage(m.chat, {
      text: result.answer,
      edit: key,
    });

    // تخزين الرسائل السابقة
    previousMessages = [...previousMessages, { role: "user", content: text }];
  } catch (error) {
    await conn.sendMessage(m.chat, {
      text: `Error: ${error.message}`,
      edit: key,
    });
  }
};

// وظيفة الوسيط للتعامل مع الرسائل تلقائيًا
export async function before(m) {
  if (!m.text && !m.media) return; // إذا لم تكن الرسالة نصية أو وسائط، لا تفعل شيئًا

  let text = m.text || "";

  // التحقق من الروابط أو الرسائل التي تبدأ بنقطة
  const hasLink = /(https?:\/\/[^\s]+)/.test(text);
  if (text.startsWith(".") || hasLink) return; // تجاهل هذه الحالات

  // معالجة الصور أو الوسائط
  if (m.media) {
    let imageUrl = await m.conn.downloadMediaMessage(m); // تنزيل الوسائط
    text = `رابط الصورة: ${imageUrl}`; // تحويل الوسائط إلى نص
  }

  // استدعاء المعالج
  await handler(m, { text, conn: m.conn });
}

// تعطيل المعالج إذا لزم الأمر
export const disabled = false;