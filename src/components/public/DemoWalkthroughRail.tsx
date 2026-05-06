import { cn } from '@/lib/utils'

type WalkthroughStep = {
  label: string
  subtitle: string
}

type DemoWalkthroughRailProps = {
  eyebrow: string
  title: string
  summary: string
  steps: WalkthroughStep[]
  activeStep?: number
  layout?: 'stack' | 'grid'
  className?: string
}

export default function DemoWalkthroughRail({
  eyebrow,
  title,
  summary,
  steps,
  activeStep = 0,
  layout = 'stack',
  className,
}: DemoWalkthroughRailProps) {
  return (
    <section className={cn('rounded-[2rem] border border-[#CBFBF1] bg-white p-5 shadow-sm', className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#00C4B4]">{eyebrow}</p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{summary}</p>

      <div className={cn('mt-4', layout === 'grid' ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-4' : 'space-y-3')}>
        {steps.map((step, index) => {
          const active = index === activeStep

          return (
            <div
              key={step.label}
              className={cn(
                'rounded-2xl border px-4 py-3 transition-all',
                active
                  ? 'border-[#0A2540] bg-[linear-gradient(135deg,#0A2540_0%,#0D3A5C_65%,#0E5060_100%)] text-white shadow-[0_18px_36px_-18px_rgba(10,37,64,.45)]'
                  : 'border-slate-900/10 bg-[#F9FAFB] text-slate-700',
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    active ? 'bg-white/15 text-white' : 'bg-[#F0FDFA] text-[#0E5060]',
                  )}
                >
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className={cn('text-sm font-semibold', active ? 'text-white' : 'text-slate-950')}>{step.label}</p>
                  <p className={cn('mt-1 text-sm leading-6', active ? 'text-white/75' : 'text-slate-600')}>
                    {step.subtitle}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
