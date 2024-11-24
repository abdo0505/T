import fs from 'fs';

// وظيفة إعادة التشغيل
const restartProcess = () => {
  console.log('تم اكتشاف خطأ! يتم الآن إعادة تشغيل البرنامج...');
  process.exit(); // إنهاء العملية لإعادة تشغيلها من جديد
};

// الاستماع للأخطاء غير المعالجة (Exceptions)
process.on('uncaughtException', (err) => {
  console.error('خطأ غير متوقع:', err);
  restartProcess();
});

// الاستماع للوعود المرفوضة (Unhandled Promise Rejections)
process.on('unhandledRejection', (reason, promise) => {
  console.error('وعد مرفوض لم تتم معالجته:', reason);
  restartProcess();
});

// رسالة توضيحية عند تشغيل البرنامج
console.log('تم تشغيل البرنامج. سيعيد التشغيل تلقائيًا عند وقوع أي خطأ.');

// جزء البرنامج الأساسي (مثال)
try {
  // أضف منطق برنامجك هنا
  // مثال: كود يؤدي لخطأ للتجربة
  throw new Error('خطأ تجريبي!');
} catch (error) {
  console.error('خطأ تم التعامل معه محليًا:', error.message);
}