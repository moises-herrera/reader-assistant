import { redirect } from 'next/navigation';
import { BillingForm } from '@/components/billing/BillingForm';
import { getUserSubscriptionPlan } from '@/helpers/get-user-subscription-plan';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

const BillingPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect('/auth-callback?origin=/dashboard/billing');

  const subscriptionPlan = await getUserSubscriptionPlan(user);

  return <BillingForm subscriptionPlan={subscriptionPlan} />;
};

export default BillingPage;
