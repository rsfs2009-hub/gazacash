import React, { useState } from 'react';
import { UserAccount } from '../types';
import { Shield, Key, UserPlus, Trash2, Edit3, Check, X, ShieldAlert, Lock, Unlock, Users, Settings, Eye, EyeOff } from 'lucide-react';

interface UsersManagementProps {
  users: UserAccount[];
  currentUserRole: 'admin' | 'cashier';
  onUpdateUsers: (updatedUsers: UserAccount[]) => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  users = [],
  currentUserRole,
  onUpdateUsers,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'cashier'>('cashier');
  const [showPassword, setShowPassword] = useState(false);
  
  // Permissions states
  const [canDeleteInvoices, setCanDeleteInvoices] = useState(false);
  const [canAccessSettings, setCanAccessSettings] = useState(false);
  const [canEditInventory, setCanEditInventory] = useState(true);
  const [canAccessReports, setCanAccessReports] = useState(false);
  const [canManageUsers, setCanManageUsers] = useState(false);

  // Open add user modal
  const handleOpenAdd = () => {
    if (currentUserRole !== 'admin') {
      alert('🔒 عذراً! صلاحية إدارة المستخدمين وتغيير كلمات المرور مقتصرة فقط على "مدير النظام".');
      return;
    }
    setName('');
    setUsername('');
    setPassword('');
    setRole('cashier');
    setCanDeleteInvoices(false);
    setCanAccessSettings(false);
    setCanEditInventory(true);
    setCanAccessReports(false);
    setCanManageUsers(false);
    setShowAddModal(true);
  };

  // Open edit user modal
  const handleOpenEdit = (user: UserAccount) => {
    if (currentUserRole !== 'admin') {
      alert('🔒 عذراً! صلاحية إدارة المستخدمين وتغيير كلمات المرور مقتصرة فقط على "مدير النظام".');
      return;
    }
    setSelectedUser(user);
    setName(user.name);
    setUsername(user.username);
    setPassword(user.password || '');
    setRole(user.role);
    setCanDeleteInvoices(user.permissions.canDeleteInvoices);
    setCanAccessSettings(user.permissions.canAccessSettings);
    setCanEditInventory(user.permissions.canEditInventory);
    setCanAccessReports(user.permissions.canAccessReports);
    setCanManageUsers(user.permissions.canManageUsers);
    setShowEditModal(true);
  };

