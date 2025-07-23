import { fetchFilteredCustomers } from '@/app/lib/data';
import CustomersTable from '@/app/ui/customers/table';
import { Metadata } from 'next';
import { Suspense } from 'react';
export const metadata: Metadata = {
  title: 'Customers',
};

export default async function Page(props: {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query as string;
  const currentPage = Number(searchParams?.page) || 1;
  // pagination

  const totalCustomers = await fetchFilteredCustomers(query);

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <CustomersTable customers={totalCustomers} />
      </Suspense>
    </>
  );
}
