import { useState, useEffect, useMemo } from 'react';
import { useAdminUser } from '../hooks/useAdminUser';
import { usePermissions } from '../hooks/usePermissions';
import { supabase, TENANT_ID } from '../../../lib/supabase/supabaseClient';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { DateRangeFilter, DEFAULT_DATE_RANGE, isDateInRange } from '../components/DateRangeFilter';
import type { DateRangeValue } from '../components/DateRangeFilter';
import { Coins, Eye, CheckCircle, XCircle, Calendar, Trash2 } from 'lucide-react';
import { useNotification } from '../../../core/context/NotificationContext';

interface LeewayAccount {
  id: string;
  tenant_id: string;
  customer_id: string;
  order_id: string;
  total_amount: number;
  down_payment_amount: number;
  remaining_balance: number;
  monthly_payment_amount: number;
  payment_schedule: 'weekly' | 'monthly' | 'flexible';
  status: 'active' | 'completed' | 'defaulted';
  created_at: string;
  customer?: {
    email: string;
    full_name?: string;
  } | null;
  order?: {
    tracking_number: string;
  } | null;
}

interface LeewayPayment {
  id: string;
  tenant_id: string;
  leeway_account_id: string;
  amount: number;
  proof_of_payment_url: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  payment_type: 'down_payment' | 'installment';
  admin_notes: string | null;
  created_at: string;
  updated_at?: string;
  leeway_account?: {
    total_amount: number;
    remaining_balance: number;
    payment_schedule: string;
    customer_id: string;
    order?: {
      tracking_number: string;
    } | null;
  } | null;
  customer_name?: string;
  customer_email?: string;
}

interface LeewayRequest {
  id: string;
  tenant_id: string;
  customer_id: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  monthly_payment_amount?: number | null;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_email?: string;
  requested_items?: any[];
}

