'use client';

import { FC, FormEventHandler } from 'react';
import { getUserSubscriptionPlan } from '@/helpers/get-user-subscription-plan';
import { useToast } from '@/components/ui/use-toast';
import { trpc } from '@/app/_trpc/client';
import { MaxWidthWrapper } from '@/components';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface BillingFormProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}

export const BillingForm: FC<BillingFormProps> = ({ subscriptionPlan }) => {
  const { toast } = useToast();

  const { mutate: createStripeSession, isPending } =
    trpc.createStripeSession.useMutation({
      onSuccess: ({ url }) => {
        if (url) {
          window.location.href = url;
        } else {
          toast({
            title: 'There was a problem...',
            description: 'Please try again in a moment',
            variant: 'destructive',
          });
        }
      },
    });

  const onSubmitForm: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    createStripeSession();
  };

  return (
    <MaxWidthWrapper className="max-w-5xl">
      <form className="mt-12" onSubmit={onSubmitForm}>
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              You are currently on the <strong>{subscriptionPlan.name}</strong>{' '}
              plan.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col items-center space-y-2 md:flex-row md:justify-between md:space-x-0">
            <Button type="submit">
              {isPending ? (
                <Loader2 className=" mr-4 w-4 h-4 animate-spin" />
              ) : null}
              {subscriptionPlan.isSubscribed
                ? 'Manage Subscription'
                : 'Upgrade to Pro'}
            </Button>

            {subscriptionPlan.isSubscribed ? (
              <p className="rounded-full text-xs font-medium">
                {subscriptionPlan.isCanceled
                  ? 'Your plan will be canceled on '
                  : 'Your plan renews on '}
                {format(subscriptionPlan.stripeCurrentPeriodEnd!, 'dd.MM.yyyy')}
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </MaxWidthWrapper>
  );
};
