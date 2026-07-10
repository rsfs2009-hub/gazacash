import Database from 'better-sqlite3';
import crypto from 'crypto';
import path from 'path';
import { app } from 'electron';

// تشفير وفك تشفير البيانات الحساسة باستخدام AES-256-GCM
// AES-256-GCM encryption/decryption module for database secure storage

let db: Database.Database | null = null;
let masterKey: Buffer | null = null; // Derived from master password

const SALT = 'gaza_cash_secure_salt_2026'; // Salt fixed for PBKDF2

/**
 * تهيئة قاعدة البيانات المحلية باستخدام Better-SQLite3
 */
export function initDatabase(dbPath?: string): void {
  if (db) return;

  const defaultPath = dbPath || path.join(app.getPath('userData'), 'gaza_cash.db');
  db = new Database(defaultPath);

  // تفعيل الاستعلامات السريعة وتحسين الأداء
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  // إنشاء جدول المستخدمين
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL
    );
  `);

  // إنشاء جدول مخزن البيانات المشفرة (مفتاح / قيمة)
  db.exec(`
    CREATE TABLE IF NOT EXISTS secure_store (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

/**
 * التحقق من وجود كلمة المرور الرئيسية في النظام
 */
export function hasMasterPassword(): boolean {
  if (!db) initDatabase();
  const stmt = db!.prepare('SELECT value FROM secure_store WHERE key = ?');
  const record = stmt.get('__master_verification__') as { value: string } | undefined;
  return !!record;
}

/**
 * إنشاء وتعيين كلمة المرور الرئيسية للمرة الأولى
 */
export function setMasterPassword(password: string): boolean {
  if (!db) initDatabase();
  
  // اشتقاق مفتاح التشفير من كلمة المرور الرئيسية
  const derivedKey = crypto.pbkdf2Sync(password, SALT, 100000, 32, 'sha256');
  masterKey = derivedKey;

  // تشفير نص اختبار للتحقق لاحقاً
  const testText = 'gaza-cash-authorized';
  const encryptedValue = encrypt(testText, derivedKey);

  const stmt = db!.prepare('INSERT OR REPLACE INTO secure_store (key, value) VALUES (?, ?)');
  stmt.run('__master_verification__', encryptedValue);
  return true;
}

/**
 * فك تشفير قاعدة البيانات والتحقق من كلمة المرور الرئيسية
 */
export function unlockDatabase(password: string): boolean {
  if (!db) initDatabase();
  
  try {
    const derivedKey = crypto.pbkdf2Sync(password, SALT, 100000, 32, 'sha256');
    
    const stmt = db!.prepare('SELECT value FROM secure_store WHERE key = ?');
    const record = stmt.get('__master_verification__') as { value: string } | undefined;
    
    if (!record) {
      throw new Error('قاعدة البيانات غير مهيأة بكلمة مرور رئيسية بعد.');
    }

    const decrypted = decrypt(record.value, derivedKey);
    if (decrypted === 'gaza-cash-authorized') {
      masterKey = derivedKey;
      return true;
    }
    return false;
  } catch (error) {
    console.error('فشل إلغاء قفل قاعدة البيانات:', error);
    return false;
  }
}

/**
 * تشفير نص باستخدام خوارزمية AES-256-GCM
 */
export function encrypt(text: string, key: Buffer): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

/**
 * فك تشفير نص مشفر باستخدام خوارزمية AES-256-GCM
 */
export function decrypt(encryptedText: string, key: Buffer): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('تنسيق البيانات المشفرة غير صالح');
  }
  
  const [ivHex, tagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * حفظ البيانات بشكل آمن ومصنف داخل قاعدة البيانات المشفرة
 */
export function saveSecureData(key: string, data: any): void {
  if (!db) initDatabase();
  if (!masterKey) {
    throw new Error('يجب إلغاء قفل قاعدة البيانات بكلمة المرور الرئيسية أولاً.');
  }

  const serialized = JSON.stringify(data);
  const encrypted = encrypt(serialized, masterKey);

  const stmt = db!.prepare('INSERT OR REPLACE INTO secure_store (key, value) VALUES (?, ?)');
  stmt.run(key, encrypted);
}

/**
 * استرجاع وفك تشفير البيانات من مخزن الأمان
 */
export function getSecureData(key: string): any {
  if (!db) initDatabase();
  if (!masterKey) {
    throw new Error('يجب إلغاء قفل قاعدة البيانات بكلمة المرور الرئيسية أولاً.');
  }

  const stmt = db!.prepare('SELECT value FROM secure_store WHERE key = ?');
  const record = stmt.get(key) as { value: string } | undefined;
  
  if (!record) return null;

  try {
    const decrypted = decrypt(record.value, masterKey);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error(`خطأ أثناء فك تشفير المفتاح ${key}:`, error);
    return null;
  }
}

/**
 * تصدير نسخة احتياطية مشفرة بكلمة مرور مخصصة
 */
export function exportBackup(password: string): string {
  if (!db) initDatabase();
  if (!masterKey) {
    throw new Error('يجب إلغاء قفل قاعدة البيانات للتصدير.');
  }

  // استخراج جميع السجلات من المخزن الآمن والمستخدمين
  const secureStmt = db!.prepare('SELECT key, value FROM secure_store WHERE key != ?');
  const secureRecords = secureStmt.all('__master_verification__') as Array<{ key: string; value: string }>;
  
  const usersStmt = db!.prepare('SELECT username, password_hash, role, name FROM users');
  const usersRecords = usersStmt.all();

  const backupPayload = {
    timestamp: Date.now(),
    secure_store: secureRecords.map(r => ({
      key: r.key,
      // فك التشفير عن مفتاح الماستر وإعادة تشفير بمفتاح النسخ الاحتياطي في الدالة المساعدة
      plainValue: JSON.parse(decrypt(r.value, masterKey!))
    })),
    users: usersRecords
  };

  const serialized = JSON.stringify(backupPayload);
  
  // تشفير بمفتاح مشتق من كلمة مرور النسخ الاحتياطي
  const salt = crypto.randomBytes(16);
  const backupKey = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', backupKey, iv);
  
  let encrypted = cipher.update(serialized, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  
  return `${salt.toString('hex')}:${iv.toString('hex')}:${tag}:${encrypted}`;
}

/**
 * استيراد نسخة احتياطية مشفرة وفك تشفيرها ودمجها بالقاعدة
 */
export function importBackup(encryptedBackup: string, password: string): boolean {
  if (!db) initDatabase();
  if (!masterKey) {
    throw new Error('يجب إلغاء قفل قاعدة البيانات للاستيراد.');
  }

  const parts = encryptedBackup.split(':');
  if (parts.length !== 4) {
    throw new Error('تنسيق ملف النسخة الاحتياطية غير صالح أو تالف');
  }

  const [saltHex, ivHex, tagHex, encrypted] = parts;
  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const backupKey = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const decipher = crypto.createDecipheriv('aes-256-gcm', backupKey, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  const payload = JSON.parse(decrypted);

  // دمج البيانات المستوردة بأمان مع قاعدة البيانات الحالية باستخدام Transactions
  const transaction = db!.transaction(() => {
    // دمج المستخدمين
    const insertUser = db!.prepare(`
      INSERT OR REPLACE INTO users (username, password_hash, role, name) 
      VALUES (?, ?, ?, ?)
    `);
    for (const u of payload.users) {
      insertUser.run(u.username, u.password_hash, u.role, u.name);
    }

    // دمج مخزن الأمان
    for (const r of payload.secure_store) {
      saveSecureData(r.key, r.plainValue);
    }
  });

  transaction();
  return true;
}

export function getDatabaseInstance(): Database.Database | null {
  return db;
}
