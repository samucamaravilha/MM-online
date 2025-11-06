import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getServiceClient } from '@/lib/supabaseService';
import styles from '@/styles/dashboard.module.css';

async function createProject(formData: FormData) {
  'use server';

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado.');
  }

  const service = getServiceClient();
  const { error } = await service.from('projects').insert({
    owner_id: user.id,
    title: (formData.get('title') as string) || 'Novo projeto',
    description: formData.get('description') as string,
    schedule: {
      scenes: [],
      milestones: [],
      departments: []
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard');
}

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false });

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h1>Olá, {user.email}</h1>
          <p>Mantenha toda a pré-produção sincronizada em um dashboard elegante.</p>
        </div>
        <form action={createProject} className={styles.quickCreate}>
          <input type="text" name="title" placeholder="Título do projeto" />
          <input type="text" name="description" placeholder="Descrição" />
          <button type="submit">Criar projeto</button>
        </form>
      </header>

      <section className={styles.projects}>
        <h2>Seus projetos</h2>
        <div className={styles.grid}>
          {projects?.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className={styles.card}>
              <span className={styles.cardBadge}>{project.share_role ? 'Compartilhado' : 'Privado'}</span>
              <h3>{project.title}</h3>
              <p>{project.description ?? 'Organize cenas, locações e logística sem complicações.'}</p>
              <div className={styles.cardFooter}>
                <span>Atualizado em {new Date(project.updated_at).toLocaleDateString('pt-BR')}</span>
                <span>↗</span>
              </div>
            </Link>
          ))}
          <div className={styles.skeleton}>Pronto para o próximo blockbuster.</div>
        </div>
      </section>
    </div>
  );
}
