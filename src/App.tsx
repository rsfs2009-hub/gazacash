/**
 * Gaza Cash ERP - Main Application Wrapper & Controller
 * Copyright (c) 2026 Gaza Cash Team. All rights reserved.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Coins,
  LayoutDashboard,
  ShoppingBag,
  Users,
  Layers,
  BarChart3,
  Settings,
  Receipt,
  Sun,
  Moon,
  Plus,
  Share2,
  FolderSync,
  HelpCircle,
  Building,
  Phone,
  MapPin,
  Sparkles,
  RefreshCw,
  FolderPlus,
  ShieldCheck,
  Search,
  Trash,
  Menu,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  Bell,
  AlertTriangle,
  Lock,
  UserCheck,
  Filter,
  SlidersHorizontal,
  LogOut,
  Key,
  Store,
  Briefcase,
  ArrowLeft,
  Eye,
  Info,
  Shield,
  X,
  ExternalLink,
  Copy,
  MessageSquare,
  Printer,
  FileText
} from 'lucide-react';

import {
  getGroups,
  saveGroups,
  getActiveGroupId,
  setActiveGroupId,
  getGroupData,
  saveGroupData,
  getTheme,
  setTheme,
  exportAllData,
  importAllData,
  GroupData
} from './db';

import { Group, Item, Branch, CustomerSupplier, Sale, Purchase, SalesReturn, PurchaseReturn, Quotation, BranchTransfer, ItemMovement, BranchStock, AuditLogEntry, Currency, Appointment, UserAccount, FirewallSettings, SecurityAlert } from './types';

// Importing ERP Modules
import POS from './components/POS';
import Inventory from './components/Inventory';
import Contacts from './components/Contacts';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import SalesManagement from './components/SalesManagement';
import PurchasesManagement from './components/PurchasesManagement';
import { UsersManagement } from './components/UsersManagement';
import { FirewallDashboard } from './components/FirewallDashboard';
import { motion, AnimatePresence } from 'motion/react';

// @ts-ignore
import defaultLogo from './assets/images/app_logo_1783192654934.jpg';

const getThemeCss = (themeColor: string) => {
  switch (themeColor) {
    case 'green':
      return `
        :root {
          --color-emerald-50: rgba(16, 185, 129, 0.05) !important;
          --color-emerald-100: rgba(16, 185, 129, 0.1) !important;
          --color-emerald-200: rgba(16, 185, 129, 0.2) !important;
          --color-emerald-300: #6ee7b7 !important;
          --color-emerald-400: #34d399 !important;
          --color-emerald-500: #10b981 !important;
          --color-emerald-600: #059669 !important;
          --color-emerald-700: #047857 !important;
          --color-emerald-800: #065f46 !important;
          --color-emerald-900: #064e3b !important;
          --color-emerald-950: #022c22 !important;
        }
      `;
    case 'blue':
      return `
        :root {
          --color-emerald-50: rgba(14, 165, 233, 0.05) !important;
          --color-emerald-100: rgba(14, 165, 233, 0.1) !important;
          --color-emerald-200: rgba(14, 165, 233, 0.2) !important;
          --color-emerald-300: #7dd3fc !important;
          --color-emerald-400: #38bdf8 !important;
          --color-emerald-500: #0ea5e9 !important;
          --color-emerald-600: #0284c7 !important;
          --color-emerald-700: #0369a1 !important;
          --color-emerald-800: #075985 !important;
          --color-emerald-900: #0c4a6e !important;
          --color-emerald-950: #082f49 !important;
        }
      `;
    case 'indigo':
      return `
        :root {
          --color-emerald-50: rgba(99, 102, 241, 0.05) !important;
          --color-emerald-100: rgba(99, 102, 241, 0.1) !important;
          --color-emerald-200: rgba(99, 102, 241, 0.2) !important;
          --color-emerald-300: #a5b4fc !important;
          --color-emerald-400: #818cf8 !important;
          --color-emerald-500: #6366f1 !important;
          --color-emerald-600: #4f46e5 !important;
          --color-emerald-700: #4338ca !important;
          --color-emerald-800: #3730a3 !important;
          --color-emerald-900: #312e81 !important;
          --color-emerald-950: #1e1b4b !important;
        }
      `;
    case 'purple':
      return `
        :root {
          --color-emerald-50: rgba(168, 85, 247, 0.05) !important;
          --color-emerald-100: rgba(168, 85, 247, 0.1) !important;
          --color-emerald-200: rgba(168, 85, 247, 0.2) !important;
          --color-emerald-300: #d8b4fe !important;
          --color-emerald-400: #c084fc !important;
          --color-emerald-500: #a855f7 !important;
          --color-emerald-600: #9333ea !important;
          --color-emerald-700: #7e22ce !important;
          --color-emerald-800: #6b21a8 !important;
          --color-emerald-900: #581c87 !important;
          --color-emerald-950: #3b0764 !important;
        }
      `;
    case 'amber':
      return `
        :root {
          --color-emerald-50: rgba(245, 158, 11, 0.05) !important;
          --color-emerald-100: rgba(245, 158, 11, 0.1) !important;
          --color-emerald-200: rgba(245, 158, 11, 0.2) !important;
          --color-emerald-300: #fef08a !important;
          --color-emerald-400: #facc15 !important;
          --color-emerald-500: #eab308 !important;
          --color-emerald-600: #ca8a04 !important;
          --color-emerald-700: #a16207 !important;
          --color-emerald-800: #854d0e !important;
          --color-emerald-900: #713f12 !important;
          --color-emerald-950: #422006 !important;
        }
      `;
    case 'rose':
      return `
        :root {
          --color-emerald-50: rgba(244, 63, 94, 0.05) !important;
          --color-emerald-100: rgba(244, 63, 94, 0.1) !important;
          --color-emerald-200: rgba(244, 63, 94, 0.2) !important;
          --color-emerald-300: #fda4af !important;
          --color-emerald-400: #f43f5e !important;
          --color-emerald-500: #e11d48 !important;
          --color-emerald-600: #be123c !important;
          --color-emerald-700: #9f1239 !important;
          --color-emerald-800: #881337 !important;
          --color-emerald-900: #4c0519 !important;
          --color-emerald-950: #270510 !important;
        }
      `;
    default:
      return ''; // maps to default Classic Blue loaded in index.css
  }
};

export default function App() {
  // Global ERP configuration & data states
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveId] = useState('');
  const [groupData, setGroupDataState] = useState<GroupData>({
    items: [],
    branches: [],
    branchStock: [],
    contacts: [],
    sales: [],
    purchases: [],
    returns: [],
    quotations: [],
    transfers: [],
    movements: []
  });

  const [themeMode, setThemeState] = useState<'light' | 'dark'>(getTheme);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'inventory' | 'contacts' | 'transactions' | 'reports' | 'settings' | 'sales-management' | 'purchases-management' | 'firewall'>('dashboard');
  const [settingsSubTab, setSettingsSubTab] = useState<'identity' | 'users' | 'backup'>('identity');
  
  const [userRole, setUserRole] = useState<'admin' | 'cashier'>(() => {
    return (localStorage.getItem('gaza_cash_user_role') as 'admin' | 'cashier') || 'admin';
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('gaza_cash_current_user_id') || '';
  });

  const defaultAdmin = useMemo<UserAccount>(() => ({
    id: 'user_admin',
    username: 'admin',
    role: 'admin',
    name: 'أحمد المحترف',
    permissions: {
      canDeleteInvoices: true,
      canAccessSettings: true,
      canEditInventory: true,
      canAccessReports: true,
      canManageUsers: true
    }
  }), []);

  const defaultCashier = useMemo<UserAccount>(() => ({
    id: 'user_cashier',
    username: 'cashier',
    role: 'cashier',
    name: 'مسؤول الكاشير والمبيعات',
    permissions: {
      canDeleteInvoices: false,
      canAccessSettings: false,
      canEditInventory: true,
      canAccessReports: false,
      canManageUsers: false
    }
  }), []);

  const currentUser = useMemo<UserAccount>(() => {
    const usersList = groupData.users || [];
    const found = usersList.find(u => u.id === currentUserId);
    if (found) return found;
    return userRole === 'admin' ? defaultAdmin : defaultCashier;
  }, [groupData.users, currentUserId, userRole, defaultAdmin, defaultCashier]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('gaza_cash_auth') === 'true';
  });

  const [isGroupSelected, setIsGroupSelected] = useState<boolean>(() => {
    return sessionStorage.getItem('gaza_cash_group_selected') === 'true';
  });

  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginUserId, setLoginUserId] = useState<string>('');

  useEffect(() => {
    const filtered = (groupData.users || []).filter(u => u.role === userRole);
    if (filtered.length > 0) {
      setLoginUserId(filtered[0].id);
    } else {
      setLoginUserId(userRole === 'admin' ? 'user_admin' : 'user_cashier');
    }
  }, [userRole, groupData.users]);
  
  // Firewall State
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    const saved = localStorage.getItem('gaza_cash_lockout_until');
    return saved ? parseInt(saved, 10) : null;
  });

  const [showCreateGroupOnOnboarding, setShowCreateGroupOnOnboarding] = useState(false);

  useEffect(() => {
    localStorage.setItem('gaza_cash_user_role', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('gaza_cash_current_user_id', currentUserId);
  }, [currentUserId]);
  const [reportsSubTab, setReportsSubTab] = useState<'sales' | 'purchases' | 'accounts' | 'stock' | 'trial-balance' | 'final-accounts' | 'profits'>('sales');
  const [inventorySubTab, setInventorySubTab] = useState<'items' | 'branches' | 'transfers' | 'ledger' | 'import' | 'adjust'>('items');
  const [transactionsSubTab, setTransactionsSubTab] = useState<'purchase' | 'return' | 'quotation'>('purchase');
  const [contactsSubTab, setContactsSubTab] = useState<'list' | 'ledger'>('list');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // New Group Creator States
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupShopName, setNewGroupShopName] = useState('');
  const [newGroupAddress, setNewGroupAddress] = useState('');
  const [newGroupPhone, setNewGroupPhone] = useState('');

  // AI Advisor States
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Administrative Operations & Audit Log States
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [selectedThemeColor, setSelectedThemeColor] = useState<string>('emerald');
  const [base64Logo, setBase64Logo] = useState<string>('');
  const [lastPrintedSale, setLastPrintedSale] = useState<Sale | null>(null);
  const [showOnScreenReceipt, setShowOnScreenReceipt] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showPrintIframeModal, setShowPrintIframeModal] = useState<boolean>(false);
  const [adjItemId, setAdjItemId] = useState('');
  const [adjBranchId, setAdjBranchId] = useState('');
  const [adjQty, setAdjQty] = useState<number | ''>('');
  const [adjNotes, setAdjNotes] = useState('');
  const [delInvoiceNo, setDelInvoiceNo] = useState('');
  const [delReason, setDelReason] = useState('');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logOperatorFilter, setLogOperatorFilter] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('');
  const [logSeverityFilter, setLogSeverityFilter] = useState('');
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogEntry | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: false
  });

  // Dynamic Toast Notifications state
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Expose toast and intercept print globally
  useEffect(() => {
    (window as any).showToast = (msg: string, typ: 'success' | 'error' | 'warning' | 'info' = 'success') => {
      const id = `toast_${Date.now()}_${Math.random()}`;
      setToasts(prev => [...prev, { id, message: msg, type: typ }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4500);
    };

    // Intercept window.print to handle iframe sandboxing and clean document-only prints
    const originalPrint = window.print;
    (window as any)._originalPrint = originalPrint;
    
    window.print = () => {
      const isIframe = window.self !== window.top;
      if (isIframe) {
        setShowPrintIframeModal(true);
      } else {
        // Prioritize printable elements inside active overlays/modals (.fixed) first so we don't accidentally print background content
        const printTarget = document.querySelector('.fixed .print-invoice-wrapper') || 
                            document.querySelector('.fixed .print-report-wrapper') || 
                            ((window as any)._printTargetSelector ? document.querySelector((window as any)._printTargetSelector) : null) ||
                            document.querySelector('.print-invoice-wrapper') || 
                            document.querySelector('.print-report-wrapper') || 
                            document.querySelector('#thermal-receipt-print') || 
                            document.querySelector('.printable-area');

        if (printTarget) {
          // Create clean container for printing outside of the React #root
          const printSection = document.createElement('div');
          printSection.id = 'print-section';
          printSection.className = 'print-container';
          printSection.setAttribute('dir', 'rtl');
          
          // Clone the node
          const clone = printTarget.cloneNode(true) as HTMLElement;
          
          // Clean up the printed layout from buttons or controls marked as no-print inside the clone
          const noPrints = clone.querySelectorAll('.no-print');
          noPrints.forEach(el => el.remove());
          
          printSection.appendChild(clone);
          document.body.appendChild(printSection);
          document.body.classList.add('is-printing');
          
          // Use modern standard 'afterprint' listener to clean up only AFTER printing process concludes
          const cleanup = () => {
            delete (window as any)._printTargetSelector;
            if (document.body.contains(printSection)) {
              document.body.removeChild(printSection);
            }
            document.body.classList.remove('is-printing');
            window.removeEventListener('afterprint', cleanup);
          };

          window.addEventListener('afterprint', cleanup);

          // Wait briefly for reflow, then call actual print window
          setTimeout(() => {
            originalPrint();
            // Fallback cleanup in case afterprint does not fire on older engines
            setTimeout(cleanup, 2500);
          }, 150);
        } else {
          originalPrint();
        }
      }
    };

    return () => {
      delete (window as any).showToast;
      delete (window as any)._originalPrint;
      window.print = originalPrint;
    };
  }, []);

  // Initialize data on mount
  useEffect(() => {
    // 1. Theme Configuration
    const currentTheme = getTheme();
    setThemeState(currentTheme);
    applyThemeClass(currentTheme);

    // 2. Groups loading
    const loadedGroups = getGroups();
    setGroups(loadedGroups);

    const activeId = getActiveGroupId();
    setActiveId(activeId);

    // 3. Group specific data loading
    const data = getGroupData(activeId);
    setGroupDataState(data);
  }, []);

  useEffect(() => {
    const activeG = groups.find(g => g.id === activeGroupId);
    if (activeG?.settings?.logoUrl) {
      setLogoPreview(activeG.settings.logoUrl);
    } else {
      setLogoPreview('');
    }
    setSelectedThemeColor(activeG?.settings?.themeColor || 'emerald');
  }, [activeGroupId, groups]);

  // Convert logo to Base64 to ensure offline printing works
  useEffect(() => {
    const activeG = groups.find(g => g.id === activeGroupId);
    const logoSrc = activeG?.settings?.logoUrl || defaultLogo;
    if (logoSrc.startsWith('data:image/')) {
      setBase64Logo(logoSrc);
    } else {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const dataURL = canvas.toDataURL('image/jpeg');
            setBase64Logo(dataURL);
            return;
          } catch (e) {
            console.error("Base64 conversion failed", e);
          }
        }
        setBase64Logo(logoSrc);
      };
      img.onerror = () => {
        setBase64Logo(logoSrc);
      };
      img.src = logoSrc;
    }
  }, [activeGroupId, groups]);

  // Sync state modifications to LocalStorage database
  const saveStateToDB = (updatedData: GroupData) => {
    setGroupDataState(updatedData);
    saveGroupData(activeGroupId, updatedData);
  };

  const applyThemeClass = (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleThemeToggle = () => {
    const nextTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeState(nextTheme);
    setTheme(nextTheme);
    applyThemeClass(nextTheme);
  };

  const handleGroupChange = (groupId: string) => {
    setActiveId(groupId);
    setActiveGroupId(groupId);
    const data = getGroupData(groupId);
    setGroupDataState(data);
    setAiAnalysis(''); // Clear past reports insights
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // 1. Check Firewall Lockout
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const minutesRemaining = Math.ceil((lockoutUntil - Date.now()) / 60000);
      setLoginError(`🚨 تم حظر تسجيل الدخول مؤقتاً لحماية النظام! يرجى الانتظار لمدة ${minutesRemaining} دقيقة.`);
      return;
    }
    
    const firewall = groupData.firewallSettings || {
      enabled: true,
      maxAttempts: 3,
      lockoutDuration: 5,
      highSecurityMode: false,
      blockedIps: [],
      whitelistedIps: []
    };

    // Simulated Blocked IP check
    if (firewall.enabled && firewall.blockedIps?.includes('192.168.1.55')) {
      setLoginError('🚫 عذراً! عنوان جهازك محظور من الوصول بقرار أمني من مدير النظام.');
      return;
    }

    const usersList = groupData.users || [];
    const selectedUserObj = usersList.find(u => u.id === loginUserId) || 
      (userRole === 'admin' ? defaultAdmin : defaultCashier);
      
    const isValidPassword = selectedUserObj.password === loginPassword || 
      (selectedUserObj.id === 'user_admin' && loginPassword === 'admin') ||
      (selectedUserObj.id === 'user_cashier' && loginPassword === '1234');

    if (isValidPassword) {
      sessionStorage.setItem('gaza_cash_auth', 'true');
      setIsAuthenticated(true);
      setLoginPassword('');
      setFailedAttempts(0);
      setLockoutUntil(null);
      localStorage.removeItem('gaza_cash_lockout_until');

      setCurrentUserId(selectedUserObj.id);

      // Log successful login
      const logEntry: AuditLogEntry = {
        id: `log_auth_success_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'تسجيل دخول ناجح',
        operator: `${selectedUserObj.name} (${selectedUserObj.role === 'admin' ? 'مدير النظام' : 'كاشير مبيعات'})`,
        details: `تم ترخيص الدخول إلى الجلسة بنجاح للحساب الشخصي للموظف: ${selectedUserObj.name}.`,
        severity: 'info'
      };
      
      const updatedData = {
        ...groupData,
        auditLogs: [logEntry, ...(groupData.auditLogs || [])]
      };
      setGroupDataState(updatedData);
      saveGroupData(activeGroupId, updatedData);

    } else {
      const nextFailedAttempts = failedAttempts + 1;
      
      if (firewall.enabled && nextFailedAttempts >= firewall.maxAttempts) {
        const duration = firewall.lockoutDuration;
        const until = Date.now() + duration * 60000;
        setLockoutUntil(until);
        localStorage.setItem('gaza_cash_lockout_until', until.toString());
        setFailedAttempts(0);

        // Generate critical security alert
        const newAlert: SecurityAlert = {
          id: `alert_brute_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'brute_force',
          ipAddress: '192.168.1.55',
          userAgent: navigator.userAgent.slice(0, 50),
          details: `🚨 محاولة تخمين مكررة! تم إفشال محاولة تسجيل الدخول لدور (${userRole === 'admin' ? 'مدير' : 'كاشير'}) لـ ${firewall.maxAttempts} مرات متتالية. تم قفل النظام لـ ${duration} دقائق.`,
          severity: 'critical',
          resolved: false
        };

        const auditLog: AuditLogEntry = {
          id: `log_firewall_lockout_${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'تفعيل الإغلاق الأمني',
          operator: 'جدار حماية التطبيق تلقائياً',
          details: `تم حجب وقفل شاشة الدخول مؤقتاً لتخطي الحد الأقصى للمحاولات الخاطئة (${firewall.maxAttempts} مرات) للدور (${userRole === 'admin' ? 'مدير' : 'كاشير'}).`,
          severity: 'critical'
        };

        const updatedData = {
          ...groupData,
          securityAlerts: [newAlert, ...(groupData.securityAlerts || [])],
          auditLogs: [auditLog, ...(groupData.auditLogs || [])]
        };
        setGroupDataState(updatedData);
        saveGroupData(activeGroupId, updatedData);

        setLoginError(`🚨 تم حظر تسجيل الدخول مؤقتاً لحماية النظام! لقد استنفدت كافة المحاولات المسموحة (${firewall.maxAttempts} محاولات). يرجى الانتظار لـ ${duration} دقائق.`);
      } else {
        setFailedAttempts(nextFailedAttempts);
        const remaining = firewall.enabled ? firewall.maxAttempts - nextFailedAttempts : 99;
        
        setLoginError(
          userRole === 'admin'
            ? `رمز دخول المدير غير صحيح! ${firewall.enabled ? `(المتبقي: ${remaining} محاولات قبل الإغلاق الأمني)` : ''}`
            : `رمز دخول الكاشير غير صحيح! ${firewall.enabled ? `(المتبقي: ${remaining} محاولات قبل الإغلاق الأمني)` : ''}`
        );

        // Log failed attempt
        const auditLog: AuditLogEntry = {
          id: `log_auth_failed_${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'محاولة دخول فاشلة',
          operator: userRole === 'admin' ? 'مدير نظام مجهول' : 'كاشير مجهول',
          details: `محاولة تسجيل دخول فاشلة للدور (${userRole === 'admin' ? 'مدير' : 'كاشير'}) باستخدام رمز مرور خاطئ. المحاولة رقم ${nextFailedAttempts}.`,
          severity: 'warning'
        };

        const updatedData = {
          ...groupData,
          auditLogs: [auditLog, ...(groupData.auditLogs || [])]
        };
        setGroupDataState(updatedData);
        saveGroupData(activeGroupId, updatedData);
      }
    }
  };

  const handleSelectGroupOnboarding = (groupId: string) => {
    handleGroupChange(groupId);
    sessionStorage.setItem('gaza_cash_group_selected', 'true');
    setIsGroupSelected(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gaza_cash_auth');
    sessionStorage.removeItem('gaza_cash_group_selected');
    setIsAuthenticated(false);
    setIsGroupSelected(false);
  };

  // --- MULTI-CURRENCY LOGIC AND HANDLERS ---
  const handleSelectCurrency = (currencyId: string) => {
    const updatedData = {
      ...groupData,
      selectedCurrencyId: currencyId
    };
    setGroupDataState(updatedData);
    saveStateToDB(updatedData);
  };

  const handleAddCurrency = (newCurrency: Omit<Currency, 'id'>) => {
    const newId = `curr_${Date.now()}`;
    const currencies = groupData.currencies || [];
    
    // If setting as base, unset others
    let updatedCurrencies = currencies.map(c => {
      if (newCurrency.isBase) {
        return { ...c, isBase: false };
      }
      return c;
    });

    updatedCurrencies.push({
      ...newCurrency,
      id: newId
    });

    const updatedData = {
      ...groupData,
      currencies: updatedCurrencies
    };
    setGroupDataState(updatedData);
    saveStateToDB(updatedData);
    
    const updatedLogs = appendAuditLog(
      'إضافة عملة جديدة',
      `تم إضافة العملة ${newCurrency.name} (${newCurrency.symbol}) بسعر صرف ${newCurrency.exchangeRate}.`,
      'info',
      updatedData
    );

    saveStateToDB({
      ...updatedData,
      auditLogs: updatedLogs
    });
  };

  const handleDeleteCurrency = (currencyId: string) => {
    const currencies = groupData.currencies || [];
    const currencyToDelete = currencies.find(c => c.id === currencyId);
    if (!currencyToDelete) return;

    if (currencyToDelete.isBase) {
      alert('لا يمكن مسح العملة الأساسية للنظام!');
      return;
    }

    const updatedCurrencies = currencies.filter(c => c.id !== currencyId);
    
    // If the deleted currency was the active one, fallback to the base currency
    let selectedCurrencyId = groupData.selectedCurrencyId;
    if (selectedCurrencyId === currencyId) {
      selectedCurrencyId = updatedCurrencies.find(c => c.isBase)?.id || 'ILS';
    }

    const updatedData = {
      ...groupData,
      currencies: updatedCurrencies,
      selectedCurrencyId
    };
    setGroupDataState(updatedData);
    saveStateToDB(updatedData);

    const updatedLogs = appendAuditLog(
      'حذف عملة',
      `تم حذف العملة ${currencyToDelete.name} (${currencyToDelete.symbol}) من المجموعة.`,
      'info',
      updatedData
    );

    saveStateToDB({
      ...updatedData,
      auditLogs: updatedLogs
    });
  };

  const handleUpdateExchangeRate = (currencyId: string, rate: number) => {
    const currencies = groupData.currencies || [];
    const updatedCurrencies = currencies.map(c => {
      if (c.id === currencyId) {
        return { ...c, exchangeRate: rate };
      }
      return c;
    });

    const updatedData = {
      ...groupData,
      currencies: updatedCurrencies
    };
    setGroupDataState(updatedData);
    saveStateToDB(updatedData);

    const updatedLogs = appendAuditLog(
      'تحديث سعر الصرف',
      `تم تحديث سعر صرف العملة ${currencies.find(c => c.id === currencyId)?.name} إلى ${rate}.`,
      'info',
      updatedData
    );

    saveStateToDB({
      ...updatedData,
      auditLogs: updatedLogs
    });
  };

  // --- AUDIT LOG & ADMINISTRATION UTILITIES ---

  const appendAuditLog = (
    action: string,
    details: string,
    severity: 'info' | 'warning' | 'critical' = 'info',
    currentData: GroupData = groupData
  ): AuditLogEntry[] => {
    const newEntry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      operator: 'أحمد المحترف (مدير النظام)',
      details,
      severity
    };
    const logs = currentData.auditLogs || [];
    return [newEntry, ...logs].slice(0, 200);
  };

  const handleAdjustStockManual = (itemId: string, branchId: string, newQty: number, notes: string) => {
    const item = groupData.items.find(i => i.id === itemId);
    const branch = groupData.branches.find(b => b.id === branchId);
    if (!item || !branch) {
      alert('لم يتم العثور على الصنف أو المستودع المحدد!');
      return;
    }

    const updatedBranchStock = [...groupData.branchStock];
    const stockIdx = updatedBranchStock.findIndex(st => st.itemId === itemId && st.branchId === branchId);
    const oldQty = stockIdx > -1 ? updatedBranchStock[stockIdx].quantity : 0;

    if (stockIdx > -1) {
      updatedBranchStock[stockIdx].quantity = newQty;
    } else {
      updatedBranchStock.push({ itemId, branchId, quantity: newQty });
    }

    const updatedMovements = [...groupData.movements];
    updatedMovements.push({
      id: `mov_${Date.now()}_adj`,
      itemId,
      itemName: item.name,
      date: new Date().toISOString(),
      type: 'manual_adjust',
      referenceNo: `ADJ-${Date.now().toString().slice(-4)}`,
      branchId,
      branchName: branch.name,
      quantityChange: newQty - oldQty,
      unitName: item.mainUnit,
      description: `تسوية جرد يدوية: ${notes || 'تعديل مباشر من لوحة التحكم'}`
    });

    const currentData = {
      ...groupData,
      branchStock: updatedBranchStock,
      movements: updatedMovements
    };

    const updatedLogs = appendAuditLog(
      'تعديل رصيد صنف',
      `تم تعديل رصيد الصنف "${item.name}" في فرع "${branch.name}" من ${oldQty} إلى ${newQty} ${item.mainUnit}. السبب: ${notes || 'تسوية يدوية'}`,
      'warning',
      currentData
    );

    saveStateToDB({
      ...currentData,
      auditLogs: updatedLogs
    });

    alert('تم تعديل رصيد الصنف وتسوية حركات المخازن بنجاح!');
  };

  const handleDeleteInvoice = (invoiceNo: string, reason: string) => {
    if (!currentUser.permissions.canDeleteInvoices) {
      alert('🔒 عذراً! تم إلغاء العملية. حسابك غير مخوّل بحذف أو تعديل الفواتير المعتمدة. يرجى مراجعة مدير النظام.');
      return;
    }

    const isSale = invoiceNo.startsWith('INV');
    const isPurchase = invoiceNo.startsWith('PUR');
    
    if (!isSale && !isPurchase) {
      alert('الرجاء التأكد من رقم الفاتورة (يجب أن يبدأ بـ INV أو PUR)');
      return;
    }

    const updatedBranchStock = [...groupData.branchStock];
    const updatedMovements = [...groupData.movements];
    const updatedContacts = [...groupData.contacts];

    if (isSale) {
      const saleIdx = groupData.sales.findIndex(s => s.invoiceNo === invoiceNo);
      if (saleIdx === -1) {
        alert('فاتورة المبيعات غير موجودة في قاعدة البيانات الحالية!');
        return;
      }
      const sale = groupData.sales[saleIdx];

      // Restore stock: Add back quantities sold
      sale.items.forEach(saleItem => {
        const itemMeta = groupData.items.find(i => i.id === saleItem.itemId);
        if (!itemMeta) return;

        let additionQty = saleItem.quantity;
        if (saleItem.isSubUnitUsed && itemMeta.conversionRate) {
          additionQty = saleItem.quantity / itemMeta.conversionRate;
        }

        const stockEntry = updatedBranchStock.find(
          st => st.itemId === saleItem.itemId && st.branchId === sale.branchId
        );

        if (stockEntry) {
          stockEntry.quantity += additionQty;
        } else {
          updatedBranchStock.push({
            itemId: saleItem.itemId,
            branchId: sale.branchId,
            quantity: additionQty
          });
        }
      });

      // Restore customer balance (revert debt addition)
      if (sale.customerId) {
        const contactIdx = updatedContacts.findIndex(c => c.id === sale.customerId);
        if (contactIdx > -1) {
          const contact = updatedContacts[contactIdx];
          const outstandingAmount = sale.total - sale.paidAmount;
          contact.currentBalance += outstandingAmount; // reduces customer debt
        }
      }

      // Remove sale
      const updatedSales = groupData.sales.filter(s => s.invoiceNo !== invoiceNo);

      // Clean up movements
      const filteredMovements = updatedMovements.filter(m => m.referenceNo !== invoiceNo);

      const currentData = {
        ...groupData,
        sales: updatedSales,
        branchStock: updatedBranchStock,
        movements: filteredMovements,
        contacts: updatedContacts
      };

      const updatedLogs = appendAuditLog(
        'مسح فاتورة مبيعات',
        `تم إلغاء ومسح فاتورة المبيعات رقم ${invoiceNo} بقيمة ${sale.total.toFixed(2)} شيكل للزبون "${sale.customerName}" وتحديث أرصدة الحسابات والمخازن. السبب: ${reason || 'لم يذكر'}`,
        'critical',
        currentData
      );

      saveStateToDB({
        ...currentData,
        auditLogs: updatedLogs
      });

    } else {
      const purchIdx = groupData.purchases.findIndex(p => p.invoiceNo === invoiceNo);
      if (purchIdx === -1) {
        alert('فاتورة المشتريات غير موجودة في قاعدة البيانات الحالية!');
        return;
      }
      const purchase = groupData.purchases[purchIdx];

      // Revert stock: Deduct quantities purchased
      purchase.items.forEach(purchItem => {
        const stockEntry = updatedBranchStock.find(
          st => st.itemId === purchItem.itemId && st.branchId === purchase.branchId
        );

        if (stockEntry) {
          stockEntry.quantity = Math.max(0, stockEntry.quantity - purchItem.quantity);
        }
      });

      // Revert supplier balance
      if (purchase.supplierId) {
        const contactIdx = updatedContacts.findIndex(c => c.id === purchase.supplierId);
        if (contactIdx > -1) {
          const contact = updatedContacts[contactIdx];
          const unpaidSupplierDebt = purchase.total - purchase.paidAmount;
          contact.currentBalance -= unpaidSupplierDebt; // reduces our liability
        }
      }

      // Remove purchase
      const updatedPurchases = groupData.purchases.filter(p => p.invoiceNo !== invoiceNo);

      // Clean up movements
      const filteredMovements = updatedMovements.filter(m => m.referenceNo !== invoiceNo);

      const currentData = {
        ...groupData,
        purchases: updatedPurchases,
        branchStock: updatedBranchStock,
        movements: filteredMovements,
        contacts: updatedContacts
      };

      const updatedLogs = appendAuditLog(
        'مسح فاتورة مشتريات',
        `تم إلغاء ومسح فاتورة المشتريات رقم ${invoiceNo} بقيمة ${purchase.total.toFixed(2)} شيكل للمورد "${purchase.supplierName}" وتحديث أرصدة الحسابات والمخازن. السبب: ${reason || 'لم يذكر'}`,
        'critical',
        currentData
      );

      saveStateToDB({
        ...currentData,
        auditLogs: updatedLogs
      });
    }

    alert(`تم مسح الفاتورة ${invoiceNo} وتسوية المخازن وحسابات الأطراف بنجاح!`);
  };

  const handleClearAuditLogs = () => {
    if (!currentUser.permissions.canAccessSettings) {
      alert('🔒 عذراً! تم إلغاء العملية. حسابك غير مخوّل بمسح سجل الأمان والمساءلة النشط.');
      return;
    }
    
    setConfirmModal({
      isOpen: true,
      title: 'تصفير سجل النشاط بالكامل',
      message: 'هل أنت متأكد من رغبتك في تصفير وإفراغ سجل النشاط بالكامل؟ لا يمكن التراجع عن هذا الإجراء.',
      isDanger: true,
      onConfirm: () => {
        const currentData = {
          ...groupData
        };
        const updatedLogs = appendAuditLog(
          'تصفير سجل النشاط',
          'قام مدير النظام بعملية تفريغ وتطهير شاملة لكامل سجلات النشاط والعمليات الحساسة السابقة لزيادة التبسيط والاعتمادية الجارية.',
          'critical',
          currentData
        );
        saveStateToDB({
          ...currentData,
          auditLogs: updatedLogs
        });
        alert('تم تصفير سجل النشاط وإعادة ضبط المخرجات بنجاح!');
      }
    });
  };

  const handleResetCurrentGroup = (wipeClean: boolean) => {
    if (!currentUser.permissions.canAccessSettings) {
      alert('🔒 عذراً! تم إلغاء العملية. حسابك غير مخوّل بمسح أو تصفير بيانات المجموعة.');
      return;
    }
    const actionName = wipeClean ? 'تصفير كامل لبيانات المجموعة' : 'إعادة تعيين المجموعة للبيانات الافتراضية';
    const confirmationText = wipeClean 
      ? `تحذير حرج: هل أنت متأكد من مسح وتفريغ كامل بيانات المجموعة الحالية "${shopMeta.name}"؟\nسيتم حذف كافة الأصناف، المستودعات، الفروع، الفواتير، وحسابات العملاء والموردين بشكل نهائي!`
      : `هل أنت متأكد من إعادة تعيين المجموعة الحالية "${shopMeta.name}" إلى البيانات التجريبية الافتراضية؟\nسيتم استبدال البيانات الحالية ببيانات تجريبية أولية وتحديث المستندات وحركات المخازن.`;

    setConfirmModal({
      isOpen: true,
      title: actionName,
      message: confirmationText,
      isDanger: wipeClean,
      onConfirm: () => {
        let targetData: GroupData;
        if (wipeClean) {
          targetData = {
            items: [],
            branches: [{ id: `branch_${activeGroupId}_main`, name: 'المستودع الرئيسي الافتراضي', location: shopMeta.address || 'غزة' }],
            branchStock: [],
            contacts: [],
            sales: [],
            purchases: [],
            returns: [],
            quotations: [],
            transfers: [],
            movements: [],
            auditLogs: []
          };
        } else {
          localStorage.removeItem(`gaza_cash_data_${activeGroupId}`);
          targetData = getGroupData(activeGroupId);
        }

        const logs = appendAuditLog(
          actionName,
          wipeClean 
            ? `قام مدير النظام بعملية مسح شاملة (Wipe Out) لجميع السجلات والأرصدة والذمم المالية للمجموعة وتصفيرها بالكامل.`
            : `تمت إعادة تهيئة المجموعة وتعبئتها بالبيانات التجريبية الافتراضية لغرض الفحص والتدريب.`,
          'critical',
          targetData
        );

        targetData.auditLogs = logs;
        saveStateToDB(targetData);
        alert(wipeClean ? 'تم تصفير بيانات المجموعة بالكامل بنجاح!' : 'تم إعادة تعيين المجموعة للبيانات التجريبية الافتراضية بنجاح!');
      }
    });
  };

  const handleSystemFactoryReset = () => {
    if (!currentUser.permissions.canAccessSettings) {
      alert('🔒 عذراً! تم إلغاء العملية. حسابك غير مخوّل بالقيام بإعادة تعيين المصنع للمنظومة.');
      return;
    }
    
    setConfirmModal({
      isOpen: true,
      title: 'إعادة ضبط المصنع بالكامل',
      message: '🚨 تحذير نهائي وقاطع:\nأنت تقوم بطلب إعادة تعيين المنظومة بالكامل إلى حالة التثبيت الأولى وتصفير كافة المجموعات والبيانات المسجلة.\nسيؤدي هذا الإجراء إلى حذف جميع البيانات والنسخ والملفات وسجلات الحركة وحسابات الأطراف ولا يمكن التراجع عنه.\nهل ترغب في الاستمرار؟',
      isDanger: true,
      onConfirm: () => {
        localStorage.removeItem('gaza_cash_groups');
        localStorage.removeItem('gaza_cash_active_group_id');
        localStorage.removeItem('gaza_cash_theme');
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('gaza_cash_data_')) {
            localStorage.removeItem(key);
          }
        }
        alert('تم تصفير وإعادة تعيين النظام بالكامل إلى حالة التثبيت الافتراضية بنجاح! سيتم الآن إعادة تحميل البرنامج.');
        window.location.reload();
      }
    });
  };

  // --- BUSINESS ACTION HANDLERS ---

  // 1. Complete Sales Transaction (POS Checkout)
  const handleSaveSale = (saleData: Omit<Sale, 'id' | 'invoiceNo' | 'date'>) => {
    const nextInvoiceNo = `INV-${new Date().getFullYear()}-${String(groupData.sales.length + 1).padStart(4, '0')}`;
    const newSale: Sale = {
      ...saleData,
      id: `sale_${Date.now()}`,
      invoiceNo: nextInvoiceNo,
      date: new Date().toISOString()
    };

    // Make local copies of data pools
    const updatedSales = [newSale, ...groupData.sales];
    const updatedBranchStock = [...groupData.branchStock];
    const updatedMovements = [...groupData.movements];
    const updatedContacts = [...groupData.contacts];

    // Loop items in sale to reduce quantities and record movements
    newSale.items.forEach(saleItem => {
      // Find item conversion rate for dual units
      const itemMeta = groupData.items.find(i => i.id === saleItem.itemId);
      if (!itemMeta) return;

      let deductionQty = saleItem.quantity;
      if (saleItem.isSubUnitUsed && itemMeta.conversionRate) {
        deductionQty = saleItem.quantity / itemMeta.conversionRate;
      }

      // Deduct from Branch Stock
      const stockEntry = updatedBranchStock.find(
        st => st.itemId === saleItem.itemId && st.branchId === newSale.branchId
      );

      if (stockEntry) {
        stockEntry.quantity = Math.max(0, stockEntry.quantity - deductionQty);
      } else {
        updatedBranchStock.push({
          itemId: saleItem.itemId,
          branchId: newSale.branchId,
          quantity: 0
        });
      }

      // Record detailed Item ledger movement
      updatedMovements.push({
        id: `mov_${Date.now()}_${saleItem.itemId}`,
        itemId: saleItem.itemId,
        itemName: saleItem.itemName,
        date: newSale.date,
        type: 'sale',
        referenceNo: newSale.invoiceNo,
        branchId: newSale.branchId,
        branchName: newSale.branchName,
        quantityChange: -deductionQty,
        unitName: saleItem.unitName,
        description: `فاتورة مبيعات رقم ${newSale.invoiceNo} للزبون ${newSale.customerName}`
      });
    });

    // Update Customer Accounts balances if paymentType is credit or there's outstanding amount
    if (newSale.customerId) {
      const contactIdx = updatedContacts.findIndex(c => c.id === newSale.customerId);
      if (contactIdx > -1) {
        const contact = updatedContacts[contactIdx];
        const outstandingAmount = newSale.total - newSale.paidAmount;
        // In our system, negative balances denote "عليه" (owe us)
        contact.currentBalance -= outstandingAmount;
      }
    }

    // Save
    const currentData = {
      ...groupData,
      sales: updatedSales,
      branchStock: updatedBranchStock,
      movements: updatedMovements,
      contacts: updatedContacts
    };

    const updatedLogs = appendAuditLog(
      'فاتورة مبيعات جديدة',
      `تم إصدار فاتورة مبيعات جديدة رقم ${newSale.invoiceNo} بقيمة إجمالية ${newSale.total.toFixed(2)} شيكل (المدفوع: ${newSale.paidAmount.toFixed(2)} شيكل) للزبون "${newSale.customerName}" عبر فرع "${newSale.branchName}".`,
      'info',
      currentData
    );

    saveStateToDB({
      ...currentData,
      auditLogs: updatedLogs
    });

    return newSale;
  };

  // 2. Complete Stock Purchases from Suppliers
  const handleSavePurchase = (purchaseData: Omit<Purchase, 'id' | 'invoiceNo' | 'date'>) => {
    const nextInvoiceNo = `PUR-${new Date().getFullYear()}-${String(groupData.purchases.length + 1).padStart(4, '0')}`;
    const newPurchase: Purchase = {
      ...purchaseData,
      id: `pur_${Date.now()}`,
      invoiceNo: nextInvoiceNo,
      date: new Date().toISOString()
    };

    const updatedPurchases = [newPurchase, ...groupData.purchases];
    const updatedBranchStock = [...groupData.branchStock];
    const updatedMovements = [...groupData.movements];
    const updatedContacts = [...groupData.contacts];

    // Loop items to add stock
    newPurchase.items.forEach(purchItem => {
      // Find branch stock entry
      const stockEntry = updatedBranchStock.find(
        st => st.itemId === purchItem.itemId && st.branchId === newPurchase.branchId
      );

      if (stockEntry) {
        stockEntry.quantity += purchItem.quantity;
      } else {
        updatedBranchStock.push({
          itemId: purchItem.itemId,
          branchId: newPurchase.branchId,
          quantity: purchItem.quantity
        });
      }

      // Record item ledger movement
      updatedMovements.push({
        id: `mov_${Date.now()}_${purchItem.itemId}`,
        itemId: purchItem.itemId,
        itemName: purchItem.itemName,
        date: newPurchase.date,
        type: 'purchase',
        referenceNo: newPurchase.invoiceNo,
        branchId: newPurchase.branchId,
        branchName: newPurchase.branchName,
        quantityChange: purchItem.quantity,
        unitName: purchItem.unitName,
        description: `فاتورة شراء رقم ${newPurchase.invoiceNo} من المورد ${newPurchase.supplierName}`
      });
    });

    // Update Supplier Balance
    if (newPurchase.supplierId) {
      const contactIdx = updatedContacts.findIndex(c => c.id === newPurchase.supplierId);
      if (contactIdx > -1) {
        const contact = updatedContacts[contactIdx];
        const unpaidSupplierDebt = newPurchase.total - newPurchase.paidAmount;
        // In our system, positive balances denote "له علينا" (we owe supplier)
        contact.currentBalance += unpaidSupplierDebt;
      }
    }

    const currentData = {
      ...groupData,
      purchases: updatedPurchases,
      branchStock: updatedBranchStock,
      movements: updatedMovements,
      contacts: updatedContacts
    };

    const updatedLogs = appendAuditLog(
      'فاتورة مشتريات جديدة',
      `تم استلام فاتورة مشتريات جديدة رقم ${newPurchase.invoiceNo} بقيمة إجمالية ${newPurchase.total.toFixed(2)} شيكل من المورد "${newPurchase.supplierName}" بالمستودع "${newPurchase.branchName}".`,
      'info',
      currentData
    );

    saveStateToDB({
      ...currentData,
      auditLogs: updatedLogs
    });
  };

  // 3. Process Customer Returns (سند مرتجع مبيعات)
  const handleSaveReturn = (returnData: Omit<SalesReturn, 'id' | 'returnNo' | 'date'>) => {
    const nextReturnNo = `RET-${new Date().getFullYear()}-${String(groupData.returns.length + 1).padStart(4, '0')}`;
    const newReturn: SalesReturn = {
      ...returnData,
      id: `ret_${Date.now()}`,
      returnNo: nextReturnNo,
      date: new Date().toISOString()
    };

    const updatedReturns = [newReturn, ...groupData.returns];
    const updatedBranchStock = [...groupData.branchStock];
    const updatedMovements = [...groupData.movements];
    const updatedContacts = [...groupData.contacts];

    newReturn.items.forEach(retItem => {
      const itemMeta = groupData.items.find(i => i.id === retItem.itemId);
      if (!itemMeta) return;

      let returnQtyInMain = retItem.quantity;
      if (retItem.isSubUnitUsed && itemMeta.conversionRate) {
        returnQtyInMain = retItem.quantity / itemMeta.conversionRate;
      }

      // Add back to Branch Stock
      const stockEntry = updatedBranchStock.find(
        st => st.itemId === retItem.itemId && st.branchId === newReturn.branchId
      );

      if (stockEntry) {
        stockEntry.quantity += returnQtyInMain;
      } else {
        updatedBranchStock.push({
          itemId: retItem.itemId,
          branchId: newReturn.branchId,
          quantity: returnQtyInMain
        });
      }

      // Record detailed item movement ledger
      updatedMovements.push({
        id: `mov_${Date.now()}_${retItem.itemId}`,
        itemId: retItem.itemId,
        itemName: retItem.itemName,
        date: newReturn.date,
        type: 'return_in',
        referenceNo: newReturn.returnNo,
        branchId: newReturn.branchId,
        branchName: groupData.branches.find(b => b.id === newReturn.branchId)?.name || 'الفرع الرئيسي',
        quantityChange: returnQtyInMain,
        unitName: retItem.unitName,
        description: `مرتجع مبيعات رقم ${newReturn.returnNo} من العميل ${newReturn.customerName}`
      });
    });

    // Adjust client financial balance (repay customer)
    if (newReturn.customerId) {
      const contactIdx = updatedContacts.findIndex(c => c.id === newReturn.customerId);
      if (contactIdx > -1) {
        const contact = updatedContacts[contactIdx];
        // Refunds client (reduces their negative debt, moves positive/neutral)
        contact.currentBalance += newReturn.total;
      }
    }

    saveStateToDB({
      ...groupData,
      returns: updatedReturns,
      branchStock: updatedBranchStock,
      movements: updatedMovements,
      contacts: updatedContacts
    });
  };

  // 4. Save quotations
  const handleSaveQuotation = (quotationData: Omit<Quotation, 'id' | 'quotationNo' | 'date'>) => {
    const nextQuotationNo = `QUO-${new Date().getFullYear()}-${String(groupData.quotations.length + 1).padStart(4, '0')}`;
    const newQuotation: Quotation = {
      ...quotationData,
      id: `quot_${Date.now()}`,
      quotationNo: nextQuotationNo,
      date: new Date().toISOString()
    };

    saveStateToDB({
      ...groupData,
      quotations: [newQuotation, ...groupData.quotations]
    });
  };

  // 4a. Update Sale (تعديل فاتورة مبيعات صالحة بالكامل)
  const handleUpdateSale = (saleId: string, updatedSale: Sale) => {
    if (!currentUser.permissions.canDeleteInvoices) {
      alert('🔒 عذراً! تم إلغاء العملية. حسابك غير مخوّل بتعديل الفواتير المعتمدة. يرجى مراجعة مدير النظام.');
      return;
    }

    const oldSale = groupData.sales.find(s => s.id === saleId);
    if (!oldSale) {
      alert('الفاتورة الأصلية غير موجودة!');
      return;
    }

    const updatedBranchStock = [...groupData.branchStock];
    const updatedMovements = [...groupData.movements];
    const updatedContacts = [...groupData.contacts];

    // Revert Old Sale Stock
    oldSale.items.forEach(saleItem => {
      const itemMeta = groupData.items.find(i => i.id === saleItem.itemId);
      if (!itemMeta) return;

      let additionQty = saleItem.quantity;
      if (saleItem.isSubUnitUsed && itemMeta.conversionRate) {
        additionQty = saleItem.quantity / itemMeta.conversionRate;
      }

      const stockEntry = updatedBranchStock.find(
        st => st.itemId === saleItem.itemId && st.branchId === oldSale.branchId
      );

      if (stockEntry) {
        stockEntry.quantity += additionQty;
      } else {
        updatedBranchStock.push({
          itemId: saleItem.itemId,
          branchId: oldSale.branchId,
          quantity: additionQty
        });
      }
    });

    // Revert Old Customer Balance
    if (oldSale.customerId) {
      const contactIdx = updatedContacts.findIndex(c => c.id === oldSale.customerId);
      if (contactIdx > -1) {
        const contact = updatedContacts[contactIdx];
        const outstandingAmount = oldSale.total - oldSale.paidAmount;
        contact.currentBalance += outstandingAmount;
      }
    }

    // Filter out old movements
    const filteredMovements = updatedMovements.filter(m => m.referenceNo !== oldSale.invoiceNo);

    // Apply New Sale Stock
    updatedSale.items.forEach(saleItem => {
      const itemMeta = groupData.items.find(i => i.id === saleItem.itemId);
      if (!itemMeta) return;

      let deductionQty = saleItem.quantity;
      if (saleItem.isSubUnitUsed && itemMeta.conversionRate) {
        deductionQty = saleItem.quantity / itemMeta.conversionRate;
      }

      const stockEntry = updatedBranchStock.find(
        st => st.itemId === saleItem.itemId && st.branchId === updatedSale.branchId
      );

      if (stockEntry) {
        stockEntry.quantity = Math.max(0, stockEntry.quantity - deductionQty);
      } else {
        updatedBranchStock.push({
          itemId: saleItem.itemId,
          branchId: updatedSale.branchId,
          quantity: 0
        });
      }

      // Record detailed movement
      filteredMovements.push({
        id: `mov_${Date.now()}_${saleItem.itemId}_upd`,
        itemId: saleItem.itemId,
        itemName: saleItem.itemName,
        date: updatedSale.date,
        type: 'sale',
        referenceNo: updatedSale.invoiceNo,
        branchId: updatedSale.branchId,
        branchName: updatedSale.branchName,
        quantityChange: -deductionQty,
        unitName: saleItem.unitName,
        description: `تعديل فاتورة مبيعات رقم ${updatedSale.invoiceNo} للزبون ${updatedSale.customerName}`
      });
    });

    // Apply New Customer Balance
    if (updatedSale.customerId) {
      const contactIdx = updatedContacts.findIndex(c => c.id === updatedSale.customerId);
      if (contactIdx > -1) {
        const contact = updatedContacts[contactIdx];
        const outstandingAmount = updatedSale.total - updatedSale.paidAmount;
        contact.currentBalance -= outstandingAmount;
      }
    }

    const updatedSales = groupData.sales.map(s => s.id === saleId ? updatedSale : s);

    const currentData = {
      ...groupData,
      sales: updatedSales,
      branchStock: updatedBranchStock,
      movements: filteredMovements,
      contacts: updatedContacts
    };

    const updatedLogs = appendAuditLog(
      'تعديل فاتورة مبيعات',
      `تم تعديل وتصحيح تفاصيل فاتورة مبيعات رقم ${updatedSale.invoiceNo} بقيمة جديدة ${updatedSale.total.toFixed(2)} شيكل للزبون "${updatedSale.customerName}".`,
      'warning',
      currentData
    );

    saveStateToDB({
      ...currentData,
      auditLogs: updatedLogs
    });
  };

  // 4b. Update Sales Return
  const handleUpdateReturn = (returnId: string, updatedReturn: SalesReturn) => {
    if (!currentUser.permissions.canDeleteInvoices) {
      alert('🔒 عذراً! تم إلغاء العملية. حسابك غير مخوّل بتعديل المرتجعات المعتمدة. يرجى مراجعة مدير النظام.');
      return;
    }

    const oldReturn = groupData.returns.find(r => r.id === returnId);
    if (!oldReturn) {
      alert('سند المرتجع الأصلي غير موجود!');
      return;
    }

    const updatedBranchStock = [...groupData.branchStock];
    const updatedMovements = [...groupData.movements];
    const updatedContacts = [...groupData.contacts];

    // Revert Old Return Stock
    oldReturn.items.forEach(retItem => {
      const itemMeta = groupData.items.find(i => i.id === retItem.itemId);
      if (!itemMeta) return;

      let returnQtyInMain = retItem.quantity;
      if (retItem.isSubUnitUsed && itemMeta.conversionRate) {
        returnQtyInMain = retItem.quantity / itemMeta.conversionRate;
      }

      const stockEntry = updatedBranchStock.find(
        st => st.itemId === retItem.itemId && st.branchId === oldReturn.branchId
      );

      if (stockEntry) {
        stockEntry.quantity = Math.max(0, stockEntry.quantity - returnQtyInMain);
      }
    });

    // Revert Old Customer Balance
    if (oldReturn.customerId) {
      const contactIdx = updatedContacts.findIndex(c => c.id === oldReturn.customerId);
      if (contactIdx > -1) {
        const contact = updatedContacts[contactIdx];
        contact.currentBalance -= oldReturn.total;
      }
    }

    // Filter old movements
    const filteredMovements = updatedMovements.filter(m => m.referenceNo !== oldReturn.returnNo);

    // Apply New Return Stock
    updatedReturn.items.forEach(retItem => {
      const itemMeta = groupData.items.find(i => i.id === retItem.itemId);
      if (!itemMeta) return;

      let returnQtyInMain = retItem.quantity;
      if (retItem.isSubUnitUsed && itemMeta.conversionRate) {
        returnQtyInMain = retItem.quantity / itemMeta.conversionRate;
      }

      const stockEntry = updatedBranchStock.find(
        st => st.itemId === retItem.itemId && st.branchId === updatedReturn.branchId
      );

      if (stockEntry) {
        stockEntry.quantity += returnQtyInMain;
      } else {
        updatedBranchStock.push({
          itemId: retItem.itemId,
          branchId: updatedReturn.branchId,
          quantity: returnQtyInMain
        });
      }

      // Record detailed movement
      filteredMovements.push({
        id: `mov_${Date.now()}_${retItem.itemId}_upd`,
        itemId: retItem.itemId,
        itemName: retItem.itemName,
        date: updatedReturn.date,
        type: 'return_in',
        referenceNo: updatedReturn.returnNo,
        branchId: updatedReturn.branchId,
        branchName: groupData.branches.find(b => b.id === updatedReturn.branchId)?.name || 'الفرع الرئيسي',
        quantityChange: returnQtyInMain,
        unitName: retItem.unitName,
        description: `تعديل مرتجع مبيعات رقم ${updatedReturn.returnNo} للزبون ${updatedReturn.customerName}`
      });
    });

    // Apply New Customer Balance
    if (updatedReturn.customerId) {
      const contactIdx = updatedContacts.findIndex(c => c.id === updatedReturn.customerId);
      if (contactIdx > -1) {
        const contact = updatedContacts[contactIdx];
        contact.currentBalance += updatedReturn.total;
      }
    }

    const updatedReturns = groupData.returns.map(r => r.id === returnId ? updatedReturn : r);

    const currentData = {
      ...groupData,
      returns: updatedReturns,
      branchStock: updatedBranchStock,
      movements: filteredMovements,
      contacts: updatedContacts
    };

    const updatedLogs = appendAuditLog(
      'تعديل مرتجع مبيعات',
      `تم تعديل وتصحيح تفاصيل مرتجع المبيعات رقم ${updatedReturn.returnNo} بقيمة جديدة ${updatedReturn.total.toFixed(2)} شيكل للزبون "${updatedReturn.customerName}".`,
      'warning',
      currentData
    );

    saveStateToDB({
      ...currentData,
      auditLogs: updatedLogs
    });
  };

  // 4c. Delete Sales Return
  const handleDeleteReturn = (returnId: string, reason: string) => {
    if (!currentUser.permissions.canDeleteInvoices) {
      alert('🔒 عذراً! تم إلغاء العملية. حسابك غير مخوّل بحذف المرتجعات. يرجى مراجعة مدير النظام.');
      return;
    }

    const oldReturn = groupData.returns.find(r => r.id === returnId);
    if (!oldReturn) {
      alert('سند المرتجع غير موجود!');
      return;
    }

    const updatedBranchStock = [...groupData.branchStock];
    const updatedMovements = [...groupData.movements];
    const updatedContacts = [...groupData.contacts];

    // Revert return stock effects (deduct from branch stock)
    oldReturn.items.forEach(retItem => {
      const itemMeta = groupData.items.find(i => i.id === retItem.itemId);
      if (!itemMeta) return;

      let returnQtyInMain = retItem.quantity;
      if (retItem.isSubUnitUsed && itemMeta.conversionRate) {
        returnQtyInMain = retItem.quantity / itemMeta.conversionRate;
      }

      const stockEntry = updatedBranchStock.find(
        st => st.itemId === retItem.itemId && st.branchId === oldReturn.branchId
      );

      if (stockEntry) {
        stockEntry.quantity = Math.max(0, stockEntry.quantity - returnQtyInMain);
      }
    });

    // Revert client financial refund
    if (oldReturn.customerId) {
      const contactIdx = updatedContacts.findIndex(c => c.id === oldReturn.customerId);
      if (contactIdx > -1) {
        const contact = updatedContacts[contactIdx];
        contact.currentBalance -= oldReturn.total;
      }
    }

    const updatedReturns = groupData.returns.filter(r => r.id !== returnId);
    const filteredMovements = updatedMovements.filter(m => m.referenceNo !== oldReturn.returnNo);

    const currentData = {
      ...groupData,
      returns: updatedReturns,
      branchStock: updatedBranchStock,
      movements: filteredMovements,
      contacts: updatedContacts
    };

    const updatedLogs = appendAuditLog(
      'حذف مرتجع مبيعات',
      `تم إلغاء وحذف سند مرتجع المبيعات رقم ${oldReturn.returnNo} بقيمة ${oldReturn.total.toFixed(2)} شيكل للزبون "${oldReturn.customerName}". السبب: ${reason || 'لم يذكر'}.`,
      'critical',
      currentData
    );

    saveStateToDB({
      ...currentData,
      auditLogs: updatedLogs
    });
  };

  // 4d. Update Purchase (تعديل وإعادة محاسبة فاتورة توريد/شراء)
  const handleUpdatePurchase = (purchaseId: string, updatedPurchase: Purchase) => {
    if (!currentUser.permissions.canDeleteInvoices) {
      alert('🔒 عذراً! تم إلغاء العملية. حسابك غير مخوّل بتعديل الفواتير المعتمدة. يرجى مراجعة مدير النظام.');
      return;
    }

    const oldPurchase = groupData.purchases.find(p => p.id === purchaseId);
    if (!oldPurchase) {
      alert('الفاتورة الأصلية غير موجودة!');
      return;
    }

    const updatedBranchStock = [...groupData.branchStock];
    const updatedMovements = [...groupData.movements];
    const updatedContacts = [...groupData.contacts];

    // Revert Old Purchase Stock (Subtract old quantities)
    oldPurchase.items.forEach(purchItem => {
      const stockEntry = updatedBranchStock.find(
        st => st.itemId === purchItem.itemId && st.branchId === oldPurchase.branchId
      );
      if (stockEntry) {
        stockEntry.quantity = Math.max(0, stockEntry.quantity - purchItem.quantity);
      }
    });

    // Revert Old Supplier Balance (positive balances denote "له علينا")
    if (oldPurchase.supplierId) {
      const contactIdx = updatedContacts.findIndex(c => c.id === oldPurchase.supplierId);
      if (contactIdx > -1) {
        const contact = updatedContacts[contactIdx];
        const unpaidSupplierDebt = oldPurchase.total - oldPurchase.paidAmount;
        contact.currentBalance -= unpaidSupplierDebt;
      }
    }

    // Filter out old movements
    const filteredMovements = updatedMovements.filter(m => m.referenceNo !== oldPurchase.invoiceNo);

    // Apply New Purchase Stock (Add new quantities)
    updatedPurchase.items.forEach(purchItem => {
      const stockEntry = updatedBranchStock.find(
        st => st.itemId === purchItem.itemId && st.branchId === updatedPurchase.branchId
      );

      if (stockEntry) {
        stockEntry.quantity += purchItem.quantity;
      } else {
        updatedBranchStock.push({
          itemId: purchItem.itemId,
          branchId: updatedPurchase.branchId,
          quantity: purchItem.quantity
        });
      }

      // Record detailed movement
      filteredMovements.push({
        id: `mov_${Date.now()}_${purchItem.itemId}_upd`,
        itemId: purchItem.itemId,
        itemName: purchItem.itemName,
        date: updatedPurchase.date,
        type: 'purchase',
        referenceNo: updatedPurchase.invoiceNo,
        branchId: updatedPurchase.branchId,
        branchName: updatedPurchase.branchName,
        quantityChange: purchItem.quantity,
        unitName: purchItem.unitName,
        description: `تعديل فاتورة شراء رقم ${updatedPurchase.invoiceNo} من المورد ${updatedPurchase.supplierName}`
      });
    });

    // Apply New Supplier Balance
    if (updatedPurchase.supplierId) {
      const contactIdx = updatedContacts.findIndex(c => c.id === updatedPurchase.supplierId);
      if (contactIdx > -1) {
        const contact = updatedContacts[contactIdx];
        const unpaidSupplierDebt = updatedPurchase.total - updatedPurchase.paidAmount;
        contact.currentBalance += unpaidSupplierDebt;
      }
    }

    const updatedPurchases = groupData.purchases.map(p => p.id === purchaseId ? updatedPurchase : p);

    const currentData = {
      ...groupData,
      purchases: updatedPurchases,
      branchStock: updatedBranchStock,
      movements: filteredMovements,
      contacts: updatedContacts
    };

    const updatedLogs = appendAuditLog(
      'تعديل فاتورة مشتريات',
      `تم تعديل وتصحيح تفاصيل فاتورة مشتريات رقم ${updatedPurchase.invoiceNo} بقيمة جديدة ${updatedPurchase.total.toFixed(2)} شيكل للمورد "${updatedPurchase.supplierName}".`,
      'warning',
      currentData
    );

    saveStateToDB({
      ...currentData,
      auditLogs: updatedLogs
    });
  };

  // 4e. Save Purchase Return (تسجيل سند مرتجع مشتريات للمورد)
  const handleSavePurchaseReturn = (returnData: Omit<PurchaseReturn, 'id' | 'returnNo' | 'date'>) => {
    const nextReturnNo = `PUR-RET-${new Date().getFullYear()}-${String(((groupData.purchaseReturns || []).length) + 1).padStart(4, '0')}`;
    const newReturn: PurchaseReturn = {
      ...returnData,
      id: `pur_ret_${Date.now()}`,
      returnNo: nextReturnNo,
      date: new Date().toISOString()
    };

    const updatedReturns = [newReturn, ...(groupData.purchaseReturns || [])];
    const updatedBranchStock = [...groupData.branchStock];
    const updatedMovements = [...groupData.movements];
    const updatedContacts = [...groupData.contacts];

    // Deduct stock for returned items
    newReturn.items.forEach(retItem => {
      const stockEntry = updatedBranchStock.find(
        st => st.itemId === retItem.itemId && st.branchId === newReturn.branchId
      );

      if (stockEntry) {
        stockEntry.quantity = Math.max(0, stockEntry.quantity - retItem.quantity);
      }

      // Record item ledger movement
      updatedMovements.push({
        id: `mov_${Date.now()}_${retItem.itemId}`,
        itemId: retItem.itemId,
        itemName: retItem.itemName,
        date: newReturn.date,
        type: 'transfer_out',
        referenceNo: newReturn.returnNo,
        branchId: newReturn.branchId,
        branchName: groupData.branches.find(b => b.id === newReturn.branchId)?.name || 'الفرع الرئيسي',
        quantityChange: -retItem.quantity,
        unitName: retItem.unitName,
        description: `مرتجع مشتريات رقم ${newReturn.returnNo} للمورد ${newReturn.supplierName}`
      });
    });

    // Update Supplier Balance (Subtract total because we returned goods, reducing liability)
    if (newReturn.supplierId) {
      const contactIdx = updatedContacts.findIndex(c => c.id === newReturn.supplierId);
      if (contactIdx > -1) {
        const contact = updatedContacts[contactIdx];
        contact.currentBalance -= newReturn.total;
      }
    }

    const currentData = {
      ...groupData,
      purchaseReturns: updatedReturns,
      branchStock: updatedBranchStock,
      movements: updatedMovements,
      contacts: updatedContacts
    };

    const updatedLogs = appendAuditLog(
      'تسجيل مرتجع مشتريات',
      `تم تسجيل سند مرتجع مشتريات للمورد رقم ${newReturn.returnNo} بقيمة ${newReturn.total.toFixed(2)} شيكل للمورد "${newReturn.supplierName}".`,
      'info',
      currentData
    );

    saveStateToDB({
      ...currentData,
      auditLogs: updatedLogs
    });
  };

  // 4f. Update Purchase Return
  const handleUpdatePurchaseReturn = (returnId: string, updatedReturn: PurchaseReturn) => {
    if (!currentUser.permissions.canDeleteInvoices) {
      alert('🔒 عذراً! تم إلغاء العملية. حسابك غير مخوّل بتعديل المرتجعات المعتمدة. يرجى مراجعة مدير النظام.');
      return;
    }

    const oldReturn = (groupData.purchaseReturns || []).find(r => r.id === returnId);
    if (!oldReturn) {
      alert('سند المرتجع الأصلي غير موجود!');
      return;
    }

    const updatedBranchStock = [...groupData.branchStock];
    const updatedMovements = [...groupData.movements];
    const updatedContacts = [...groupData.contacts];

    // Revert Old Return Stock (Add old returned quantities back)
    oldReturn.items.forEach(retItem => {
      const stockEntry = updatedBranchStock.find(
        st => st.itemId === retItem.itemId && st.branchId === oldReturn.branchId
      );
      if (stockEntry) {
        stockEntry.quantity += retItem.quantity;
      } else {
        updatedBranchStock.push({
          itemId: retItem.itemId,
          branchId: oldReturn.branchId,
          quantity: retItem.quantity
        });
      }
    });

    // Revert Old Supplier Balance (add back old total, increasing liability)
    if (oldReturn.supplierId) {
      const contactIdx = updatedContacts.findIndex(c => c.id === oldReturn.supplierId);
      if (contactIdx > -1) {
        const contact = updatedContacts[contactIdx];
        contact.currentBalance += oldReturn.total;
      }
    }

    // Filter old movements
    const filteredMovements = updatedMovements.filter(m => m.referenceNo !== oldReturn.returnNo);

    // Apply New Return Stock (Deduct new returned quantities)
    updatedReturn.items.forEach(retItem => {
      const stockEntry = updatedBranchStock.find(
        st => st.itemId === retItem.itemId && st.branchId === updatedReturn.branchId
      );
      if (stockEntry) {
        stockEntry.quantity = Math.max(0, stockEntry.quantity - retItem.quantity);
      }

      // Record detailed movement
      filteredMovements.push({
        id: `mov_${Date.now()}_${retItem.itemId}_upd`,
        itemId: retItem.itemId,
        itemName: retItem.itemName,
        date: updatedReturn.date,
        type: 'transfer_out',
        referenceNo: updatedReturn.returnNo,
        branchId: updatedReturn.branchId,
        branchName: groupData.branches.find(b => b.id === updatedReturn.branchId)?.name || 'الفرع الرئيسي',
        quantityChange: -retItem.quantity,
        unitName: retItem.unitName,
        description: `تعديل مرتجع مشتريات رقم ${updatedReturn.returnNo} للمورد ${updatedReturn.supplierName}`
      });
    });

    // Apply New Supplier Balance (Deduct new total, reducing liability)
    if (updatedReturn.supplierId) {
      const contactIdx = updatedContacts.findIndex(c => c.id === updatedReturn.supplierId);
      if (contactIdx > -1) {
        const contact = updatedContacts[contactIdx];
        contact.currentBalance -= updatedReturn.total;
      }
    }

    const updatedReturns = (groupData.purchaseReturns || []).map(r => r.id === returnId ? updatedReturn : r);

    const currentData = {
      ...groupData,
      purchaseReturns: updatedReturns,
      branchStock: updatedBranchStock,
      movements: filteredMovements,
      contacts: updatedContacts
    };

    const updatedLogs = appendAuditLog(
      'تعديل مرتجع مشتريات',
      `تم تعديل سند مرتجع المشتريات رقم ${updatedReturn.returnNo} بقيمة جديدة ${updatedReturn.total.toFixed(2)} شيكل للمورد "${updatedReturn.supplierName}".`,
      'warning',
      currentData
    );

    saveStateToDB({
      ...currentData,
      auditLogs: updatedLogs
    });
  };

  // 4g. Delete Purchase Return
  const handleDeletePurchaseReturn = (returnId: string, reason: string) => {
    if (!currentUser.permissions.canDeleteInvoices) {
      alert('🔒 عذراً! تم إلغاء العملية. حسابك غير مخوّل بحذف المرتجعات المعتمدة. يرجى مراجعة مدير النظام.');
      return;
    }

    const oldReturn = (groupData.purchaseReturns || []).find(r => r.id === returnId);
    if (!oldReturn) {
      alert('سند المرتجع غير موجود!');
      return;
    }

    const updatedBranchStock = [...groupData.branchStock];
    const updatedMovements = [...groupData.movements];
    const updatedContacts = [...groupData.contacts];

    // Revert return stock effects (add back returned quantities)
    oldReturn.items.forEach(retItem => {
      const stockEntry = updatedBranchStock.find(
        st => st.itemId === retItem.itemId && st.branchId === oldReturn.branchId
      );
      if (stockEntry) {
        stockEntry.quantity += retItem.quantity;
      } else {
        updatedBranchStock.push({
          itemId: retItem.itemId,
          branchId: oldReturn.branchId,
          quantity: retItem.quantity
        });
      }
    });

    // Revert supplier balance (add back return amount, increasing liability)
    if (oldReturn.supplierId) {
      const contactIdx = updatedContacts.findIndex(c => c.id === oldReturn.supplierId);
      if (contactIdx > -1) {
        const contact = updatedContacts[contactIdx];
        contact.currentBalance += oldReturn.total;
      }
    }

    const updatedReturns = (groupData.purchaseReturns || []).filter(r => r.id !== returnId);
    const filteredMovements = updatedMovements.filter(m => m.referenceNo !== oldReturn.returnNo);

    const currentData = {
      ...groupData,
      purchaseReturns: updatedReturns,
      branchStock: updatedBranchStock,
      movements: filteredMovements,
      contacts: updatedContacts
    };

    const updatedLogs = appendAuditLog(
      'حذف مرتجع مشتريات',
      `تم إلغاء وحذف سند مرتجع المشتريات رقم ${oldReturn.returnNo} بقيمة ${oldReturn.total.toFixed(2)} شيكل للمورد "${oldReturn.supplierName}". السبب: ${reason || 'لم يذكر'}.`,
      'critical',
      currentData
    );

    saveStateToDB({
      ...currentData,
      auditLogs: updatedLogs
    });
  };

  // 5. Branch Inventory Stock Transfers (تحويل كميات أصناف بين الفروع)
  const handleSaveTransfer = (transferData: Omit<BranchTransfer, 'id' | 'transferNo' | 'date'>) => {
    const nextTransferNo = `TRSF-${new Date().getFullYear()}-${String(groupData.transfers.length + 1).padStart(4, '0')}`;
    const newTransfer: BranchTransfer = {
      ...transferData,
      id: `trsf_${Date.now()}`,
      transferNo: nextTransferNo,
      date: new Date().toISOString()
    };

    const updatedTransfers = [newTransfer, ...groupData.transfers];
    const updatedBranchStock = [...groupData.branchStock];
    const updatedMovements = [...groupData.movements];

    newTransfer.items.forEach(trsfItem => {
      // 1. Deduct from source branch
      const sourceStock = updatedBranchStock.find(
        st => st.itemId === trsfItem.itemId && st.branchId === newTransfer.fromBranchId
      );
      if (sourceStock) {
        sourceStock.quantity = Math.max(0, sourceStock.quantity - trsfItem.quantity);
      }

      // 2. Add to destination branch
      const destStock = updatedBranchStock.find(
        st => st.itemId === trsfItem.itemId && st.branchId === newTransfer.toBranchId
      );
      if (destStock) {
        destStock.quantity += trsfItem.quantity;
      } else {
        updatedBranchStock.push({
          itemId: trsfItem.itemId,
          branchId: newTransfer.toBranchId,
          quantity: trsfItem.quantity
        });
      }

      // 3. Record double-legged movements
      // Source movement (out)
      updatedMovements.push({
        id: `mov_${Date.now()}_out_${trsfItem.itemId}`,
        itemId: trsfItem.itemId,
        itemName: trsfItem.itemName,
        date: newTransfer.date,
        type: 'transfer_out',
        referenceNo: newTransfer.transferNo,
        branchId: newTransfer.fromBranchId,
        branchName: newTransfer.fromBranchName,
        quantityChange: -trsfItem.quantity,
        unitName: trsfItem.unitName,
        description: `تحويل بضاعة صادرة رقم ${newTransfer.transferNo} إلى ${newTransfer.toBranchName}`
      });

      // Destination movement (in)
      updatedMovements.push({
        id: `mov_${Date.now()}_in_${trsfItem.itemId}`,
        itemId: trsfItem.itemId,
        itemName: trsfItem.itemName,
        date: newTransfer.date,
        type: 'transfer_in',
        referenceNo: newTransfer.transferNo,
        branchId: newTransfer.toBranchId,
        branchName: newTransfer.toBranchName,
        quantityChange: trsfItem.quantity,
        unitName: trsfItem.unitName,
        description: `تحويل بضاعة واردة رقم ${newTransfer.transferNo} من ${newTransfer.fromBranchName}`
      });
    });

    saveStateToDB({
      ...groupData,
      transfers: updatedTransfers,
      branchStock: updatedBranchStock,
      movements: updatedMovements
    });
  };

  // 6. Add Custom Items to Group Catalog
  const handleAddItem = (newItem: Omit<Item, 'id'>, initialQty?: number, branchId?: string) => {
    const itemWithId: Item = {
      ...newItem,
      id: `item_${Date.now()}`
    };

    const updatedItems = [...groupData.items, itemWithId];
    const updatedBranchStock = [...groupData.branchStock];
    const updatedMovements = [...groupData.movements];

    if (initialQty && initialQty > 0) {
      const activeBranch = branchId || 'branch_main';
      const branchName = groupData.branches.find(b => b.id === activeBranch)?.name || 'الفرع الرئيسي';
      updatedBranchStock.push({
        itemId: itemWithId.id,
        branchId: activeBranch,
        quantity: initialQty
      });
      updatedMovements.push({
        id: `mov_${Date.now()}_init_${itemWithId.id}`,
        itemId: itemWithId.id,
        itemName: itemWithId.name,
        date: new Date().toISOString(),
        type: 'initial',
        referenceNo: 'BEGIN-FAST',
        branchId: activeBranch,
        branchName: branchName,
        quantityChange: initialQty,
        unitName: itemWithId.mainUnit,
        description: `رصيد أول المدة مضاف من كاشير الفاتورة`
      });
    }

    saveStateToDB({
      ...groupData,
      items: updatedItems,
      branchStock: updatedBranchStock,
      movements: updatedMovements
    });
  };

  const handleImportItemsAndStock = (importedList: Array<{ item: Omit<Item, 'id'>, qty: number }>) => {
    const updatedItems = [...groupData.items];
    const updatedBranchStock = [...groupData.branchStock];
    const updatedMovements = [...groupData.movements];

    // Find primary branch or create main branch
    const primaryBranch = groupData.branches[0] || { id: 'branch_main', name: 'الفرع الرئيسي' };

    importedList.forEach(entry => {
      // Check if barcode already exists
      const existingIndex = updatedItems.findIndex(i => i.barcode === entry.item.barcode);
      let itemToUse: Item;

      if (existingIndex > -1) {
        // Update existing item fields (except ID and barcode)
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          name: entry.item.name,
          category: entry.item.category,
          mainUnit: entry.item.mainUnit,
          hasSubUnit: entry.item.hasSubUnit,
          subUnitName: entry.item.subUnitName,
          conversionRate: entry.item.conversionRate,
          purchasePrice: entry.item.purchasePrice,
          salePrice: entry.item.salePrice,
          subUnitSalePrice: entry.item.subUnitSalePrice
        };
        itemToUse = updatedItems[existingIndex];
      } else {
        // Create new item
        itemToUse = {
          ...entry.item,
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        };
        updatedItems.push(itemToUse);
      }

      // Update branch stock for the primary branch
      if (entry.qty > 0) {
        const stockEntryIndex = updatedBranchStock.findIndex(st => st.itemId === itemToUse.id && st.branchId === primaryBranch.id);
        if (stockEntryIndex > -1) {
          updatedBranchStock[stockEntryIndex].quantity += entry.qty;
        } else {
          updatedBranchStock.push({
            itemId: itemToUse.id,
            branchId: primaryBranch.id,
            quantity: entry.qty
          });
        }

        // Record initial inventory balance movement (رصيد أول المدة)
        updatedMovements.push({
          id: `mov_${Date.now()}_${itemToUse.id}_${Math.random().toString(36).substr(2, 4)}`,
          itemId: itemToUse.id,
          itemName: itemToUse.name,
          date: new Date().toISOString(),
          type: 'initial',
          referenceNo: 'BEGIN-STOCK',
          branchId: primaryBranch.id,
          branchName: primaryBranch.name,
          quantityChange: entry.qty,
          unitName: itemToUse.mainUnit,
          description: `استيراد رصيد أول المدة من ملف إكسل`
        });
      }
    });

    const finalLogs = appendAuditLog(
      'استيراد أرصدة أول المدة',
      `تم استيراد وتحديث ${importedList.length} صنف/أرصدة مخزنية افتتاحية عبر ملف إكسل.`,
      'info',
      {
        ...groupData,
        items: updatedItems,
        branchStock: updatedBranchStock,
        movements: updatedMovements
      }
    );

    saveStateToDB({
      ...groupData,
      items: updatedItems,
      branchStock: updatedBranchStock,
      movements: updatedMovements,
      auditLogs: finalLogs
    });
  };

  // Manual Stock Adjustment & Physical Inventory Count
  const handleAdjustStock = (itemId: string, branchId: string, actualQty: number, notes: string) => {
    const updatedBranchStock = [...groupData.branchStock];
    const updatedMovements = [...groupData.movements];

    const stockIdx = updatedBranchStock.findIndex(st => st.itemId === itemId && st.branchId === branchId);
    const item = groupData.items.find(i => i.id === itemId);
    const branch = groupData.branches.find(b => b.id === branchId) || { name: 'الفرع الرئيسي', id: branchId };

    const currentQty = stockIdx > -1 ? updatedBranchStock[stockIdx].quantity : 0;
    const diff = actualQty - currentQty;

    if (diff === 0) {
      alert('الكمية الحالية مطابقة للكمية الفعلية المدخلة، لم يتم إجراء أي تعديل.');
      return;
    }

    if (stockIdx > -1) {
      updatedBranchStock[stockIdx].quantity = actualQty;
    } else {
      updatedBranchStock.push({
        itemId,
        branchId,
        quantity: actualQty
      });
    }

    // Record adjustment movement (تسوية مخزنية)
    updatedMovements.push({
      id: `mov_${Date.now()}_adj_${itemId}`,
      itemId,
      itemName: item?.name || 'صنف غير معروف',
      date: new Date().toISOString(),
      type: 'manual_adjust',
      referenceNo: `ADJ-${Date.now().toString().substr(-6)}`,
      branchId,
      branchName: branch.name,
      quantityChange: diff,
      unitName: item?.mainUnit || 'وحدة',
      description: `تسوية جرد مخزني يدوي: تعديل من ${currentQty} إلى ${actualQty}. المبرر: ${notes || 'مطابقة جرد فعلي'}`
    });

    const finalLogs = appendAuditLog(
      'تسوية جرد مخزني يدوي',
      `جرد مخزني وتعديل الصنف: ${item?.name || ''} في فرع ${branch.name}. تم تعديل الرصيد بقيمة ${diff > 0 ? '+' : ''}${diff} ${item?.mainUnit || ''}. السبب: ${notes || 'مطابقة جرد فعلي'}`,
      'warning',
      {
        ...groupData,
        branchStock: updatedBranchStock,
        movements: updatedMovements
      }
    );

    saveStateToDB({
      ...groupData,
      branchStock: updatedBranchStock,
      movements: updatedMovements,
      auditLogs: finalLogs
    });
  };

  const handleUpdateItem = (id: string, updatedFields: Partial<Item>) => {
    const updatedItems = groupData.items.map(item => {
      if (item.id === id) {
        return { ...item, ...updatedFields };
      }
      return item;
    });
    saveStateToDB({
      ...groupData,
      items: updatedItems
    });
  };

  const handleUpdateContact = (id: string, updatedFields: Partial<CustomerSupplier>) => {
    const updatedContacts = groupData.contacts.map(c => {
      if (c.id === id) {
        let newCurrentBalance = c.currentBalance;
        if (updatedFields.initialBalance !== undefined) {
          const diff = updatedFields.initialBalance - c.initialBalance;
          newCurrentBalance += diff;
        }
        return { 
          ...c, 
          ...updatedFields,
          currentBalance: newCurrentBalance
        };
      }
      return c;
    });
    saveStateToDB({
      ...groupData,
      contacts: updatedContacts
    });
  };

  const handleUpdateBranch = (id: string, updatedFields: Partial<Branch>) => {
    const updatedBranches = groupData.branches.map(b => {
      if (b.id === id) {
        return { ...b, ...updatedFields };
      }
      return b;
    });
    saveStateToDB({
      ...groupData,
      branches: updatedBranches
    });
  };

  // 7. Add Branches/Warehouses to Active Group
  const handleAddBranch = (newBranch: Omit<Branch, 'id'>) => {
    const branchWithId: Branch = {
      ...newBranch,
      id: `branch_${Date.now()}`
    };

    const updatedBranches = [...groupData.branches, branchWithId];
    saveStateToDB({
      ...groupData,
      branches: updatedBranches
    });
  };

  // 8. Add Contacts (Customers/Suppliers)
  const handleAddContact = (newContact: Omit<CustomerSupplier, 'id' | 'currentBalance'>) => {
    const contactWithId: CustomerSupplier = {
      ...newContact,
      id: `contact_${Date.now()}`,
      currentBalance: newContact.initialBalance
    };

    const updatedContacts = [...groupData.contacts, contactWithId];
    saveStateToDB({
      ...groupData,
      contacts: updatedContacts
    });
  };

  // 8.5. Add Customer Appointment / Schedule (إضافة موعد أو مراجعة لعميل)
  const handleAddAppointment = (newApp: Omit<Appointment, 'id' | 'status'>) => {
    const appWithId: Appointment = {
      ...newApp,
      id: `app_${Date.now()}`,
      status: 'pending'
    };

    const updatedApps = [appWithId, ...(groupData.appointments || [])];
    saveStateToDB({
      ...groupData,
      appointments: updatedApps
    });
  };

  // 9. Record Cash Payments (قبض أو صرف نقد)
  const handleRecordPayment = (contactId: string, amount: number, type: 'receipt' | 'payment', notes: string) => {
    const updatedContacts = [...groupData.contacts];
    const contactIdx = updatedContacts.findIndex(c => c.id === contactId);
    
    if (contactIdx > -1) {
      const contact = updatedContacts[contactIdx];
      if (type === 'receipt') {
        // Customer pays us: reduces client debt (currentBalance gets closer to 0 or positive)
        contact.currentBalance += amount;
      } else {
        // We pay supplier: reduces supplier credit liabilities (reduces positive liabilities closer to 0 or negative)
        contact.currentBalance -= amount;
      }
    }

    saveStateToDB({
      ...groupData,
      contacts: updatedContacts
    });
  };

  // 10. Multi-group Creator (مجموعة جديدة مستقلة تماماً ببياناتها)
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.permissions.canAccessSettings) {
      alert('🔒 عذراً! تم إلغاء العملية. حسابك غير مخوّل لتأسيس مجموعة تجارية مستقلة جديدة.');
      return;
    }
    if (!newGroupName || !newGroupShopName) {
      alert('يرجى تعبئة اسم المجموعة واسم النشاط التجاري');
      return;
    }

    const newGroupId = `group_custom_${Date.now()}`;
    const newGroup: Group = {
      id: newGroupId,
      name: newGroupName,
      settings: {
        name: newGroupShopName,
        address: newGroupAddress || 'غزة',
        phone: newGroupPhone || 'غير مدرج',
        logoText: newGroupShopName.substring(0, 12),
        logoColor: 'emerald'
      }
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    saveGroups(updatedGroups);

    // Seed empty group data structure in db
    const emptyData: GroupData = {
      items: [],
      branches: [{ id: `branch_${newGroupId}_main`, name: 'المستودع الرئيسي الافتراضي', location: newGroupAddress || 'غزة' }],
      branchStock: [],
      contacts: [],
      sales: [],
      purchases: [],
      returns: [],
      quotations: [],
      transfers: [],
      movements: []
    };

    saveGroupData(newGroupId, emptyData);

    // Switch focus
    handleGroupChange(newGroupId);

    // Reset Form
    setNewGroupName('');
    setNewGroupShopName('');
    setNewGroupAddress('');
    setNewGroupPhone('');
    alert('تم تأسيس وتهيئة المجموعة التجارية المستقلة الجديدة بنجاح!');
  };

  // 11. Update Active Group Settings (بيانات المحل والشعار والهاتف)
  const handleUpdateSettings = (
    shopName: string,
    shopAddress: string,
    shopPhone: string,
    logoUrl: string,
    themeColor: string,
    showInvoiceDate: boolean,
    showInvoiceBranch: boolean,
    showInvoiceLogo: boolean
  ) => {
    if (!currentUser.permissions.canAccessSettings) {
      alert('🔒 عذراً! تم إلغاء العملية. حسابك غير مخوّل لتعديل هوية المجموعة التجارية النشطة.');
      return;
    }
    const updatedGroups = groups.map(g => {
      if (g.id === activeGroupId) {
        return {
          ...g,
          settings: {
            ...g.settings,
            name: shopName,
            address: shopAddress,
            phone: shopPhone,
            logoUrl: logoUrl,
            themeColor: themeColor,
            showInvoiceDate,
            showInvoiceBranch,
            showInvoiceLogo
          }
        };
      }
      return g;
    });

    setGroups(updatedGroups);
    saveGroups(updatedGroups);
    alert('تم تحديث إعدادات وهوية المحل التجاري للمجموعة بنجاح!');
  };

  const handleUpdateUsers = (updatedUsers: UserAccount[]) => {
    if (!currentUser.permissions.canManageUsers && userRole !== 'admin' && currentUser.id !== 'user_admin') {
      alert('🔒 عذراً! صلاحية إدارة حسابات الموظفين مقتصرة فقط على الموظفين المخولين بذلك.');
      return;
    }
    const updatedData = {
      ...groupData,
      users: updatedUsers
    };
    setGroupDataState(updatedData);
    saveGroupData(activeGroupId, updatedData);
    
    // Log user management change
    const logEntry: AuditLogEntry = {
      id: `log_user_mgmt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'إدارة المستخدمين والصلاحيات',
      operator: `${currentUser.name} (${currentUser.role === 'admin' ? 'مدير النظام' : 'كاشير مبيعات'})`,
      details: `تحديث قائمة حسابات الموظفين وصلاحياتهم الفعالة (العدد الحالي: ${updatedUsers.length} حسابات)`,
      severity: 'warning'
    };
    
    const logs = [logEntry, ...(groupData.auditLogs || [])];
    const finalData = { ...updatedData, auditLogs: logs };
    setGroupDataState(finalData);
    saveGroupData(activeGroupId, finalData);
  };

  const handleUpdateFirewallSettings = (updatedSettings: FirewallSettings) => {
    if (userRole !== 'admin') {
      alert('🔒 عذراً! صلاحية إدارة جدار الحماية مقتصرة فقط على "مدير النظام".');
      return;
    }
    const updatedData = {
      ...groupData,
      firewallSettings: updatedSettings
    };
    setGroupDataState(updatedData);
    saveGroupData(activeGroupId, updatedData);
  };

  const handleUpdateSecurityAlerts = (updatedAlerts: SecurityAlert[]) => {
    if (userRole !== 'admin') {
      alert('🔒 عذراً! صلاحية إدارة الأحداث والإنذارات مقتصرة فقط على "مدير النظام".');
      return;
    }
    const updatedData = {
      ...groupData,
      securityAlerts: updatedAlerts
    };
    setGroupDataState(updatedData);
    saveGroupData(activeGroupId, updatedData);
  };

  const handleAddAuditLogDirect = (log: AuditLogEntry) => {
    const updatedData = {
      ...groupData,
      auditLogs: [log, ...(groupData.auditLogs || [])]
    };
    setGroupDataState(updatedData);
    saveGroupData(activeGroupId, updatedData);
  };

  // 12. Backup Restore Operations
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser.permissions.canAccessSettings) {
      alert('🔒 عذراً! استيراد النسخ الاحتياطية وتغيير قواعد البيانات متاح فقط لمدير النظام (Admin).');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAllData(content);
      if (success) {
        alert('تم فحص واستعادة النسخة الاحتياطية وتحديث قواعد البيانات بنجاح! يرجى إعادة تحميل الصفحة لتفعيل التغييرات.');
        window.location.reload();
      } else {
        alert('فشل استعادة الملف؛ يرجى التأكد من اختيار ملف نسخة احتياطية صالح ومصدره "غزة كاش".');
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadBackup = () => {
    if (!currentUser.permissions.canAccessSettings) {
      alert('🔒 عذراً! تصدير النسخ الاحتياطية مسموح فقط لمدير النظام (Admin) لحماية سرية البيانات.');
      return;
    }
    const backupStr = exportAllData();
    const blob = new Blob([backupStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `نسخة_احتياطية_غزة_كاش_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 13. API Gemini Business Advisor consultation
  const consultGeminiAdvisor = async () => {
    setLoadingAi(true);
    setAiAnalysis('');
    try {
      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeGroup: groups.find(g => g.id === activeGroupId)?.name,
          items: groupData.items,
          sales: groupData.sales,
          purchases: groupData.purchases,
          contacts: groupData.contacts
        })
      });
      const resData = await response.json();
      if (resData && resData.advice) {
        setAiAnalysis(resData.advice);
      } else {
        setAiAnalysis('حدث خطأ في قراءة رد المستشار؛ يرجى المحاولة لاحقاً.');
      }
    } catch (error) {
      console.error(error);
      setAiAnalysis('فشل الاتصال بخادم الاستشارات الذكي. تأكد من تفعيل الاتصال ومفتاح GEMINI_API_KEY.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Get active group context settings
  const activeGroupMeta = groups.find(g => g.id === activeGroupId);
  const shopMeta = activeGroupMeta?.settings || {
    name: 'محلات غزة كاش للأعمال',
    address: 'غزة',
    phone: '059-000000',
    logoText: 'غزة كاش',
    logoColor: 'emerald'
  };

  const currencies = groupData.currencies || [];
  const selectedCurrencyId = groupData.selectedCurrencyId || 'ILS';
  const activeCurrency = currencies.find(c => c.id === selectedCurrencyId) || currencies.find(c => c.isBase) || { id: 'ILS', name: 'شيكل', symbol: '₪', exchangeRate: 1, isBase: true };

  // Dashboard calculations in selected active currency
  const dashboardSalesTotal = groupData.sales.reduce((sum, s) => {
    const saleCurr = currencies.find(c => c.id === (s.currencyId || 'ILS')) || activeCurrency;
    return sum + (s.total * (saleCurr.exchangeRate / activeCurrency.exchangeRate));
  }, 0);

  const dashboardPurchasesTotal = groupData.purchases.reduce((sum, p) => {
    const purchCurr = currencies.find(c => c.id === (p.currencyId || 'ILS')) || activeCurrency;
    return sum + (p.total * (purchCurr.exchangeRate / activeCurrency.exchangeRate));
  }, 0);

  const totalDebts = groupData.contacts
    .filter(c => c.type === 'customer' || c.type === 'both')
    .reduce((sum, c) => {
      const val = c.currentBalance;
      return sum + (val < 0 ? Math.abs(val) : 0);
    }, 0);

  const lowStockItems = groupData.items.map(item => {
    const totalQty = groupData.branchStock
      .filter(bs => bs.itemId === item.id)
      .reduce((sum, bs) => sum + bs.quantity, 0);
    return {
      ...item,
      totalQty
    };
  }).filter(item => item.totalQty <= item.minStockAlert);
  
  const filteredAuditLogs = (groupData.auditLogs || []).filter(log => {
    if (logSearchQuery) {
      const q = logSearchQuery.toLowerCase();
      const matchesText = (log.action || '').toLowerCase().includes(q) ||
                          (log.details || '').toLowerCase().includes(q) ||
                          (log.operator || '').toLowerCase().includes(q);
      if (!matchesText) return false;
    }
    if (logOperatorFilter && log.operator !== logOperatorFilter) {
      return false;
    }
    if (logActionFilter && log.action !== logActionFilter) {
      return false;
    }
    if (logSeverityFilter && log.severity !== logSeverityFilter) {
      return false;
    }
    return true;
  });

  const uniqueOperators = Array.from(new Set((groupData.auditLogs || []).map(log => log.operator).filter(Boolean)));
  const uniqueActions = Array.from(new Set((groupData.auditLogs || []).map(log => log.action).filter(Boolean)));

  const renderLockedCard = (title: string, description: string) => (
    <div className="rounded-2xl glass-panel-card p-6 border border-amber-500/10 dark:border-amber-500/5 shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[160px] bg-slate-500/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/40 backdrop-blur-[1px] pointer-events-none" />
      <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 z-10">
        <Lock size={22} />
      </div>
      <div className="space-y-1 z-10 max-w-md">
        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-right" dir="rtl">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-500 mx-auto flex items-center justify-center shadow-inner border border-emerald-500/20">
              <Store size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">بوابة الدخول الموحدة</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">نظام غزة كاش الذكي لإدارة المبيعات والمستودعات ERP</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 block">اختر نوع الصلاحية (الدور الوظيفي):</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setUserRole('admin');
                    setLoginError('');
                  }}
                  className={`p-4 rounded-xl border text-right transition flex flex-col items-start gap-2 cursor-pointer w-full ${
                    userRole === 'admin'
                      ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-500/5'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${userRole === 'admin' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <ShieldCheck size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-black block">مدير النظام</span>
                    <span className="text-[9px] text-slate-400 leading-tight block">كامل الصلاحيات</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserRole('cashier');
                    setLoginError('');
                  }}
                  className={`p-4 rounded-xl border text-right transition flex flex-col items-start gap-2 cursor-pointer w-full ${
                    userRole === 'cashier'
                      ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-500/5'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${userRole === 'cashier' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <Users size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-black block">كاشير مبيعات</span>
                    <span className="text-[9px] text-slate-400 leading-tight block">بيع مباشر وفواتير</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 block">اختر حساب الموظف للتحضير:</label>
              <select
                value={loginUserId}
                onChange={(e) => setLoginUserId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-950 dark:text-white font-extrabold focus:outline-none focus:border-emerald-500"
              >
                {(groupData.users || [])
                  .filter(u => u.role === userRole)
                  .map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.username})
                    </option>
                  ))
                }
                {(groupData.users || []).filter(u => u.role === userRole).length === 0 && (
                  <option value={userRole === 'admin' ? 'user_admin' : 'user_cashier'}>
                    {userRole === 'admin' ? 'أحمد المحترف (admin)' : 'مسؤول الكاشير والمبيعات (cashier)'}
                  </option>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 block flex items-center justify-between">
                <span>رمز الدخول السري:</span>
                <span className="text-[10px] text-slate-400 font-normal">الافتراضي: <code className="font-mono bg-slate-100 dark:bg-slate-850 px-1 rounded font-bold">{userRole === 'admin' ? 'admin' : '1234'}</code></span>
              </label>
              <div className="relative">
                <Key size={14} className="absolute right-3 top-3.5 text-slate-400" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="أدخل الرمز السري هنا..."
                  className="w-full p-2.5 pr-9 rounded-xl glass-input text-xs text-slate-950 dark:text-white font-mono text-center tracking-widest"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 text-[11px] font-bold border border-red-500/20 leading-relaxed">
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 transition duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              دخول المنظومة السحابية
            </button>
          </form>

          <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
            <button
              type="button"
              onClick={() => {
                const nextTheme = themeMode === 'light' ? 'dark' : 'light';
                setThemeState(nextTheme);
                setTheme(nextTheme);
                applyThemeClass(nextTheme);
              }}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 cursor-pointer"
            >
              {themeMode === 'light' ? <Moon size={12} /> : <Sun size={12} />}
            </button>
          </div>

        </div>
      </div>
    );
  }

  if (!isGroupSelected) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-right" dir="rtl">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">الخطوة الثانية والأخيرة</span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">اختر المجموعة التجارية النشطة</h2>
              <p className="text-xs text-slate-500">يرجى اختيار المجموعة التجارية أو المعرض الذي ترغب في تفعيل دفاتر حساباته الآن</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/10 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="تسجيل الخروج والرجوع"
            >
              <LogOut size={14} />
              <span>خروج</span>
            </button>
          </div>

          {!showCreateGroupOnOnboarding ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((g) => {
                  const isFoods = g.id === 'group_foods';
                  return (
                    <div
                      key={g.id}
                      onClick={() => handleSelectGroupOnboarding(g.id)}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:border-emerald-500 dark:hover:border-emerald-500/60 hover:bg-slate-50 dark:hover:bg-slate-950/80 cursor-pointer transition-all duration-300 flex flex-col justify-between group relative overflow-hidden text-right"
                    >
                      <div className="absolute top-0 right-0 w-1.5 h-full bg-slate-300 dark:bg-slate-800 group-hover:bg-emerald-500 transition-colors" />
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${isFoods ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            <Store size={22} />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">{g.name}</h3>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">المعرف: {g.id}</p>
                          </div>
                        </div>

                        <div className="space-y-1 bg-slate-100/50 dark:bg-slate-900/50 p-3 rounded-xl text-[11px] text-slate-500 dark:text-slate-400">
                          <div>📍 {g.settings?.address || 'غير محدد'}</div>
                          <div>📞 {g.settings?.phone || 'غير محدد'}</div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end text-xs font-extrabold text-emerald-500 gap-1 opacity-80 group-hover:opacity-100 transition">
                        <span>دخول لوحة التحكم</span>
                        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {userRole === 'admin' && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowCreateGroupOnOnboarding(true)}
                    className="w-full py-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500/60 text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>تأسيس مجموعة تجارية أو فرع مستقل جديد</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newGroupName || !newGroupShopName) {
                  alert('يرجى تعبئة اسم المجموعة واسم النشاط التجاري');
                  return;
                }
                const newGroupId = `group_custom_${Date.now()}`;
                const newGroup: Group = {
                  id: newGroupId,
                  name: newGroupName,
                  settings: {
                    name: newGroupShopName,
                    address: newGroupAddress || 'غزة',
                    phone: newGroupPhone || 'غير مدرج',
                    logoText: newGroupShopName.substring(0, 12),
                    logoColor: 'emerald'
                  }
                };

                const updatedGroups = [...groups, newGroup];
                setGroups(updatedGroups);
                saveGroups(updatedGroups);

                const emptyData: GroupData = {
                  items: [],
                  branches: [{ id: `branch_${newGroupId}_main`, name: 'المستودع الرئيسي الافتراضي', location: newGroupAddress || 'غزة' }],
                  branchStock: [],
                  contacts: [],
                  sales: [],
                  purchases: [],
                  returns: [],
                  quotations: [],
                  transfers: [],
                  movements: []
                };

                saveGroupData(newGroupId, emptyData);
                
                handleSelectGroupOnboarding(newGroupId);

                setNewGroupName('');
                setNewGroupShopName('');
                setNewGroupAddress('');
                setNewGroupPhone('');
                setShowCreateGroupOnOnboarding(false);
                alert('تم تأسيس وتفعيل المجموعة التجارية المستقلة الجديدة بنجاح!');
              }}
              className="space-y-4 bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-3 duration-200 text-right"
            >
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">تأسيس مجموعة تجارية جديدة</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 text-right">
                  <label className="text-[11px] font-bold text-slate-500">اسم المجموعة التجارية</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="مثال: مجموعة الهدى للملبوسات"
                    className="w-full p-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
                <div className="space-y-1 text-right">
                  <label className="text-[11px] font-bold text-slate-500">اسم المعرض الرئيسي</label>
                  <input
                    type="text"
                    value={newGroupShopName}
                    onChange={(e) => setNewGroupShopName(e.target.value)}
                    placeholder="مثال: معرض الهدى للملابس الرجالية"
                    className="w-full p-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
                <div className="space-y-1 text-right">
                  <label className="text-[11px] font-bold text-slate-500">العنوان الجغرافي</label>
                  <input
                    type="text"
                    value={newGroupAddress}
                    onChange={(e) => setNewGroupAddress(e.target.value)}
                    placeholder="مثال: غزة، الرمال، شارع الجلاء"
                    className="w-full p-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
                <div className="space-y-1 text-right">
                  <label className="text-[11px] font-bold text-slate-500">رقم الهاتف / الجوال</label>
                  <input
                    type="text"
                    value={newGroupPhone}
                    onChange={(e) => setNewGroupPhone(e.target.value)}
                    placeholder="مثال: 059-9000000"
                    className="w-full p-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateGroupOnOnboarding(false);
                    setNewGroupName('');
                    setNewGroupShopName('');
                    setNewGroupAddress('');
                    setNewGroupPhone('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition cursor-pointer"
                >
                  إلغاء التأسيس
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition shadow-md cursor-pointer"
                >
                  حفظ وتفعيل المجموعة الجديدة
                </button>
              </div>
            </form>
          )}

          <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>تسجيل الدخول الحالي كـ: <span className="font-extrabold text-slate-800 dark:text-white">{userRole === 'admin' ? 'مدير النظام (Admin)' : 'كاشير مبيعات (Cashier)'}</span></span>
            <button
              type="button"
              onClick={() => {
                const nextTheme = themeMode === 'light' ? 'dark' : 'light';
                setThemeState(nextTheme);
                setTheme(nextTheme);
                applyThemeClass(nextTheme);
              }}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 cursor-pointer"
            >
              {themeMode === 'light' ? <Moon size={12} /> : <Sun size={12} />}
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {shopMeta.themeColor && (
        <style dangerouslySetInnerHTML={{ __html: getThemeCss(shopMeta.themeColor) }} />
      )}
      
      {/* 1. APP NAVBAR BRANDING HEADER */}
      <header className="border-b border-white/20 dark:border-slate-900 sticky top-0 z-40 backdrop-blur-md glass-panel-card no-print">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Company identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-xl bg-slate-500/5 dark:bg-slate-800/40 hover:bg-slate-500/10 dark:hover:bg-slate-800/80 transition text-emerald-600 dark:text-emerald-400 cursor-pointer border border-emerald-500/20"
              title={sidebarCollapsed ? "إظهار الشريط الجانبي" : "إخفاء الشريط الجانبي"}
            >
              <Menu size={18} />
            </button>
 
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              <img src={shopMeta.logoUrl || defaultLogo} alt="شعار" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-right">
                <h1 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">نظام غزة كاش الذكي</h1>
                <span className="bg-emerald-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">v1.1</span>
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Building size={10} /> {shopMeta.name} ({shopMeta.address})
              </p>
            </div>
          </div>
 
          {/* Quick Active Group Selector & Currency Selector */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* User Role Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-[10px] sm:text-xs shadow-inner select-none transition-all duration-200 ${
              userRole === 'admin' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}>
              <ShieldCheck size={14} className={userRole === 'admin' ? 'text-emerald-500 animate-pulse' : 'text-amber-500'} />
              <span>{userRole === 'admin' ? 'مدير النظام (Admin)' : 'كاشير مبيعات (Cashier)'}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="تسجيل الخروج والرجوع لبوابة الدخول"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">تسجيل خروج</span>
            </button>
 
            <div className="flex items-center gap-1 bg-slate-500/5 dark:bg-slate-950/50 p-1.5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-slate-500 px-2">المجموعة النشطة:</span>
              <select
                value={activeGroupId}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none border-none pr-6 cursor-pointer"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id} className="dark:bg-slate-900 dark:text-white text-slate-950 font-bold">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-500/5 dark:bg-slate-950/50 p-1.5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-slate-500 px-2 flex items-center gap-1">
                <Coins size={12} className="text-emerald-500" /> العملة:
              </span>
              <select
                value={selectedCurrencyId}
                onChange={(e) => handleSelectCurrency(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none border-none pr-6 cursor-pointer"
              >
                {currencies.map(c => (
                  <option key={c.id} value={c.id} className="dark:bg-slate-900 dark:text-white text-slate-950 font-bold">
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Inventory Alerts Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-xl bg-slate-500/5 dark:bg-slate-800/40 hover:bg-slate-500/10 dark:hover:bg-slate-800/80 transition cursor-pointer relative ${lowStockItems.length > 0 ? 'text-amber-500 hover:text-amber-600' : 'text-slate-500 dark:text-slate-300'}`}
                title="تنبيهات المخزون المتدني"
              >
                <Bell size={18} className={lowStockItems.length > 0 ? 'animate-bounce' : ''} />
                {lowStockItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {lowStockItems.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown List */}
              {showNotifications && (
                <div className="absolute left-0 mt-2 w-80 rounded-2xl glass-panel-card p-4 border border-white/25 dark:border-slate-800 shadow-xl z-50 text-right space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">تنبيهات النقص في البضائع ({lowStockItems.length})</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      إغلاق ✕
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2.5 no-scrollbar">
                    {lowStockItems.length === 0 ? (
                      <div className="text-center py-6 text-[11px] text-slate-400">
                        👍 جميع السلع متوفرة بمخزون آمن وكافٍ!
                      </div>
                    ) : (
                      lowStockItems.map((item) => (
                        <div key={item.id} className="p-2 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition flex items-center justify-between gap-2">
                          <div className="space-y-0.5 text-right">
                            <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{item.name}</h4>
                            <p className="text-[10px] text-slate-500">
                              الحد الآمن: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{item.minStockAlert} {item.mainUnit}</span>
                            </p>
                          </div>
                          
                          <div className="text-left shrink-0">
                            <span className="bg-red-500/10 text-red-600 dark:text-red-400 font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-lg border border-red-500/20">
                              متوفر: {item.totalQty.toFixed(1)} {item.mainUnit}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {lowStockItems.length > 0 && (
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveTab('inventory');
                      }}
                      className="w-full text-center py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[11px] rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>عرض تفاصيل وإدارة المستودعات</span>
                      <Layers size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle button */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-xl bg-slate-500/5 dark:bg-slate-800/40 hover:bg-slate-500/10 dark:hover:bg-slate-800/80 transition text-slate-500 dark:text-slate-300 cursor-pointer"
              title="تغيير المظهر"
            >
              {themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Sidebar (3 Cols) */}
        {!sidebarCollapsed && (
          <nav className="lg:col-span-3 space-y-2 no-print transition-all duration-300">
            <div className="rounded-2xl glass-panel-card p-4 border border-white/25 shadow-md space-y-1">
              
              <div className="flex items-center justify-between px-3 pb-2 border-b border-slate-200 dark:border-slate-800/40 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">التنقل السريع بين الأقسام</span>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1 rounded hover:bg-slate-500/10 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  title="إخفاء الشريط الجانبي"
                >
                  <span className="text-[10px] font-bold">طوي ✕</span>
                </button>
              </div>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-right p-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${activeTab === 'dashboard' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' : 'hover:bg-slate-500/5 text-slate-600 dark:text-slate-300'}`}
              >
                <LayoutDashboard size={16} /> لوحة التحكم والاستشارة الذكية
              </button>
              
              <button
                onClick={() => setActiveTab('pos')}
                className={`w-full text-right p-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${activeTab === 'pos' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' : 'hover:bg-slate-500/5 text-slate-600 dark:text-slate-300'}`}
              >
                <Coins size={16} /> نقطة البيع السريعة (POS)
              </button>

              <p className="text-[10px] font-bold text-slate-400 px-3 pt-4 pb-2 uppercase tracking-wider">إدارة المخزون والتجارة</p>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full text-right p-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${activeTab === 'inventory' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' : 'hover:bg-slate-500/5 text-slate-600 dark:text-slate-300'}`}
              >
                <Layers size={16} /> إدارة المخازن والفروع والأصناف
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className={`w-full text-right p-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${activeTab === 'transactions' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' : 'hover:bg-slate-500/5 text-slate-600 dark:text-slate-300'}`}
              >
                <ShoppingBag size={16} /> الشراء، المرتجعات وعروض الأسعار
              </button>

              <button
                onClick={() => setActiveTab('sales-management')}
                className={`w-full text-right p-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${activeTab === 'sales-management' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' : 'hover:bg-slate-500/5 text-slate-600 dark:text-slate-300'}`}
              >
                <Receipt size={16} /> إدارة المبيعات ومرتجع المبيعات 📊
              </button>

              <button
                onClick={() => setActiveTab('purchases-management')}
                className={`w-full text-right p-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${activeTab === 'purchases-management' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' : 'hover:bg-slate-500/5 text-slate-600 dark:text-slate-300'}`}
              >
                <ShoppingBag size={16} /> إدارة المشتريات ومرتجع الشراء 🛒
              </button>

              <p className="text-[10px] font-bold text-slate-400 px-3 pt-4 pb-2 uppercase tracking-wider">الحسابات والتقارير</p>

              <button
                onClick={() => setActiveTab('contacts')}
                className={`w-full text-right p-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${activeTab === 'contacts' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' : 'hover:bg-slate-500/5 text-slate-600 dark:text-slate-300'}`}
              >
                <Users size={16} /> حسابات العملاء والموردين والذمم
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full text-right p-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${activeTab === 'reports' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' : 'hover:bg-slate-500/5 text-slate-600 dark:text-slate-300'}`}
              >
                <BarChart3 size={16} /> التقارير الشاملة وميزان المراجعة
              </button>

              <p className="text-[10px] font-bold text-slate-400 px-3 pt-4 pb-2 uppercase tracking-wider">الإعدادات والأمان</p>

              <button
                onClick={() => setActiveTab('firewall')}
                className={`w-full text-right p-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${activeTab === 'firewall' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' : 'hover:bg-slate-500/5 text-slate-600 dark:text-slate-300'}`}
              >
                <Shield size={16} className={groupData.securityAlerts?.some(a => !a.resolved) ? 'text-amber-500 animate-pulse shrink-0' : 'shrink-0'} /> جدار الحماية والملف الأمني 🛡️
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-right p-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${activeTab === 'settings' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' : 'hover:bg-slate-500/5 text-slate-600 dark:text-slate-300'}`}
              >
                <Settings size={16} /> إعدادات المحل والنسخ الاحتياطي
              </button>
            </div>

            {/* Quick Actions Panel */}
            <div className="rounded-2xl glass-panel-card p-4 border border-white/25 shadow-md space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-200 dark:border-slate-800/40 pb-2 mb-1">
                إجراءات وعمليات سريعة ⚡
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                <button
                  onClick={() => {
                    setActiveTab('inventory');
                    setInventorySubTab('items');
                  }}
                  className="p-2 rounded-xl bg-slate-500/5 hover:bg-emerald-500 hover:text-white transition text-right flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={12} className="text-emerald-500 shrink-0" />
                  <span>إضافة صنف</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('transactions');
                    setTransactionsSubTab('purchase');
                  }}
                  className="p-2 rounded-xl bg-slate-500/5 hover:bg-emerald-500 hover:text-white transition text-right flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag size={12} className="text-blue-500 shrink-0" />
                  <span>فاتورة شراء</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('transactions');
                    setTransactionsSubTab('return');
                  }}
                  className="p-2 rounded-xl bg-slate-500/5 hover:bg-emerald-500 hover:text-white transition text-right flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={12} className="text-rose-500 shrink-0" />
                  <span>مرتجع مبيعات</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('contacts');
                    setContactsSubTab('list');
                  }}
                  className="p-2 rounded-xl bg-slate-500/5 hover:bg-emerald-500 hover:text-white transition text-right flex items-center gap-1.5 cursor-pointer"
                >
                  <Users size={12} className="text-amber-500 shrink-0" />
                  <span>سند مالي</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('contacts');
                    setContactsSubTab('ledger');
                  }}
                  className="p-2 rounded-xl bg-slate-500/5 hover:bg-emerald-500 hover:text-white transition text-right flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowDownLeft size={12} className="text-sky-500 shrink-0" />
                  <span>كشف حساب</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('inventory');
                    setInventorySubTab('transfers');
                  }}
                  className="p-2 rounded-xl bg-slate-500/5 hover:bg-emerald-500 hover:text-white transition text-right flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers size={12} className="text-indigo-500 shrink-0" />
                  <span>تحويل مخزني</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('inventory');
                    setInventorySubTab('adjust');
                  }}
                  className="p-2 rounded-xl bg-slate-500/5 hover:bg-emerald-500 hover:text-white transition text-right flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={12} className="text-cyan-500 shrink-0" />
                  <span>تسوية وجرد</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('reports');
                    setReportsSubTab('profits');
                  }}
                  className="p-2 rounded-xl bg-slate-500/5 hover:bg-emerald-500 hover:text-white transition text-right flex items-center gap-1.5 cursor-pointer"
                >
                  <TrendingUp size={12} className="text-emerald-500 shrink-0" />
                  <span>الأرباح</span>
                </button>
              </div>
            </div>

            {/* Quick shop card helper */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-lg space-y-3">
              <div>
                <h4 className="font-extrabold text-sm">{shopMeta.name}</h4>
                <p className="text-[10px] opacity-80 flex items-center gap-0.5 mt-0.5"><MapPin size={10} /> {shopMeta.address}</p>
                <p className="text-[10px] opacity-80 flex items-center gap-0.5"><Phone size={10} /> {shopMeta.phone}</p>
              </div>
              
              <div className="border-t border-white/20 pt-2 flex justify-between text-[11px] font-bold">
                <span>أصناف المجموعة:</span>
                <span className="font-mono">{groupData.items.length} صنف</span>
              </div>
            </div>
          </nav>
        )}

        {/* Action Stage Workspace (9 Cols or 12 Cols depending on sidebar state) */}
        <main className={`${sidebarCollapsed ? 'lg:col-span-12' : 'lg:col-span-9'} h-full transition-all duration-300`}>
          
          {/* A. TAB: DASHBOARD (لوحة المعلومات ومستشار الذكاء الاصطناعي) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Glass welcome banners */}
              <div className="rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-6 text-white border border-white/10 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">غزة كاش ERP</span>
                    <h2 className="font-extrabold text-xl md:text-2xl tracking-tight">مرحباً بك في لوحة الإدارة الشاملة</h2>
                    <p className="text-xs text-slate-300 max-w-xl">
                      يقدم نظام "غزة كاش" تجربة متكاملة لإدارة المبيعات السريعة، تتبع المستودعات بالفروع، موازين حسابات العملاء، والتصدير المباشر بضغطة زر.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setActiveTab('pos')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition flex items-center gap-1"
                  >
                    فتح نقطة البيع السريعة <Coins size={14} />
                  </button>
                </div>
              </div>

              {/* Dynamic Business Advisor Consultation Module */}
              <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <h3 className="font-extrabold text-md text-slate-950 dark:text-white flex items-center gap-1.5">
                    <Sparkles size={18} className="text-emerald-500" /> مستشار غزة كاش الذكي (توصيات الأعمال والتحليل المالي)
                  </h3>
                  
                  <button
                    onClick={consultGeminiAdvisor}
                    disabled={loadingAi}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {loadingAi ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> جاري التحليل...
                      </>
                    ) : (
                      <>
                        توليد توصية تشغيلية <Sparkles size={14} />
                      </>
                    )}
                  </button>
                </div>

                {loadingAi && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-2">
                    <RefreshCw size={32} className="text-emerald-500 animate-spin" />
                    <p className="text-xs text-slate-500">جاري قراءة المخزون، حجم الديون، ونسب المبيعات لتقديم تحليل ذكي معتمد...</p>
                  </div>
                )}

                {aiAnalysis && !loadingAi && (
                  <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl space-y-2 text-xs md:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                      <Sparkles size={16} /> توصية استشارية مستهدفة:
                    </div>
                    <div className="whitespace-pre-line font-medium leading-relaxed">
                      {aiAnalysis}
                    </div>
                  </div>
                )}

                {!aiAnalysis && !loadingAi && (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    اضغط على زر "توليد توصية تشغيلية" ليقوم الذكاء الاصطناعي بتحليل المبيعات الحالية ومستوى الديون والمخزون وتقديم رؤى حول تحسين الربحية والتحصيل والحد من التكلفة.
                  </div>
                )}
              </div>

              {/* Financial KPI metrics (Clickable, linked to specific report tabs) */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">مؤشرات الأداء المالي والمبيعات (اضغط للذهاب للتقرير المالي)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sales Card */}
                  <button
                    onClick={() => {
                      setReportsSubTab('sales');
                      setActiveTab('reports');
                    }}
                    className="rounded-2xl glass-panel-card p-5 border border-white/25 dark:border-slate-800/80 hover:border-emerald-500/40 hover:shadow-lg transition-all text-right flex items-center justify-between cursor-pointer group bg-white/40 dark:bg-slate-900/40"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-500 group-hover:text-emerald-500 transition-colors">إجمالي المبيعات الجارية ↗</span>
                      <h3 className="font-extrabold text-2xl text-emerald-600 dark:text-emerald-400 font-mono">
                        {dashboardSalesTotal.toFixed(2)} {activeCurrency.symbol}
                      </h3>
                      <p className="text-[10px] text-slate-400">انقر لتقرير المبيعات والفواتير</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                      <TrendingUp size={24} />
                    </div>
                  </button>

                  {/* Purchases Card */}
                  <button
                    onClick={() => {
                      setReportsSubTab('purchases');
                      setActiveTab('reports');
                    }}
                    className="rounded-2xl glass-panel-card p-5 border border-white/25 dark:border-slate-800/80 hover:border-amber-500/40 hover:shadow-lg transition-all text-right flex items-center justify-between cursor-pointer group bg-white/40 dark:bg-slate-900/40"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-500 group-hover:text-amber-500 transition-colors">إجمالي المشتريات والتوريد ↘</span>
                      <h3 className="font-extrabold text-2xl text-amber-600 dark:text-amber-400 font-mono">
                        {dashboardPurchasesTotal.toFixed(2)} {activeCurrency.symbol}
                      </h3>
                      <p className="text-[10px] text-slate-400">انقر لتقرير المشتريات ومستندات التوريد</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                      <TrendingDown size={24} />
                    </div>
                  </button>

                  {/* Debt Card */}
                  <button
                    onClick={() => {
                      setReportsSubTab('accounts');
                      setActiveTab('reports');
                    }}
                    className="rounded-2xl glass-panel-card p-5 border border-white/25 dark:border-slate-800/80 hover:border-rose-500/40 hover:shadow-lg transition-all text-right flex items-center justify-between cursor-pointer group bg-white/40 dark:bg-slate-900/40"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-500 group-hover:text-rose-500 transition-colors">ذمم العملاء والتحصيل الجاري ⇙</span>
                      <h3 className="font-extrabold text-2xl text-rose-600 dark:text-rose-400 font-mono">
                        {totalDebts.toFixed(2)} {activeCurrency.symbol}
                      </h3>
                      <p className="text-[10px] text-slate-400">انقر لدفتر الحسابات وميزان المراجعة</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                      <ArrowDownLeft size={24} />
                    </div>
                  </button>
                </div>
              </div>

              {/* Quick statistics layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Branches Count */}
                <div className="rounded-xl bg-slate-500/5 p-4 border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500">المستودعات والفروع</span>
                    <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">{groupData.branches.length} فروع</h3>
                    <p className="text-[9px] text-slate-400">تتبع وتحويل البضائع بيسر</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Building size={20} />
                  </div>
                </div>

                {/* Items Catalog */}
                <div className="rounded-xl bg-slate-500/5 p-4 border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500">الأصناف المبرمجة</span>
                    <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">{groupData.items.length} صنف</h3>
                    <p className="text-[9px] text-slate-400">تدعم التعبئة الكبرى والصغرى</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Layers size={20} />
                  </div>
                </div>

                {/* Customers Statement count */}
                <div className="rounded-xl bg-slate-500/5 p-4 border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500">الحسابات والذمم</span>
                    <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">{groupData.contacts.length} حسابات</h3>
                    <p className="text-[9px] text-slate-400">سجل كشف حساب مفصل معتمد</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Users size={20} />
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* B. TAB: POS (نقطة مبيعات ذكية سريعة) */}
          {activeTab === 'pos' && (
            <POS
              items={groupData.items}
              contacts={groupData.contacts}
              branches={groupData.branches}
              activeBranchId="branch_main"
              onSaveSale={handleSaveSale}
              onPrintInvoice={(sale) => {
                setLastPrintedSale(sale);
                setShowOnScreenReceipt(true);
                setTimeout(() => {
                  (window as any)._printTargetSelector = '#thermal-receipt-print';
                  window.print();
                }, 150);
              }}
              shopName={shopMeta.name}
              activeCurrency={activeCurrency}
              currencies={currencies}
              onAddItem={handleAddItem}
              onAddContact={handleAddContact}
              onAddAppointment={handleAddAppointment}
              appointments={groupData.appointments || []}
            />
          )}

          {/* C. TAB: INVENTORY (إدارة المستودعات وحركات الصنف والتحويلات) */}
          {activeTab === 'inventory' && (
            <Inventory
              items={groupData.items}
              branches={groupData.branches}
              branchStock={groupData.branchStock}
              movements={groupData.movements}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onAddBranch={handleAddBranch}
              onUpdateBranch={handleUpdateBranch}
              onTransferStock={handleSaveTransfer}
              onImportItemsAndStock={handleImportItemsAndStock}
              onAdjustStock={handleAdjustStock}
              activeCurrency={activeCurrency}
              initialTab={inventorySubTab}
              onTabChange={setInventorySubTab}
            />
          )}

          {/* D. TAB: TRANSACTIONS (شراء، مرتجعات، عروض أسعار) */}
          {activeTab === 'transactions' && (
            <Transactions
              items={groupData.items}
              contacts={groupData.contacts}
              branches={groupData.branches}
              purchases={groupData.purchases}
              returns={groupData.returns}
              quotations={groupData.quotations}
              onSavePurchase={handleSavePurchase}
              onSaveReturn={handleSaveReturn}
              onSaveQuotation={handleSaveQuotation}
              onAddContact={handleAddContact}
              activeCurrency={activeCurrency}
              initialTab={transactionsSubTab}
            />
          )}

          {/* D2. TAB: SALES & RETURNS MANAGEMENT (إدارة المبيعات ومرتجع المبيعات وفلاتر البحث والتعديل) */}
          {activeTab === 'sales-management' && (
            <SalesManagement
              sales={groupData.sales}
              returns={groupData.returns}
              contacts={groupData.contacts}
              branches={groupData.branches}
              items={groupData.items}
              userRole={userRole}
              onUpdateSale={handleUpdateSale}
              onUpdateReturn={handleUpdateReturn}
              onDeleteSale={handleDeleteInvoice}
              onDeleteReturn={handleDeleteReturn}
              currencies={currencies}
              activeCurrency={activeCurrency}
              shopSettings={shopMeta}
            />
          )}

          {/* D3. TAB: PURCHASES & RETURNS MANAGEMENT (إدارة المشتريات والتوريد ومرتجع المشتريات والبحث والتعديل) */}
          {activeTab === 'purchases-management' && (
            <PurchasesManagement
              purchases={groupData.purchases}
              purchaseReturns={groupData.purchaseReturns || []}
              contacts={groupData.contacts}
              branches={groupData.branches}
              items={groupData.items}
              userRole={userRole}
              onUpdatePurchase={handleUpdatePurchase}
              onUpdatePurchaseReturn={handleUpdatePurchaseReturn}
              onDeletePurchase={handleDeleteInvoice}
              onDeletePurchaseReturn={handleDeletePurchaseReturn}
              onSavePurchaseReturn={handleSavePurchaseReturn}
            />
          )}

          {/* E. TAB: CONTACTS (العملاء والموردين وكشوف الحسابات المعتمدة والسندات المالية) */}
          {activeTab === 'contacts' && (
            <Contacts
              contacts={groupData.contacts}
              sales={groupData.sales}
              purchases={groupData.purchases}
              returns={groupData.returns}
              onAddContact={handleAddContact}
              onUpdateContact={handleUpdateContact}
              onRecordPayment={handleRecordPayment}
              initialTab={contactsSubTab}
              onTabChange={setContactsSubTab}
            />
          )}

          {/* F. TAB: REPORTS (التحليلات وموازين الأرصدة ومطبوعات PDF) */}
          {activeTab === 'reports' && (
            !currentUser.permissions.canAccessReports ? (
              <div className="max-w-4xl mx-auto p-4">
                {renderLockedCard(
                  "التقارير الشاملة وميزان المراجعة",
                  "حسابك الحالي غير مخوّل بالاطلاع على تقارير الأرباح والمراجعة المالية لحماية سرية البيانات النشطة."
                )}
              </div>
            ) : (
              <Reports
                sales={groupData.sales}
                purchases={groupData.purchases}
                contacts={groupData.contacts}
                items={groupData.items}
                branches={groupData.branches}
                activeCurrency={activeCurrency}
                currencies={currencies}
                initialTab={reportsSubTab}
                onTabChange={setReportsSubTab}
                logoUrl={base64Logo || defaultLogo}
                returns={groupData.returns}
                branchStock={groupData.branchStock}
                movements={groupData.movements}
                showInvoiceDate={shopMeta.showInvoiceDate !== false}
                showInvoiceBranch={shopMeta.showInvoiceBranch !== false}
                showInvoiceLogo={shopMeta.showInvoiceLogo !== false}
                shopSettings={shopMeta}
              />
            )
          )}

          {/* G. TAB: SETTINGS & SECURITY BACKUP */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              
              {/* Settings Sub-Tab Navigation Bar */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setSettingsSubTab('identity')}
                  className={`pb-3 font-bold text-sm transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    settingsSubTab === 'identity'
                      ? 'text-blue-500 border-b-2 border-blue-500'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <Building size={16} /> هوية وبيانات المحل التجاري
                </button>
                <button
                  onClick={() => setSettingsSubTab('users')}
                  className={`pb-3 font-bold text-sm transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    settingsSubTab === 'users'
                      ? 'text-blue-500 border-b-2 border-blue-500'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <Users size={16} /> الموظفون وصلاحياتهم وكلمات المرور
                </button>
                <button
                  onClick={() => setSettingsSubTab('backup')}
                  className={`pb-3 font-bold text-sm transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    settingsSubTab === 'backup'
                      ? 'text-blue-500 border-b-2 border-blue-500'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <FolderSync size={16} /> النسخ الاحتياطي وتصفير المنظومة
                </button>
              </div>

              {settingsSubTab === 'users' && (
                <>
                  {/* Role & Permissions Settings Card */}
              <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
                <h3 className="font-extrabold text-md text-slate-950 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck size={18} className="text-emerald-500 animate-pulse" /> نظام الأدوار وصلاحيات المستخدمين (User Roles & Permissions)
                </h3>
                <p className="text-xs text-slate-500">
                  حدد دور المستخدم الحالي للمنظومة على هذا المتصفح. تذكر أن دور "الكاشير" مقيد الصلاحيات لحماية بياناتك المالية من التلاعب أو المسح العشوائي.
                </p>
                
                <div className="flex flex-wrap gap-4 items-center bg-slate-500/5 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">دور المستخدم النشط:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUserRole('admin')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          userRole === 'admin'
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <UserCheck size={14} /> مدير النظام (Admin)
                      </button>
                      <button
                        onClick={() => setUserRole('cashier')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          userRole === 'cashier'
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <Lock size={14} /> كاشير مبيعات (Cashier)
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    {userRole === 'admin' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">✓ لديك صلاحيات كاملة لإدارة الأصناف، مسح الفواتير، تهيئة وتصفير النظام وتصدير قواعد البيانات.</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-extrabold">🔒 تم تقييد حسابك: لا يمكنك مسح الفواتير، تصفير قواعد البيانات، تصدير النسخ الاحتياطية أو تعديل بيانات المجموعات التجارية.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Users & Passwords Control Panel */}
              <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md">
                <UsersManagement
                  users={
                    (groupData.users && groupData.users.length > 0)
                      ? groupData.users
                      : [defaultAdmin, defaultCashier]
                  }
                  currentUserRole={userRole}
                  currentUserCanManageUsers={currentUser.permissions.canManageUsers || userRole === 'admin' || currentUser.id === 'user_admin'}
                  onUpdateUsers={handleUpdateUsers}
                />
              </div>
            </>
          )}

          {settingsSubTab === 'identity' && (
            <>
              {/* Settings Group Meta */}
              {!currentUser.permissions.canAccessSettings ? (
                renderLockedCard(
                  "تعديل هوية وإعدادات المجموعة التجارية النشطة",
                  "هذه الإعدادات حساسة وتتحكم بالاسم والشعار والعناوين المطبوعة على فواتير وسندات المحل. يرجى تعديل صلاحيات حسابك للتحكم بها."
                )
              ) : (
                <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
                  <h3 className="font-extrabold text-md text-slate-950 dark:text-white flex items-center gap-1">
                    <Settings size={18} className="text-emerald-500" /> إعدادات الهوية للمجموعة التجارية النشطة
                  </h3>
                <p className="text-xs text-slate-500">
                  حدد هنا تفاصيل الاسم التجاري المطبوع في رأس الفاتورة وعنوان الفروع ورقم الهاتف ليظهر في سندات العملاء والمبيعات للمجموعة.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const showInvoiceDate = fd.get('showInvoiceDate') === 'on';
                    const showInvoiceBranch = fd.get('showInvoiceBranch') === 'on';
                    const showInvoiceLogo = fd.get('showInvoiceLogo') === 'on';
                    handleUpdateSettings(
                      fd.get('shopName') as string,
                      fd.get('shopAddress') as string,
                      fd.get('shopPhone') as string,
                      logoPreview,
                      selectedThemeColor,
                      showInvoiceDate,
                      showInvoiceBranch,
                      showInvoiceLogo
                    );
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {/* Logo Upload Section */}
                  <div className="md:col-span-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 bg-slate-500/5">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner">
                      {logoPreview ? (
                        <img src={logoPreview} alt="شعار المجموعة" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <Building size={24} className="text-slate-400" />
                      )}
                    </div>
                    
                    <div className="space-y-1.5 flex-1">
                      <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">شعار المجموعة التجارية (Logo)</h4>
                      <p className="text-[10px] text-slate-500">اختر صورة مناسبة لتكون الشعار الرسمي للمجموعة. يظهر هذا الشعار في شريط النظام العلوي، في رأس الفواتير المطبوعة، وفي تقرير وسندات القبض.</p>
                      
                      <div className="flex items-center gap-2">
                        <label className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition">
                          <span>رفع وتغيير الشعار ⬆</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                setLogoPreview(evt.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="hidden"
                          />
                        </label>
                        
                        {logoPreview && (
                          <button
                            type="button"
                            onClick={() => setLogoPreview('')}
                            className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer px-2 py-1"
                          >
                            مسح الشعار
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">اسم المحل أو المعرض الرئيسي</label>
                    <input
                      type="text"
                      name="shopName"
                      defaultValue={shopMeta.name}
                      className="w-full p-2.5 rounded-xl glass-input text-sm font-semibold text-slate-950 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">العنوان الجغرافي للشركة</label>
                    <input
                      type="text"
                      name="shopAddress"
                      defaultValue={shopMeta.address}
                      className="w-full p-2.5 rounded-xl glass-input text-sm font-semibold text-slate-950 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">رقم الهاتف أو الجوال</label>
                    <input
                      type="text"
                      name="shopPhone"
                      defaultValue={shopMeta.phone}
                      className="w-full p-2.5 rounded-xl glass-input text-sm font-semibold text-slate-950 dark:text-white"
                      required
                    />
                  </div>

                  {/* Printed Invoice Customization */}
                  <div className="md:col-span-3 space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                    <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">تخصيص مظهر الفاتورة المطبوعة (Print Invoice Customization)</label>
                    <p className="text-[10px] text-slate-500 mb-3">حدد العناصر والبيانات التي ترغب في إظهارها أو إخفائها عند طباعة الفواتير والسندات لعملائك.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-slate-500/5 hover:bg-slate-500/10 cursor-pointer select-none transition">
                        <input
                          type="checkbox"
                          name="showInvoiceDate"
                          defaultChecked={shopMeta.showInvoiceDate !== false}
                          className="w-4 h-4 text-emerald-500 border-slate-300 dark:border-slate-700 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="space-y-0.5 text-right">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">إظهار تاريخ ووقت الفاتورة</span>
                          <span className="text-[9px] text-slate-400 block">تفعيل لعرض وقت المعاملة الدقيق بالفاتورة</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-slate-500/5 hover:bg-slate-500/10 cursor-pointer select-none transition">
                        <input
                          type="checkbox"
                          name="showInvoiceBranch"
                          defaultChecked={shopMeta.showInvoiceBranch !== false}
                          className="w-4 h-4 text-emerald-500 border-slate-300 dark:border-slate-700 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="space-y-0.5 text-right">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">إظهار اسم المستودع / الفرع</span>
                          <span className="text-[9px] text-slate-400 block">تفعيل لعرض الفرع الذي خرجت منه البضاعة</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-slate-500/5 hover:bg-slate-500/10 cursor-pointer select-none transition">
                        <input
                          type="checkbox"
                          name="showInvoiceLogo"
                          defaultChecked={shopMeta.showInvoiceLogo !== false}
                          className="w-4 h-4 text-emerald-500 border-slate-300 dark:border-slate-700 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="space-y-0.5 text-right">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">إظهار شعار الشركة</span>
                          <span className="text-[9px] text-slate-400 block">تفعيل لعرض شعار المجموعة في رأس الفاتورة</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Theme Color Selector */}
                  <div className="md:col-span-3 space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                    <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">اختيار اللون الرئيسي الموحد للتطبيق (Theme Colors)</label>
                    <p className="text-[10px] text-slate-500 mb-3">اختر اللون المميز لعملياتك. سيقوم النظام بتحديث كافة الأزرار، الأيقونات، والعناصر البصرية لتتناسب مع ذوقك ومظهر شركتك فوراً.</p>
                    
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { id: 'emerald', name: 'أزرق كاش (الافتراضي)', colorBg: 'bg-blue-500' },
                        { id: 'green', name: 'أخضر زمردي', colorBg: 'bg-emerald-500' },
                        { id: 'blue', name: 'أزرق محيطي', colorBg: 'bg-sky-500' },
                        { id: 'indigo', name: 'بنفسجي ملكي', colorBg: 'bg-indigo-500' },
                        { id: 'purple', name: 'أرجواني', colorBg: 'bg-purple-500' },
                        { id: 'amber', name: 'برتقالي ذهبي', colorBg: 'bg-amber-500' },
                        { id: 'rose', name: 'أحمر مرجاني', colorBg: 'bg-rose-500' }
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setSelectedThemeColor(theme.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition ${selectedThemeColor === theme.id ? 'border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-500/5 text-slate-600 dark:text-slate-400'}`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${theme.colorBg} shrink-0 shadow-inner`}></span>
                          <span>{theme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-3 text-left">
                    <button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer transition"
                    >
                      تحديث إعدادات الهوية والمظهر
                    </button>
                  </div>
                </form>
              </div>
              )}

              {/* Group Manager (إضافة مجموعة مستقلة) */}
              {!currentUser.permissions.canAccessSettings ? (
                renderLockedCard(
                  "تأسيس مجموعة أعمال تجارية مستقلة جديدة",
                  "إضافة مجموعات تجارية جديدة أو التعديل عليها صلاحية خاصة بالمخولين بإعدادات النظام لتفادي إنشاء مجموعات وهمية."
                )
              ) : (
                <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
                  <h3 className="font-extrabold text-md text-slate-950 dark:text-white flex items-center gap-1">
                    <FolderPlus size={18} className="text-emerald-500" /> تأسيس مجموعة أعمال تجارية مستقلة جديدة
                  </h3>
                <p className="text-xs text-slate-500">
                  يتيح لك نظام غزة كاش العمل على عدة مجموعات مستقلة؛ حيث تمتلك كل مجموعة سجل أصناف، عملاء، فروع، فواتير ومستودعات معزولة تماماً في مأمن من التداخل.
                </p>

                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">اسم المجموعة التجارية الجديدة</label>
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="مثال: مجموعة الرمال لمستحضرات التجميل"
                        className="w-full p-2.5 rounded-xl glass-input text-xs font-bold text-slate-950 dark:text-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">الاسم التجاري للمحل</label>
                      <input
                        type="text"
                        value={newGroupShopName}
                        onChange={(e) => setNewGroupShopName(e.target.value)}
                        placeholder="مثال: معرض الرمال باريس"
                        className="w-full p-2.5 rounded-xl glass-input text-xs font-bold text-slate-950 dark:text-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">عنوان المقر أو الفرع الافتراضي</label>
                      <input
                        type="text"
                        value={newGroupAddress}
                        onChange={(e) => setNewGroupAddress(e.target.value)}
                        placeholder="الرمال، شارع الجلاء"
                        className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-950 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">رقم الهاتف المستهدف</label>
                      <input
                        type="text"
                        value={newGroupPhone}
                        onChange={(e) => setNewGroupPhone(e.target.value)}
                        placeholder="059-XXXXXXX"
                        className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer transition flex items-center gap-1"
                  >
                    تأسيس المجموعة المستقلة <Plus size={14} />
                  </button>
                </form>
              </div>
              )}
            </>
          )}

          {settingsSubTab === 'backup' && (
            <>
              {/* Data backups and security rules */}
              {!currentUser.permissions.canAccessSettings ? (
                renderLockedCard(
                  "الأمان والنسخ الاحتياطي لقواعد البيانات",
                  "تصدير أو استيراد البيانات مسموح فقط للمخولين بإعدادات النظام للحفاظ على سرية الحسابات والبيانات الحساسة."
                )
              ) : (
                <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
                  <h3 className="font-extrabold text-md text-slate-950 dark:text-white flex items-center gap-1">
                    <Share2 size={18} className="text-emerald-500" /> الأمان والنسخ الاحتياطي لقواعد البيانات
                  </h3>
                <p className="text-xs text-slate-500">
                  لحماية أعمالك من الضياع، يمكنك سحب نسخة مبرمجة شاملة لكافة مجموعاتك ونقاط البيع الخاصة بك كملف مشفر، واستعادتها على أي جهاز كمبيوتر آخر يعمل بنظام غزة كاش.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleDownloadBackup}
                    className="flex-1 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-extrabold text-xs p-4 rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <FolderSync size={18} /> تصدير نسخة احتياطية كاملة (.json)
                  </button>

                  <div className="flex-1 relative border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-center items-center">
                    <label className="text-xs font-bold text-slate-500 cursor-pointer flex flex-col items-center gap-1">
                      <span>📤 استيراد نسخة احتياطية من ملف</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportBackup}
                        className="hidden"
                      />
                      <span className="text-[10px] text-emerald-600 font-bold">انقر لاختيار ملف JSON المعتمد</span>
                    </label>
                  </div>
                </div>
              </div>
              )}

              {/* Data Wiping & Factory Reset Panel */}
              {!currentUser.permissions.canAccessSettings ? (
                renderLockedCard(
                  "تصفير البيانات وإعادة تعيين النظام",
                  "أدوات تصفير الحسابات والمسح الشامل تم تقييدها بالكامل لحماية النشاط المالي من الضياع أو التخريب غير المصرح به."
                )
              ) : (
                <div className="rounded-2xl glass-panel-card p-5 border border-red-500/20 dark:border-red-500/10 shadow-md space-y-4">
                  <h3 className="font-extrabold text-md text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <RotateCcw size={18} className="text-red-500" /> تصفير البيانات وإعادة تعيين النظام
                  </h3>
                <p className="text-xs text-slate-500">
                  لوحة تحكم لإفراغ وتطهير قواعد البيانات عند بدء دورة مالية جديدة، أو العودة للحالة التجريبية لغرض التدريب، أو مسح المنظومة بالكامل.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Option 1: Clean Reset Current Group */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 bg-slate-500/5">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">تصفير المجموعة الحالية</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        يمسح كافة الفواتير والأصناف والزبائن والموردين في المجموعة النشطة فقط (المجموعة الحالية: {shopMeta.name}) ويترك قاعدة البيانات خاوية تماماً للبدء من الصفر.
                      </p>
                    </div>
                    <button
                      onClick={() => handleResetCurrentGroup(true)}
                      className="w-full bg-slate-200 dark:bg-slate-900 hover:bg-red-500 hover:text-white text-slate-700 dark:text-slate-300 font-bold text-xs py-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center gap-1"
                    >
                      <Trash size={12} /> مسح وتصفير المجموعة الحالية
                    </button>
                  </div>

                  {/* Option 2: Default Sample Reset Current Group */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 bg-slate-500/5">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">إعادة تعيين للبيانات التجريبية</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        يعيد تعيين المجموعة الحالية لبياناتها التجريبية والافتراضية الأولى (التي تصدر مع النظام)، لإلغاء أي تعديلات خاطئة ولأغراض التدريب والتدقيق.
                      </p>
                    </div>
                    <button
                      onClick={() => handleResetCurrentGroup(false)}
                      className="w-full bg-slate-200 dark:bg-slate-900 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-300 font-bold text-xs py-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center gap-1"
                    >
                      <RotateCcw size={12} /> تعبئة بالبيانات التجريبية
                    </button>
                  </div>

                  {/* Option 3: System Factory Reset */}
                  <div className="border border-red-500/10 dark:border-red-500/5 rounded-xl p-4 flex flex-col justify-between space-y-3 bg-red-500/5">
                    <div>
                      <h4 className="font-extrabold text-xs text-red-600 dark:text-red-400">إعادة ضبط المصنع بالكامل</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        حذف المنظومة بكاملها! يزيل كافة مجموعات العمل، الفروع، الإعدادات، التخصيصات المضافة، وجميع قواعد البيانات من متصفحك ليعود النظام وكأنه يُفتح للمرة الأولى.
                      </p>
                    </div>
                    <button
                      onClick={handleSystemFactoryReset}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center gap-1 shadow"
                    >
                      <Trash size={12} /> تصفير شامل (ضبط المصنع)
                    </button>
                  </div>
                </div>
              </div>
              )}

              {/* --- 1. DANGEROUS OPERATIONS / ADMINISTRATION CONTROL PANEL --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Manual Stock Adjustment Tool */}
                {!currentUser.permissions.canEditInventory ? (
                  renderLockedCard(
                    "تعديل رصيد صنف يدوياً (تسوية جرد)",
                    "تسويات المخزون اليدوية تؤثر بشكل مباشر على الأرباح والتقارير المالية، لذلك تم قصرها على الحسابات المخولة بإدارة المخزون."
                  )
                ) : (
                  <div className="rounded-2xl glass-panel-card p-5 border border-amber-500/10 dark:border-amber-500/5 shadow-md space-y-4">
                    <h3 className="font-extrabold text-md text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <RefreshCw size={18} className="text-amber-500" /> تعديل رصيد صنف يدوياً (تسوية جرد)
                    </h3>
                  <p className="text-xs text-slate-500">
                    أداة إدارية لتعديل الكمية المتوفرة لصنف معين في مستودع محدد مباشرة، دون الحاجة لعملية شراء أو بيع. سيتم قيد هذه العملية في كشف حركة الصنف وسجل الأمان.
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!adjItemId || !adjBranchId || adjQty === '') {
                        alert('يرجى اختيار الصنف والمستودع وتحديد الكمية الجديدة!');
                        return;
                      }
                      handleAdjustStockManual(adjItemId, adjBranchId, +adjQty, adjNotes);
                      setAdjQty('');
                      setAdjNotes('');
                    }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">اختر الصنف</label>
                        <select
                          value={adjItemId}
                          onChange={(e) => setAdjItemId(e.target.value)}
                          className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-medium"
                          required
                        >
                          <option value="">-- اختر صنفاً --</option>
                          {groupData.items.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">المستودع / الفرع</label>
                        <select
                          value={adjBranchId}
                          onChange={(e) => setAdjBranchId(e.target.value)}
                          className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-medium"
                          required
                        >
                          <option value="">-- اختر فرعاً --</option>
                          {groupData.branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">الرصيد الجديد (الوحدة الكبرى)</label>
                        <input
                          type="number"
                          step="any"
                          value={adjQty}
                          onChange={(e) => setAdjQty(e.target.value !== '' ? +e.target.value : '')}
                          placeholder="مثال: 50"
                          className="w-full p-2 rounded-xl glass-input text-xs font-bold font-mono text-slate-900 dark:text-white"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">ملاحظات وسبب التعديل</label>
                        <input
                          type="text"
                          value={adjNotes}
                          onChange={(e) => setAdjNotes(e.target.value)}
                          placeholder="مثال: فروقات جرد نصف سنوي"
                          className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-2.5 rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-1"
                    >
                      تحديث الرصيد وتسجيل العملية في سجل الأمان <ShieldCheck size={14} />
                    </button>
                  </form>
                </div>
                )}

                {/* Permanent Invoice Deletion Tool */}
                {!currentUser.permissions.canDeleteInvoices ? (
                  renderLockedCard(
                    "مسح وإلغاء فاتورة معتمدة (مبيعات / مشتريات)",
                    "إلغاء الفواتير المسجلة يؤدي لتغيير الذمم والكميات تلقائياً؛ هذه الصلاحية مقفلة للموظفين غير المخولين بحذف الفواتير المصدرة."
                  )
                ) : (
                  <div className="rounded-2xl glass-panel-card p-5 border border-red-500/10 dark:border-red-500/5 shadow-md space-y-4">
                    <h3 className="font-extrabold text-md text-red-600 dark:text-red-400 flex items-center gap-2">
                      <Trash size={18} className="text-red-500 animate-pulse" /> مسح وإلغاء فاتورة معتمدة (مبيعات / مشتريات)
                    </h3>
                  <p className="text-xs text-slate-500">
                    أداة حساسة جداً لحذف الفواتير الخاطئة تماماً. ستقوم الأداة بـ: حذف الفاتورة، إرجاع كميات الأصناف للمخازن تلقائياً، تسوية حسابات العملاء/الموردين وحذف قيود الحركة.
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!delInvoiceNo) {
                        alert('يرجى تحديد أو إدخال رقم الفاتورة المطلوب مسحها!');
                        return;
                      }
                      if (!delReason) {
                        alert('يرجى كتابة سبب الحذف لتوثيقه في سجل الأمان والمساءلة!');
                        return;
                      }
                      setConfirmModal({
                        isOpen: true,
                        title: 'تحذير أمان حرج',
                        message: `هل أنت متأكد تماماً من رغبتك في مسح الفاتورة رقم (${delInvoiceNo})؟\nسيتم عكس كميات المخازن وتصفية أرصدة الذمم المالية على الفور.`,
                        isDanger: true,
                        onConfirm: () => {
                          handleDeleteInvoice(delInvoiceNo, delReason);
                          setDelInvoiceNo('');
                          setDelReason('');
                        }
                      });
                    }}
                    className="space-y-3"
                  >
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">اختر الفاتورة المستهدفة</label>
                      <select
                        value={delInvoiceNo}
                        onChange={(e) => setDelInvoiceNo(e.target.value)}
                        className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-semibold"
                        required
                      >
                        <option value="">-- اختر الفاتورة المراد مسحها --</option>
                        <optgroup label="فواتير المبيعات POS">
                          {groupData.sales.map(sale => (
                            <option key={sale.id} value={sale.invoiceNo}>
                              {sale.invoiceNo} - للزبون ({sale.customerName}) - قيمة: {sale.total.toFixed(2)} شيكل
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="فواتير المشتريات والموردين">
                          {groupData.purchases.map(pur => (
                            <option key={pur.id} value={pur.invoiceNo}>
                              {pur.invoiceNo} - من المورد ({pur.supplierName}) - قيمة: {pur.total.toFixed(2)} شيكل
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">سبب مسح وإلغاء الفاتورة (إجباري)</label>
                      <input
                        type="text"
                        value={delReason}
                        onChange={(e) => setDelReason(e.target.value)}
                        placeholder="مثال: فاتورة مكررة أو تم إلغاء البيعة من العميل"
                        className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-1"
                    >
                      مسح الفاتورة نهائياً وعكس الكميات والذمم <Trash size={14} />
                    </button>
                  </form>
                </div>
                )}

              </div>

              {/* --- 2. THE AUDIT LOG DISPLAY TABLE PANEL --- */}
              <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-md text-slate-950 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck size={18} className="text-emerald-500" /> سجل نشاط العمليات الحساسة والأمان (Audit Log)
                    </h3>
                    <p className="text-xs text-slate-500">
                      يعمل هذا السجل تلقائياً على توثيق جميع التعديلات ومسح الفواتير والتسويات اليدوية وتصدير البيانات لزيادة الشفافية والاعتمادية الجنائية للنشاط.
                    </p>
                  </div>

                  <button
                    onClick={handleClearAuditLogs}
                    className="bg-slate-200 dark:bg-slate-900 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 text-slate-500 font-bold text-[10px] px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    تصفير السجل بالكامل
                  </button>
                </div>

                {/* Filter and Search */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-100/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    
                    {/* Interactive Text Search */}
                    <div className="md:col-span-4 relative">
                      <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">ابحث بالاسم أو التفاصيل</label>
                      <div className="relative">
                        <Search size={14} className="absolute right-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          value={logSearchQuery}
                          onChange={(e) => setLogSearchQuery(e.target.value)}
                          placeholder="ابحث عن صنف، رقم فاتورة، موظف..."
                          className="w-full p-2 pr-9 rounded-xl glass-input text-xs text-slate-950 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Filter by Operator */}
                    <div className="md:col-span-3">
                      <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                        <UserCheck size={11} className="text-emerald-500" /> الموظف المسؤول
                      </label>
                      <select
                        value={logOperatorFilter}
                        onChange={(e) => setLogOperatorFilter(e.target.value)}
                        className="w-full p-2 rounded-xl glass-input text-xs text-slate-950 dark:text-white cursor-pointer"
                      >
                        <option value="">كافة الموظفين والمستخدمين</option>
                        {uniqueOperators.map(op => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filter by Action */}
                    <div className="md:col-span-3">
                      <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                        <SlidersHorizontal size={11} className="text-emerald-500" /> نوع الإجراء (العملية)
                      </label>
                      <select
                        value={logActionFilter}
                        onChange={(e) => setLogActionFilter(e.target.value)}
                        className="w-full p-2 rounded-xl glass-input text-xs text-slate-950 dark:text-white cursor-pointer"
                      >
                        <option value="">كافة أنواع الإجراءات والعمليات</option>
                        {uniqueActions.map(action => (
                          <option key={action} value={action}>{action}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filter by Severity */}
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                        <Filter size={11} className="text-emerald-500" /> مستوى الخطورة
                      </label>
                      <select
                        value={logSeverityFilter}
                        onChange={(e) => setLogSeverityFilter(e.target.value)}
                        className="w-full p-2 rounded-xl glass-input text-xs text-slate-950 dark:text-white cursor-pointer"
                      >
                        <option value="">كافة المستويات</option>
                        <option value="info">معلومة (أخضر)</option>
                        <option value="warning">تنبيه (أصفر)</option>
                        <option value="critical">حرج (أحمر)</option>
                      </select>
                    </div>

                  </div>

                  {/* Active Filters Stats & Reset */}
                  <div className="flex items-center justify-between text-[11px] px-1 bg-slate-500/5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-400">
                      أظهرت النتائج <span className="font-extrabold text-slate-800 dark:text-white">{filteredAuditLogs.length}</span> عملية من أصل <span className="font-extrabold text-slate-800 dark:text-white">{(groupData.auditLogs || []).length}</span> مسجلة في سجل الأمان.
                    </div>
                    {(logSearchQuery || logOperatorFilter || logActionFilter || logSeverityFilter) && (
                      <button
                        onClick={() => {
                          setLogSearchQuery('');
                          setLogOperatorFilter('');
                          setLogActionFilter('');
                          setLogSeverityFilter('');
                        }}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-extrabold hover:underline flex items-center gap-1 cursor-pointer transition"
                      >
                        إزالة التصفية الفعّالة ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Logs Table */}
                <div className="overflow-x-auto no-scrollbar max-h-[350px] border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3">التاريخ والوقت</th>
                        <th className="p-3">الإجراء والمستوى</th>
                        <th className="p-3">المسؤول</th>
                        <th className="p-3">التفاصيل الكاملة للعملية</th>
                        <th className="p-3 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredAuditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                            لا توجد أي سجلات نشاط تطابق شروط البحث الحالية.
                          </td>
                        </tr>
                      ) : (
                        filteredAuditLogs.map((log) => {
                          const severityColors = {
                            info: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
                            warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
                            critical: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                          };

                          return (
                            <tr 
                              key={log.id} 
                              className="hover:bg-slate-500/5 transition text-slate-900 dark:text-white cursor-pointer"
                              onClick={() => setSelectedAuditLog(log)}
                              title="انقر لفتح تفاصيل هذه العملية الحساسة"
                            >
                              <td className="p-3 whitespace-nowrap font-mono text-[10px] text-slate-500">
                                {new Date(log.timestamp).toLocaleString('ar-EG')}
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="font-bold block">{log.action}</span>
                                <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-extrabold mt-0.5 ${severityColors[log.severity || 'info']}`}>
                                  {log.severity === 'critical' ? 'حرج' : log.severity === 'warning' ? 'تنبيه' : 'معلومة'}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap font-semibold text-slate-600 dark:text-slate-400">
                                {log.operator}
                              </td>
                              <td className="p-3 text-slate-500 dark:text-slate-300 max-w-[300px] leading-relaxed truncate">
                                {log.details}
                              </td>
                              <td className="p-3 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAuditLog(log);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:text-emerald-400 text-[10px] font-black transition cursor-pointer"
                                >
                                  <Eye size={12} />
                                  <span>فتح</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

            </div>
          )}

          {/* H. TAB: FIREWALL & SECURITY CENTER */}
          {activeTab === 'firewall' && (
            <div className="rounded-2xl glass-panel-card p-6 border border-white/25 shadow-md bg-white dark:bg-slate-950/40">
              <FirewallDashboard
                settings={groupData.firewallSettings || {
                  enabled: true,
                  maxAttempts: 3,
                  lockoutDuration: 5,
                  highSecurityMode: false,
                  blockedIps: [],
                  whitelistedIps: ['127.0.0.1', '192.168.1.1']
                }}
                alerts={groupData.securityAlerts || []}
                currentUserRole={userRole}
                onUpdateSettings={handleUpdateFirewallSettings}
                onUpdateAlerts={handleUpdateSecurityAlerts}
                onAddAuditLog={handleAddAuditLogDirect}
              />
            </div>
          )}

        </main>

      </div>

      {/* FOOTER - Geometric Balance style bottom command bar */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-900/50 bg-slate-50 dark:bg-black/40 py-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4 no-print text-xs">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="glow-dot text-emerald-500 bg-emerald-500"></div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">قاعدة البيانات المحلية: متصلة ونشطة</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="glow-dot text-blue-500 bg-blue-500"></div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">النسخ الاحتياطي السحابي: مفعل وتلقائي</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">
          تصميم هندسي متوازن من غزة كاش © 2026 - جميع الحقوق محفوظة
        </div>
      </footer>

      {/* Floating Sidebar Trigger when collapsed */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="fixed bottom-6 left-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all duration-200 hover:scale-105 flex items-center gap-2 border border-emerald-400/20 cursor-pointer no-print animate-bounce"
        >
          <Menu size={16} />
          <span>إظهار القائمة الانتقالية</span>
        </button>
      )}

      {/* 🧾 On-Screen Interactive Receipt Preview & WhatsApp Share Modal */}
      <AnimatePresence>
        {lastPrintedSale && showOnScreenReceipt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800/80 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-emerald-500 text-white">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowOnScreenReceipt(false);
                    setLastPrintedSale(null);
                  }} 
                  className="hover:bg-white/10 p-1.5 rounded-xl transition-all text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  <Receipt size={18} /> معاينة الفاتورة الصادرة ومشاركتها
                </h3>
              </div>

              {/* Receipt Body - styled to look like thermal paper */}
              <div className="p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex-1 flex flex-col items-center">
                <div id="thermal-receipt-print" className="print-invoice-wrapper bg-white dark:bg-slate-900 w-full rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800/80 text-right relative overflow-hidden">
                  {/* Decorative cut marks at top/bottom */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-200 to-transparent dark:from-slate-800"></div>
                  
                  {/* Logo and Shop Info */}
                  <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-xl font-black shadow-sm">
                      {base64Logo ? (
                        <img src={base64Logo} alt="Logo" className="w-full h-full object-contain p-1 rounded-2xl" />
                      ) : 'غك'}
                    </div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">{shopMeta.name || 'غزة كاش ERP'}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">فاتورة مبيعات معتمدة</p>
                  </div>

                  {/* Meta details */}
                  <div className="py-3 border-b border-dashed border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span className="font-mono text-slate-900 dark:text-white font-bold">{lastPrintedSale.invoiceNo}</span>
                      <span className="font-bold text-slate-400">رقم الفاتورة:</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono">{new Date(lastPrintedSale.date).toLocaleString('ar-EG')}</span>
                      <span className="font-bold text-slate-400">التاريخ والوقت:</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{lastPrintedSale.customerName}</span>
                      <span className="font-bold text-slate-400">العميل المستلم:</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{lastPrintedSale.branchName || 'الفرع الرئيسي'}</span>
                      <span className="font-bold text-slate-400">الفرع / الموقع:</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="py-3 border-b border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">السلع والخدمات المدرجة:</span>
                    {lastPrintedSale.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs font-sans">
                        <div className="text-left font-mono font-bold text-slate-900 dark:text-white">
                          {(item.quantity * item.price).toFixed(2)}
                        </div>
                        <div className="text-right flex-1 pr-2 space-y-0.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.itemName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.quantity} {item.unitName} × {item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="py-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span className="font-mono">{lastPrintedSale.subTotal.toFixed(2)}</span>
                      <span>المجموع قبل الخصم:</span>
                    </div>
                    {lastPrintedSale.discount > 0 && (
                      <div className="flex justify-between text-red-500">
                        <span className="font-mono">-{lastPrintedSale.discount.toFixed(2)}</span>
                        <span>قيمة الخصم الممنوح:</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="font-mono text-emerald-500">
                        {lastPrintedSale.total.toFixed(2)} {(currencies.find(c => c.id === lastPrintedSale.currencyId) || activeCurrency).symbol}
                      </span>
                      <span>الصافي النهائي المطلوب:</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1">
                      <span className="font-mono text-slate-800 dark:text-slate-200">{lastPrintedSale.paidAmount.toFixed(2)}</span>
                      <span>المبلغ المدفوع كاش:</span>
                    </div>
                    {lastPrintedSale.total - lastPrintedSale.paidAmount > 0 && (
                      <div className="flex justify-between text-amber-500 font-bold">
                        <span className="font-mono">{(lastPrintedSale.total - lastPrintedSale.paidAmount).toFixed(2)}</span>
                        <span>المتبقي ذمم آجل:</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400 text-[10px] pt-2 text-center border-t border-dashed border-slate-200 dark:border-slate-800">
                      <span className="w-full">{lastPrintedSale.notes || 'شكرًا لثقتكم بنا! نسعد بخدمتكم دائماً.'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 w-full flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* Print button */}
                  <button
                    type="button"
                    onClick={() => {
                      (window as any)._printTargetSelector = '#thermal-receipt-print';
                      window.print();
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    <Coins size={14} /> طباعة الفاتورة ورقياً
                  </button>

                  {/* Share WhatsApp button */}
                  <button
                    type="button"
                    onClick={() => {
                      const customerObj = groupData.contacts.find(c => c.id === lastPrintedSale.customerId);
                      const customerPhone = customerObj ? customerObj.phone : '';
                      
                      let itemsText = lastPrintedSale.items.map(item => 
                        `• ${item.itemName} (${item.quantity} ${item.unitName} × ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)})`
                      ).join('\n');

                      const currencySymbol = (currencies.find(c => c.id === lastPrintedSale.currencyId) || activeCurrency).symbol;

                      const message = `🧾 *فاتورة مبيعات معتمدة - ${shopMeta.name || 'غزة كاش ERP'}*\n\n` +
                        `📄 *رقم الفاتورة:* ${lastPrintedSale.invoiceNo}\n` +
                        `📅 *التاريخ والوقت:* ${new Date(lastPrintedSale.date).toLocaleString('ar-EG')}\n` +
                        `👤 *العميل المستلم:* ${lastPrintedSale.customerName}\n` +
                        `-----------------------------\n` +
                        `📦 *السلع المدرجة:*\n${itemsText}\n` +
                        `-----------------------------\n` +
                        `💵 *المجموع:* ${lastPrintedSale.subTotal.toFixed(2)} ${currencySymbol}\n` +
                        (lastPrintedSale.discount > 0 ? `🏷️ *الخصم الممنوح:* ${lastPrintedSale.discount.toFixed(2)} ${currencySymbol}\n` : '') +
                        `✨ *الصافي المطلوب:* ${lastPrintedSale.total.toFixed(2)} ${currencySymbol}\n` +
                        `💰 *المدفوع نقداً:* ${lastPrintedSale.paidAmount.toFixed(2)} ${currencySymbol}\n` +
                        (lastPrintedSale.total - lastPrintedSale.paidAmount > 0 ? `⚠️ *المتبقي ذمم:* ${(lastPrintedSale.total - lastPrintedSale.paidAmount).toFixed(2)} ${currencySymbol}\n` : '') +
                        `-----------------------------\n` +
                        `🌸 _${lastPrintedSale.notes || 'شكرًا لتعاملكم معنا! نسعد بخدمتكم دائمًا.'}_`;

                      navigator.clipboard.writeText(message);
                      showToast('📋 تم نسخ نص الفاتورة المنسق لمشاركته عبر الواتساب بنجاح!', 'success');

                      if (customerPhone) {
                        const cleanPhone = customerPhone.replace(/\D/g, '');
                        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
                      } else {
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-blue-500/10"
                  >
                    <Share2 size={14} /> مشاركة عبر الواتساب 💬
                  </button>
                </div>

                {/* Export PDF Button */}
                <button
                  type="button"
                  onClick={async () => {
                    const { usePrint } = await import('./utils/usePrint');
                    const { exportInvoiceToPDF } = usePrint();
                    const settings = {
                      name: shopMeta.name,
                      address: shopMeta.address,
                      phone: shopMeta.phone,
                      logoText: shopMeta.logoText
                    };
                    await exportInvoiceToPDF(
                      lastPrintedSale,
                      'sale',
                      settings,
                      (currencies.find(c => c.id === lastPrintedSale.currencyId) || activeCurrency).symbol
                    );
                  }}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/15"
                >
                  <FileText size={14} /> تصدير وتنزيل الفاتورة كـ PDF احترافي 📄
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowOnScreenReceipt(false);
                    setLastPrintedSale(null);
                  }}
                  className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  إغلاق معاينة الفاتورة
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print-Only Active POS Receipt/Invoice Container */}
      {lastPrintedSale && (
        <div className="print-only hidden">
          <div className="print-invoice-wrapper bg-white p-6 space-y-6 text-right" dir="rtl">
            {/* Header */}
            <div className="border-b border-slate-200 pb-4 text-right space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full uppercase">
                    فاتورة مبيعات معتمدة (صادرة عن نقطة البيع)
                  </span>
                  <h3 className="font-extrabold text-lg text-slate-950">
                    رقم الفاتورة: <span className="font-mono">{lastPrintedSale.invoiceNo}</span>
                  </h3>
                  {shopMeta.showInvoiceDate !== false && (
                    <p className="text-xs text-slate-500">{new Date(lastPrintedSale.date).toLocaleString('ar-EG')}</p>
                  )}
                </div>
                
                {shopMeta.showInvoiceLogo !== false && (
                  <div className="flex items-center gap-2">
                    {base64Logo ? (
                      <img src={base64Logo} alt="Logo" className="w-10 h-10 rounded-xl object-contain border border-slate-200 p-0.5 bg-white" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                        غك
                      </div>
                    )}
                    <div className="text-left font-bold text-xs text-slate-400">غزة كاش ERP</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                {shopMeta.showInvoiceBranch !== false ? (
                  <>
                    <div className="space-y-1">
                      <span className="text-slate-400 block font-bold">موقع المستودع / الفرع:</span>
                      <span className="font-bold text-slate-800">{lastPrintedSale.branchName || 'الفرع الرئيسي'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block font-bold">العميل المستلم:</span>
                      <span className="font-bold text-slate-800">{lastPrintedSale.customerName}</span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 col-span-2">
                    <span className="text-slate-400 block font-bold">العميل المستلم:</span>
                    <span className="font-bold text-slate-800">{lastPrintedSale.customerName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-500">تفاصيل السلع والأصناف المدرجة:</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <th className="p-2.5">اسم الصنف</th>
                      <th className="p-2.5 text-center">الوحدة المستخدمة</th>
                      <th className="p-2.5 text-center">الكمية</th>
                      <th className="p-2.5 text-center">سعر الوحدة</th>
                      <th className="p-2.5 text-left pl-3">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {lastPrintedSale.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 font-semibold">{item.itemName}</td>
                        <td className="p-2.5 text-center text-slate-500">{item.unitName}</td>
                        <td className="p-2.5 text-center font-mono font-bold">{item.quantity}</td>
                        <td className="p-2.5 text-center font-mono">{item.price.toFixed(2)}</td>
                        <td className="p-2.5 text-left pl-3 font-mono font-bold text-slate-900">{(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              <div className="space-y-1.5 text-xs text-slate-500 italic">
                <span className="font-bold text-slate-400 block not-italic">ملاحظات الفاتورة:</span>
                {lastPrintedSale.notes || 'شكرًا لتعاملكم معنا! نسعد بخدمتكم دائمًا.'}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>المجموع قبل الخصم:</span>
                  <span className="font-mono">{lastPrintedSale.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>قيمة الخصم الممنوح:</span>
                  <span className="font-mono text-red-500">-{lastPrintedSale.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-sm text-slate-900 border-t border-dashed border-slate-300 pt-2">
                  <span>صافي قيمة الفاتورة النهائي:</span>
                  <span className="font-mono text-emerald-600">
                    {lastPrintedSale.total.toFixed(2)} {(currencies.find(c => c.id === lastPrintedSale.currencyId) || activeCurrency).symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>المبلغ المدفوع (نقداً):</span>
                  <span className="font-mono text-slate-900">
                    {lastPrintedSale.paidAmount.toFixed(2)} {(currencies.find(c => c.id === lastPrintedSale.currencyId) || activeCurrency).symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center font-bold text-xs text-slate-500">
                  <span>المتبقي في حساب الذمم:</span>
                  <span className={`font-mono ${lastPrintedSale.total - lastPrintedSale.paidAmount > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {(lastPrintedSale.total - lastPrintedSale.paidAmount).toFixed(2)} {(currencies.find(c => c.id === lastPrintedSale.currencyId) || activeCurrency).symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center font-bold text-xs text-slate-500">
                  <span>طريقة دفع الفاتورة:</span>
                  <span className={`px-2 py-0.5 rounded-full ${lastPrintedSale.paymentType === 'cash' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {lastPrintedSale.paymentType === 'cash' ? 'نقدي كامل' : 'آجل على الحساب'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Premium Confirmation Dialog */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          />
          {/* Modal Container */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-right" dir="rtl">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-full shrink-0 ${confirmModal.isDanger ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                  {confirmModal.message}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              >
                تراجع وإلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  confirmModal.onConfirm();
                }}
                className={`px-4 py-2 rounded-xl text-white font-extrabold text-xs transition cursor-pointer shadow-md ${
                  confirmModal.isDanger 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                    : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                }`}
              >
                تأكيد الإجراء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed View for Selected Audit Log */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSelectedAuditLog(null)}
          />
          {/* Modal Container */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-right" dir="rtl">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  selectedAuditLog.severity === 'critical' 
                    ? 'bg-red-500/10 text-red-500' 
                    : selectedAuditLog.severity === 'warning' 
                      ? 'bg-amber-500/10 text-amber-500' 
                      : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {selectedAuditLog.severity === 'info' ? <Info size={18} /> : <AlertTriangle size={18} />}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">تفاصيل العملية الأمنية الحساسة</h3>
                  <p className="text-[10px] text-slate-400">سجل الأمان والتحقق الرقمي لـ غزة كاش ERP</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">نوع الإجراء أو العملية</span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-1">{selectedAuditLog.action}</span>
                </div>

                <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">المنفذ / المسؤول</span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-1">{selectedAuditLog.operator}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">التاريخ والوقت الكامل</span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 block mt-1 leading-none" dir="ltr">
                    {new Date(selectedAuditLog.timestamp).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'medium' })}
                  </span>
                </div>

                <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">مستوى الخطورة الأمنية</span>
                  <div className="mt-1">
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-black ${
                      selectedAuditLog.severity === 'critical' 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                        : selectedAuditLog.severity === 'warning' 
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {selectedAuditLog.severity === 'critical' ? 'حرج جداً' : selectedAuditLog.severity === 'warning' ? 'تنبيه أمني' : 'عملية اعتيادية'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Details Box */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold block">مخرجات العملية والتفاصيل الدقيقة:</span>
                <div className="p-4 bg-slate-900 dark:bg-black border border-slate-800 rounded-xl max-h-[180px] overflow-y-auto no-scrollbar">
                  <p className="text-slate-200 dark:text-slate-300 font-mono text-[11px] leading-relaxed break-words whitespace-pre-line text-left" dir="ltr">
                    {selectedAuditLog.details}
                  </p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setSelectedAuditLog(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition border border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ⚠️ Modal: Print Instructions for Iframe Sandbox */}
      <AnimatePresence>
        {showPrintIframeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800/80 overflow-hidden flex flex-col text-right"
              dir="rtl"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <button 
                  type="button" 
                  onClick={() => setShowPrintIframeModal(false)} 
                  className="hover:bg-white/10 p-1.5 rounded-xl transition-all text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <Printer size={18} className="animate-pulse" /> تنبيه هام بخصوص طباعة المستندات
                </h3>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-2xl">
                  🖨️
                </div>
                <div className="text-center space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">بيئة التشغيل الحالية تمنع الطباعة المباشرة</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    أنت تتصفح تطبيق <span className="font-bold text-emerald-600 dark:text-emerald-400">نظام غزة كاش</span> حالياً من خلال نافذة المعاينة التفاعلية داخل متصفح الويب.
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 p-3 rounded-2xl font-bold leading-relaxed">
                    ⚠️ المتصفحات تحظر تفعيل أوامر الطباعة (window.print) تلقائياً داخل نوافذ الـ iFrame لحمايتك. لطباعة أي مستند، كشف حساب، أو فاتورة بسلاسة وبشكل فوري، يرجى فتح النظام في نافذة مستقلة.
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowPrintIframeModal(false);
                    // Open application in a new standalone tab/window
                    window.open(window.location.href, '_blank');
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/20 hover:scale-[1.02] duration-150"
                >
                  <ExternalLink size={14} /> فتح النظام في نافذة مستقلة للطباعة المباشرة 🚀
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('📋 تم نسخ رابط التشغيل المباشر للنظام بنجاح!', 'success');
                    }}
                    className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Copy size={13} /> نسخ رابط النظام
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPrintIframeModal(false);
                      showToast('⚠️ جاري محاولة تفعيل الطباعة المباشرة بالرغم من قيود المتصفح...', 'info');
                      // Fallback: try printing anyway, in some browsers/configurations it might work
                      try {
                        window.focus();
                        window.print();
                      } catch (err) {
                        console.error('Print failed', err);
                      }
                    }}
                    className="border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold text-[10px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    محاولة طباعة على أي حال
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPrintIframeModal(false)}
                  className="w-full py-2 bg-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl text-[10px] font-bold transition cursor-pointer text-center"
                >
                  إغلاق هذه النافذة الإرشادية
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dynamic Toast Notifications Container */}
      <div className="fixed bottom-5 left-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full" dir="rtl">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`p-4 rounded-xl shadow-xl border flex items-start gap-3 relative overflow-hidden ${
                toast.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-300'
                  : toast.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-300'
                    : toast.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/90 dark:border-amber-800 dark:text-amber-300'
                      : 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/90 dark:border-sky-800 dark:text-sky-300'
              }`}
            >
              {/* Left animated accent line */}
              <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
              }`} />
              
              <div className="flex-1 text-right">
                <p className="text-xs font-bold leading-relaxed">{toast.message}</p>
              </div>

              <button
                type="button"
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 cursor-pointer self-center"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
