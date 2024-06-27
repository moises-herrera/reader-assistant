import { Dashboard } from '@/components/dashboard/Dashboard';
import { db } from '@/db';
import { getUserSubscriptionPlan } from '@/helpers/get-user-subscription-plan';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';

const DashboardPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect('/auth-callback?origin=dashboard');

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) redirect('/auth-callback?origin=dashboard');

  const subscriptionPlan = await getUserSubscriptionPlan(user);

  return <Dashboard subscriptionPlan={subscriptionPlan} />;
};

export default DashboardPage;
