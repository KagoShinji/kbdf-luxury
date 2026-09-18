import { useState } from 'react';
import { X, Lock, Eye, EyeOff, KeyRound, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase/supabaseClient';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNotification } from '../../../core/context/NotificationContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { adminUser } = useAdminAuth();
  const { showSuccess } = useNotification();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (currentPassword && currentPassword === newPassword) {
      setError('New password cannot be the same as your current password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. If current password is provided, verify it first
      if (currentPassword && adminUser?.email) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: adminUser.email,
          password: currentPassword,
        });

        if (verifyError) {
          setError('Current password is incorrect. Please double check and try again.');
          setIsLoading(false);
          return;
        }
      }

      // 2. Update user password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      showSuccess('Password has been changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleModalClose() {
    setError(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#fb7a90]/10 flex items-center justify-center text-[#fb7a90]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">Change Password</h3>
              <p className="text-white/40 text-xs">Update your account login password</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Current User Info */}
          <div className="bg-[#0f1117] border border-white/5 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">Logged in as</p>
              <p className="text-xs font-semibold text-white truncate max-w-[240px]">
                {adminUser?.email || 'Admin User'}
              </p>
            </div>
            <span className="text-[10px] bg-white/5 text-white/60 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wider font-semibold">
              {adminUser?.is_superadmin ? 'Superadmin' : 'Admin'}
            </span>
          </div>

          {/* Current Password */}
          <div>
            <label className="text-xs text-white/60 block mb-1.5 font-medium">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-[#0f1117] border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-xs text-white/60 block mb-1.5 font-medium">
              New Password <span className="text-[#fb7a90]">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-[#0f1117] border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="text-xs text-white/60 block mb-1.5 font-medium">
              Confirm New Password <span className="text-[#fb7a90]">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-[#0f1117] border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Requirements Helper */}
          <div className="text-[11px] text-white/40 space-y-1 pt-1">
            <div className="flex items-center gap-1.5">
              <span className={newPassword.length >= 6 ? 'text-emerald-400' : 'text-white/30'}>
                •
              </span>
              <span>Minimum 6 characters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={newPassword && newPassword === confirmPassword ? 'text-emerald-400' : 'text-white/30'}>
                •
              </span>
              <span>Passwords must match</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={isLoading}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#fb7a90] to-[#f16881] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                'Updating...'
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
