import React, { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Search, Filter, Clock, CheckCircle2, User, Mail, Phone, Calendar, Reply, ArrowLeft, Send } from 'lucide-react';
import { commerceStore } from '../../../shared/store/commerceStore';
import { commerceEventBus } from '../../../shared/events/commerceEvents';
import { SupportTicket } from '../../../shared/types/commerce';

export const AdminMessagesPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    setTickets(commerceStore.getSupportTickets());

    const unsubCreated = commerceEventBus.subscribe('TICKET_CREATED', () => setTickets(commerceStore.getSupportTickets()));
    const unsubUpdated = commerceEventBus.subscribe('TICKET_UPDATED', () => {
      const updatedTickets = commerceStore.getSupportTickets();
      setTickets(updatedTickets);
      if (selectedTicket) {
        const stillExists = updatedTickets.find(t => t.id === selectedTicket.id);
        setSelectedTicket(stillExists || null);
      }
    });
    const unsubDeleted = commerceEventBus.subscribe('TICKET_DELETED', () => setTickets(commerceStore.getSupportTickets()));

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [selectedTicket]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = t.customerName.toLowerCase().includes(search.toLowerCase()) ||
                            t.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
                            t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
                            t.subject.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  const handleStatusChange = (id: string, newStatus: any) => {
    commerceStore.updateSupportTicketStatus(id, newStatus);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    commerceStore.addSupportTicketResponse(selectedTicket.id, 'admin', replyMessage);
    setReplyMessage('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 text-xs font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> جديدة</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 text-xs font-bold flex items-center gap-1"><Reply className="w-3.5 h-3.5" /> قيد المعالجة</span>;
      case 'resolved':
      case 'closed':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> مكتملة</span>;
      default:
        return null;
    }
  };

  if (selectedTicket) {
    return (
      <div className="flex flex-col gap-6 font-arabic" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedTicket(null)}
              className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">{selectedTicket.subject}</h1>
                {getStatusBadge(selectedTicket.status)}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">تذكرة رقم #{selectedTicket.ticketNumber}</p>
            </div>
          </div>
          
          <select
            value={selectedTicket.status}
            onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="open">جديدة</option>
            <option value="in_progress">قيد المعالجة</option>
            <option value="resolved">تم الحل</option>
            <option value="closed">مغلقة</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Conversation */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
              <div className="p-6 flex-1 max-h-[60vh] overflow-y-auto flex flex-col gap-6">
                {/* Initial Message */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl rounded-tr-none border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedTicket.customerName}</p>
                      <span className="text-xs text-slate-500">{new Date(selectedTicket.createdAt).toLocaleString('ar-SA')}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.message}
                    </p>
                  </div>
                </div>

                {/* Responses */}
                {selectedTicket.responses?.map((res) => (
                  <div key={res.id} className={`flex gap-4 ${res.sender === 'admin' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      res.sender === 'admin' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' 
                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10'
                    }`}>
                      {res.sender === 'admin' ? <MessageSquare className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div className={`flex-1 p-4 rounded-2xl border ${
                      res.sender === 'admin' 
                        ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 rounded-tl-none' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 rounded-tr-none'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          {res.sender === 'admin' ? 'دعم فخامة' : selectedTicket.customerName}
                        </p>
                        <span className="text-xs text-slate-500">{new Date(res.timestamp).toLocaleString('ar-SA')}</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {res.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <form onSubmit={handleSendReply} className="flex gap-3">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="اكتب ردك هنا..."
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!replyMessage.trim()}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>إرسال</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Customer Details Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" />
                بيانات العميل
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">الاسم الكامل</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedTicket.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">البريد الإلكتروني</p>
                  <a href={`mailto:${selectedTicket.customerEmail}`} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-2" dir="ltr">
                    <Mail className="w-4 h-4" />
                    {selectedTicket.customerEmail}
                  </a>
                </div>
                {selectedTicket.customerPhone && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">رقم الهاتف</p>
                    <a href={`tel:${selectedTicket.customerPhone}`} className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2" dir="ltr">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {selectedTicket.customerPhone}
                    </a>
                  </div>
                )}
                <hr className="border-slate-100 dark:border-slate-800" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">تاريخ الإنشاء</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(selectedTicket.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 font-arabic" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">رسائل الدعم والتواصل</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              متابعة تذاكر الدعم الفني واستفسارات العملاء
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث برقم التذكرة، الاسم، أو البريد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pr-12 pl-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white shadow-xs"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="open">جديدة</option>
              <option value="in_progress">قيد المعالجة</option>
              <option value="resolved">مكتملة/تم الحل</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <div 
              key={ticket.id} 
              onClick={() => setSelectedTicket(ticket)}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white">{ticket.subject}</h3>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                      #{ticket.ticketNumber}
                    </span>
                    <span>•</span>
                    <span>{ticket.customerName}</span>
                    <span>•</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 sm:border-r border-slate-100 dark:border-slate-800 sm:pr-6">
                <div className="text-left">
                  <p className="text-xs text-slate-500 mb-1">آخر تحديث</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {new Date(ticket.updatedAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">لا توجد رسائل</h3>
            <p className="text-slate-500">لم يتم العثور على أي رسائل دعم مطابقة للبحث.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessagesPage;
