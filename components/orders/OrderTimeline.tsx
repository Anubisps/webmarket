import { buildOrderTimeline } from '@/lib/orderTimeline'
import { CheckCircle, Circle, Clock, XCircle } from 'lucide-react'

type Props = {
  order: {
    createdAt: Date
    paymentStatus: string
    status: string
    fulfillmentStatus: string
    fulfilledAt: Date | null
    refundTotal: number
  }
}

export function OrderTimeline({ order }: Props) {
  const steps = buildOrderTimeline(order)

  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <div key={step.key} className="flex gap-3">
          <div className="flex flex-col items-center">
            {step.status === 'done' ? (
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            ) : step.status === 'current' ? (
              <Clock className="h-5 w-5 text-amber-400" />
            ) : step.status === 'skipped' ? (
              <XCircle className="h-5 w-5 text-gray-600" />
            ) : (
              <Circle className="h-5 w-5 text-gray-600" />
            )}
            {i < steps.length - 1 && <div className="mt-1 h-full min-h-[24px] w-px bg-white/10" />}
          </div>
          <div className="pb-4">
            <p className={`font-medium ${step.status === 'pending' || step.status === 'skipped' ? 'text-gray-500' : 'text-white'}`}>
              {step.label}
            </p>
            {step.description && <p className="text-xs text-gray-500">{step.description}</p>}
            {step.at && (
              <p className="text-xs text-gray-600 mt-0.5">{new Date(step.at).toLocaleString()}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
