import fetch from "node-fetch";

let previousMessages = [];

const handler = async (m, { text, conn }) => {
  try {
    if (!text) {
      throw "Text is empty!";
    }

    let { key } = await conn.sendMessage(m.chat, {
      text: "...يكتب",
    });

    let anu = ' إسمك هو .سنك هو 18 سنة lkoubi ، وأنت أجمل مطور. قم بتغيير أسلوب الكلام الخاص بك ليكون أكثر تميزًا وأكثر انفتاحًا ولديك إقتسابات عن الخياة وعن الإكتئابات وعن الصداقة وعن الحانب المظلم. كلمة تعباتك هي "مرحبًا عزيزي" باستخدام لغة مهذبة وقاسية إلى حد ما. أعرب عن طبيعتك من خلال التحدث التي ليست رسمية مثل الإنسان. قم بتغيير لغتك باستخدام لغة ممتعة للتحدث معها ، فأنت صديق للمتحدث ، وقم بإجراء محادثة قصيرة وممتعة وجعل طبيعة Tsundere، ودائما ضع رموز تعبيرية مثل إيموجي و حاول أن تكون إجابتك باللغة التي راسلك بها المستخدميعني إذا راسلك بالعربية أجبه بالعربية وإذا راسلك بلغة أخرى أجبه بنفس اللغة ';

    let response = await fetch(`https://api.ryzendesu.vip/api/ai/gemini-pro?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(anu)}`);

    if (!response.ok) {
      throw new Error("Request to Gemini AI failed");
    }

    let result = await response.json();

    await conn.sendMessage(m.chat, {
      text: "" + result.answer,
      edit: key,
    });

    previousMessages = [...previousMessages, { role: "user", content: text }];
  } catch (error) {
    await conn.sendMessage(m.chat, {
      text: "" + `Error: ${error.message}`,
      edit: key,
    });
  }
};

// الوظيفة الأساسية لمعالجة الرسائل
export async function before(m) {
    if (!m.text && !m.media) return; // إذا كانت الرسالة لا تحتوي على نص أو صورة، فلا نفعل شيئًا

    let text = m.text || '';

    // التحقق إذا كانت الرسالة تحتوي على رابط أو تبدأ بنقطة
    const hasLink = /(https?:\/\/[^\s]+)/.test(text); // التحقق من وجود رابط
    if (text.startsWith(".") || hasLink) return; // تجاهل الرسائل التي تبدأ بنقطة أو تحتوي على رابط

    // إذا كانت الرسالة تحتوي على صورة
    if (m.media) {
        let imageUrl = await conn.downloadMediaMessage(m); // تحميل الصورة
        text = `رابط الصورة: ${imageUrl}`; // إضافة رابط الصورة كـ نص
    }

    // استدعاء المعالج
    handler(m, { text: text, conn: m.conn });
}

export const disabled = false;