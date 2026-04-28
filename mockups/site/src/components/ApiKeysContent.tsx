import { useState } from 'react';
import { Info, Copy, X, Check, AlertTriangle } from 'lucide-react';
type ModalState = 'none' | 'create' | 'reveal';
export function ApiKeysContent() {
  const [modalState, setModalState] = useState<ModalState>('none');
  const [selectedExpiry, setSelectedExpiry] = useState('90 days');
  const [checkedScopes, setCheckedScopes] = useState<Record<string, boolean>>({
    read: true,
    write: true,
    admin: false
  });
  const toggleScope = (scope: string) => {
    setCheckedScopes((prev) => ({
      ...prev,
      [scope]: !prev[scope]
    }));
  };
  return (
    <>
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-sm text-white/50 mt-1">
            Authenticate your applications and tools with personal access
            tokens.
          </p>
        </div>
        <button
          onClick={() => setModalState('create')}
          className="bg-[#5CE0D8] hover:bg-[#4BCBC3] rounded-xl px-4 py-2 text-sm font-semibold text-[#0D1117] shadow-[0_0_20px_rgba(92,224,216,0.25)] transition-colors whitespace-nowrap">
          
          Create API Key
        </button>
      </div>

      <div className="h-px bg-white/[0.06] mb-8" />

      {/* INFO CALLOUT */}
      <div className="bg-[#0A0E14] border border-[#7BCDD8]/20 rounded-xl p-4 mb-8 flex gap-3">
        <Info className="w-[18px] h-[18px] text-[#7BCDD8] shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-white mb-1">
            Keys are shown once
          </div>
          <p className="text-[13px] text-white/55 leading-relaxed">
            For security, the full key value is only shown immediately after
            creation. Store it in your environment variables — we cannot
            retrieve it again.
          </p>
        </div>
      </div>

      {/* KEYS TABLE */}
      <div className="w-full rounded-2xl border border-white/[0.08] overflow-hidden mb-8">
        <table className="w-full bg-[#0A0E14]">
          <thead>
            <tr className="bg-[#070A0F] border-b border-white/[0.06]">
              {['NAME', 'KEY', 'CREATED', 'LAST USED', 'SCOPES', ''].map(
                (col, i) =>
                <th
                  key={i}
                  className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">
                  
                    {col}
                  </th>

              )}
            </tr>
          </thead>
          <tbody>
            {/* Row 1 — Production (Active) */}
            <tr className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
              <td className="px-5 py-4">
                <div className="text-sm font-medium text-white">Production</div>
                <span className="inline-block mt-1 bg-[#10B981]/15 text-[#10B981] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#10B981]/20">
                  Active
                </span>
              </td>
              <td className="px-5 py-4">
                <span className="font-mono text-[13px] text-white/55">
                  cck_live_a8f2...
                </span>
                <button className="ml-2 text-white/30 hover:text-white/70 transition-colors inline-flex align-middle">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </td>
              <td className="px-5 py-4 text-sm text-white/50">Mar 15, 2026</td>
              <td className="px-5 py-4 text-sm text-[#10B981]">
                2 minutes ago
              </td>
              <td className="px-5 py-4">
                <div className="flex gap-1.5">
                  <span className="bg-white/[0.06] text-white/50 text-[11px] px-2 py-0.5 rounded-md border border-white/10">
                    read
                  </span>
                  <span className="bg-white/[0.06] text-white/50 text-[11px] px-2 py-0.5 rounded-md border border-white/10">
                    write
                  </span>
                </div>
              </td>
              <td className="px-5 py-4 text-right">
                <button className="text-sm text-white/30 hover:text-[#EF4444] transition-colors">
                  Revoke
                </button>
              </td>
            </tr>

            {/* Row 2 — Development (Active) */}
            <tr className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
              <td className="px-5 py-4">
                <div className="text-sm font-medium text-white">
                  Development
                </div>
                <span className="inline-block mt-1 bg-[#10B981]/15 text-[#10B981] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#10B981]/20">
                  Active
                </span>
              </td>
              <td className="px-5 py-4">
                <span className="font-mono text-[13px] text-white/55">
                  cck_dev_3b91...
                </span>
                <button className="ml-2 text-white/30 hover:text-white/70 transition-colors inline-flex align-middle">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </td>
              <td className="px-5 py-4 text-sm text-white/50">Mar 8, 2026</td>
              <td className="px-5 py-4 text-sm text-white/50">Yesterday</td>
              <td className="px-5 py-4">
                <div className="flex gap-1.5">
                  <span className="bg-white/[0.06] text-white/50 text-[11px] px-2 py-0.5 rounded-md border border-white/10">
                    read
                  </span>
                  <span className="bg-white/[0.06] text-white/50 text-[11px] px-2 py-0.5 rounded-md border border-white/10">
                    write
                  </span>
                  <span className="bg-white/[0.06] text-white/50 text-[11px] px-2 py-0.5 rounded-md border border-white/10">
                    admin
                  </span>
                </div>
              </td>
              <td className="px-5 py-4 text-right">
                <button className="text-sm text-white/30 hover:text-[#EF4444] transition-colors">
                  Revoke
                </button>
              </td>
            </tr>

            {/* Row 3 — CI/CD Pipeline (Revoked) */}
            <tr className="bg-[#EF4444]/5">
              <td className="px-5 py-4">
                <div className="text-sm font-medium text-white/35">
                  CI/CD Pipeline
                </div>
                <span className="inline-block mt-1 bg-[#EF4444]/15 text-[#EF4444] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#EF4444]/20">
                  Revoked
                </span>
              </td>
              <td className="px-5 py-4">
                <span className="font-mono text-[13px] text-white/25">
                  cck_live_f7c4...
                </span>
              </td>
              <td className="px-5 py-4 text-sm text-white/35">Feb 22, 2026</td>
              <td className="px-5 py-4 text-sm text-white/35">Mar 31, 2026</td>
              <td className="px-5 py-4">
                <span className="bg-white/[0.04] text-white/25 text-[11px] px-2 py-0.5 rounded-md border border-white/[0.06]">
                  read
                </span>
              </td>
              <td className="px-5 py-4 text-right">
                <span className="text-sm text-white/20 italic cursor-not-allowed">
                  Deleted
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SCOPE REFERENCE */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-white mb-4">
          Scope Reference
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#0A0E14] rounded-xl border border-white/[0.08] p-4">
            <span className="inline-block bg-white/[0.06] text-white/50 text-xs px-2 py-0.5 rounded-md border border-white/10 mb-3">
              read
            </span>
            <p className="text-[13px] text-white/50 leading-relaxed">
              Access data: list agents, fetch usage stats, read settings.
            </p>
          </div>
          <div className="bg-[#0A0E14] rounded-xl border border-white/[0.08] p-4">
            <span className="inline-block bg-white/[0.06] text-white/50 text-xs px-2 py-0.5 rounded-md border border-white/10 mb-3">
              write
            </span>
            <p className="text-[13px] text-white/50 leading-relaxed">
              Modify data: create agents, update settings, trigger deployments.
            </p>
          </div>
          <div className="bg-[#0A0E14] rounded-xl border border-[#7C3AED]/20 p-4">
            <span className="inline-block bg-[#7C3AED]/15 text-[#7C3AED] text-xs px-2 py-0.5 rounded-md border border-[#7C3AED]/25 mb-3">
              admin
            </span>
            <p className="text-[13px] text-white/50 leading-relaxed">
              Full access: manage team members, billing, and revoke all keys.
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
              <span className="text-xs text-[#F59E0B]/70">
                Use with caution
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE KEY MODAL */}
      {modalState === 'create' &&
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0E14] rounded-2xl border border-white/[0.12] w-full max-w-md p-6 shadow-[0_25px_80px_rgba(0,0,0,0.6)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Create API Key</h3>
              <button
              onClick={() => setModalState('none')}
              className="w-8 h-8 rounded-lg hover:bg-white/[0.08] flex items-center justify-center transition-colors">
              
                <X className="w-4 h-4 text-white/40 hover:text-white/80" />
              </button>
            </div>

            {/* Key Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Key Name
              </label>
              <input
              type="text"
              placeholder="e.g., Production API Key"
              className="w-full h-10 bg-[#070A0F] border border-white/[0.12] rounded-xl px-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50" />
            
              <p className="text-xs text-white/30 mt-1.5">
                Choose a descriptive name — you cannot rename keys later.
              </p>
            </div>

            {/* Expiration */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Expiration
              </label>
              <div className="flex bg-[#070A0F] rounded-xl p-1 border border-white/[0.08]">
                {['30 days', '90 days', '1 year', 'No expiry'].map((opt) =>
              <button
                key={opt}
                onClick={() => setSelectedExpiry(opt)}
                className={`flex-1 py-1.5 text-center text-sm rounded-lg transition-colors ${selectedExpiry === opt ? 'bg-[#0D1117] text-white font-medium shadow-sm border border-white/[0.12]' : 'text-white/40 hover:text-white/60'}`}>
                
                    {opt}
                  </button>
              )}
              </div>
            </div>

            {/* Scopes */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Scopes
              </label>
              {[
            {
              id: 'read',
              label: 'read',
              desc: 'Access agents and usage data'
            },
            {
              id: 'write',
              label: 'write',
              desc: 'Create agents and trigger runs'
            },
            {
              id: 'admin',
              label: 'admin',
              desc: 'Full platform access — use carefully'
            }].
            map((scope) =>
            <button
              key={scope.id}
              onClick={() => toggleScope(scope.id)}
              className="flex items-start gap-3 py-2 w-full text-left">
              
                  <div
                className={`w-4 h-4 rounded-md mt-0.5 shrink-0 flex items-center justify-center transition-colors ${checkedScopes[scope.id] ? 'bg-[#7C3AED] border border-[#7C3AED]' : 'bg-[#070A0F] border border-white/20'}`}>
                
                    {checkedScopes[scope.id] &&
                <Check className="w-2.5 h-2.5 text-white" />
                }
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {scope.label}
                    </div>
                    <div className="text-xs text-white/40">{scope.desc}</div>
                  </div>
                </button>
            )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-white/[0.06] flex gap-3">
              <button
              onClick={() => setModalState('none')}
              className="flex-1 h-10 rounded-xl border border-white/[0.12] text-sm font-medium text-white/70 hover:bg-white/[0.06] transition-colors">
              
                Cancel
              </button>
              <button
              onClick={() => setModalState('reveal')}
              className="flex-1 h-10 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-colors">
              
                Create Key
              </button>
            </div>
          </div>
        </div>
      }

      {/* SHOW-ONCE REVEAL MODAL */}
      {modalState === 'reveal' &&
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0E14] rounded-2xl border border-white/[0.12] w-full max-w-md p-6 shadow-[0_25px_80px_rgba(0,0,0,0.6)]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#10B981]/15 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-[#10B981]" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Save your API key now
              </h3>
            </div>
            <p className="text-[13px] text-white/55 mt-1 mb-6">
              This key will never be shown again. Copy it to a safe place.
            </p>

            {/* Key Display */}
            <div className="bg-[#070A0F] rounded-xl border border-[#10B981]/20 p-4">
              <div className="font-mono text-[13px] text-[#10B981] break-all tracking-wide leading-relaxed">
                cck_live_a8f2b3c9d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
              </div>
              <button className="mt-3 w-full h-9 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                <Copy className="w-3.5 h-3.5 text-white/60" />
                <span className="text-sm text-white/70">Copy to clipboard</span>
              </button>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 mt-4">
              <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] mt-0.5 shrink-0" />
              <p className="text-xs text-[#F59E0B]/70 leading-relaxed">
                We do not store the full key. If you lose it, you will need to
                revoke this key and create a new one.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <button
              onClick={() => setModalState('none')}
              className="h-10 w-full rounded-xl bg-[#0D1117] border border-white/[0.12] text-sm font-medium text-white/70 hover:bg-white/[0.06] transition-colors">
              
                I've saved my key
              </button>
            </div>
          </div>
        </div>
      }
    </>);

}