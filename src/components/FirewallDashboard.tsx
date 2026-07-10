import React, { useState, useEffect } from 'react';
import { 
  Shield, ShieldAlert, ShieldCheck, Activity, Sliders, Lock, Unlock, 
  Ban, AlertTriangle, Play, RefreshCw, Trash2, Check, X, Plus, Globe, 
  Terminal, FileText, CheckCircle, Info, Zap, AlertOctagon, UserX, Cpu
} from 'lucide-react';
import { FirewallSettings, SecurityAlert, AuditLogEntry } from '../types';

interface FirewallDashboardProps {
  settings: FirewallSettings;
  alerts: SecurityAlert[];
  currentUserRole: 'admin' | 'cashier';
  onUpdateSettings: (updatedSettings: FirewallSettings) => void;
  onUpdateAlerts: (updatedAlerts: SecurityAlert[]) => void;
  onAddAuditLog: (log: AuditLogEntry) => void;
}

export const FirewallDashboard: React.FC<FirewallDashboardProps> = ({
  settings = {
    enabled: true,
    maxAttempts: 3,
    lockoutDuration: 5,
    highSecurityMode: false,
    blockedIps: [],
    whitelistedIps: ['127.0.0.1', '192.168.1.1']
  },
  alerts = [],
  currentUserRole,
  onUpdateSettings,
  onUpdateAlerts,
  onAddAuditLog
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'policies' | 'ip-lists' | 'alerts'>('overview');
  
  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [successOverlay, setSuccessOverlay] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (successOverlay) {
      const timer = setTimeout(() => setSuccessOverlay(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [successOverlay]);

  const handleManualSave = () => {
    if (currentUserRole !== 'admin') {
      showToast('🔒 عذراً! صلاحية حفظ وتعديل إعدادات جدار الحماية مقتصرة فقط على مدير النظام.', 'warning');
      return;
    }
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      onUpdateSettings(settings);
      setSuccessOverlay('✓ تم حفظ وتطبيق سياسات وإعدادات جدار الحماية بنجاح!');
      showToast('✓ تم حفظ وتطبيق إعدادات جدار الحماية والسياسات الأمنية بنجاح!', 'success');
      onAddAuditLog({
        id: `log_firewall_save_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'حفظ يدوي لإعدادات جدار الحماية',
        operator: 'أحمد المحترف (مدير النظام)',
        details: 'قام مدير النظام بحفظ وتأكيد تطبيق سياسات جدار الحماية يدويًا.',
        severity: 'info'
      });
    }, 800);
  };

  // State for adding IPs
  const [newBlockedIp, setNewBlockedIp] = useState('');
  const [newWhitelistedIp, setNewWhitelistedIp] = useState('');
  
  // Simulated scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [scanResult, setScanResult] = useState<{
    vulnerabilities: number;
    score: number;
    status: 'excellent' | 'good' | 'warning' | 'danger';
    details: string;
  } | null>(null);

  // Security Statistics
  const threatLevel = alerts.some(a => a.severity === 'critical' && !a.resolved) 
    ? 'danger' 
    : alerts.some(a => a.severity === 'high' && !a.resolved) 
      ? 'warning' 
      : 'safe';

  const totalBlocked = settings.blockedIps?.length || 0;
  const activeAlertsCount = alerts.filter(a => !a.resolved).length;

  // Toggle general firewall enabled status
  const handleToggleEnabled = () => {
    if (currentUserRole !== 'admin') {
      showToast('🔒 عذراً! هذه الصلاحية مقتصرة على مدير النظام. يرجى التبديل لدور مدير النظام أولاً.', 'warning');
      return;
    }
    const updated = { ...settings, enabled: !settings.enabled };
    onUpdateSettings(updated);
    const overlayMsg = updated.enabled ? '🟢 تم تفعيل وتشغيل جدار حماية النظام بنجاح!' : '⚠️ تم تعطيل وإيقاف جدار حماية النظام بالكامل!';
    setSuccessOverlay(overlayMsg);
    showToast(overlayMsg, updated.enabled ? 'success' : 'warning');
    
    onAddAuditLog({
      id: `log_firewall_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: updated.enabled ? 'تفعيل جدار الحماية' : 'تعطيل جدار الحماية',
      operator: 'أحمد المحترف (مدير النظام)',
      details: updated.enabled 
        ? 'تم تفعيل جدار حماية التطبيق والتحقق من محاولات التسلل بنجاح.' 
        : '🚨 تحذير: تم إيقاف جدار حماية النظام بالكامل يدوياً!',
      severity: updated.enabled ? 'info' : 'critical'
    });
  };

  // Toggle high security mode
  const handleToggleHighSecurity = () => {
    if (currentUserRole !== 'admin') {
      showToast('🔒 عذراً! هذه الصلاحية مقتصرة على مدير النظام. يرجى التبديل لدور مدير النظام أولاً.', 'warning');
      return;
    }
    const updated = { ...settings, highSecurityMode: !settings.highSecurityMode };
    onUpdateSettings(updated);
    
    const overlayMsg = updated.highSecurityMode 
      ? '⚡ تم تفعيل وتشغيل وضع "الحماية الفائقة" بنجاح!' 
      : '🟢 تم إيقاف الحماية الفائقة والعودة للوضع المتوازن.';
    setSuccessOverlay(overlayMsg);
    showToast(overlayMsg, updated.highSecurityMode ? 'success' : 'info');
    
    onAddAuditLog({
      id: `log_firewall_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'تحديث وضع الأمان المتقدم',
      operator: 'أحمد المحترف (مدير النظام)',
      details: updated.highSecurityMode 
        ? 'تم تشغيل "وضع الحماية القصوى" لمنع أي تداخلات أو محاولات تخطي الصلاحيات.' 
        : 'تم خفض حماية النظام إلى الوضع القياسي.',
      severity: updated.highSecurityMode ? 'warning' : 'info'
    });
  };

  // Update policy numerical parameters
  const handleUpdatePolicyParam = (key: 'maxAttempts' | 'lockoutDuration', value: number) => {
    if (currentUserRole !== 'admin') {
      showToast('🔒 عذراً! هذه الصلاحية مقتصرة على مدير النظام.', 'warning');
      return;
    }
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    
    const overlayMsg = key === 'maxAttempts' 
      ? `✓ تم تعديل الحد الأقصى إلى ${value} محاولات وحفظ الإعداد تلقائياً!`
      : `✓ تم تعديل مدة الإغلاق الأمني إلى ${value} دقيقة وحفظ الإعداد تلقائياً!`;
    setSuccessOverlay(overlayMsg);
    showToast(overlayMsg, 'success');
  };

  // Block a new IP address
  const handleAddBlockedIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserRole !== 'admin') {
      showToast('🔒 عذراً! هذه الصلاحية مقتصرة على مدير النظام.', 'warning');
      return;
    }
    const ip = newBlockedIp.trim();
    if (!ip) return;
    
    // IP format basic check
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipPattern.test(ip)) {
      showToast('⚠️ يرجى إدخال عنوان IP صحيح (مثال: 192.168.1.100)', 'error');
      return;
    }

    if (settings.blockedIps.includes(ip)) {
      showToast('⚠️ هذا العنوان محظور بالفعل!', 'warning');
      return;
    }

    const updatedBlocked = [...settings.blockedIps, ip];
    // Remove from whitelist if present
    const updatedWhite = settings.whitelistedIps.filter(w => w !== ip);

    onUpdateSettings({
      ...settings,
      blockedIps: updatedBlocked,
      whitelistedIps: updatedWhite
    });
    showToast(`✓ تم حظر عنوان الـ IP (${ip}) بنجاح!`, 'success');

    onAddAuditLog({
      id: `log_firewall_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'حظر عنوان IP جديد',
      operator: 'أحمد المحترف (مدير النظام)',
      details: `تم إضافة عنوان الـ IP (${ip}) إلى قائمة الحظر ومنعه من الاتصال بالتطبيق نهائياً.`,
      severity: 'warning'
    });

    setNewBlockedIp('');
  };

  // Whitelist an IP address
  const handleAddWhitelistedIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserRole !== 'admin') {
      showToast('🔒 عذراً! هذه الصلاحية مقتصرة على مدير النظام.', 'warning');
      return;
    }
    const ip = newWhitelistedIp.trim();
    if (!ip) return;
    
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipPattern.test(ip)) {
      showToast('⚠️ يرجى إدخال عنوان IP صحيح (مثال: 192.168.1.100)', 'error');
      return;
    }

    if (settings.whitelistedIps.includes(ip)) {
      showToast('⚠️ هذا العنوان موثوق بالفعل!', 'warning');
      return;
    }

    const updatedWhite = [...settings.whitelistedIps, ip];
    // Remove from blocked if present
    const updatedBlocked = settings.blockedIps.filter(b => b !== ip);

    onUpdateSettings({
      ...settings,
      whitelistedIps: updatedWhite,
      blockedIps: updatedBlocked
    });
    showToast(`✓ تم توثيق عنوان الـ IP (${ip}) بنجاح!`, 'success');

    onAddAuditLog({
      id: `log_firewall_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'توثيق عنوان IP جديد',
      operator: 'أحمد المحترف (مدير النظام)',
      details: `تم إضافة عنوان الـ IP (${ip}) لقائمة العناوين الموثوقة والآمنة.`,
      severity: 'info'
    });

    setNewWhitelistedIp('');
  };

  // Remove IP from lists
  const handleRemoveIp = (listKey: 'blockedIps' | 'whitelistedIps', ip: string) => {
    if (currentUserRole !== 'admin') {
      showToast('🔒 عذراً! هذه الصلاحية مقتصرة على مدير النظام.', 'warning');
      return;
    }
    const updatedList = settings[listKey].filter(item => item !== ip);
    onUpdateSettings({
      ...settings,
      [listKey]: updatedList
    });
    showToast('✓ تم إزالة العنوان وحفظ القوائم بنجاح.', 'success');

    onAddAuditLog({
      id: `log_firewall_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'إزالة عنوان IP من القوائم',
      operator: 'أحمد المحترف (مدير النظام)',
      details: `تم إزالة العنوان (${ip}) من قائمة ${listKey === 'blockedIps' ? 'المحظورين' : 'الموثوقين'}.`,
      severity: 'info'
    });
  };

  // Resolve security alert
  const handleResolveAlert = (alertId: string) => {
    const updated = alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a);
    onUpdateAlerts(updated);
  };

  // Clear all resolved alerts
  const handleClearResolvedAlerts = () => {
    const updated = alerts.filter(a => !a.resolved);
    onUpdateAlerts(updated);
  };

  // Trigger simulated security scan
  const handleStartSecurityScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanLogs([]);
    setScanResult(null);

    const logs = [
      '🔍 بدء اختبار الاختراق المحاكي ومراجعة جدار الحماية...',
      '📡 فحص حزم الاتصال الواردة وسجلات الأجهزة المتصلة...',
      '🔑 اختبار متانة كلمات المرور وسياسة التشفير الثنائية...',
      '🛡️ محاكاة هجوم بروت فورس (Brute-Force Attack) على لوحة الكاشير...',
      '🔗 مراجعة الصلاحيات النشطة ومستودعات التخزين المحلية...',
      '🚦 تقييم معايير الحماية النشطة ودرجة التعقيد الهيكلي...'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          
          // Generate realistic result
          const vulnerabilitiesFound = settings.enabled ? (settings.highSecurityMode ? 0 : 1) : 4;
          const score = settings.enabled ? (settings.highSecurityMode ? 98 : 88) : 45;
          let status: 'excellent' | 'good' | 'warning' | 'danger' = 'excellent';
          let details = 'ممتاز! جدار الحماية نشط ويتم حظر محاولات الاختراق بنجاح ولا توجد ثغرات مكشوفة.';
          
          if (!settings.enabled) {
            status = 'danger';
            details = '🚨 خطر حرج! جدار الحماية معطل بالكامل، مما يسمح بمحاولات دخول غير محدودة دون آلية حظر.';
          } else if (!settings.highSecurityMode) {
            status = 'good';
            details = 'جيد جداً! الحماية الأساسية مفعلة، ينصح بتفعيل وضع الحماية القصوى لصد محاولات التسلل المتقدمة.';
          }

          setScanResult({
            vulnerabilities: vulnerabilitiesFound,
            score,
            status,
            details
          });

          // Add audit log about scan completion
          onAddAuditLog({
            id: `log_security_scan_${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'إجراء فحص أمني للنظام',
            operator: `${currentUserRole === 'admin' ? 'أحمد المحترف (مدير النظام)' : 'الكاشير'}`,
            details: `تم الانتهاء من الفحص الدوري لمتانة النظام. النتيجة: ${score}% - الثغرات المكتشفة: ${vulnerabilitiesFound}`,
            severity: vulnerabilitiesFound > 0 ? 'warning' : 'info'
          });

          return 100;
        }

        // Add logs as progress updates
        if (prev % 15 === 0 && currentLogIndex < logs.length) {
          setScanLogs(l => [...l, logs[currentLogIndex]]);
          currentLogIndex++;
        }

        return prev + 5;
      });
    }, 150);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Upper Status Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Dynamic pulsing glow behind shield based on threat level */}
        <div className={`absolute top-1/2 left-6 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition duration-500 ${
          !settings.enabled 
            ? 'bg-rose-600' 
            : threatLevel === 'danger' 
              ? 'bg-rose-500 animate-pulse' 
              : threatLevel === 'warning'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-emerald-500'
        }`} />

        <div className="flex items-center gap-4 z-10">
          <div className={`p-4 rounded-2xl ${
            !settings.enabled 
              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
              : threatLevel === 'danger' 
                ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30' 
                : threatLevel === 'warning'
                  ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          }`}>
            {!settings.enabled ? (
              <ShieldAlert size={36} className="animate-bounce" />
            ) : threatLevel === 'danger' ? (
              <AlertOctagon size={36} className="animate-pulse" />
            ) : (
              <ShieldCheck size={36} className="animate-pulse" />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              مركز الحماية وجدار الحماية الذكي <span className="text-emerald-400 text-xs font-bold font-mono px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">v1.5 Active Guard</span>
            </h3>
            <p className="text-xs text-slate-400">
              يقوم جدار الحماية بفحص محاولات تسجيل الدخول، ومراقبة تغيير صلاحيات الكاشير، والحد من هجمات التخمين Brute-Force تلقائياً.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 self-stretch md:self-auto justify-end border-t border-slate-800/80 md:border-t-0 pt-4 md:pt-0">
          <div className="text-left md:text-right pl-4">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">حالة جدار الحماية</span>
            <span className={`text-xs font-black ${settings.enabled ? 'text-emerald-400' : 'text-rose-500'}`}>
              {settings.enabled ? '● نشط ومحمي' : '○ معطل - معرض للخطر'}
            </span>
          </div>

          <button
            onClick={handleToggleEnabled}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-sm ${
              settings.enabled 
                ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {settings.enabled ? 'تعطيل الحماية' : 'تشغيل جدار الحماية'}
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 block">مستوى التهديد الأمني</span>
            <span className={`text-sm font-black ${
              threatLevel === 'danger' ? 'text-rose-600' : threatLevel === 'warning' ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {threatLevel === 'danger' ? 'مستهدف / خطر عالي' : threatLevel === 'warning' ? 'تنبيهات أمنية معلقة' : 'آمن تماماً'}
            </span>
          </div>
          <div className={`p-2.5 rounded-xl ${
            threatLevel === 'danger' ? 'bg-rose-500/10 text-rose-500' : threatLevel === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
          }`}>
            <Activity size={18} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 block">عناوين IP المحظورة</span>
            <span className="text-xl font-mono font-black text-slate-900 dark:text-white">
              {totalBlocked} <span className="text-xs text-slate-400 font-sans font-normal">عنوان</span>
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
            <Ban size={18} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 block">أحداث أمنية غير محلولة</span>
            <span className="text-xl font-mono font-black text-slate-900 dark:text-white">
              {activeAlertsCount} <span className="text-xs text-slate-400 font-sans font-normal">حدث</span>
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* Metric 4 */}
        <button
          type="button"
          onClick={handleToggleHighSecurity}
          className={`text-right bg-white dark:bg-slate-900 border ${
            settings.highSecurityMode 
              ? 'border-purple-500/30 dark:border-purple-500/30 bg-purple-500/[0.02] dark:bg-purple-950/[0.05]' 
              : 'border-slate-200/60 dark:border-slate-800'
          } rounded-2xl p-4 flex items-center justify-between shadow-xs transition-all duration-200 hover:shadow-md cursor-pointer group w-full`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 block group-hover:text-purple-400 transition-colors">وضع الحماية الفائقة (اضغط للتغيير)</span>
            <span className={`text-sm font-black transition-colors ${settings.highSecurityMode ? 'text-purple-500 font-bold' : 'text-slate-500'}`}>
              {settings.highSecurityMode ? 'مفعّل (تشديد كامل) ⚡' : 'مغلق (الوضع المتوازن)'}
            </span>
          </div>
          <div className={`p-2.5 rounded-xl transition-all duration-300 ${
            settings.highSecurityMode 
              ? 'bg-purple-500/10 text-purple-500 group-hover:scale-110' 
              : 'bg-slate-500/10 text-slate-500 group-hover:bg-purple-500/10 group-hover:text-purple-500'
          }`}>
            <Zap size={18} />
          </div>
        </button>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeSubTab === 'overview'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          نظرة عامة والتحليلات الأهلية
        </button>
        <button
          onClick={() => setActiveSubTab('policies')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeSubTab === 'policies'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          سياسات جدار الحماية وقواعد الحظر
        </button>
        <button
          onClick={() => setActiveSubTab('ip-lists')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeSubTab === 'ip-lists'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          قوائم عناوين الـ IP والتفويض
        </button>
        <button
          onClick={() => setActiveSubTab('alerts')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'alerts'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          الإنذارات وسجلات الاختراق
          {activeAlertsCount > 0 && (
            <span className="bg-rose-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
              {activeAlertsCount}
            </span>
          )}
        </button>
      </div>

      {/* SUB-TAB CONTENTS */}
      
      {/* 1. OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Security Scan & Health Card */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Cpu size={16} className="text-emerald-500" /> مراجعة متانة النظام واختبار الاختراق المحاكي
                </h4>
                <p className="text-xs text-slate-400">
                  قم بإجراء فحص أمني عميق للتحقق من ثغرات قاعدة البيانات وملفات التخزين ومحاكاة هجمات تسريب البيانات.
                </p>
              </div>
              
              <button
                disabled={isScanning}
                onClick={handleStartSecurityScan}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
                {isScanning ? 'جاري الفحص الميداني...' : 'إجراء فحص أمني دقيق'}
              </button>
            </div>

            {isScanning && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>تم إنجاز: {scanProgress}%</span>
                  <span>الذكاء الأمني يراجع الثغرات...</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-150" 
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                
                {/* Rolling Logs */}
                <div className="bg-slate-950 p-3 rounded-lg text-[10px] font-mono text-emerald-400 space-y-1 h-24 overflow-y-auto">
                  {scanLogs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  <div className="animate-pulse">_</div>
                </div>
              </div>
            )}

            {/* Scan Result */}
            {scanResult && !isScanning && (
              <div className={`p-5 rounded-xl border flex flex-col md:flex-row items-center gap-5 transition-all duration-300 ${
                scanResult.status === 'excellent' 
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                  : scanResult.status === 'good'
                    ? 'bg-blue-500/5 border-blue-500/20 text-blue-800 dark:text-blue-400'
                    : 'bg-rose-500/5 border-rose-500/20 text-rose-800 dark:text-rose-400'
              }`}>
                <div className="text-center shrink-0">
                  <div className="text-xs uppercase tracking-wider font-bold mb-1">نقاط أمان النظام</div>
                  <div className={`text-4xl font-black font-mono w-20 h-20 rounded-full flex items-center justify-center border-4 ${
                    scanResult.status === 'excellent' 
                      ? 'border-emerald-500 text-emerald-500'
                      : scanResult.status === 'good'
                        ? 'border-blue-500 text-blue-500'
                        : 'border-rose-500 text-rose-500'
                  }`}>
                    {scanResult.score}
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-extrabold text-sm flex items-center gap-1.5">
                    <CheckCircle size={16} /> نتائج المراجعة الميدانية
                  </h5>
                  <p className="text-xs leading-relaxed">{scanResult.details}</p>
                  
                  <div className="flex gap-4 text-xs pt-1 border-t border-slate-200/50 dark:border-slate-800/40">
                    <div>
                      <span className="text-slate-400">الثغرات المفتوحة: </span>
                      <strong className="font-mono font-bold">{scanResult.vulnerabilities}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">محاولات الاختراق التي تم ردعها: </span>
                      <strong className="font-mono font-bold text-emerald-500">{alerts.length}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Static Guard Status Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Lock size={12} className="text-emerald-500" /> الحماية ضد هجمات القوة الغاشمة
                </h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  يقفل جدار الحماية النظام مؤقتاً لأي جهاز يفشل في إدخال رمز المرور {settings.maxAttempts} مرات متتالية، مما يمنع أدوات التخمين التلقائي من تخطي الحماية.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Shield size={12} className="text-emerald-500" /> جدار الحماية للتخزين المحلي
                </h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  يتم تشفير وتأمين فواتير المبيعات والشراء ومستندات المخازن ضد أي تلاعب بالملفات المؤقتة للمتصفح لمنع التهرب الضريبي أو السرقة.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Active Policy Snapshot */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders size={16} className="text-emerald-500" /> ملخص سياسات جدار الحماية
              </h4>
              <p className="text-xs text-slate-400">الضوابط المفعلة حالياً على منافذ المحل.</p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">حالة جدار الحماية:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  settings.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}>
                  {settings.enabled ? 'فعّال ونشط' : 'معطّل'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">الحد الأقصى للمحاولات:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{settings.maxAttempts} محاولات</span>
              </div>

              <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">فترة الإغلاق الأمني:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{settings.lockoutDuration} دقائق</span>
              </div>

              <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">الحماية الفائقة:</span>
                <span className={`font-bold ${settings.highSecurityMode ? 'text-purple-500' : 'text-slate-400'}`}>
                  {settings.highSecurityMode ? 'مفعّلة' : 'غير نشطة'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pb-1">
                <span className="text-slate-500">عناوين IP محظورة:</span>
                <span className="font-mono font-bold text-rose-500">{totalBlocked} عناوين</span>
              </div>
            </div>

            {currentUserRole === 'admin' && (
              <button
                onClick={() => setActiveSubTab('policies')}
                className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer text-center"
              >
                تعديل وتخصيص السياسات
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. POLICIES CONFIGURATION */}
      {activeSubTab === 'policies' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sliders size={16} className="text-emerald-500" /> ضبط سياسات وقواعد مكافحة الهجمات الرقمية
            </h4>
            <p className="text-xs text-slate-400">
              حدد سياسة التعامل التلقائي مع المحاولات الفاشلة وشدة جدار الحماية في حماية بيانات الكاشير والمبيعات.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Setting: Max Attempts */}
            <div className="space-y-2 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/30">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Unlock size={14} className="text-amber-500" /> الحد الأقصى لمحاولات تسجيل الدخول الخاطئة
              </label>
              <p className="text-[11px] text-slate-400 leading-normal">
                عدد المحاولات المسموح بها للموظف أو الكاشير لإدخال رمز المرور قبل أن يتم حظر الجهاز وعنوان الـ IP الخاص به تلقائياً.
              </p>
              
              <div className="flex gap-2 pt-2">
                {[3, 5, 10].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleUpdatePolicyParam('maxAttempts', val)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition font-mono cursor-pointer ${
                      settings.maxAttempts === val
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {val} محاولات
                  </button>
                ))}
              </div>
            </div>

            {/* Setting: Lockout Duration */}
            <div className="space-y-2 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/30">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Lock size={14} className="text-rose-500" /> مدة الإغلاق الأمني المؤقت للكاشير
              </label>
              <p className="text-[11px] text-slate-400 leading-normal">
                المدة الزمنية (بالدقائق) التي سيظل فيها حساب الموظف مغلقاً والجهاز محظوراً من الوصول لشاشة تسجيل الدخول بعد تخطي المحاولات الخاطئة.
              </p>
              
              <div className="flex gap-2 pt-2">
                {[1, 5, 15, 60].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleUpdatePolicyParam('lockoutDuration', val)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition font-mono cursor-pointer ${
                      settings.lockoutDuration === val
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {val === 60 ? 'ساعة كاملة' : `${val} دقائق`}
                  </button>
                ))}
              </div>
            </div>

            {/* Setting: High Security Mode */}
            <div className="md:col-span-2 space-y-4 border border-purple-500/10 p-5 rounded-2xl bg-purple-500/[0.02] dark:bg-purple-950/[0.05]">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h5 className="font-extrabold text-xs text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                    <Zap size={14} className="text-purple-500" /> وضع الحماية العالية والتحكم بالصلاحيات الفرعية (High Security Level)
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    عند تفعيل هذا الخيار، سيقوم جدار الحماية بفرض رقابة أمنية مشددة، ومطالبة الكاشير بكلمة المرور عند محاولة الوصول لأمور حساسة، وحظر العمليات غير العادية، وإجراء تسجيل خروج فوري للجهاز عند انقضاء جلسة الخمول.
                  </p>
                </div>
                
                <button
                  onClick={handleToggleHighSecurity}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black transition cursor-pointer ${
                    settings.highSecurityMode
                      ? 'bg-purple-500 text-white shadow-md shadow-purple-500/15'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {settings.highSecurityMode ? 'الحماية الفائقة مفعّلة ⚡' : 'تشغيل الحماية الفائقة'}
                </button>
              </div>
            </div>

            {/* Manual Save Button for user peace of mind */}
            <div className="md:col-span-2 pt-5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold leading-relaxed">
                <Info size={14} className="text-blue-500 shrink-0" />
                <span>يتم تحديث جميع التغييرات تلقائياً وفورياً لضمان سلامة خادم المبيعات ومحاكيات جدار الحماية الميدانية.</span>
              </div>
              <button
                type="button"
                onClick={handleManualSave}
                disabled={isSavingSettings}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700/50 text-white text-xs font-black rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md shadow-emerald-500/10 hover:shadow-lg"
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>جاري تطبيق وحفظ السياسات...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    <span>حفظ وتطبيق إعدادات جدار الحماية</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. IP LISTS MANAGEMENT */}
      {activeSubTab === 'ip-lists' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Blacklist Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Ban size={16} className="text-rose-500" /> عناوين الـ IP المحظورة والمقيدة
              </h4>
              <p className="text-xs text-slate-400">عناوين الأجهزة المتسللة التي تم عزلها وحظرها من الوصول للتطبيق.</p>
            </div>

            <form onSubmit={handleAddBlockedIp} className="flex gap-2">
              <input
                type="text"
                value={newBlockedIp}
                onChange={e => setNewBlockedIp(e.target.value)}
                placeholder="مثال: 192.168.1.102"
                className="flex-1 p-2.5 rounded-xl text-xs font-mono border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-rose-500 text-left"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus size={14} /> حظر IP
              </button>
            </form>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {settings.blockedIps.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  لا يوجد أي عناوين IP محظورة حالياً.
                </div>
              ) : (
                settings.blockedIps.map(ip => (
                  <div key={ip} className="flex justify-between items-center p-2.5 rounded-xl border border-rose-500/10 bg-rose-500/[0.02] dark:bg-rose-950/[0.05]">
                    <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <Globe size={12} /> {ip}
                    </span>
                    
                    {currentUserRole === 'admin' && (
                      <button
                        onClick={() => handleRemoveIp('blockedIps', ip)}
                        className="p-1 text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer"
                        title="إلغاء الحظر وتفويض العنوان"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Whitelist Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-500" /> القائمة البيضاء (العناوين الموثوقة)
              </h4>
              <p className="text-xs text-slate-400">عناوين الأجهزة والشبكات الموثوقة التي لا تخضع لسياسة الحظر التلقائي.</p>
            </div>

            <form onSubmit={handleAddWhitelistedIp} className="flex gap-2">
              <input
                type="text"
                value={newWhitelistedIp}
                onChange={e => setNewWhitelistedIp(e.target.value)}
                placeholder="مثال: 10.0.0.12"
                className="flex-1 p-2.5 rounded-xl text-xs font-mono border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-emerald-500 text-left"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus size={14} /> توثيق IP
              </button>
            </form>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {settings.whitelistedIps.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  لا يوجد عناوين موثوقة مخصصة. العناوين الافتراضية تخضع للسياسات العامة.
                </div>
              ) : (
                settings.whitelistedIps.map(ip => (
                  <div key={ip} className="flex justify-between items-center p-2.5 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] dark:bg-emerald-950/[0.05]">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck size={12} /> {ip}
                    </span>
                    
                    {currentUserRole === 'admin' && (
                      <button
                        onClick={() => handleRemoveIp('whitelistedIps', ip)}
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer"
                        title="إزالة الثقة"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* 4. SECURITY ALERTS */}
      {activeSubTab === 'alerts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldAlert size={16} className="text-amber-500" /> سجل الأحداث والتهديدات الأمنية النشطة
              </h4>
              <p className="text-xs text-slate-400">راجع سجلات هجمات التخمين ومحاولات الاستخدام غير المصرح به.</p>
            </div>

            {currentUserRole === 'admin' && alerts.length > 0 && (
              <button
                onClick={handleClearResolvedAlerts}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <Trash2 size={12} /> تنظيف الأحداث المحلولة
              </button>
            )}
          </div>

          <div className="space-y-3 pt-2">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/60 flex flex-col items-center justify-center gap-2">
                <ShieldCheck size={32} className="text-emerald-500" />
                <span>ممتاز! لا يوجد أي أحداث تسلل أو تنبيهات أمنية معلقة بالوقت الحالي.</span>
              </div>
            ) : (
              alerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition duration-200 ${
                    alert.resolved 
                      ? 'bg-slate-50/50 border-slate-100 dark:bg-slate-950/20 dark:border-slate-800/40 opacity-70' 
                      : alert.severity === 'critical'
                        ? 'bg-rose-500/5 border-rose-500/20'
                        : alert.severity === 'high'
                          ? 'bg-amber-500/5 border-amber-500/20'
                          : 'bg-blue-500/5 border-blue-500/20'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alert.severity === 'critical' 
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                          : alert.severity === 'high'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}>
                        {alert.severity === 'critical' ? 'حرج جداً' : alert.severity === 'high' ? 'أمان عالي' : 'إشعار'}
                      </span>
                      
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(alert.timestamp).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'medium' })}
                      </span>

                      {alert.resolved && (
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                          <CheckCircle size={10} /> تم حلها وتحييد الخطر
                        </span>
                      )}
                    </div>

                    <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">{alert.details}</h5>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-mono">
                      <span>عنوان الـ IP: {alert.ipAddress}</span>
                      <span>نظام التشغيل: {alert.userAgent}</span>
                    </div>
                  </div>

                  {!alert.resolved && currentUserRole === 'admin' && (
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Check size={12} /> حل المشكلة
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 py-3.5 px-5 rounded-2xl shadow-2xl border border-slate-800/10 dark:border-slate-100/10 max-w-sm text-right leading-relaxed font-sans shadow-purple-500/5">
          <div className={`p-1.5 rounded-xl ${
            toast.type === 'success' ? 'bg-emerald-500/15 text-emerald-500' :
            toast.type === 'error' ? 'bg-rose-500/15 text-rose-500' :
            toast.type === 'warning' ? 'bg-amber-500/15 text-amber-500' : 'bg-blue-500/15 text-blue-500'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> :
             toast.type === 'error' ? <AlertOctagon size={18} /> :
             toast.type === 'warning' ? <AlertTriangle size={18} /> : <Info size={18} />}
          </div>
          <p className="text-xs font-black">{toast.message}</p>
        </div>
      )}

      {/* Interactive Full Screen successOverlay */}
      {successOverlay && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-2 border-purple-500/30 rounded-3xl p-8 max-w-xs text-center shadow-2xl flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center animate-bounce">
              <Zap size={32} />
            </div>
            <p className="text-sm font-extrabold text-slate-950 dark:text-white leading-relaxed text-center">
              {successOverlay}
            </p>
            <div className="text-[10px] text-slate-400 font-bold">غزة كاش • حماية فائقة نشطة ⚡</div>
          </div>
        </div>
      )}

    </div>
  );
};
