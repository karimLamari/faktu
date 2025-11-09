'use client';

import { useEffect, useState } from 'react';
import { SubscriptionPlan } from '@/types/subscription';

interface UsageData {
  plan: SubscriptionPlan;
  usage: {
    invoices: { current: number; limit: number | 'unlimited' };
    quotes: { current: number; limit: number | 'unlimited' };
    expenses: { current: number; limit: number | 'unlimited' };
    clients: { current: number; limit: number | 'unlimited' };
  };
  subscription: {
    status: string;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd: boolean;
    trialEndsAt?: Date;
  };
}

export function useSubscription() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription/usage');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription data');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { 
    data, 
    loading, 
    error,
    refetch: fetchData 
  };
}
