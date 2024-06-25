import { BillingForm } from '@/components';
import { getUserSubscriptionPlan } from '@/helpers/get-user-subscription-plan';

const BillingPage = async () => {
  const subscriptionPlan = await getUserSubscriptionPlan();

  return <BillingForm subscriptionPlan={subscriptionPlan}></BillingForm>;
};

export default BillingPage;
