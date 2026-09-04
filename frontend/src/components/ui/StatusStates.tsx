export function PageSpinner({ label }: { label: string }) { return <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 py-20"><div className="w-10 h-10 border-2 border-[#3B6FE0] border-t-transparent rounded-full animate-spin" /><p className="text-[#6B7A99] text-sm">{label}</p></div>; }
export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) { return <div className="max-w-lg mx-auto text-center py-16 px-4"><div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><span className="text-red-500 text-2xl">!</span></div><p className="text-[#1A2540] font-medium mb-1">Xəta baş verdi</p><p className="text-[#6B7A99] text-sm mb-5">{message}</p>{onRetry && <button onClick={onRetry} className="px-5 py-2.5 rounded-xl bg-[#3B6FE0] text-white text-sm font-semibold hover:opacity-90">Yenidən cəhd et</button>}</div>; }

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-full bg-[#EEF3FD] flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-[#6B7A99]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
      <p className="text-[#1A2540] font-medium mb-1">{title}</p>
      {description && <p className="text-[#6B7A99] text-sm max-w-sm mx-auto">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="mt-5 px-5 py-2.5 rounded-xl bg-[#3B6FE0] text-white text-sm font-semibold hover:opacity-90">
          {action.label}
        </button>
      )}
    </div>
  );
}
