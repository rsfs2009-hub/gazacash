import { contextBridge, ipcRenderer } from 'electron';

// تعريف واجهة التواصل الآمنة للمصادر الأمامية (Renderer process)
// Expose protected methods that allow the renderer process to use node/electron APIs safely
contextBridge.exposeInMainWorld('electronAPI', {
  // التفاعل مع كلمة المرور الرئيسية لقاعدة البيانات المشفرة
  hasMasterPassword: () => ipcRenderer.invoke('db:hasMaster'),
  setMasterPassword: (password: string) => ipcRenderer.invoke('db:setMaster', password),
  unlockDatabase: (password: string) => ipcRenderer.invoke('db:unlock', password),
  
  // حفظ واسترجاع السجلات المشفرة (الأصناف، الفواتير، الحسابات، العملاء، إلخ)
  getSecureData: (key: string) => ipcRenderer.invoke('db:get', key),
  saveSecureData: (key: string, data: any) => ipcRenderer.invoke('db:save', key, data),
  
  // إدارة عمليات تحقق المستخدمين والمصادقة الأمنية
  login: (username: string, password: string) => ipcRenderer.invoke('auth:login', username, password),
  registerUser: (userData: { username: string; password?: string; role: string; name: string }) => 
    ipcRenderer.invoke('auth:register', userData),
  getUsers: () => ipcRenderer.invoke('auth:getUsers'),
  deleteUser: (userId: number) => ipcRenderer.invoke('auth:deleteUser', userId),
  
  // استدعاء المستشار المالي والذكي المدمج بشكل آمن من الـ Main Process
  callGemini: (prompt: string, options?: any) => ipcRenderer.invoke('ai:gemini', prompt, options),
  
  // النسخ الاحتياطي الآمن والمشفر (تصدير واستيراد)
  exportBackup: (password: string) => ipcRenderer.invoke('backup:export', password),
  importBackup: (backupData: string, password: string) => ipcRenderer.invoke('backup:import', backupData, password),
  
  // توليد وحفظ ملفات الـ PDF الاحترافية في نظام التشغيل
  generatePDF: (filename: string, buffer: ArrayBuffer) => ipcRenderer.invoke('print:generate-pdf', filename, buffer),
});
