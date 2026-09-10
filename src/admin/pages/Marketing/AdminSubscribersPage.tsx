import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Search, Download, Trash2, CheckCircle2, XCircle, Users } from 'lucide-react';
import { commerceStore } from '../../../shared/store/commerceStore';
import { commerceEventBus } from '../../../shared/events/commerceEvents';
import { Subscriber } from '../../../shared/types/commerce';

export const AdminSubscribersPage: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSubscribers(commerceStore.getNewsletterSubscribers());
    const unsub = commerceEventBus.subscribe('SUBSCRIBER_UPDATED', (newData) => {
      setSubscribers(newData);
    });
    return () => unsub();
  }, []);

  const filteredSubscribers = useMemo(() => {
    if (!search.trim()) return subscribers;
    return subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));
  }, [subscribers, search]);

  const activeCount = subscribers.filter(s => s.status === 'active').length;

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Email,Status,SubscribedAt,Source\n" + 
      subscribers.map(e => `${e.email},${e.status},${e.subscribedAt},${e.source || 'Footer'}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'unsubscribed' : 'active';
    commerceStore.updateSubscriberStatus(id, newStatus);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المشترك نهائياً؟')) {
      commerceStore.deleteSubscriber(id);
    }
  };

  return (
    <div className="flex flex-col gap-8 font-arabic" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">مشتركو النشرة البريدية</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              إدارة المشتركين وإرسال النشرات البريدية وحملات التسويق
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={subscribers.length === 0}
          className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          تصدير CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">إجمالي المشتركين النشطين</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">إلغاء الاشتراك</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{subscribers.length - activeCount}</p>
          </div>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالبريد الإلكتروني..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-11 pl-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-bold">البريد الإلكتروني</th>
                <th className="px-6 py-4 font-bold">تاريخ الاشتراك</th>
                <th className="px-6 py-4 font-bold">المصدر</th>
                <th className="px-6 py-4 font-bold">الحالة</th>
                <th className="px-6 py-4 font-bold text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((sub, idx) => (
                  <tr key={`sub-${sub.id || idx}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {sub.email}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(sub.subscribedAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs">
                        {sub.source || 'Footer'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          sub.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {sub.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {sub.status === 'active' ? 'نشط' : 'ملغى'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(sub.id, sub.status)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          {sub.status === 'active' ? 'إلغاء الاشتراك' : 'إعادة تفعيل'}
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    لا توجد اشتراكات مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscribersPage;
