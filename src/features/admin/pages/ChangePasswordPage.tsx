import { useState } from 'react';
import { Lock, Eye, EyeOff, KeyRound, AlertCircle, ShieldCheck, CheckCircle2, UserCheck, Key } from 'lucide-react';
import { supabase } from '../../../lib/supabase/supabaseClient';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNotification } from '../../../core/context/NotificationContext';

export function ChangePasswordPage() {
  const { adminUser, role, isSuperadmin } = useAdminAuth();
  const { showSuccess, showError } = useNotification();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hasMinLength = newPassword.length >= 6;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferentFromCurrent = !currentPassword || currentPassword !== newPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!hasMinLength) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (!passwordsMatch) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (currentPassword && currentPassword === newPassword) {
      setError('New password cannot be the same as your current password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. If current password is provided, verify it first with Supabase Auth
      if (currentPassword && adminUser?.email) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: adminUser.email,
          password: currentPassword,
        });

        if (verifyError) {
          setError('Current password is incorrect. Please verify and try again.');
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

      setSuccessMessage('Your password has been changed successfully!');
      showSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password update error:', err);
      const msg = err.message || 'Failed to update password. Please try again.';
      setError(msg);
      showError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#fb7a90]/10 flex items-center justify-center text-[#fb7a90]">
            <KeyRound className="w-4 h-4" />
          </div>
          Change Password
        </h1>
        <p className="text-white/40 text-xs mt-1">
          Manage your account credentials and update your security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#fb7a90]" />
              Update Password
            </h2>
            <p className="text-xs text-white/40 mb-6">
              Ensure your account is using a secure password that is at least 6 characters.
            </p>

            {error && (
              <div className="p-3.5 mb-5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-xs text-white/70 block mb-1.5 font-medium">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
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
                <p className="text-[11px] text-white/30 mt-1">
                  Optional: Verify your current password before changing.
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs text-white/70 block mb-1.5 font-medium">
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
                <label className="text-xs text-white/70 block mb-1.5 font-medium">
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

              {/* Password Checklist */}
              <div className="p-3 bg-[#0f1117] border border-white/5 rounded-xl space-y-1.5 text-[11px] text-white/50">
                <div className="flex items-center gap-2">
                  <span className={hasMinLength ? 'text-emerald-400 font-bold' : 'text-white/20'}>
                    ✓
                  </span>
                  <span className={hasMinLength ? 'text-white/80' : 'text-white/40'}>
                    Minimum 6 characters long
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={passwordsMatch ? 'text-emerald-400 font-bold' : 'text-white/20'}>
                    ✓
                  </span>
                  <span className={passwordsMatch ? 'text-white/80' : 'text-white/40'}>
                    Passwords match exactly
                  </span>
                </div>
                {currentPassword && (
                  <div className="flex items-center gap-2">
                    <span className={isDifferentFromCurrent ? 'text-emerald-400 font-bold' : 'text-white/20'}>
                      ✓
                    </span>
                    <span className={isDifferentFromCurrent ? 'text-white/80' : 'text-white/40'}>
                      Different from current password
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword || !hasMinLength || !passwordsMatch}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#fb7a90] to-[#f16881] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 shadow-sm"
                >
                  {isLoading ? (
                    'Updating Password...'
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      Save New Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Account & Security Tips */}
        <div className="space-y-6">
          {/* Account Profile Card */}
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#fb7a90]" />
              Account Details
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-white/40">Full Name</p>
                <p className="text-xs font-semibold text-white">{adminUser?.full_name || 'Admin User'}</p>
              </div>

              <div>
                <p className="text-[11px] text-white/40">Email Address</p>
                <p className="text-xs font-semibold text-white truncate">{adminUser?.email}</p>
              </div>

              <div>
                <p className="text-[11px] text-white/40">Role</p>
                <span className="inline-block mt-0.5 text-[10px] bg-[#fb7a90]/10 text-[#fb7a90] border border-[#fb7a90]/20 px-2 py-0.5 rounded font-medium">
                  {isSuperadmin ? 'Platform Superadmin' : (role?.name || 'Admin')}
                </span>
              </div>
            </div>
          </div>

          {/* Security Best Practices Card */}
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Security Tips
            </h3>

            <ul className="text-[11px] text-white/50 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-[#fb7a90] font-bold">•</span>
                Use a combination of letters, numbers, and symbols.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#fb7a90] font-bold">•</span>
                Avoid reusing passwords across other personal or business accounts.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#fb7a90] font-bold">•</span>
                Never share your admin login credentials with unauthorized staff.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
