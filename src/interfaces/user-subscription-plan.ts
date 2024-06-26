import { Plan } from './plan';

export interface UserSubscriptionPlan extends Partial<Plan> {
  isSubscribed: boolean;
  isCanceled: boolean;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
  stripeCurrentPeriodEnd: Date | null;
}
