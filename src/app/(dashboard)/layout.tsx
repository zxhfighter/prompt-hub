import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { getUser } from '@/lib/auth/actions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getUser();
  
  const user = authUser ? {
    username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
  } : null;
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
