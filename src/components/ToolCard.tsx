import { Link } from "react-router-dom";
import type { ToolCard } from "../data/tools";

export function ToolCardItem({ card }: { card: ToolCard }) {
  return (
    <Link
      key={card.title}
      to={card.href}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20 transition hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-transparent to-purple-600/20 opacity-0 transition group-hover:opacity-100" />
      <div className="relative z-10 space-y-3">
        <span
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-cyan-100"
          dangerouslySetInnerHTML={{ __html: card.badge }}
        />
        <h3 className="text-xl font-semibold text-white">{card.title}</h3>
        <p className="text-sm text-slate-200/80">{card.description}</p>
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">{card.cta}</p>
        <div className="flex flex-wrap gap-2 pt-1 text-[10px] uppercase tracking-[0.3em] text-cyan-200/70">
          {card.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

