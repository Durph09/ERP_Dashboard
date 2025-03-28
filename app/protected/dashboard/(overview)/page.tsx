import CardWrapper from '@/components/ui/dashboard/cards';
import RevenueChart from '@/components/ui/dashboard/revenue-chart';
import LatestInvoices from '@/components/ui/dashboard/latest-invoices';
import { lusitana } from '@/components/ui/fonts';
import { fetchCardData } from '@/lib/data';
import { Suspense } from 'react';
import { LatestInvoicesSkeleton, RevenueChartSkeleton, CardsSkeleton } from '@/components/skeletons';


export default async function Page() {
  //const supabase = createClient()

  // const { data, error } = await supabase.auth.getUser()
  // console.log('data from layout getUser: ',data)
  // if (error || !data?.user) {
  //   redirect('/')
  // }

  //const { totalPaidInvoices, totalPendingInvoices, numberOfInvoices, numberOfCustomers } = await fetchCardData();
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>


      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
       {/*  <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>*/}
      </div> 
    </main>
  );
}