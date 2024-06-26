import { BillingForm } from '@/components';
import { getUserSubscriptionPlan } from '@/helpers/get-user-subscription-plan';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';

const BillingPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect('/auth-callback?origin=/dashboard/billing');

  const subscriptionPlan = await getUserSubscriptionPlan(user);

  return <BillingForm subscriptionPlan={subscriptionPlan} />;
};

export default BillingPage;
