import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs-extra';
import { 
  initDatabase, 
  setMasterPassword, 
  unlockDatabase, 
  getSecureData, 
  saveSecureData, 
  hasMasterPassword,
  exportBackup,
  importBackup
} from './database';
import { 
  handleLogin, 
  handleRegister, 
  getUsersList, 
  handleDeleteUser 
} from './auth';

// إصلاح مشاكل المسارات في بيئات ES Module لـ Node.js / Electron
// ES Module support for Electron paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // تفعيل العزل الكامل لطبقة الواجهة
      nodeIntegration: false,  // إغلاق دمج Node المباشر لضمان الأمان
      sandbox: true,           // تفعيل بيئة التشغيل المعزولة (Sandboxing)
    },
    title: 'نظام غزة كاش لـ إدارة المبيعات والحسابات والمخازن ERP',
    icon: path.join(__dirname, '../../public/icon.png'), // أيقونة النظام الرسمية
  });

  // إذا كان التطبيق في وضع التطوير (Vite Dev Server)
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // فتح أدوات المطورين تلقائياً في وضع التطوير
    mainWindow.webContents.openDevTools();
  } else {
    // تشغيل وضع الإنتاج من الملفات المبنية الثابتة
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // تعزيز الأمان: وضع سياسة أمن المحتوى (Content Security Policy)
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https:;"]
      }
    });
  });

  // حظر فتح النوافذ المنبثقة غير المصرح بها
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // السماح فقط بنطاق محدد أو فتح المتصفح الخارجي للنظام
    if (url.startsWith('https://wa.me/') || url.startsWith('https://api.whatsapp.com/')) {
      return { action: 'allow' };
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// تهيئة قاعدة البيانات المحلية عند إقلاع التطبيق
app.whenReady().then(() => {
  // إنشاء أو فتح قاعدة البيانات المشفرة
  initDatabase();
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// إغلاق التطبيق عند إغلاق كافة النوافذ (باستثناء أجهزة الماك)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ==========================================
// تسجيل معالجات الـ IPC Handlers لـ واجهة المستخدم
// Register IPC Handlers for communication
// ==========================================

// 1. فحص وجود كلمة المرور الرئيسية
ipcMain.handle('db:hasMaster', async () => {
  try {
    return hasMasterPassword();
  } catch (error: any) {
    console.error('IPC hasMaster Error:', error);
    return false;
  }
});

// 2. تعيين كلمة المرور الرئيسية
ipcMain.handle('db:setMaster', async (event, password) => {
  try {
    return setMasterPassword(password);
  } catch (error: any) {
    console.error('IPC setMaster Error:', error);
    return false;
  }
});

// 3. إلغاء قفل قاعدة البيانات
ipcMain.handle('db:unlock', async (event, password) => {
  try {
    return unlockDatabase(password);
  } catch (error: any) {
    console.error('IPC unlock Error:', error);
    return false;
  }
});

// 4. استرجاع بيانات آمنة ومفتوحة
ipcMain.handle('db:get', async (event, key) => {
  try {
    return getSecureData(key);
  } catch (error: any) {
    console.error(`IPC get key (${key}) Error:`, error);
    return null;
  }
});

// 5. حفظ بيانات آمنة ومحدثة
ipcMain.handle('db:save', async (event, key, data) => {
  try {
    saveSecureData(key, data);
    return true;
  } catch (error: any) {
    console.error(`IPC save key (${key}) Error:`, error);
    return false;
  }
});

// 6. تسجيل الدخول والتحقق من كلمة المرور المشفّرة
ipcMain.handle('auth:login', async (event, username, password) => {
  try {
    return handleLogin(username, password);
  } catch (error: any) {
    console.error('IPC login Error:', error);
    return { success: false, error: 'فشل تفعيل المصادقة الأمنية لبيانات الدخول' };
  }
});

// 7. تسجيل مستخدم جديد بالـ Hash
ipcMain.handle('auth:register', async (event, userData) => {
  try {
    return handleRegister(userData);
  } catch (error: any) {
    console.error('IPC register Error:', error);
    return { success: false, error: 'فشل تسجيل بيانات المستخدم الجديد' };
  }
});

// 8. الحصول على قائمة المستخدمين
ipcMain.handle('auth:getUsers', async () => {
  try {
    return getUsersList();
  } catch (error: any) {
    console.error('IPC getUsers Error:', error);
    return [];
  }
});

// 9. حذف مستخدم مسجل
ipcMain.handle('auth:deleteUser', async (event, userId) => {
  try {
    return handleDeleteUser(userId);
  } catch (error: any) {
    console.error('IPC deleteUser Error:', error);
    return { success: false, error: 'فشل معالجة طلب حذف المستخدم' };
  }
});

// 10. تشغيل الـ Gemini API بأمان تام (مفتاح الـ API غير معلن ومحمي بالكامل في الـ Main)
ipcMain.handle('ai:gemini', async (event, prompt, options = {}) => {
  try {
    // محاولة جلب المفتاح المشفر من قاعدة البيانات الآمنة أولاً، أو الاستعانة ببيئة التشغيل
    const geminiSettings = getSecureData('__gemini_api_key__');
    const apiKey = geminiSettings?.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return { 
        success: false, 
        error: 'لم يتم العثور على مفتاح تفعيل Gemini API المشفر. يرجى تكوين المفتاح في صفحة إعدادات النظام.' 
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // إرسال الطلب لنموذج الذكاء الاصطناعي بنجاح
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      ...options
    });

    return { success: true, text: response.text };
  } catch (error: any) {
    console.error('IPC Gemini API Error:', error);
    return { 
      success: false, 
      error: `حدث خطأ أثناء الاتصال بالخادم الذكي: ${error.message || String(error)}` 
    };
  }
});

// 11. تصدير نسخة احتياطية مشفرة بـ AES-256-GCM
ipcMain.handle('backup:export', async (event, password) => {
  try {
    return exportBackup(password);
  } catch (error: any) {
    console.error('IPC Backup Export Error:', error);
    throw new Error(`فشل تصدير النسخة الاحتياطية: ${error.message || String(error)}`);
  }
});

// 12. استيراد ودمج نسخة احتياطية وفك تشفيرها
ipcMain.handle('backup:import', async (event, backupData, password) => {
  try {
    return importBackup(backupData, password);
  } catch (error: any) {
    console.error('IPC Backup Import Error:', error);
    return { success: false, error: `فشل استيراد النسخة الاحتياطية وفك تشفيرها: ${error.message || String(error)}` };
  }
});

// 13. حفظ ملف PDF المولد عن طريق حوار الحفظ الأصلي لنظام التشغيل
ipcMain.handle('print:generate-pdf', async (event, filename, arrayBuffer) => {
  try {
    if (!mainWindow) {
      throw new Error('لم يتم العثور على نافذة التطبيق الرئيسية.');
    }

    // عرض نافذة حوار الحفظ الخاصة بنظام التشغيل
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: 'تصدير وحفظ ملف PDF الاحترافي',
      defaultPath: path.join(app.getPath('documents'), filename),
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] }
      ]
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    // كتابة الملف إلى القرص الصلب
    const nodeBuffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, nodeBuffer);

    return { success: true, filePath };
  } catch (error: any) {
    console.error('IPC Generate PDF Error:', error);
    return { success: false, error: error.message || String(error) };
  }
});
