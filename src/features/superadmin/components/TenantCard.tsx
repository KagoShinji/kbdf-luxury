import { Globe, ArrowRight } from 'lucide-react';
import type { Tenant } from '../../../lib/supabase/database.types';
import { EnvGenerator } from './EnvGenerator';
import { Link } from 'react-router-dom';

interface TenantCardProps {
  tenant: Tenant;
}

export function TenantCard({ tenant }: TenantCardProps) {
  const bType = tenant.business_type || 'e-commerce';
  
  const getBadgeStyle = (type: string) => {
    if (type.startsWith('portfolio_food') || type === 'food') {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    if (type.startsWith('portfolio_construction') || type === 'construction') {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
    if (type.startsWith('portfolio')) {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  const formatTypeLabel = (type: string) => {
    if (type === 'portfolio_food') return 'Portfolio: Food';
    if (type === 'portfolio_construction') return 'Portfolio: Const.';
    if (type === 'portfolio_general') return 'Portfolio: General';
    if (type === 'e-commerce') return 'E-Commerce';
    return type;
  };

  return (
    <div
      className={`bg-[#111827] border rounded-2xl p-5 flex flex-col justify-between h-52 transition-all ${
        tenant.is_active ? 'border-white/5 shadow-lg' : 'border-white/5 opacity-50'
      }`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70 overflow-hidden border border-white/5">
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <Globe className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">{tenant.name}</h4>
              <p className="text-white/40 text-[10px] font-mono">{tenant.slug}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border uppercase tracking-wider ${
              tenant.is_active
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {tenant.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border uppercase tracking-wider ${getBadgeStyle(bType)}`}>
              {formatTypeLabel(bType)}
            </span>
          </div>
        </div>

        {/* Configurations */}
        <div className="flex items-center gap-4 text-xs text-white/60 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: tenant.primary_color }} />
            Primary Theme
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: tenant.accent_color }} />
            Accent Color
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <EnvGenerator tenant={tenant} />
        
        <Link
          to={`/odc/tenants/${tenant.id}`}
          className="text-xs font-semibold text-[#fb7a90] hover:text-[#f16881] transition-all flex items-center gap-1 hover:underline"
        >
          View Store Data <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
export default TenantCard;
