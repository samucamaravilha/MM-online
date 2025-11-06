import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import styles from '@/styles/dashboard-layout.module.css';

export default async function ProtectedLayout({
  children
}: {
  children: ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <Link href="/dashboard" className={styles.brand}>
          MovieMagic<span>Online</span>
        </Link>
        <nav className={styles.menu}>
          <Link href="/dashboard">Visão geral</Link>
          <Link href="/dashboard?tab=calendario">Calendário</Link>
          <Link href="/dashboard?tab=departamentos">Departamentos</Link>
          <Link href="/dashboard?tab=relatorios">Relatórios</Link>
        </nav>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
