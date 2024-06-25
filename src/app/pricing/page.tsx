import { MaxWidthWrapper, PlanCard } from '@/components';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PLANS } from '@/config/stripe';
import { PRICING_ITEMS } from '@/constants/pricing';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export const PricingPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <>
      <MaxWidthWrapper className="mb-8 mt-24 text-center max-w-5xl">
        <header className="mx-auto mb-10 sm:max-w-lg">
          <h1 className="text-6xl font-bold sm:text-7xl">Pricing</h1>
          <p className="mt-5 text-gray-600 sm:text-lg">
            Whether you&apos;re just trying out our service our need more,
            we&apos;ve got you covered.
          </p>
        </header>

        <div className="pt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <TooltipProvider>
            {PRICING_ITEMS.map((item) => {
              const price =
                PLANS.find(({ slug }) => slug === item.plan.toLowerCase())
                  ?.price.amount ?? 0;

              return (
                <PlanCard
                  key={item.plan}
                  {...item}
                  price={price}
                  isUserAuthenticated={!!user}
                />
              );
            })}
          </TooltipProvider>
        </div>
      </MaxWidthWrapper>
    </>
  );
};

export default PricingPage;
