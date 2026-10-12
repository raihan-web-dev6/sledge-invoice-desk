
import type { LucideIcon } from "lucide-react";

interface SummaryCard {
  label: string;
  value: string | number;
  note: string;
  icon: LucideIcon;
  iconClass: string;
}

interface SummaryCardsProps {
  cards: SummaryCard[];
}

export default function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
                  {card.value}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}
              >
                <Icon size={21} strokeWidth={1.8} />
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              {card.note}
            </p>
          </article>
        );
      })}
    </div>
  );
}
