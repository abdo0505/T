import { exec } from 'child_process';
import fs from 'fs';

// وظيفة لإعادة تشغيل البرنامج باستخدام npm restart
const restartProcess = (reason) => {
  console.log(`إعادة تشغيل البوت... السبب: ${reason || 'غير معروف'}`);
  exec('npm restart', (error, stdout, stderr) => {
    if (error) {
      console.error(`حدث خطأ أثناء إعادة التشغيل: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`تحذير أثناء إعادة التشغيل: ${stderr}`);
    }
    console.log(`تمت إعادة تشغيل البوت بنجاح: ${stdout}`);
  });
};

// مؤقت يعيد تشغيل البوت كل 10 دقائق
setInterval(() => {
  console.log('إعادة تشغيل مجدولة كل 10 دقائق.');
  restartProcess('إعادة تشغيل مجدولة');
}, 600000); // 10 دقائق = 600,000 مللي ثانية

// الاستماع للأخطاء غير المعالجة (Exceptions)
process.on('uncaughtException', (err) => {
  console.error('خطأ غير متوقع:', err);
  restartProcess('خطأ غير متوقع');
});

// الاستماع للوعود المرفوضة (Unhandled Promise Rejections)
process.on('unhandledRejection', (reason, promise) => {
  console.error('وعد مرفوض لم تتم معالجته:', reason);
  restartProcess('وعد مرفوض');
});

// رسالة توضيحية عند بدء تشغيل البرنامج
console.log('تم تشغيل البوت. سيعيد التشغيل كل 10 دقائق أو عند وقوع خطأ.');