import bcrypt from 'bcryptjs';
import { getDatabaseInstance } from './database';

interface User {
  id: number;
  username: string;
  password_hash: string;
  role: string;
  name: string;
}

/**
 * التحقق من صلاحيات وبيانات تسجيل الدخول لمستخدم
 * Authenticate and verify user credentials using bcrypt hashing
 */
export function handleLogin(username: string, password: string): { success: boolean; user?: Omit<User, 'password_hash'>; error?: string } {
  const db = getDatabaseInstance();
  if (!db) {
    return { success: false, error: 'قاعدة البيانات غير متصلة' };
  }

  try {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username) as User | undefined;

    if (!user) {
      return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }

    // التحقق من كلمة المرور المشفرة
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }

    const { password_hash, ...safeUser } = user;
    return { success: true, user: safeUser };
  } catch (error: any) {
    console.error('خطأ تسجيل الدخول:', error);
    return { success: false, error: 'حدث خطأ غير متوقع أثناء تسجيل الدخول' };
  }
}

/**
 * تسجيل مستخدم جديد في النظام مع تشفير كلمة المرور بـ bcrypt
 * Register a new user in the database with secure bcrypt hashing
 */
export function handleRegister(userData: { username: string; password?: string; role: string; name: string }): { success: boolean; error?: string } {
  const db = getDatabaseInstance();
  if (!db) {
    return { success: false, error: 'قاعدة البيانات غير متصلة' };
  }

  const { username, password, role, name } = userData;

  if (!username || !role || !name) {
    return { success: false, error: 'يرجى إدخال جميع الحقول الإلزامية لتسجيل المستخدم' };
  }

  try {
    // التحقق من تكرار اسم المستخدم
    const checkStmt = db.prepare('SELECT id FROM users WHERE username = ?');
    const existing = checkStmt.get(username);
    if (existing) {
      return { success: false, error: 'اسم المستخدم مسجل مسبقاً في النظام' };
    }

    let passwordHash = '';
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      passwordHash = bcrypt.hashSync(password, salt);
    } else {
      return { success: false, error: 'يرجى تزويد كلمة مرور صالحة للمستخدم الجديد' };
    }

    const stmt = db.prepare(`
      INSERT INTO users (username, password_hash, role, name) 
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(username, passwordHash, role, name);
    return { success: true };
  } catch (error: any) {
    console.error('خطأ في تسجيل مستخدم:', error);
    return { success: false, error: 'فشل إدخال المستخدم الجديد في قاعدة البيانات' };
  }
}

/**
 * الحصول على قائمة بكافة المستخدمين المسجلين في النظام بدون كلمات المرور
 * Retrieve a list of all users registered in the system (safe view)
 */
export function getUsersList(): Array<Omit<User, 'password_hash'>> {
  const db = getDatabaseInstance();
  if (!db) return [];

  try {
    const stmt = db.prepare('SELECT id, username, role, name FROM users');
    return stmt.all() as Array<Omit<User, 'password_hash'>>;
  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    return [];
  }
}

/**
 * حذف مستخدم نهائياً من قاعدة البيانات بناءً على معرفه الفريد
 */
export function handleDeleteUser(userId: number): { success: boolean; error?: string } {
  const db = getDatabaseInstance();
  if (!db) {
    return { success: false, error: 'قاعدة البيانات غير متصلة' };
  }

  try {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(userId);
    return { success: true };
  } catch (error: any) {
    console.error('خطأ في حذف مستخدم:', error);
    return { success: false, error: 'فشل حذف المستخدم من قاعدة البيانات' };
  }
}
