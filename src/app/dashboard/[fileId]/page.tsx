import { ChatWrapper } from '@/components/chat/ChatWrapper';
import { PdfRenderer } from '@/components/pdf-renderer/PdfRenderer';
import { db } from '@/db';
import { getUserSubscriptionPlan } from '@/helpers/get-user-subscription-plan';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { notFound, redirect } from 'next/navigation';

interface PageProps {
  params: {
    fileId: string;
  };
}

const FilePage = async ({ params: { fileId } }: PageProps) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileId}`);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId: user.id,
    },
  });

  if (!file) notFound();

  const subscriptionPlan = await getUserSubscriptionPlan(user);

  return (
    <section className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* Left side */}
        <section className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <PdfRenderer url={file.url} />
          </div>
        </section>

        <section className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <ChatWrapper fileId={file.id} subscriptionPlan={subscriptionPlan} />
        </section>
      </div>
    </section>
  );
};

export default FilePage;
