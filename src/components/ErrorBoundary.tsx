import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearCacheAndReset = () => {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
      }
      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
    } catch (e) {
      console.warn('Cache clear error:', e);
    }
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 font-sans" dir="rtl">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30 shadow-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">حدث خطأ أثناء تحميل الواجهة</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                نعتذر عن هذا العطل المؤقت. يمكنك تحديث الصفحة أو مسح الذاكرة المؤقتة لمتابعة العمل بنظام قيد فوراً.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-700/60 text-[11px] text-rose-300 font-mono text-left max-h-36 overflow-y-auto leading-normal">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                onClick={this.handleClearCacheAndReset}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer"
                title="مسح الكاش المؤقت وإعادة التحميل"
              >
                <Trash2 className="w-4 h-4 text-slate-400" />
                <span>مسح الكاش المؤقت</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
