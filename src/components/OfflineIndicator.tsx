import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getPendingSyncCount } from '../lib/offlineIndexedDB';

export const OfflineIndicator: React.FC<{ onTriggerSync?: () => void }> = ({ onTriggerSync }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshPendingCount = async () => {
    try {
      const count = await getPendingSyncCount();
      setPendingCount(count);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      refreshPendingCount();
    };
    const handleOffline = () => {
      setIsOnline(false);
      refreshPendingCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    if (onTriggerSync) {
      await onTriggerSync();
    }
    await refreshPendingCount();
    setTimeout(() => setIsSyncing(false), 800);
  };

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs"
          title="متصل بالإنترنت وقاعدة البيانات السحابية"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">أونلاين</span>
          
          {pendingCount > 0 && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="mr-1 flex items-center gap-1 px-1.5 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] hover:bg-emerald-700 transition cursor-pointer"
              title="يوجد عمليات بانتظار المزامنة، انقر للمزامنة فوراً"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>مزامنة ({pendingCount})</span>
            </button>
          )}
        </div>
      ) : (
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500 text-white shadow-xs animate-pulse"
          title="أنت تعمل حالياً بدون اتصال إنترنت (أوفلاين)، العمليات تحفظ بأمان محلياً في IndexedDB"
        >
          <WifiOff className="w-3.5 h-3.5 text-white" />
          <span>أوفلاين (IndexedDB)</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-700/60 rounded-md text-[10px]">
              {pendingCount} معلقة
            </span>
          )}
        </div>
      )}
    </div>
  );
};
