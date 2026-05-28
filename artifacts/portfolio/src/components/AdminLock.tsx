import { useState } from "react";
import { Lock, LockOpen, X, Eye } from "lucide-react";
import { useAdminMode } from "@/hooks/use-admin-mode";

export function AdminLock() {
  const { isAdmin, unlock, lock } = useAdminMode();
  const [showDialog, setShowDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [clicks, setClicks] = useState(0);

  const handleIconClick = () => {
    if (isAdmin) {
      lock();
      return;
    }
    const next = clicks + 1;
    setClicks(next);
    if (next >= 3) {
      setShowDialog(true);
      setClicks(0);
    }
  };

  const handleUnlock = () => {
    if (unlock(password)) {
      setShowDialog(false);
      setPassword("");
      setError("");
    } else {
      setError("Incorrect password.");
    }
  };

  return (
    <>
      <button
        onClick={handleIconClick}
        title={isAdmin ? "Admin mode active — click to lock" : "Click 3× to enter admin mode"}
        className={`fixed bottom-6 left-6 z-50 w-9 h-9 flex items-center justify-center transition-all duration-300 ${
          isAdmin
            ? "bg-white text-black opacity-80 hover:opacity-100"
            : "bg-transparent text-gray-700 hover:text-gray-400 opacity-40 hover:opacity-70"
        }`}
      >
        {isAdmin ? <LockOpen size={15} /> : <Lock size={14} />}
      </button>

      {isAdmin && (
        <div className="fixed bottom-6 left-16 z-50 flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5">
          <Eye size={11} className="text-white" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white">Admin Mode</span>
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-white/10 p-8 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs uppercase tracking-[0.4em] font-bold text-white">Admin Access</p>
              <button onClick={() => { setShowDialog(false); setPassword(""); setError(""); }}>
                <X size={16} className="text-gray-500 hover:text-white transition-colors" />
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              placeholder="Enter admin password"
              autoFocus
              className="w-full bg-black border border-white/20 text-white px-4 py-3 text-sm font-mono mb-2 outline-none focus:border-white/50 transition-colors placeholder:text-gray-600"
            />
            {error && <p className="text-red-400 text-xs mb-4">{error}</p>}
            <button
              onClick={handleUnlock}
              className="w-full bg-white text-black py-3 text-xs uppercase tracking-[0.2em] font-bold hover:bg-gray-200 transition-colors mt-3"
            >
              Unlock
            </button>
          </div>
        </div>
      )}
    </>
  );
}
