import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  MapPin,
  Sparkles,
  Scissors,
  Check,
  ArrowUpRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { WorkSchedule, CustomerInquiry } from '../../types';

interface WorkSchedulesTabProps {
  schedules: WorkSchedule[];
  inquiries?: CustomerInquiry[];
  onUpdateScheduleStatus: (scheduleId: string, newStatus: WorkSchedule['status']) => void;
  onAddSchedule: (schedule: WorkSchedule) => void;
}

export const WorkSchedulesTab: React.FC<WorkSchedulesTabProps> = ({
  schedules,
  inquiries = [],
  onUpdateScheduleStatus,
  onAddSchedule,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New schedule form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'loom_production' as WorkSchedule['category'],
    assignee: 'Master Weaver Venkateswara Rao',
    role: 'Chief Pit Loom Master',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM – 05:00 PM',
    targetItem: '',
    clientName: '',
    priority: 'High' as WorkSchedule['priority'],
    location: 'Pit Loom A1, Heritage Weaving Hall',
    notes: '',
  });

  // Filtered schedules
  const filteredSchedules = schedules.filter((sch) => {
    if (selectedCategory !== 'all' && sch.category !== selectedCategory) return false;
    if (statusFilter !== 'all' && sch.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        sch.title.toLowerCase().includes(q) ||
        sch.assignee.toLowerCase().includes(q) ||
        (sch.targetItem && sch.targetItem.toLowerCase().includes(q)) ||
        (sch.clientName && sch.clientName.toLowerCase().includes(q)) ||
        sch.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSch: WorkSchedule = {
      id: `SCH-${Math.floor(100 + Math.random() * 900)}`,
      title: formData.title,
      category: formData.category,
      assignee: formData.assignee,
      role: formData.role,
      date: formData.date,
      timeSlot: formData.timeSlot,
      targetItem: formData.targetItem || undefined,
      clientName: formData.clientName || undefined,
      priority: formData.priority,
      status: 'Scheduled',
      notes: formData.notes,
      location: formData.location,
    };

    onAddSchedule(newSch);
    setIsNewModalOpen(false);
    setFormData({
      title: '',
      category: 'loom_production',
      assignee: 'Master Weaver Venkateswara Rao',
      role: 'Chief Pit Loom Master',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '09:00 AM – 05:00 PM',
      targetItem: '',
      clientName: '',
      priority: 'High',
      location: 'Pit Loom A1, Heritage Weaving Hall',
      notes: '',
    });
  };

  const getCategoryBadge = (cat: WorkSchedule['category']) => {
    switch (cat) {
      case 'loom_production':
        return { label: 'Loom Weaving', bg: 'bg-[#FAF0E6] text-[#8C4A2B] border-[#E8D0C0]' };
      case 'bridal_fitting':
        return { label: 'Bridal Fitting', bg: 'bg-[#FDF2F4] text-[#9E2A2B] border-[#F5C2C7]' };
      case 'artisan_shift':
        return { label: 'Artisan Shift', bg: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]' };
      case 'qc_dispatch':
        return { label: 'QC & Dispatch', bg: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]' };
    }
  };

  const getPriorityBadge = (p: WorkSchedule['priority']) => {
    switch (p) {
      case 'Urgent':
        return 'bg-[#DC2626] text-white';
      case 'High':
        return 'bg-[#D97706] text-white';
      case 'Normal':
        return 'bg-[#736352] text-white';
    }
  };

  const getStatusColor = (status: WorkSchedule['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#15803D] text-white';
      case 'In Progress':
        return 'bg-[#B8860B] text-white animate-pulse';
      case 'Pending Review':
        return 'bg-[#4338CA] text-white';
      case 'Scheduled':
        return 'bg-[#E2DACB] text-[#4A3E33]';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans">
      {/* Top Banner with Direct MD Authorization */}
      <div className="bg-[#1C1814] text-[#FAF6ED] p-6 rounded-2xl border border-[#3D3124] shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#2E241B] border border-[#4F3C2C] text-[#C5A059] text-[10px] uppercase tracking-widest font-semibold">
            <Sparkles size={12} />
            <span>Authenticated Managing Director Access</span>
          </div>
          <h2 className="font-serif text-2xl text-[#FAF8F5]">
            Atelier Work Schedules & Production Rosters
          </h2>
          <p className="text-xs text-[#B5A691]">
            Direct schedule oversight for pit loom masters, zardozi artisans, and private bridal fittings with Mrs. K. Ramani.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="bg-[#C5A059] text-[#14100C] hover:bg-[#D9B774] px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm shrink-0"
          id="add-work-schedule-btn"
        >
          <Plus size={16} />
          <span>New Schedule Assignment</span>
        </button>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E8DFC9] shadow-xs space-y-1.5">
          <div className="flex justify-between items-center text-[#8C7A65]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Active Schedules</span>
            <Calendar size={18} className="text-[#B8860B]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#1A1510]">{schedules.length}</div>
          <p className="text-[11px] text-[#524436]">Synchronized with atelier roster</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8DFC9] shadow-xs space-y-1.5">
          <div className="flex justify-between items-center text-[#8C7A65]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Progress Work</span>
            <Clock size={18} className="text-[#B8860B]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#B8860B]">
            {schedules.filter((s) => s.status === 'In Progress').length}
          </div>
          <p className="text-[11px] text-[#205A32]">Active on looms & embroidery desks</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8DFC9] shadow-xs space-y-1.5">
          <div className="flex justify-between items-center text-[#8C7A65]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Bridal Fittings (MD)</span>
            <UserCheck size={18} className="text-[#9E2A2B]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#9E2A2B]">
            {schedules.filter((s) => s.category === 'bridal_fitting').length}
          </div>
          <p className="text-[11px] text-[#736352]">Private appointments scheduled</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8DFC9] shadow-xs space-y-1.5">
          <div className="flex justify-between items-center text-[#8C7A65]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Completed Deliveries</span>
            <CheckCircle2 size={18} className="text-[#15803D]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#15803D]">
            {schedules.filter((s) => s.status === 'Completed').length}
          </div>
          <p className="text-[11px] text-[#736352]">Certified pure Silk Mark heirlooms</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E8DFC9] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 whitespace-nowrap">
          {[
            { id: 'all', label: 'All Operations' },
            { id: 'loom_production', label: 'Pit Loom Weaving' },
            { id: 'bridal_fitting', label: 'Bridal Fittings' },
            { id: 'artisan_shift', label: 'Guild Shifts' },
            { id: 'qc_dispatch', label: 'QC & Dispatch' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#1C1814] text-[#FAF6ED] shadow-xs'
                  : 'bg-[#FAF8F5] text-[#524436] hover:bg-[#F2ECE1] border border-[#E5DAC6]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full md:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A65]" />
            <input
              type="text"
              placeholder="Search artisan, client, or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#D9CEBA] rounded-lg text-xs text-[#1A1510] placeholder-[#9E9080] focus:outline-none focus:border-[#B8860B]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#FAF8F5] border border-[#D9CEBA] rounded-lg text-xs text-[#1A1510] font-medium focus:outline-none focus:border-[#B8860B]"
          >
            <option value="all">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Schedules List / Grid */}
      <div className="space-y-4">
        {filteredSchedules.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-[#E8DFC9] space-y-2">
            <Calendar size={36} className="mx-auto text-[#B8860B] opacity-50" />
            <h4 className="font-serif text-lg text-[#1A1510]">No Work Schedules Match Filters</h4>
            <p className="text-xs text-[#736352]">Try adjusting your search terms or category selection.</p>
          </div>
        ) : (
          filteredSchedules.map((sch) => {
            const cat = getCategoryBadge(sch.category);
            return (
              <div
                key={sch.id}
                className="bg-white rounded-xl border border-[#E8DFC9] p-5 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header: Badges & Timing */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#F5EFE6] pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cat.bg}`}>
                      {cat.label}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${getPriorityBadge(sch.priority)}`}>
                      {sch.priority} Priority
                    </span>
                    <span className="font-mono text-xs text-[#8C7A65] font-semibold">
                      {sch.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#524436]">
                    <span className="flex items-center gap-1 font-medium bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E8DFC9]">
                      <Calendar size={13} className="text-[#B8860B]" />
                      {sch.date}
                    </span>
                    <span className="flex items-center gap-1 font-medium bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E8DFC9]">
                      <Clock size={13} className="text-[#B8860B]" />
                      {sch.timeSlot}
                    </span>
                  </div>
                </div>

                {/* Title and Detail Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-6 space-y-1.5">
                    <h3 className="font-serif text-lg text-[#1A1510] leading-snug">
                      {sch.title}
                    </h3>
                    {sch.targetItem && (
                      <p className="text-xs text-[#736352] flex items-center gap-1.5 font-medium">
                        <Scissors size={13} className="text-[#B8860B] shrink-0" />
                        <span>Workpiece: <strong className="text-[#1A1510]">{sch.targetItem}</strong></span>
                      </p>
                    )}
                    {sch.clientName && (
                      <p className="text-xs text-[#9E2A2B] flex items-center gap-1.5 font-semibold">
                        <Sparkles size={13} className="shrink-0" />
                        <span>Client: {sch.clientName}</span>
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-3 space-y-1 text-xs text-[#524436]">
                    <div className="flex items-center gap-1.5">
                      <UserCheck size={14} className="text-[#B8860B] shrink-0" />
                      <div>
                        <strong className="text-[#1A1510] block">{sch.assignee}</strong>
                        <span className="text-[11px] text-[#8C7A65]">{sch.role}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 text-[#8C7A65]">
                      <MapPin size={13} className="text-[#B8860B] shrink-0" />
                      <span>{sch.location}</span>
                    </div>
                  </div>

                  {/* Status Toggle & Action */}
                  <div className="md:col-span-3 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#8C7A65] uppercase font-semibold">Status:</span>
                      <select
                        value={sch.status}
                        onChange={(e) => onUpdateScheduleStatus(sch.id, e.target.value as WorkSchedule['status'])}
                        className={`text-xs font-bold px-2.5 py-1 rounded-md cursor-pointer ${getStatusColor(sch.status)}`}
                      >
                        <option value="Scheduled" className="bg-white text-black">Scheduled</option>
                        <option value="In Progress" className="bg-white text-black">In Progress</option>
                        <option value="Pending Review" className="bg-white text-black">Pending Review</option>
                        <option value="Completed" className="bg-white text-black">Completed</option>
                      </select>
                    </div>

                    {sch.status !== 'Completed' && (
                      <button
                        onClick={() => onUpdateScheduleStatus(sch.id, 'Completed')}
                        className="text-[11px] font-semibold text-[#15803D] hover:underline flex items-center gap-1"
                      >
                        <Check size={13} />
                        <span>Mark as Finished</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes bar */}
                {sch.notes && (
                  <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E0D2] text-xs text-[#615141] flex items-start gap-2">
                    <ShieldCheck size={15} className="text-[#C5A059] shrink-0 mt-0.5" />
                    <span>{sch.notes}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Schedule Assignment Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-[#E2DACB] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#F2ECE1] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059]">
                  Atelier Logistics
                </span>
                <h3 className="font-serif text-xl text-[#1A1510]">
                  Create Work Schedule Assignment
                </h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 rounded-lg text-[#736352] hover:bg-[#FAF8F5]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#4A3E33] mb-1">
                  Schedule Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Bespoke Muhurtham Saree - Zari Pallu Weave"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CEBA] rounded-lg text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4A3E33] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CEBA] rounded-lg text-xs focus:outline-none focus:border-[#B8860B]"
                  >
                    <option value="loom_production">Pit Loom Weaving</option>
                    <option value="bridal_fitting">Bridal Fitting & Salon</option>
                    <option value="artisan_shift">Artisan Guild Shift</option>
                    <option value="qc_dispatch">QC & Express Dispatch</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4A3E33] mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CEBA] rounded-lg text-xs focus:outline-none focus:border-[#B8860B]"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4A3E33] mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CEBA] rounded-lg text-xs focus:outline-none focus:border-[#B8860B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4A3E33] mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    placeholder="e.g. 02:00 PM – 04:00 PM"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CEBA] rounded-lg text-xs focus:outline-none focus:border-[#B8860B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4A3E33] mb-1">
                    Assigned Lead / Artisan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    placeholder="e.g., Mrs. K. Ramani or Master Weaver"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CEBA] rounded-lg text-xs focus:outline-none focus:border-[#B8860B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4A3E33] mb-1">
                    Atelier Role
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g., Managing Director or Loom Master"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CEBA] rounded-lg text-xs focus:outline-none focus:border-[#B8860B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4A3E33] mb-1">
                    Target Item / Order
                  </label>
                  <input
                    type="text"
                    value={formData.targetItem}
                    onChange={(e) => setFormData({ ...formData, targetItem: e.target.value })}
                    placeholder="e.g., Custom Crimson Saree"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CEBA] rounded-lg text-xs focus:outline-none focus:border-[#B8860B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4A3E33] mb-1">
                    Client Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="e.g., Sneha Reddy"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CEBA] rounded-lg text-xs focus:outline-none focus:border-[#B8860B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#4A3E33] mb-1">
                  Atelier Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., VIP Bridal Salon or Pit Loom A1"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CEBA] rounded-lg text-xs focus:outline-none focus:border-[#B8860B]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#4A3E33] mb-1">
                  Operational & Weaving Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special instructions for zari density, measurements, or client preferences..."
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CEBA] rounded-lg text-xs focus:outline-none focus:border-[#B8860B]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F2ECE1]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-[#D9CEBA] rounded-lg text-[#524436] font-medium hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1C1814] text-[#FAF6ED] rounded-lg font-bold uppercase tracking-wider hover:bg-[#332920]"
                >
                  Add Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
