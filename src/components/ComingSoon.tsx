export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-200 shadow-2xl shadow-cyan-900/20">
      <span className="rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-cyan-200">In development</span>
      <h2 className="text-3xl font-semibold text-white">{title}</h2>
      <p className="max-w-md text-sm text-slate-300">{description}</p>
      <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Stay tuned</p>
    </div>
  );
}

