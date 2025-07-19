import DashboardSkeleton from "@/app/ui/skeletons";
/*
Since loading.tsx is a level higher than /invoices/page.tsx and /customers/page.tsx in the file system, it's also applied to those pages.

We can change this with Route Groups. Create a new folder called /(overview) inside the dashboard folder. Then, move your loading.tsx and page.tsx files inside the folder:



*/
export default function Loading() {
  return <DashboardSkeleton />;
}