export function AdminLeewayPage() {
  const { adminUser, tenant } = useAdminUser();
  const { canEdit, canDelete } = usePermissions('leeway');
  const { showSuccess, showError, showConfirm } = useNotification();

  const [accounts, setAccounts] = useState<LeewayAccount[]>([]);
  const [pendingPayments, setPendingPayments] = useState<LeewayPayment[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<LeewayPayment[]>([]);
  const [leewayRequests, setLeewayRequests] = useState<LeewayRequest[]>([]);
  
  const [activeTab, setActiveTab] = useState<'accounts' | 'queue' | 'logs' | 'requests'>('accounts');
  const [loading, setLoading] = useState(true);
  
  const [selectedPayment, setSelectedPayment] = useState<LeewayPayment | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Multiple Delete State
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Notes state for request processing
  const [requestNotesMap, setRequestNotesMap] = useState<Record<string, string>>({});
  const [requestMonthlyMap, setRequestMonthlyMap] = useState<Record<string, number>>({});

  // Account Monthly Payment Editing state
  const [editingAccount, setEditingAccount] = useState<LeewayAccount | null>(null);
  const [editMonthlyAmount, setEditMonthlyAmount] = useState<number>(0);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Date Range filter state
  const [dateRange, setDateRange] = useState<DateRangeValue>(DEFAULT_DATE_RANGE);

  const tenantId = adminUser?.tenant_id ?? TENANT_ID;
  const currency = tenant?.currency_symbol ?? '₱';

  useEffect(() => {
    if (tenantId) {
      loadData();
    }
  }, [tenantId, activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === 'accounts') {
        const { data, error } = await supabase
          .from('leeway_accounts')
          .select('*, order:orders(tracking_number)')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch customer profile metadata since they reference auth.users
        const updatedAccounts = await Promise.all(
          (data || []).map(async (acc: any) => {
            const { data: userData } = await supabase
              .from('admin_users')
              .select('email, full_name')
              .eq('auth_id', acc.customer_id)
              .maybeSingle();
            
            // Fallback to searching order customer names if admin_user profile doesn't exist
            if (!userData) {
              const { data: orderData } = await supabase
                .from('orders')
                .select('customer_email, customer_first_name, customer_last_name')
                .eq('id', acc.order_id)
                .maybeSingle();

              return {
                ...acc,
                customer: orderData ? {
                  email: orderData.customer_email,
                  full_name: `${orderData.customer_first_name} ${orderData.customer_last_name}`
                } : { email: 'Unknown Customer' }
              };
            }

            return {
              ...acc,
              customer: userData ? {
                email: userData.email,
                full_name: userData.full_name
              } : null
            };
          })
        );

        setAccounts(updatedAccounts);
      } else if (activeTab === 'queue') {
        const { data, error } = await supabase
          .from('leeway_payments')
          .select('*, leeway_account:leeway_accounts(*, order:orders(tracking_number))')
          .eq('tenant_id', tenantId)
          .eq('status', 'pending_verification')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const updatedPayments = await Promise.all(
          (data || []).map(async (pay: any) => {
            const customerId = pay.leeway_account?.customer_id;
            let name = 'Unknown';
            let email = 'Unknown';
            if (customerId) {
              const { data: userData } = await supabase
                .from('admin_users')
                .select('email, full_name')
                .eq('auth_id', customerId)
                .maybeSingle();

              if (userData) {
                name = userData.full_name || 'Staff User';
                email = userData.email;
              } else {
                const { data: orderData } = await supabase
                  .from('orders')
                  .select('customer_email, customer_first_name, customer_last_name')
                  .eq('id', pay.leeway_account?.order_id)
                  .maybeSingle();
                if (orderData) {
                  name = `${orderData.customer_first_name} ${orderData.customer_last_name}`;
                  email = orderData.customer_email;
                }
              }
            }
            return {
              ...pay,
              customer_name: name,
              customer_email: email
            };
          })
        );

        setPendingPayments(updatedPayments);
      } else if (activeTab === 'logs') {
        const { data, error } = await supabase
          .from('leeway_payments')
          .select('*, leeway_account:leeway_accounts(*, order:orders(tracking_number))')
          .eq('tenant_id', tenantId)
          .neq('status', 'pending_verification')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const updatedLogs = await Promise.all(
          (data || []).map(async (pay: any) => {
            const customerId = pay.leeway_account?.customer_id;
            let name = 'Unknown';
            let email = 'Unknown';
            if (customerId) {
              const { data: userData } = await supabase
                .from('admin_users')
                .select('email, full_name')
                .eq('auth_id', customerId)
                .maybeSingle();

              if (userData) {
                name = userData.full_name || 'Staff User';
                email = userData.email;
              } else {
                const { data: orderData } = await supabase
                  .from('orders')
                  .select('customer_email, customer_first_name, customer_last_name')
                  .eq('id', pay.leeway_account?.order_id)
                  .maybeSingle();
                if (orderData) {
                  name = `${orderData.customer_first_name} ${orderData.customer_last_name}`;
                  email = orderData.customer_email;
                }
              }
            }
            return {
              ...pay,
              customer_name: name,
              customer_email: email
            };
          })
        );

        setPaymentLogs(updatedLogs);
      } else if (activeTab === 'requests') {
        const { data, error } = await supabase
          .from('leeway_requests')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const updatedRequests = await Promise.all(
          (data || []).map(async (req: any) => {
            let name = req.customer_name || 'Unknown';
            let email = req.customer_email || 'Unknown';
            
            if (name === 'Unknown' || email === 'Unknown') {
              // Try fetching from admin_users (which maps user metadata profiles)
              const { data: userData } = await supabase
                .from('admin_users')
                .select('email, full_name')
                .eq('auth_id', req.customer_id)
                .maybeSingle();

              if (userData) {
                name = userData.full_name || 'Customer Profile';
                email = userData.email;
              } else {
                // Fallback to query customer name inside orders history
                const { data: orderData } = await supabase
                  .from('orders')
                  .select('customer_email, customer_first_name, customer_last_name')
                  .eq('customer_id', req.customer_id)
                  .limit(1)
                  .maybeSingle();

                if (orderData) {
                  name = `${orderData.customer_first_name} ${orderData.customer_last_name}`;
                  email = orderData.customer_email;
                }
              }
            }

            const items = Array.isArray(req.requested_items) ? req.requested_items : [];
            const mappedItems = items.map((i: any) => ({
              ...i,
              status: i.status || req.status || 'pending'
            }));

            return {
              ...req,
              requested_items: mappedItems,
              customer_name: name,
              customer_email: email
            };
          })
        );

        setLeewayRequests(updatedRequests);
        
        // Initialize request notes & monthly amounts
        const initialNotesMap: Record<string, string> = {};
        const initialMonthlyMap: Record<string, number> = {};
        updatedRequests.forEach(r => {
          initialNotesMap[r.id] = r.admin_notes || '';
          if (r.monthly_payment_amount) {
            initialMonthlyMap[r.id] = r.monthly_payment_amount;
          }
        });
        setRequestNotesMap(initialNotesMap);
        setRequestMonthlyMap(initialMonthlyMap);
      }
    } catch (err) {
      console.error('Error fetching leeway data:', err);
      showError('Failed to load installment data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPayment(paymentId: string, action: 'verified' | 'rejected') {
    if (!canEdit) return;
    setIsVerifying(true);
    try {
      const { error } = await supabase
        .from('leeway_payments')
        .update({
          status: action,
          admin_notes: adminNotes.trim() || null
        })
        .eq('id', paymentId);

      if (error) throw error;

      showSuccess(`Payment was successfully ${action}!`);
      setSelectedPayment(null);
      setAdminNotes('');
      loadData();
    } catch (err: any) {
      console.error(err);
      showError('Failed to update installment payment: ' + (err.message || err));
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleProcessSingleItem(requestId: string, itemId: string, itemSize: string | null, action: 'approved' | 'rejected') {
    if (!canEdit) return;
    
    const request = leewayRequests.find(r => r.id === requestId);
    if (!request) return;

    const itemsList = Array.isArray(request.requested_items) ? [...request.requested_items] : [];
    const itemIndex = itemsList.findIndex((item: any) => item.id === itemId && item.size === itemSize);
    if (itemIndex === -1) return;

    itemsList[itemIndex] = {
      ...itemsList[itemIndex],
      status: action
    };

    const overallStatus = itemsList.some(i => i.status === 'pending')
      ? 'pending'
      : itemsList.some(i => i.status === 'approved')
        ? 'approved'
        : 'rejected';

    try {
      const { error } = await supabase
        .from('leeway_requests')
        .update({
          requested_items: itemsList,
          status: overallStatus
        })
        .eq('id', requestId);

      if (error) throw error;

      showSuccess(`Item status has been updated to ${action}!`);
      loadData();
    } catch (err: any) {
      console.error(err);
      showError('Failed to update item status: ' + (err.message || err));
    }
  }

  async function handleProcessRequest(requestId: string, action: 'approved' | 'rejected') {
    if (!canEdit) return;
    const request = leewayRequests.find(r => r.id === requestId);
    if (!request) return;

    const itemsList = Array.isArray(request.requested_items) ? [...request.requested_items] : [];
    const updatedItems = itemsList.map((item: any) => ({
      ...item,
      status: action
    }));

    const notes = requestNotesMap[requestId] || '';
    const monthlyAmt = requestMonthlyMap[requestId] !== undefined ? requestMonthlyMap[requestId] : (request.monthly_payment_amount || null);

    try {
      const { error } = await supabase
        .from('leeway_requests')
        .update({
          status: action,
          requested_items: updatedItems,
          admin_notes: notes.trim() || null,
          monthly_payment_amount: action === 'approved' ? (monthlyAmt || null) : null
        })
        .eq('id', requestId);

      if (error) throw error;

      showSuccess(`All items in installment request have been ${action}!`);
      loadData();
    } catch (err: any) {
      console.error(err);
      showError('Failed to update installment request: ' + (err.message || err));
    }
  }

  async function handleSaveMonthlyPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAccount || !canEdit) return;
    setIsSavingAccount(true);
    try {
      const { error } = await supabase
        .from('leeway_accounts')
        .update({ monthly_payment_amount: Number(editMonthlyAmount) })
        .eq('id', editingAccount.id);

      if (error) throw error;
      showSuccess('Monthly payment amount updated successfully!');
      setEditingAccount(null);
      loadData();
    } catch (err: any) {
      console.error(err);
      showError('Failed to update monthly payment amount: ' + (err.message || err));
    } finally {
      setIsSavingAccount(false);
    }
  }

  async function handleDeleteSingle(id: string, type: 'accounts' | 'requests' | 'payments') {
    if (!canDelete) return;

    let targetName = 'record';
    let table = '';
    if (type === 'accounts') {
      targetName = 'installment account';
      table = 'leeway_accounts';
    } else if (type === 'requests') {
      targetName = 'approval request';
      table = 'leeway_requests';
    } else {
      targetName = 'payment record';
      table = 'leeway_payments';
    }

    const confirmed = await showConfirm(
      `Are you sure you want to delete this ${targetName}? This action cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      showSuccess(`Successfully deleted ${targetName}.`);
      setSelectedIds(prev => prev.filter(item => item !== id));
      await loadData();
    } catch (err: any) {
      console.error(err);
      showError(`Failed to delete ${targetName}: ` + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkDelete() {
    if (!canDelete || selectedIds.length === 0) return;

    let targetName = 'records';
    let table = '';
    if (activeTab === 'accounts') {
      targetName = 'installment account(s)';
      table = 'leeway_accounts';
    } else if (activeTab === 'requests') {
      targetName = 'approval request(s)';
      table = 'leeway_requests';
    } else if (activeTab === 'queue' || activeTab === 'logs') {
      targetName = 'payment record(s)';
      table = 'leeway_payments';
    }

    const confirmed = await showConfirm(
      `Are you sure you want to delete the ${selectedIds.length} selected ${targetName}? This action cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      showSuccess(`Successfully deleted ${selectedIds.length} ${targetName}.`);
      setSelectedIds([]);
      setIsBulkMode(false);
      await loadData();
    } catch (err: any) {
      console.error(err);
      showError(`Failed to delete selected ${targetName}: ` + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  const accountColumns: Column<LeewayAccount>[] = [
    {
      key: 'order',
      label: 'Order Link',
      render: (row) => (
        <span className="font-mono font-bold text-white tracking-wider">
          {row.order?.tracking_number || 'N/A'}
        </span>
      ),
      width: '150px'
    },
    {
      key: 'customer',
      label: 'Customer Name',
      render: (row) => (
        <div>
          <p className="font-semibold text-white">{row.customer?.full_name || 'N/A'}</p>
          <p className="text-[11px] text-white/30">{row.customer?.email || 'N/A'}</p>
        </div>
      )
    },
    {
      key: 'total_amount',
      label: 'Total Cost',
      render: (row) => <span className="text-white">{currency}{Number(row.total_amount).toLocaleString()}</span>
    },
    {
      key: 'down_payment_amount',
      label: 'Down Payment',
      render: (row) => <span className="text-white/60">{currency}{Number(row.down_payment_amount).toLocaleString()}</span>
    },
    {
      key: 'remaining_balance',
      label: 'Outstanding Balance',
      render: (row) => (
        <span className={`font-semibold ${row.remaining_balance > 0 ? 'text-[#fb7a90]' : 'text-emerald-400'}`}>
          {currency}{Number(row.remaining_balance).toLocaleString()}
        </span>
      )
    },
    {
      key: 'monthly_payment_amount',
      label: 'Monthly Due',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">
            {row.monthly_payment_amount > 0 ? `${currency}${Number(row.monthly_payment_amount).toLocaleString()}` : <span className="text-white/40 italic">Not set</span>}
          </span>
          {canEdit && (
            <button
              onClick={() => {
                setEditingAccount(row);
                setEditMonthlyAmount(row.monthly_payment_amount || 0);
              }}
              className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded bg-[#fb7a90]/10 text-[#fb7a90] hover:bg-[#fb7a90] hover:text-white transition-all"
              title="Set or update monthly installment amount"
            >
              Set Monthly
            </button>
          )}
        </div>
      )
    },
    {
      key: 'payment_schedule',
      label: 'Schedule',
      render: (row) => <span className="capitalize text-white/70">{row.payment_schedule}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        let style = '';
        if (row.status === 'active') style = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        else if (row.status === 'completed') style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        else style = 'bg-red-500/10 text-red-400 border-red-500/20';
        return (
          <span className={`px-2.5 py-0.5 text-[10px] rounded-full border uppercase font-bold tracking-wider ${style}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        canDelete ? (
          <button
            onClick={() => handleDeleteSingle(row.id, 'accounts')}
            className="p-1.5 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
            title="Delete Installment Account"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : null
      ),
      width: '80px'
    }
  ];

  const queueColumns: Column<LeewayPayment>[] = [
    {
      key: 'created_at',
      label: 'Submitted Date',
      render: (row) => (
        <span className="text-white/60 text-xs flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(row.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
        </span>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => (
        <div>
          <p className="font-semibold text-white">{row.customer_name}</p>
          <p className="text-[11px] text-white/30">{row.customer_email}</p>
        </div>
      )
    },
    {
      key: 'tracking',
      label: 'Tracking Code',
      render: (row) => <span className="font-mono text-white/80">{row.leeway_account?.order?.tracking_number || 'N/A'}</span>
    },
    {
      key: 'payment_type',
      label: 'Type',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
          row.payment_type === 'down_payment' 
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
        }`}>
          {row.payment_type.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'Amount Paid',
      render: (row) => <span className="font-bold text-white">{currency}{Number(row.amount).toLocaleString()}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setSelectedPayment(row); setAdminNotes(row.admin_notes || ''); }}
            className="p-1.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center gap-1 text-xs"
          >
            <Eye className="w-4 h-4" /> Review
          </button>
          {canDelete && (
            <button
              onClick={() => handleDeleteSingle(row.id, 'payments')}
              className="p-1.5 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete Payment"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
      width: '130px'
    }
  ];

  const logsColumns: Column<LeewayPayment>[] = [
    {
      key: 'updated_at',
      label: 'Verified Date',
      render: (row) => (
        <span className="text-white/60 text-xs">
          {new Date(row.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
        </span>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => (
        <div>
          <p className="font-semibold text-white">{row.customer_name}</p>
          <p className="text-[11px] text-white/30">{row.customer_email}</p>
        </div>
      )
    },
    {
      key: 'tracking',
      label: 'Tracking',
      render: (row) => <span className="font-mono text-white/60">{row.leeway_account?.order?.tracking_number || 'N/A'}</span>
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => <span className="text-white">{currency}{Number(row.amount).toLocaleString()}</span>
    },
    {
      key: 'status',
      label: 'Result',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
          row.status === 'verified' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'notes',
      label: 'Verification Notes',
      render: (row) => <span className="text-white/40 text-xs truncate max-w-xs block">{row.admin_notes || '—'}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        canDelete ? (
          <button
            onClick={() => handleDeleteSingle(row.id, 'payments')}
            className="p-1.5 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
            title="Delete Log Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : null
      ),
      width: '80px'
    }
  ];

  const requestColumns: Column<LeewayRequest>[] = [
    {
      key: 'created_at',
      label: 'Request Date',
      render: (row) => (
        <span className="text-white/60 text-xs">
          {new Date(row.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
        </span>
      )
    },
    {
      key: 'customer',
      label: 'Customer Details',
      render: (row) => {
        const itemsList = Array.isArray(row.requested_items) ? row.requested_items : [];
        return (
          <div className="space-y-2">
            <div>
              <p className="font-semibold text-white">{row.customer_name}</p>
              <p className="text-[11px] text-white/30">{row.customer_email}</p>
            </div>
            {itemsList.length > 0 && (
              <div className="bg-white/5 rounded-lg p-3 max-w-md space-y-2">
                <span className="text-[9px] uppercase font-bold text-white/40 block">Requested Items:</span>
                {itemsList.map((item: any, idx: number) => {
                  let itemStatusStyle = 'text-amber-400 bg-amber-400/10 border-amber-400/20';
                  if (item.status === 'approved') itemStatusStyle = 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
                  else if (item.status === 'rejected') itemStatusStyle = 'text-red-400 bg-red-400/10 border-red-400/20';

                  return (
                    <div key={idx} className="flex items-center justify-between gap-4 text-[11px] border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{item.title}</p>
                        <p className="text-white/40 text-[9px]">
                          {item.size ? `Size: ${item.size} • ` : ''}Qty: {item.quantity} • Price: {currency}{Number(item.price).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-extrabold border ${itemStatusStyle}`}>
                          {item.status || 'pending'}
                        </span>
                        
                        {canEdit && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleProcessSingleItem(row.id, item.id, item.size || null, 'approved')}
                              className="p-1 text-emerald-400 hover:text-white hover:bg-emerald-500/20 rounded transition-all"
                              title="Approve Item"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleProcessSingleItem(row.id, item.id, item.size || null, 'rejected')}
                              className="p-1 text-red-400 hover:text-white hover:bg-red-500/20 rounded transition-all"
                              title="Reject Item"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        let style = '';
        if (row.status === 'pending') style = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        else if (row.status === 'approved') style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        else style = 'bg-red-500/10 text-red-400 border-red-500/20';
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${style}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      key: 'monthly_payment_amount',
      label: 'Approved Monthly Due',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="text-white/40 text-xs">{currency}</span>
          <input
            type="number"
            min="0"
            step="1"
            value={requestMonthlyMap[row.id] ?? (row.monthly_payment_amount || '')}
            onChange={e => setRequestMonthlyMap(prev => ({ ...prev, [row.id]: Number(e.target.value) }))}
            placeholder="e.g. 5000"
            disabled={!canEdit}
            className="bg-[#0f1117] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none w-28 focus:border-[#fb7a90]/40"
          />
        </div>
      )
    },
    {
      key: 'admin_notes',
      label: 'Admin Notes',
      render: (row) => (
        <input
          type="text"
          value={requestNotesMap[row.id] ?? ''}
          onChange={e => setRequestNotesMap(prev => ({ ...prev, [row.id]: e.target.value }))}
          placeholder="Credit limit details, approval notes..."
          disabled={!canEdit}
          className="bg-[#0f1117] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white outline-none w-full max-w-xs focus:border-[#fb7a90]/40"
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        return (
          <div className="flex gap-2 items-center">
            {canEdit && (
              <>
                <button
                  onClick={() => handleProcessRequest(row.id, 'rejected')}
                  className="p-1.5 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-all"
                  title="Reject Request"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleProcessRequest(row.id, 'approved')}
                  className="p-1.5 text-emerald-400 hover:text-white hover:bg-emerald-500/20 rounded-lg transition-all"
                  title="Approve Request"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              </>
            )}
            {canDelete && (
              <button
                onClick={() => handleDeleteSingle(row.id, 'requests')}
                className="p-1.5 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
                title="Delete Request"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
      width: '130px'
    }
  ];

  const filteredAccounts = useMemo(() => {
    return accounts.filter(a => isDateInRange(a.created_at, dateRange));
  }, [accounts, dateRange]);

  const filteredQueue = useMemo(() => {
    return pendingPayments.filter(p => isDateInRange(p.created_at, dateRange));
  }, [pendingPayments, dateRange]);

  const filteredLogs = useMemo(() => {
    return paymentLogs.filter(p => isDateInRange(p.updated_at || p.created_at, dateRange));
  }, [paymentLogs, dateRange]);

  const filteredRequests = useMemo(() => {
    return leewayRequests.filter(r => isDateInRange(r.created_at, dateRange));
  }, [leewayRequests, dateRange]);

  const currentVisibleData = useMemo(() => {
    if (activeTab === 'accounts') return filteredAccounts;
    if (activeTab === 'requests') return filteredRequests;
    if (activeTab === 'queue') return filteredQueue;
    return filteredLogs;
  }, [activeTab, filteredAccounts, filteredRequests, filteredQueue, filteredLogs]);

  const selectionColumn = {
    key: 'selection',
    label: (
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={currentVisibleData.length > 0 && selectedIds.length === currentVisibleData.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(currentVisibleData.map(item => item.id));
            } else {
              setSelectedIds([]);
            }
          }}
          className="w-4 h-4 rounded border-white/10 text-[#fb7a90] bg-[#0f1117] focus:ring-0 focus:ring-offset-0 cursor-pointer"
        />
      </div>
    ),
    render: (row: any) => (
      <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(prev => [...prev, row.id]);
            } else {
              setSelectedIds(prev => prev.filter(id => id !== row.id));
            }
          }}
          className="w-4 h-4 rounded border-white/10 text-[#fb7a90] bg-[#0f1117] focus:ring-0 focus:ring-offset-0 cursor-pointer"
        />
      </div>
    ),
    width: '50px'
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#fb7a90]" /> Installment Management
          </h2>
          <p className="text-white/40 text-xs mt-0.5">Manage customer installment accounts, verify digital payments, and log outstanding balances.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Multiple Delete Buttons */}
          {canDelete && (
            <>
              {!isBulkMode ? (
                <button
                  onClick={() => setIsBulkMode(true)}
                  className="flex items-center justify-center gap-2 bg-[#1f2937] hover:bg-[#374151] border border-white/10 text-white rounded-xl px-4 py-2.5 font-semibold text-xs hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white/70" /> Multiple Delete
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedIds.length === 0}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 font-semibold text-xs active:scale-[0.98] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedIds.length})
                  </button>
                  <button
                    onClick={() => {
                      setIsBulkMode(false);
                      setSelectedIds([]);
                    }}
                    className="flex items-center justify-center gap-2 bg-[#1f2937] hover:bg-[#374151] border border-white/10 text-white rounded-xl px-4 py-2.5 font-semibold text-xs active:scale-[0.98] transition-all"
                  >
                    Cancel Selection
                  </button>
                </div>
              )}
            </>
          )}

          {/* Date Range Filter */}
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            align="right"
          />

          {/* Tab Selectors */}
          <div className="flex bg-[#0f1117] border border-white/5 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('accounts');
                setSelectedIds([]);
                setIsBulkMode(false);
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'accounts' ? 'bg-[#fb7a90] text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Accounts
            </button>
            <button
              onClick={() => {
                setActiveTab('requests');
                setSelectedIds([]);
                setIsBulkMode(false);
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all relative ${
                activeTab === 'requests' ? 'bg-[#fb7a90] text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Requests
              {leewayRequests.some(r => r.status === 'pending') && activeTab !== 'requests' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#fb7a90] rounded-full animate-ping" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('queue');
                setSelectedIds([]);
                setIsBulkMode(false);
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all relative ${
                activeTab === 'queue' ? 'bg-[#fb7a90] text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Verification
              {pendingPayments.length > 0 && activeTab !== 'queue' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#fb7a90] rounded-full animate-ping" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('logs');
                setSelectedIds([]);
                setIsBulkMode(false);
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'logs' ? 'bg-[#fb7a90] text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Logs
            </button>
          </div>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl p-4">
        {activeTab === 'accounts' && (
          <DataTable
            columns={isBulkMode ? [selectionColumn, ...accountColumns] : accountColumns}
            data={filteredAccounts}
            isLoading={loading}
            searchPlaceholder="Search customer, email, or order..."
            emptyMessage="No active installment accounts found."
          />
        )}

        {activeTab === 'queue' && (
          <DataTable
            columns={isBulkMode ? [selectionColumn, ...queueColumns] : queueColumns}
            data={filteredQueue}
            isLoading={loading}
            searchPlaceholder="Search customer, tracking code..."
            emptyMessage="Verification queue is currently empty."
          />
        )}

        {activeTab === 'logs' && (
          <DataTable
            columns={isBulkMode ? [selectionColumn, ...logsColumns] : logsColumns}
            data={filteredLogs}
            isLoading={loading}
            searchPlaceholder="Search logs..."
            emptyMessage="No logged payment history found."
          />
        )}

        {activeTab === 'requests' && (
          <DataTable
            columns={isBulkMode ? [selectionColumn, ...requestColumns] : requestColumns}
            data={filteredRequests}
            isLoading={loading}
            searchPlaceholder="Search request customer..."
            emptyMessage="No installment access requests submitted."
          />
        )}
      </div>

      {/* Review Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[85vh]">
            
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <h3 className="text-white font-semibold text-lg">
                Review Installment Payment Submission
              </h3>
              <button 
                onClick={() => { setSelectedPayment(null); setAdminNotes(''); }} 
                className="text-white/40 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Receipt Preview */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-white/40 block">Submitted Receipt Proof</span>
                <a 
                  href={selectedPayment.proof_of_payment_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group block relative w-full aspect-[3/4] bg-black border border-white/5 rounded-xl overflow-hidden"
                >
                  <img 
                    src={selectedPayment.proof_of_payment_url} 
                    alt="Proof of Payment" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-xs text-white font-bold bg-[#fb7a90] px-4 py-1.5 rounded-full">Open Image in New Tab</span>
                  </div>
                </a>
              </div>

              {/* Verification Details */}
              <div className="space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs uppercase font-bold text-white tracking-widest border-b border-white/5 pb-1 mb-3">
                      Payment Details
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-white/70">
                      <div>
                        <span className="text-[10px] uppercase text-white/30 block">Customer</span>
                        <strong className="text-white">{selectedPayment.customer_name}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-white/30 block">Email</span>
                        <strong className="text-white text-xs">{selectedPayment.customer_email}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-white/30 block">Order Track Reference</span>
                        <strong className="text-[#fb7a90] font-mono">{selectedPayment.leeway_account?.order?.tracking_number || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-white/30 block">Payment Type</span>
                        <span className="capitalize font-semibold text-white">{selectedPayment.payment_type.replace('_', ' ')}</span>
                      </div>
                      <div className="col-span-2 border-t border-white/5 pt-3 mt-1 grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] uppercase text-white/30 block">Installment Amount</span>
                          <strong className="text-xl text-white font-sans">{currency}{Number(selectedPayment.amount).toLocaleString()}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-white/30 block">Remaining Balance</span>
                          <strong className="text-xl text-[#fb7a90] font-sans">{currency}{Number(selectedPayment.leeway_account?.remaining_balance).toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <label className="text-[10px] uppercase font-bold text-white/40">Verification Notes / Reference Codes</label>
                    <textarea
                      value={adminNotes}
                      onChange={e => setAdminNotes(e.target.value)}
                      placeholder="Input GCash transaction ref codes, bank transfer clearance info..."
                      rows={4}
                      className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-3 text-xs text-white resize-none outline-none focus:border-[#fb7a90]/50"
                    />
                  </div>
                </div>

                {/* Approve/Reject Actions */}
                {canEdit ? (
                  <div className="pt-4 border-t border-white/5 flex gap-3">
                    <button
                      onClick={() => handleVerifyPayment(selectedPayment.id, 'rejected')}
                      disabled={isVerifying}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-30 text-white rounded-xl py-3 text-xs font-semibold tracking-wider transition-all active:scale-[0.98]"
                    >
                      <XCircle className="w-4 h-4" /> Reject Payment
                    </button>
                    <button
                      onClick={() => handleVerifyPayment(selectedPayment.id, 'verified')}
                      disabled={isVerifying}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white rounded-xl py-3 text-xs font-semibold tracking-wider transition-all active:scale-[0.98]"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve & Deduct Balance
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-lg">You do not have permissions to edit installment transactions.</p>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Monthly Payment Modal */}
      {editingAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-white font-semibold text-base flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#fb7a90]" /> Set Monthly Payment Amount
              </h3>
              <button onClick={() => setEditingAccount(null)} className="text-white/40 hover:text-white transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-white/70 bg-[#0f1117] p-3.5 rounded-xl border border-white/5">
              <div className="flex justify-between">
                <span className="text-white/40">Tracking Order:</span>
                <span className="font-mono text-white font-bold">{editingAccount.order?.tracking_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Customer:</span>
                <span className="text-white font-semibold">{editingAccount.customer?.full_name || editingAccount.customer?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Total Order Cost:</span>
                <span className="text-white font-bold">{currency}{Number(editingAccount.total_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2">
                <span className="text-white/40">Remaining Balance:</span>
                <span className="text-[#fb7a90] font-bold">{currency}{Number(editingAccount.remaining_balance).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleSaveMonthlyPayment} className="space-y-4 pt-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-white/60">Required Monthly Payment ({currency}) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={editMonthlyAmount || ''}
                  onChange={e => setEditMonthlyAmount(Number(e.target.value))}
                  placeholder="e.g. 5000"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-[#fb7a90]"
                />
                <p className="text-[10px] text-white/40 italic leading-relaxed">Customers will be required to pay this exact amount each installment payment until their balance is cleared.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAccount}
                  className="px-5 py-2.5 bg-[#fb7a90] hover:bg-[#fb7a90]/90 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isSavingAccount ? 'Saving...' : 'Save Monthly Amount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export default AdminLeewayPage;