  // Save New User
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة!');
      return;
    }

    const usernameExists = users.some(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (usernameExists) {
      alert('اسم المستخدم هذا موجود مسبقاً! يرجى اختيار اسم مستخدم آخر.');
      return;
    }

    const newUser: UserAccount = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      username: username.trim().toLowerCase(),
      password: password.trim(),
      role,
      permissions: {
        canDeleteInvoices: role === 'admin' ? true : canDeleteInvoices,
        canAccessSettings: role === 'admin' ? true : canAccessSettings,
        canEditInventory: role === 'admin' ? true : canEditInventory,
        canAccessReports: role === 'admin' ? true : canAccessReports,
        canManageUsers: role === 'admin' ? true : canManageUsers,
      }
    };

    onUpdateUsers([...users, newUser]);
    setShowAddModal(false);
  };

  // Save Edited User
  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!name.trim() || !username.trim() || !password.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة!');
      return;
    }

    // Check username collision (excluding self)
    const usernameExists = users.some(
      u => u.id !== selectedUser.id && u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (usernameExists) {
      alert('اسم المستخدم هذا موجود مسبقاً! يرجى اختيار اسم مستخدم آخر.');
      return;
    }

    const updatedUsers = users.map(u => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          name: name.trim(),
          username: username.trim().toLowerCase(),
          password: password.trim(),
          role,
          permissions: {
            canDeleteInvoices: role === 'admin' ? true : canDeleteInvoices,
            canAccessSettings: role === 'admin' ? true : canAccessSettings,
            canEditInventory: role === 'admin' ? true : canEditInventory,
            canAccessReports: role === 'admin' ? true : canAccessReports,
            canManageUsers: role === 'admin' ? true : canManageUsers,
          }
        };
      }
      return u;
    });

    onUpdateUsers(updatedUsers);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  // Delete User
  const handleDeleteUser = (userId: string, userName: string) => {
    if (currentUserRole !== 'admin') {
      alert('🔒 عذراً! صلاحية مسح المستخدمين مقتصرة فقط على "مدير النظام".');
      return;
    }

    if (userId === 'user_admin') {
      alert('🚫 لا يمكن حذف حساب مدير النظام الافتراضي لضمان عدم قفل النظام!');
      return;
    }

    if (window.confirm(`هل أنت متأكد من رغبتك في حذف حساب الموظف "${userName}" نهائياً؟`)) {
      onUpdateUsers(users.filter(u => u.id !== userId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-md text-slate-950 dark:text-white flex items-center gap-1.5">
            <Users size={18} className="text-emerald-500" /> إدارة حسابات الموظفين وصلاحيات الدخول
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            أنشئ حسابات مخصصة للكاشير ومسؤولي المستودعات وحدد صلاحية كل موظف بدقة لحماية صندوق النقدية وحركات المخزون.
          </p>
        </div>

        {currentUserRole === 'admin' && (
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <UserPlus size={14} /> إضافة مستخدم جديد
          </button>
        )}
      </div>

      {currentUserRole !== 'admin' ? (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl text-xs font-semibold flex items-start gap-2">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>
            لقد تم حجب ميزة التحكم بالمستخدمين وتغيير كلمات المرور لأن دورك الحالي هو <strong>كاشير</strong>. يرجى التبديل لدور مدير النظام أولاً من البطاقة السابقة للوصول الكامل.
          </span>
        </div>
      ) : null}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div
            key={user.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden"
          >
            {/* Header / Role Badge */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">{user.name}</h4>
                <p className="text-xs text-slate-400 font-mono">@{user.username}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                user.role === 'admin'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
              }`}>
                {user.role === 'admin' ? 'مدير نظام' : 'كاشير مبيعات'}
              </span>
            </div>

            {/* Password Indicator */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Key size={12} /> رمز الدخول:
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs select-all">
                {user.password || '••••'}
              </span>
            </div>

            {/* Custom Permissions List */}
            <div className="mt-4 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                الصلاحيات والامتيازات الممنوحة 🔐
              </span>

              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  {user.permissions.canDeleteInvoices ? (
                    <Check size={12} className="text-emerald-500 shrink-0" />
                  ) : (
                    <X size={12} className="text-rose-500 shrink-0" />
                  )}
                  <span>إلغاء وفواتير</span>
                </div>
                <div className="flex items-center gap-1">
                  {user.permissions.canAccessSettings ? (
                    <Check size={12} className="text-emerald-500 shrink-0" />
                  ) : (
                    <X size={12} className="text-rose-500 shrink-0" />
                  )}
                  <span>إعدادات وتعديل</span>
                </div>
                <div className="flex items-center gap-1">
                  {user.permissions.canEditInventory ? (
                    <Check size={12} className="text-emerald-500 shrink-0" />
                  ) : (
                    <X size={12} className="text-rose-500 shrink-0" />
                  )}
                  <span>تعديل مخازن</span>
                </div>
                <div className="flex items-center gap-1">
                  {user.permissions.canAccessReports ? (
                    <Check size={12} className="text-emerald-500 shrink-0" />
                  ) : (
                    <X size={12} className="text-rose-500 shrink-0" />
                  )}
                  <span>تقارير وأرباح</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {currentUserRole === 'admin' && (
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex gap-2 justify-end">
                <button
                  onClick={() => handleOpenEdit(user)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition cursor-pointer"
                  title="تعديل الحساب والصلاحيات"
                >
                  <Edit3 size={14} />
                </button>
                {user.id !== 'user_admin' && (
                  <button
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                    title="حذف الموظف"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-950 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden text-right">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <UserPlus size={16} className="text-emerald-500" /> إضافة مستخدم جديد
              </h4>
            </div>

            <form onSubmit={handleAddUser} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">الاسم الكامل للموظف *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثال: يوسف رامي أحمد"
                  className="w-full p-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">اسم المستخدم (الدخول) *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="مثال: yusef99"
                    className="w-full p-2.5 rounded-xl text-xs font-mono border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-emerald-500 text-left"
                  />
                </div>

                <div className="space-y-1 relative">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">كلمة المرور / الرمز *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="كلمة مرور الدخول"
                      className="w-full p-2.5 pl-9 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">الدور الوظيفي الأساسي</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as 'admin' | 'cashier')}
                  className="w-full p-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="cashier">كاشير مبيعات (صلاحيات مخصصة)</option>
                  <option value="admin">مدير نظام كامل (صلاحيات مطلقة)</option>
                </select>
              </div>

              {role === 'cashier' && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-3 border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block pb-1 border-b border-slate-200 dark:border-slate-800">تخصيص الصلاحيات الفرعية للكاشير 🔒</span>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                      <input
                        type="checkbox"
                        checked={canDeleteInvoices}
                        onChange={e => setCanDeleteInvoices(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>تخويل بحذف ومسح الفواتير المعتمدة</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                      <input
                        type="checkbox"
                        checked={canAccessSettings}
                        onChange={e => setCanAccessSettings(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>تخويل بالوصول لإعدادات المحل والتهيئة</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                      <input
                        type="checkbox"
                        checked={canEditInventory}
                        onChange={e => setCanEditInventory(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>تخويل بتعديل الأصناف وأسعار الشراء</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                      <input
                        type="checkbox"
                        checked={canAccessReports}
                        onChange={e => setCanAccessReports(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>تخويل بالاطلاع على تقارير الأرباح والمراجعة</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  حفظ الموظف الجديد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-950 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden text-right">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Edit3 size={16} className="text-emerald-500" /> تعديل بيانات وصلاحيات المستخدم
              </h4>
            </div>

            <form onSubmit={handleEditUser} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">الاسم الكامل للموظف *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">اسم المستخدم *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs font-mono border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-emerald-500 text-left"
                  />
                </div>

                <div className="space-y-1 relative">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">كلمة المرور / الرمز *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full p-2.5 pl-9 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {selectedUser.id !== 'user_admin' ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">الدور الوظيفي</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as 'admin' | 'cashier')}
                    className="w-full p-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cashier">كاشير مبيعات (صلاحيات مخصصة)</option>
                    <option value="admin">مدير نظام كامل (صلاحيات مطلقة)</option>
                  </select>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-xs text-slate-500 font-semibold border border-slate-200/50">
                  ℹ️ لا يمكن تعديل دور مدير النظام الافتراضي.
                </div>
              )}

              {role === 'cashier' && selectedUser.id !== 'user_admin' && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-3 border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block pb-1 border-b border-slate-200 dark:border-slate-800">تخصيص الصلاحيات الفرعية للكاشير 🔒</span>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                      <input
                        type="checkbox"
                        checked={canDeleteInvoices}
                        onChange={e => setCanDeleteInvoices(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>تخويل بحذف ومسح الفواتير المعتمدة</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                      <input
                        type="checkbox"
                        checked={canAccessSettings}
                        onChange={e => setCanAccessSettings(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>تخويل بالوصول لإعدادات المحل والتهيئة</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                      <input
                        type="checkbox"
                        checked={canEditInventory}
                        onChange={e => setCanEditInventory(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>تخويل بتعديل الأصناف وأسعار الشراء</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                      <input
                        type="checkbox"
                        checked={canAccessReports}
                        onChange={e => setCanAccessReports(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>تخويل بالاطلاع على تقارير الأرباح والمراجعة</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
