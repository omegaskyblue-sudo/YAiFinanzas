import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';
import {
  Wallet, Globe, Landmark, Save, Plus, Trash2, TrendingUp,
  ArrowRightLeft, Calculator, LogOut, Loader2, Moon, Sun,
  CreditCard, DollarSign, Home, Calendar, Filter, Settings,
  Download, Upload, Copy, User, FileJson, AlertTriangle,
  Users, Lock, Key, CheckCircle, XCircle, LogIn, FileText,
  ArrowDownRight, ArrowUpRight, CalendarDays
} from 'lucide-react';

// --- LocalStorage Helpers ---
const STORAGE_KEYS = {
  BUDGET: 'yaifinanzas_budget',
  USERS: 'yaifinanzas_users'
};

const loadFromStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch { return defaultValue; }
};

const saveToStorage = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error('Storage error:', e); }
};

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-slate-700">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            ✕
          </button>
        </div>
        <div className="p-4 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 ${className}`}>
    {children}
  </div>
);

const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat(currency === 'EUR' ? 'es-ES' : 'es-DO', {
    style: 'currency',
    currency: currency === 'EUR' ? 'EUR' : 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper to get today's date in YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split('T')[0];

export default function App() {
  // App State
  const [loading, setLoading] = useState(true);

  // App Logic State
  const [currentUserData, setCurrentUserData] = useState(() => loadFromStorage('yaifinanzas_session', null));
  const [isAppLoggedIn, setIsAppLoggedIn] = useState(() => !!loadFromStorage('yaifinanzas_session', null));
  const [activeTab, setActiveTab] = useState('dashboard');


  // Theme Logic - Persisted and synced with HTML
  const [darkMode, setDarkMode] = useState(() => loadFromStorage('yaifinanzas_theme', false));

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveToStorage('yaifinanzas_theme', darkMode);
  }, [darkMode]);

  const fileInputRef = useRef(null);

  // System Users State
  const [systemUsers, setSystemUsers] = useState([]);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', error: '' });

  // --- Report Filters State ---
  const [reportFilter, setReportFilter] = useState('month');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });

  // Budget Data State
  const [data, setData] = useState({
    exchangeRate: 64.50,
    incomes: [
      { id: 1, name: 'Sueldo Base', amount: 2500, date: getTodayString() }
    ],
    spain: {
      expenses: [{ id: 'se1', name: 'Alquiler/Hipoteca', amount: 900, type: 'fixed', date: getTodayString() }],
      savings: [{ id: 'ss1', name: 'Fondo de Emergencia', amount: 200, date: getTodayString() }]
    },
    dr: {
      expenses: [{ id: 'de1', name: 'Ayuda Familiar', amount: 15000, type: 'fixed', date: getTodayString() }],
      savings: [{ id: 'ds1', name: 'Ahorro Local', amount: 2000, date: getTodayString() }]
    }
  });

  const [editingItem, setEditingItem] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [targetCollection, setTargetCollection] = useState(null);

  // --- Initial Load from LocalStorage ---
  useEffect(() => {
    // Load budget data
    const savedBudget = loadFromStorage(STORAGE_KEYS.BUDGET, null);
    if (savedBudget) setData(savedBudget);

    // Load users
    let savedUsers = loadFromStorage(STORAGE_KEYS.USERS, []);
    if (savedUsers.length === 0) {
      const defaultUser = { id: Date.now().toString(), username: 'root', password: '28cddf6e77', role: 'admin', createdAt: new Date().toISOString() };
      savedUsers = [defaultUser];
      saveToStorage(STORAGE_KEYS.USERS, savedUsers);
    }
    setSystemUsers(savedUsers);
    setLoading(false);
  }, []);

  const saveData = (newData) => {
    setData(newData);
    saveToStorage(STORAGE_KEYS.BUDGET, newData);
  };

  // --- Login & User Logic ---
  const handleLogin = (e) => {
    e.preventDefault();
    const user = systemUsers.find(u =>
      u.username.toLowerCase() === loginForm.username.toLowerCase() &&
      u.password === loginForm.password
    );

    if (user) {
      setCurrentUserData(user);
      setIsAppLoggedIn(true);
      saveToStorage('yaifinanzas_session', user);
      setLoginForm({ username: '', password: '', error: '' });
    } else {
      setLoginForm(prev => ({ ...prev, error: 'Usuario o contraseña incorrectos' }));
    }
  };

  const handleLogout = () => {
    setIsAppLoggedIn(false);
    setCurrentUserData(null);
    localStorage.removeItem('yaifinanzas_session');
    setActiveTab('dashboard');
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    const userId = formData.get('userId');

    let updatedUsers;
    if (userId) {
      updatedUsers = systemUsers.map(u => u.id === userId ? { ...u, username, password } : u);
    } else {
      if (systemUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        alert('Ya existe un usuario con este nombre.');
        return;
      }
      const newUser = { id: Date.now().toString(), username, password, role: 'user', createdAt: new Date().toISOString() };
      updatedUsers = [...systemUsers, newUser];
    }
    setSystemUsers(updatedUsers);
    saveToStorage(STORAGE_KEYS.USERS, updatedUsers);
    setEditingUser(null);
  };

  const handleDeleteUser = (id) => {
    if (id === currentUserData.id) return alert("No puedes eliminar tu propio usuario.");
    if (confirm('¿Seguro que quieres eliminar este usuario?')) {
      const updatedUsers = systemUsers.filter(u => u.id !== id);
      setSystemUsers(updatedUsers);
      saveToStorage(STORAGE_KEYS.USERS, updatedUsers);
    }
  };

  // --- Helpers for Current Month Logic ---
  const getCurrentMonthIncomes = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    return data.incomes.filter(inc => {
      const d = new Date(inc.date || '2000-01-01');
      return d >= startOfMonth && d <= endOfMonth;
    });
  };

  // --- Calculations ---
  const currentMonthIncomesList = getCurrentMonthIncomes();
  const totalIncomeEUR = currentMonthIncomesList.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalSpainExpensesEUR = data.spain.expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalSpainSavingsEUR = data.spain.savings.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalDRExpensesDOP = data.dr.expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalDRSavingsDOP = data.dr.savings.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalDRExpensesEUR = totalDRExpensesDOP / data.exchangeRate;
  const totalDRSavingsEUR = totalDRSavingsDOP / data.exchangeRate;

  const totalExpensesEUR = totalSpainExpensesEUR + totalDRExpensesEUR;
  const totalSavingsEUR = totalSpainSavingsEUR + totalDRSavingsEUR;
  const remainingEUR = totalIncomeEUR - totalExpensesEUR - totalSavingsEUR;

  // --- Report Logic ---
  const getFilteredData = useMemo(() => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);

    const filterByDate = (items) => items.filter(item => {
      const itemDate = item.date ? new Date(item.date) : new Date();
      return itemDate >= start && itemDate <= end;
    });

    const filteredSpainExpenses = filterByDate(data.spain.expenses);
    const filteredDRExpenses = filterByDate(data.dr.expenses);

    const timelineData = {};
    filteredSpainExpenses.forEach(item => {
      const d = item.date || getTodayString();
      if (!timelineData[d]) timelineData[d] = { date: d, spain: 0, dr: 0 };
      timelineData[d].spain += Number(item.amount);
    });
    filteredDRExpenses.forEach(item => {
      const d = item.date || getTodayString();
      if (!timelineData[d]) timelineData[d] = { date: d, spain: 0, dr: 0 };
      timelineData[d].dr += (Number(item.amount) / data.exchangeRate);
    });

    const chartData = Object.values(timelineData).sort((a, b) => new Date(a.date) - new Date(b.date));
    return { spainExpenses: filteredSpainExpenses, drExpenses: filteredDRExpenses, chartData };
  }, [data, dateRange]);

  const getStatementData = useMemo(() => {
    const incomes = data.incomes.map(i => ({ ...i, type: 'Ingreso', isCredit: true, currency: 'EUR', amountEUR: Number(i.amount) }));
    const spExp = data.spain.expenses.map(i => ({ ...i, type: 'Gasto ES', isCredit: false, currency: 'EUR', amountEUR: Number(i.amount) }));
    const spSav = data.spain.savings.map(i => ({ ...i, type: 'Ahorro ES', isCredit: false, currency: 'EUR', amountEUR: Number(i.amount) }));
    const drExp = data.dr.expenses.map(i => ({ ...i, type: 'Gasto RD', isCredit: false, currency: 'DOP', amountEUR: Number(i.amount) / data.exchangeRate }));
    const drSav = data.dr.savings.map(i => ({ ...i, type: 'Ahorro RD', isCredit: false, currency: 'DOP', amountEUR: Number(i.amount) / data.exchangeRate }));

    const allTransactions = [...incomes, ...spExp, ...spSav, ...drExp, ...drSav];
    allTransactions.sort((a, b) => new Date(a.date || '2000-01-01') - new Date(b.date || '2000-01-01'));

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);

    let runningBalance = 0;
    const filteredStatement = [];

    allTransactions.forEach(t => {
      if (t.isCredit) runningBalance += t.amountEUR;
      else runningBalance -= t.amountEUR;
      const d = new Date(t.date || '2000-01-01');
      if (d >= start && d <= end) filteredStatement.push({ ...t, balance: runningBalance });
    });

    return filteredStatement.reverse();
  }, [data, dateRange]);

  const updateDateRange = (type) => {
    setReportFilter(type);
    const today = new Date();
    let start, end;
    if (type === 'week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(today.setDate(diff));
      end = new Date(today.setDate(diff + 6));
    } else if (type === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else return;
    setDateRange({ start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] });
  };

  const handleUpdateIncome = (id, field, value) => {
    const newIncomes = data.incomes.map(inc => inc.id === id ? { ...inc, [field]: value } : inc);
    saveData({ ...data, incomes: newIncomes });
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const amount = Number(formData.get('amount'));
    const type = formData.get('type') || 'variable';
    const date = formData.get('date') || getTodayString();

    const newItem = { id: Date.now().toString(), name, amount, type, date };

    if (targetCollection === 'incomes') {
      const newIncomes = [...data.incomes, newItem];
      saveData({ ...data, incomes: newIncomes });
    } else {
      const [region, category] = targetCollection.split('_');
      const newList = [...data[region][category], newItem];
      const newData = { ...data, [region]: { ...data[region], [category]: newList } };
      saveData(newData);
    }
    setEditingItem(null);
  };

  const handleDeleteItem = (region, category, id) => {
    if (region === 'incomes') {
      const newIncomes = data.incomes.filter(item => item.id !== id);
      saveData({ ...data, incomes: newIncomes });
    } else {
      const newList = data[region][category].filter(item => item.id !== id);
      const newData = { ...data, [region]: { ...data[region], [category]: newList } };
      saveData(newData);
    }
  };

  const handleExportData = () => {
    const backup = { budget: data, users: systemUsers };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_completo_${getTodayString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.budget) saveData(importedData.budget);
        alert('Datos de presupuesto restaurados.');
      } catch (error) { alert('Error al leer el archivo.'); }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const SummaryCard = ({ title, amount, subtext, colorClass, icon: Icon }) => (
    <Card className="p-6 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{formatCurrency(amount)}</h3>
        {subtext && <p className={`text-xs ${colorClass}`}>{subtext}</p>}
      </div>
      <div className={`p-3 rounded-full bg-opacity-10 ${colorClass.replace('text-', 'bg-').split(' ')[0]}`}><Icon className={`w-6 h-6 ${colorClass.split(' ')[0]}`} /></div>
    </Card>
  );

  const ExpenseList = ({ region, type, currency }) => {
    const items = data[region][type];
    const isExpenses = type === 'expenses';
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-white">
            {isExpenses ? <CreditCard className="w-5 h-5 text-rose-500" /> : <Save className="w-5 h-5 text-emerald-500" />}
            {isExpenses ? 'Movimientos' : 'Metas de Ahorro'}
          </h3>
          <button onClick={() => { setTargetCollection(`${region}_${type}`); setEditingItem(true); }} className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors"><Plus className="w-4 h-4 text-slate-600 dark:text-slate-300" /></button>
        </div>
        {items.length === 0 ? <div className="text-center py-8 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200">No hay registros aún</div> : (
          <div className="space-y-3">
            {items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-indigo-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-10 rounded-full ${isExpenses ? 'bg-rose-400' : 'bg-emerald-400'}`}></div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{item.name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {item.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(item.date).toLocaleDateString()}</span>}
                      {isExpenses && <span>• {item.type}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(item.amount, currency)}</span>
                  <button onClick={() => handleDeleteItem(region, type, item.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const pieData = [
    { name: 'Gastos España', value: totalSpainExpensesEUR, color: '#F43F5E' },
    { name: 'Gastos RD', value: totalDRExpensesEUR, color: '#F97316' },
    { name: 'Ahorros', value: totalSavingsEUR, color: '#10B981' },
    { name: 'Disponible', value: Math.max(0, remainingEUR), color: '#6366F1' },
  ];

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  if (!isAppLoggedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 p-4 transition-colors duration-300">
        <Card className="w-full max-w-md p-8 shadow-2xl border-none">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-200 dark:shadow-none"><Lock className="w-8 h-8 text-white" /></div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Acceso Restringido</h1>
            <p className="text-slate-500 dark:text-slate-400">Introduce tus credenciales de sistema</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Usuario</label>
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" autoFocus required value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} className="w-full pl-10 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ej. Yulied" /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contraseña</label>
              <div className="relative"><Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="password" required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full pl-10 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••" /></div>
            </div>
            {loginForm.error && <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 text-sm rounded-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{loginForm.error}</div>}
            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"><LogIn className="w-5 h-5" />Entrar al Sistema</button>
            <div className="flex justify-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button type="button" onClick={() => setDarkMode(!darkMode)} className="text-slate-400 hover:text-indigo-600 transition-colors">{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-900">
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg"><ArrowRightLeft className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="font-bold text-lg text-slate-800 dark:text-white leading-tight hidden sm:block">Yulied Ai Finanzas (YAiFinanzas)</h1>
              <h1 className="font-bold text-lg text-slate-800 dark:text-white leading-tight block sm:hidden">YAiFinanzas</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span>Hola, {currentUserData?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            <button onClick={handleLogout} className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors" title="Cerrar Sesión"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'dashboard', label: 'Global', icon: Calculator },
            { id: 'spain', label: 'España', icon: Landmark },
            { id: 'dr', label: 'Rep. Dom.', icon: Globe },
            { id: 'reports', label: 'Reportes', icon: TrendingUp },
            { id: 'users', label: 'Usuarios', icon: Users },
            { id: 'settings', label: 'Configuración', icon: Settings },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="p-6 border-indigo-100 dark:border-slate-700 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><Wallet className="w-6 h-6 text-indigo-600" />Ingresos (Mes Actual)</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Registra aquí los sueldos y entradas variables de este mes.</p>
                </div>
                <div className="flex flex-col items-end gap-2 mt-4 sm:mt-0">
                  <div className="text-right bg-white dark:bg-slate-900 px-4 py-2 rounded-lg shadow-sm border border-indigo-100 dark:border-slate-700">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Mensual</p>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(totalIncomeEUR)}</p>
                  </div>
                  <button onClick={() => { setTargetCollection('incomes'); setEditingItem(true); }} className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center gap-1"><Plus className="w-3 h-3" /> Añadir Ingreso</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentMonthIncomesList.length === 0 ? (
                  <div className="col-span-2 text-center py-4 text-slate-400 italic bg-white/50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                    No hay ingresos registrados para este mes.
                  </div>
                ) : (
                  currentMonthIncomesList.sort((a, b) => new Date(b.date) - new Date(a.date)).map((inc) => (
                    <div key={inc.id} className="flex items-center gap-3 bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm focus-within:ring-2 ring-indigo-500 transition-all group relative">
                      <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-md"><DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
                      <div className="flex-1">
                        <input type="text" value={inc.name} onChange={(e) => handleUpdateIncome(inc.id, 'name', e.target.value)} className="w-full text-sm font-medium text-slate-700 dark:text-slate-200 bg-transparent focus:outline-none mb-1" />
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs">€</span>
                          <input type="number" value={inc.amount} onChange={(e) => handleUpdateIncome(inc.id, 'amount', Number(e.target.value))} className="w-full font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none" />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {new Date(inc.date).toLocaleDateString()}</div>
                      </div>
                      <button onClick={() => handleDeleteItem('incomes', null, inc.id)} className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard title="Gastos España" amount={totalSpainExpensesEUR} subtext={`${totalIncomeEUR > 0 ? Math.round((totalSpainExpensesEUR / totalIncomeEUR) * 100) : 0}% del ingreso`} colorClass="text-rose-600" icon={Home} />
              <SummaryCard title="Gastos Rep. Dom." amount={totalDRExpensesEUR} subtext={`RD$ ${new Intl.NumberFormat('es-DO').format(totalDRExpensesDOP)}`} colorClass="text-orange-500" icon={Globe} />
              <SummaryCard title="Ahorro Total" amount={totalSavingsEUR} subtext="Meta combinada" colorClass="text-emerald-600" icon={TrendingUp} />
              <SummaryCard title="Restante" amount={remainingEUR} subtext={remainingEUR < 0 ? "Presupuesto excedido" : "Disponible"} colorClass={remainingEUR < 0 ? "text-red-600" : "text-indigo-600"} icon={Wallet} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Distribución del Ingreso</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={pieData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>{pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="p-6 flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 self-start w-full">Proporción</h3>
                <div className="h-48 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie>
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-2xl font-bold text-slate-700 dark:text-slate-300">100%</span></div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gestión de Usuarios</h2><p className="text-sm text-slate-500">Administra quién puede acceder al sistema.</p></div><button onClick={() => setEditingUser({})} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 shadow-sm"><Plus className="w-4 h-4" />Nuevo Usuario</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{systemUsers.map(u => (<Card key={u.id} className="p-5 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all"><div className="flex justify-between items-start"><div className="flex items-center gap-3"><div className={`p-3 rounded-full ${u.username === currentUserData.username ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}><User className="w-6 h-6" /></div><div><h3 className="font-bold text-slate-800 dark:text-white">{u.username}</h3><p className="text-xs text-slate-500">Contraseña: {u.password?.replace(/./g, '•')}</p></div></div><div className="flex items-center gap-1"><button onClick={() => setEditingUser(u)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Settings className="w-4 h-4" /></button>{u.username !== currentUserData.username && (<button onClick={() => handleDeleteUser(u.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>)}</div></div>{u.username === currentUserData.username && (<div className="mt-4 inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-md"><CheckCircle className="w-3 h-3" />Sesión Actual</div>)}</Card>))}</div>
          </div>
        )}

        {(activeTab === 'spain' || activeTab === 'dr') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <Card className={`p-6 border-t-4 ${activeTab === 'spain' ? 'border-t-rose-500' : 'border-t-orange-500'}`}>
              <div className="flex justify-between items-end mb-6"><div><h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gastos {activeTab === 'spain' ? 'España' : 'RD'}</h2><p className="text-sm text-slate-500">{activeTab === 'spain' ? 'Moneda: Euro (€)' : `Moneda: Peso (RD$) • 1€ = ${data.exchangeRate}RD$`}</p></div><div className="text-right"><p className="text-xs text-slate-400 uppercase font-bold">Total</p><p className={`text-3xl font-black ${activeTab === 'spain' ? 'text-rose-500' : 'text-orange-500'}`}>{activeTab === 'spain' ? formatCurrency(totalSpainExpensesEUR) : formatCurrency(totalDRExpensesDOP, 'DOP')}</p></div></div>
              <ExpenseList region={activeTab} type="expenses" currency={activeTab === 'spain' ? 'EUR' : 'DOP'} />
            </Card>
            <div className="space-y-6">
              <Card className="p-6 border-t-4 border-t-emerald-500">
                <div className="flex justify-between items-end mb-6"><div><h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ahorros {activeTab === 'spain' ? 'España' : 'RD'}</h2></div><div className="text-right"><p className="text-xs text-slate-400 uppercase font-bold">Total</p><p className="text-3xl font-black text-emerald-500">{activeTab === 'spain' ? formatCurrency(totalSpainSavingsEUR) : formatCurrency(totalDRSavingsDOP, 'DOP')}</p></div></div>
                <ExpenseList region={activeTab} type="savings" currency={activeTab === 'spain' ? 'EUR' : 'DOP'} />
              </Card>
              {activeTab === 'dr' && (<Card className="p-6 bg-gradient-to-br from-orange-50 to-white dark:from-slate-800 dark:to-slate-700 border-orange-200 dark:border-slate-600"><h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4"><Calculator className="w-5 h-5 text-orange-500" />Calculadora Rápida</h3><div className="grid grid-cols-2 gap-4"><div><label className="text-xs text-slate-500 block mb-1">Euros (€)</label><input type="number" placeholder="100" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white" onChange={(e) => { const val = e.target.value; const target = document.getElementById('calc-dop'); if (target) target.value = (val * data.exchangeRate).toFixed(2); }} /></div><div><label className="text-xs text-slate-500 block mb-1">Pesos (RD$)</label><input id="calc-dop" type="number" readOnly className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-transparent text-slate-600 dark:text-slate-400 cursor-not-allowed" /></div></div></Card>)}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="p-4 bg-indigo-900 text-white border-none">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2"><TrendingUp className="w-6 h-6 text-indigo-300" /><h2 className="text-xl font-bold">Reportes y Tendencias</h2></div>
                <div className="flex items-center gap-2 bg-indigo-800/50 p-1 rounded-lg">
                  <button onClick={() => updateDateRange('week')} className={`px-4 py-1.5 rounded-md text-sm transition-colors ${reportFilter === 'week' ? 'bg-white text-indigo-900 shadow-sm font-bold' : 'text-indigo-200 hover:text-white'}`}>Esta Semana</button>
                  <button onClick={() => updateDateRange('month')} className={`px-4 py-1.5 rounded-md text-sm transition-colors ${reportFilter === 'month' ? 'bg-white text-indigo-900 shadow-sm font-bold' : 'text-indigo-200 hover:text-white'}`}>Este Mes</button>
                  <button onClick={() => setReportFilter('custom')} className={`px-4 py-1.5 rounded-md text-sm transition-colors ${reportFilter === 'custom' ? 'bg-white text-indigo-900 shadow-sm font-bold' : 'text-indigo-200 hover:text-white'}`}>Rango</button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-indigo-700/50 flex flex-col sm:flex-row items-center gap-4 text-sm">
                <div className="flex items-center gap-2"><span className="text-indigo-300">Desde:</span><input type="date" value={dateRange.start} onChange={(e) => { setReportFilter('custom'); setDateRange(prev => ({ ...prev, start: e.target.value })) }} className="bg-indigo-800 text-white border border-indigo-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" /></div>
                <div className="flex items-center gap-2"><span className="text-indigo-300">Hasta:</span><input type="date" value={dateRange.end} onChange={(e) => { setReportFilter('custom'); setDateRange(prev => ({ ...prev, end: e.target.value })) }} className="bg-indigo-800 text-white border border-indigo-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" /></div>
              </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-rose-100 dark:border-slate-700"><p className="text-sm text-slate-500 mb-1">Gastado en España</p><p className="text-2xl font-bold text-rose-600">{formatCurrency(getFilteredData.spainExpenses.reduce((sum, item) => sum + Number(item.amount), 0))}</p></div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-orange-100 dark:border-slate-700"><p className="text-sm text-slate-500 mb-1">Gastado en Rep. Dom.</p><p className="text-2xl font-bold text-orange-500">{formatCurrency(getFilteredData.drExpenses.reduce((sum, item) => sum + Number(item.amount), 0), 'DOP')}</p></div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700"><p className="text-sm text-slate-500 mb-1">Total Combinado (EUR)</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(getFilteredData.spainExpenses.reduce((sum, item) => sum + Number(item.amount), 0) + (getFilteredData.drExpenses.reduce((sum, item) => sum + Number(item.amount), 0) / data.exchangeRate))}</p></div>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Línea de Tiempo de Gastos (en Euros)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getFilteredData.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" name="España" dataKey="spain" stroke="#F43F5E" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="RD (Conv.)" dataKey="dr" stroke="#F97316" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 overflow-hidden">
              <div className="flex items-center gap-2 mb-6"><FileText className="w-6 h-6 text-slate-600 dark:text-slate-300" /><h3 className="text-lg font-bold text-slate-800 dark:text-white">Estado de Cuenta (Corte)</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold">
                    <tr><th className="px-4 py-3 rounded-l-lg">Fecha</th><th className="px-4 py-3">Descripción</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3 text-right">Monto Original</th><th className="px-4 py-3 text-right">Monto (EUR)</th><th className="px-4 py-3 text-right rounded-r-lg">Balance</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {getStatementData.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-300">{new Date(item.date || '2000-01-01').toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.name}</td>
                        <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.isCredit ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'}`}>{item.type}</span></td>
                        <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(Number(item.amount), item.currency)}</td>
                        <td className={`px-4 py-3 text-right font-medium ${item.isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>{item.isCredit ? '+' : '-'}{formatCurrency(item.amountEUR)}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-white">{formatCurrency(item.balance)}</td>
                      </tr>
                    ))}
                    {getStatementData.length === 0 && (<tr><td colSpan="6" className="px-4 py-8 text-center text-slate-400 italic">No hay movimientos en este periodo</td></tr>)}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Configuración y Seguridad</h2>
            <Card className="p-6 border-l-4 border-l-indigo-600">
              <div className="flex items-start gap-4"><div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full"><User className="w-8 h-8 text-indigo-600 dark:text-indigo-300" /></div><div className="flex-1"><h3 className="text-lg font-bold text-slate-800 dark:text-white">Almacenamiento Local</h3><p className="text-sm text-slate-500 mb-4">Los datos se guardan en este dispositivo</p><div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-700"><code className="text-xs font-mono text-slate-600 dark:text-slate-300 break-all">localStorage (navegador)</code><span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-md font-medium">Activo</span></div></div></div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 border border-slate-200 hover:border-emerald-300 transition-colors">
                <div className="flex flex-col h-full"><div className="flex items-center gap-2 mb-3"><Download className="w-5 h-5 text-emerald-600" /><h3 className="font-bold text-slate-800 dark:text-white">Exportar Backup</h3></div><p className="text-sm text-slate-500 flex-1 mb-4">Descarga una copia de seguridad.</p><button onClick={handleExportData} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"><FileJson className="w-4 h-4" />Descargar Datos</button></div>
              </Card>
              <Card className="p-6 border border-slate-200 hover:border-amber-300 transition-colors">
                <div className="flex flex-col h-full"><div className="flex items-center gap-2 mb-3"><Upload className="w-5 h-5 text-amber-600" /><h3 className="font-bold text-slate-800 dark:text-white">Restaurar Datos</h3></div><p className="text-sm text-slate-500 flex-1 mb-4">Recupera información (JSON).</p><div className="relative"><input type="file" ref={fileInputRef} accept=".json" onChange={handleImportData} className="hidden" id="file-upload" /><label htmlFor="file-upload" className="w-full py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-500 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"><Upload className="w-4 h-4" />Seleccionar Archivo</label></div></div>
              </Card>
            </div>
            <Card className="p-6"><h3 className="font-bold text-slate-800 dark:text-white mb-4">Tasa de Cambio Global</h3><div className="flex items-center gap-4"><div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700"><span className="text-slate-500 font-medium">1 EUR = </span><input type="number" value={data.exchangeRate} onChange={(e) => saveData({ ...data, exchangeRate: Number(e.target.value) })} className="w-20 bg-transparent font-bold text-slate-800 dark:text-white focus:outline-none" /><span className="text-slate-500 font-medium">DOP</span></div><p className="text-xs text-slate-400">Afecta a todos los cálculos globales.</p></div></Card>
          </div>
        )}
      </main>

      <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title={targetCollection === 'incomes' ? 'Agregar Ingreso' : 'Agregar Nuevo Movimiento'}>
        <form onSubmit={handleAddItem} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label><input name="name" required autoFocus className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder={targetCollection === 'incomes' ? "Ej. Sueldo Enero" : "Ej. Compra Supermerk..."} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monto {targetCollection?.includes('dr') ? '(RD$)' : '(€)'}</label><input name="amount" type="number" required step="0.01" className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="0.00" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha</label><input name="date" type="date" required defaultValue={getTodayString()} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" /></div>
          </div>
          {targetCollection?.includes('expenses') && (<div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label><select name="type" className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"><option value="fixed">Fijo (Necesidad)</option><option value="variable">Variable (Deseo/Ocio)</option></select></div>)}
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancelar</button><button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm">Guardar</button></div>
        </form>
      </Modal>

      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title={editingUser?.id ? "Editar Usuario" : "Nuevo Usuario"}>
        <form onSubmit={handleSaveUser} className="space-y-4">
          <input type="hidden" name="userId" value={editingUser?.id || ''} />
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre de Usuario</label><input name="username" required defaultValue={editingUser?.username || ''} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Ej. Juan" /></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label><input name="password" type="text" required defaultValue={editingUser?.password || ''} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Ej. 1234" /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancelar</button><button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm">Guardar Usuario</button></div>
        </form>
      </Modal>

    </div>
  );
}
