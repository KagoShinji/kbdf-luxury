import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase/supabaseClient';
import { useNotification } from '../../../core/context/NotificationContext';
import { 
  Loader2, Search, MessageSquare, ExternalLink, Calendar, Edit2, CheckCircle, Trash2, X 
} from 'lucide-react';

export function SuperAdminLeadsPage() {
  const { showSuccess, showError } = useNotification();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Selected lead for detail modal
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [leadNotes, setLeadNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          name,
          email,
          phone,
          subject,
          message,
          status,
          notes,
          created_at,
          tenant_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      console.error("Failed to load platform leads:", err);
      showError("Failed to retrieve platform inquiries.");
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead((prev: any) => ({ ...prev, status: newStatus }));
      }
      showSuccess(`Status updated to ${newStatus}`);
    } catch (err: any) {
      console.error(err);
      showError("Failed to update status.");
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ notes: leadNotes })
        .eq('id', selectedLead.id);

      if (error) throw error;
      
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, notes: leadNotes } : l));
      setSelectedLead((prev: any) => ({ ...prev, notes: leadNotes }));
      showSuccess("Notes updated successfully.");
    } catch (err: any) {
      console.error(err);
      showError("Failed to save remarks.");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
      
      setLeads(prev => prev.filter(l => l.id !== leadId));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(null);
      }
      showSuccess("Inquiry deleted successfully.");
    } catch (err: any) {
      console.error(err);
      showError("Failed to delete inquiry.");
    }
  };

  // Parsing helper for Viber and Facebook Link
  const parseLeadMessage = (message: string | null) => {
    if (!message) return { facebookUrl: "", userMessage: "" };
    
    const hasFbTag = message.includes("Facebook Profile: ");
    if (hasFbTag) {
      const lines = message.split('\n');
      const facebookUrl = lines[0].replace("Facebook Profile: ", "").trim();
      // Combine everything after the first two lines (Facebook Profile and the blank line)
      const userMessage = lines.slice(2).join('\n').replace(/^Message:\s*/i, "").trim();
      return { facebookUrl, userMessage };
    }
    
    return { facebookUrl: "", userMessage: message };
  };

  const filteredLeads = leads.filter(l => {
    const query = search.toLowerCase();
    const matchesSearch = 
      (l.name?.toLowerCase()?.includes(query) ?? false) || 
      (l.email?.toLowerCase()?.includes(query) ?? false) || 
      (l.phone?.toLowerCase()?.includes(query) ?? false) ||
      (l.subject?.toLowerCase()?.includes(query) ?? false);

    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper to format date safely without throwing RangeError
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/10">New</span>;
      case 'contacted':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/10">Contacted</span>;
      case 'qualified':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/10">Qualified</span>;
      case 'converted':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">Converted</span>;
      case 'archived':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/10">Archived</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-400">Unknown</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search leads by name, email, Viber, or plan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111827] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-brand-pink transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#111827] border border-white/5 text-white/80 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-pink cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="archived">Archived</option>
          </select>
          
          <button
            onClick={loadLeads}
            className="bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 text-brand-pink animate-spin" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-[#111827] border border-white/5 rounded-3xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-white/30">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-semibold text-sm">No platform leads found</h4>
            <p className="text-xs text-white/30">When merchants avail plans on your landing page, their contact details show up here.</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#0f111a] text-white/40 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4 pl-6">Merchant details</th>
                  <th className="p-4">Contact endpoints</th>
                  <th className="p-4">Requested Plan</th>
                  <th className="p-4">Submission date</th>
                  <th className="p-4">Onboarding Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeads.map(lead => {
                  const { facebookUrl } = parseLeadMessage(lead.message);
                  const dateStr = formatDate(lead.created_at);

                  return (
                    <tr key={lead.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="p-4 pl-6 font-semibold text-white">{lead.name}</td>
                      <td className="p-4 space-y-1">
                        <p className="text-white/60 font-mono">{lead.email}</p>
                        <div className="flex items-center gap-3 text-white/40">
                          {lead.phone && <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">Viber: {lead.phone}</span>}
                          {facebookUrl && (
                            <a 
                              href={facebookUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[10px] text-brand-pink hover:underline flex items-center gap-1"
                            >
                              Facebook <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-white/90">{lead.subject?.replace(" Plan Inquiry", "") || "N/A"}</span>
                      </td>
                      <td className="p-4 text-white/40 font-mono">{dateStr}</td>
                      <td className="p-4">{getStatusBadge(lead.status)}</td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setLeadNotes(lead.notes || "");
                          }}
                          className="bg-white/5 hover:bg-brand-pink hover:text-white p-2 rounded-xl transition-all inline-flex items-center"
                          title="Edit Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="bg-white/5 hover:bg-red-500/10 hover:text-red-400 p-2 rounded-xl transition-all inline-flex items-center text-white/40"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details / Action Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-8 max-w-xl w-full text-left space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setSelectedLead(null)}
              className="absolute right-6 top-6 text-white/30 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-serif font-bold text-white">Inquiry Details</h3>
              <p className="text-xs text-white/40 mt-1">Review merchant requests and keep notes on their onboarding progress.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-white/40 uppercase text-[9px] font-bold tracking-wider">Merchant Name</p>
                <p className="text-white font-semibold mt-1">{selectedLead.name}</p>
              </div>
              <div>
                <p className="text-white/40 uppercase text-[9px] font-bold tracking-wider">Requested Tier</p>
                <p className="text-white font-semibold mt-1">{selectedLead.subject?.replace(" Plan Inquiry", "") || "N/A"}</p>
              </div>
              <div>
                <p className="text-white/40 uppercase text-[9px] font-bold tracking-wider">Viber Contact</p>
                <p className="text-white/80 font-mono mt-1">{selectedLead.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-white/40 uppercase text-[9px] font-bold tracking-wider">Facebook Profile</p>
                <div className="mt-1">
                  {parseLeadMessage(selectedLead.message).facebookUrl ? (
                    <a 
                      href={parseLeadMessage(selectedLead.message).facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-pink hover:underline flex items-center gap-1 font-mono"
                    >
                      {parseLeadMessage(selectedLead.message).facebookUrl.slice(0, 30)}... <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : "N/A"}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-white/40 uppercase text-[9px] font-bold tracking-wider">User Custom Message</p>
              <p className="text-xs text-white/80 bg-[#07080c] border border-white/5 p-3 rounded-xl min-h-[50px] leading-relaxed whitespace-pre-wrap">
                {parseLeadMessage(selectedLead.message).userMessage || <span className="text-white/20 italic">No message included.</span>}
              </p>
            </div>

            {/* Onboarding Status Selector */}
            <div className="space-y-2">
              <label className="text-white/40 uppercase text-[9px] font-bold tracking-wider block">Lead Onboarding Status</label>
              <div className="flex flex-wrap gap-2">
                {['new', 'contacted', 'qualified', 'converted', 'archived'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleUpdateStatus(selectedLead.id, status)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                      selectedLead.status === status
                        ? 'bg-brand-pink text-white border-brand-pink'
                        : 'bg-white/3 text-white/50 border-white/5 hover:text-white/70'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Remarks / Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-white/40 uppercase text-[9px] font-bold tracking-wider block">Internal Remarks / Process Notes</label>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="bg-brand-pink hover:bg-brand-coral text-white rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all inline-flex items-center gap-1"
                >
                  {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                  Save Remarks
                </button>
              </div>
              <textarea
                rows={3}
                value={leadNotes}
                onChange={e => setLeadNotes(e.target.value)}
                placeholder="Log follow-ups, Viber calls, deployment status details here..."
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-brand-pink resize-none"
              />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
export default SuperAdminLeadsPage;
