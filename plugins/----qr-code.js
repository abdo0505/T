import qrcode from "qrcode-terminal";
import fs from "fs";
import pino from "pino";
import {
    default as makeWASocket,
    Browsers,
    delay,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";

const handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text || !/^\+\d+$/.test(text)) {
        return m.reply("يرجى إدخال رقم الواتساب بالصيغة الدولية بعد الأمر. مثال:\n*kobi +22898133388*");
    }

    const phoneNumber = text.trim();
    const generateCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return Array(8)
            .fill(null)
            .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
            .join("");
    };

    const pairingCode = generateCode();
    m.reply(`جارٍ تجهيز الكود لجهازك...\nالكود الخاص بك: *${pairingCode}*`);

    async function qr() {
        const { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(`./sessions`);
        const XeonBotInc = makeWASocket({
            logger: pino({ level: "silent" }),
            browser: Browsers.windows("Firefox"),
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: "silent" })),
            },
        });

        XeonBotInc.ev.on("connection.update", async (s) => {
            const { connection } = s;
            if (connection === "open") {
                const sessionFile = "./sessions/creds.json";
                if (fs.existsSync(sessionFile)) {
                    const sessionData = fs.readFileSync(sessionFile);
                    await conn.sendMessage(phoneNumber, { text: `كود الربط الخاص بك: *${pairingCode}*` });
                    await conn.sendMessage(phoneNumber, {
                        document: sessionData,
                        mimetype: "application/json",
                        fileName: "creds.json",
                    });
                } else {
                    m.reply("فشل في إنشاء ملف الجلسة.");
                }
                process.exit(0);
            }
        });

        XeonBotInc.ev.on("creds.update", saveCreds);
    }

    qr();
};

handler.command = /^kbi$/i;

export default handler;