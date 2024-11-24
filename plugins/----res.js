import fs from 'fs';

// وظيفة إعادة التشغيل
const restartProcess = (reason) => {
  console.log(`يتم الآن إعادة تشغيل البرنامج... السبب: ${reason || 'إعادة تشغيل مجدولة'}`);
  process.exit(); // إنهاء العملية الحالية
};

// مؤقت يعيد تشغيل البرنامج كل 10 دقائق
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
console.log('تم تشغيل البرنامج. سيعيد التشغيل كل 10 دقائق أو عند وقوع خطأ.');