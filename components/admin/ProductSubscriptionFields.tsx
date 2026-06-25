'use client'

type Props = {
  enabled: boolean
  billingType: string
  customDays: string
  onEnabledChange: (v: boolean) => void
  onBillingTypeChange: (v: string) => void
  onCustomDaysChange: (v: string) => void
}

export function ProductSubscriptionFields({
  enabled,
  billingType,
  customDays,
  onEnabledChange,
  onBillingTypeChange,
  onCustomDaysChange,
}: Props) {
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
      <h3 className="font-bold text-emerald-300">Recurring manual payments</h3>
      <p className="text-xs text-gray-500">
        When enabled, customers who pay for this product get a subscription and must renew manually each billing cycle.
      </p>
      <label className="flex items-center gap-2 text-sm text-gray-300">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => onEnabledChange(e.target.checked)}
          className="accent-emerald-500"
        />
        Enable recurring billing for this product
      </label>
      {enabled && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Billing cycle</label>
            <select
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white"
              value={billingType}
              onChange={e => onBillingTypeChange(e.target.value)}
            >
              <option value="monthly">Monthly (every 30 days)</option>
              <option value="weekly">Weekly (every 7 days)</option>
              <option value="biweekly">Bi-weekly (every 14 days)</option>
              <option value="custom">Custom interval</option>
            </select>
          </div>
          {billingType === 'custom' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Custom interval (days)</label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white"
                value={customDays}
                onChange={e => onCustomDaysChange(e.target.value)}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
