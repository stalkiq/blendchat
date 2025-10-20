'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

type BillingCycle = 'monthly' | 'yearly';

const plans = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    badge: 'Beta',
    features: [
      '100 daily credits',
      'Access to Chat mode',
      'Access to Workflows',
      'Direct access to founders',
    ],
    cta: 'Get started',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 16,
    priceYearly: 160,
    badge: 'Beta',
    features: [
      '2,000 credits per month',
      'Priority support',
      'Collaborative rooms',
    ],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    priceMonthly: 160,
    priceYearly: 1600,
    badge: 'Beta',
    features: [
      '25,000 credits per month',
      'Custom integrations',
      'Increased agent iterations',
    ],
    cta: 'Go Premium',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: NaN,
    priceYearly: NaN,
    features: [
      'Enterprise support',
      'Bring your own API keys',
      'Dedicated account manager',
      'Custom contract & SLA',
    ],
    cta: 'Contact sales',
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>('yearly');
  const yearlyActive = billing === 'yearly';

  const priceFor = useMemo(() => (plan: typeof plans[number]) => {
    if (Number.isNaN(plan.priceMonthly)) return 'Custom';
    const value = yearlyActive ? plan.priceYearly : plan.priceMonthly;
    return `$${value}${!yearlyActive ? '/mo' : ''}`;
  }, [yearlyActive]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-headline font-bold tracking-tight">Pricing</h1>
            <p className="mt-2 text-muted-foreground">Choose the plan that works for your team</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border bg-card/60 p-1 shadow-sm">
              <Button
                variant={yearlyActive ? 'secondary' : 'default'}
                className="rounded-lg"
                onClick={() => setBilling('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant={yearlyActive ? 'default' : 'secondary'}
                className="rounded-lg"
                onClick={() => setBilling('yearly')}
              >
                Yearly <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs">Save 20%</span>
              </Button>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {plans.map(plan => (
              <Card
                key={plan.id}
                className={plan.highlight ? 'border-primary/40 shadow-md' : ''}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {plan.badge ? (
                      <span className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">{plan.badge}</span>
                    ) : null}
                  </CardTitle>
                  <div className="mt-2 text-3xl font-bold">
                    {priceFor(plan)}
                    {!Number.isNaN(plan.priceMonthly) && (
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        {yearlyActive ? '/yr' : ''}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-6 w-full" variant={plan.highlight ? 'default' : 'secondary'}>
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}


