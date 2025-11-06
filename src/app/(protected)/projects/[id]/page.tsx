import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { isProjectSchedule, type ProjectSchedule } from '@/types/project';
import { ProjectScheduleEditor } from './components/ProjectScheduleEditor';
import { ProjectSharingPanel } from './components/ProjectSharingPanel';
import styles from '@/styles/project.module.css';

const DEFAULT_SCHEDULE: ProjectSchedule = {
  scenes: [],
  milestones: [],
  departments: []
};

export default async function ProjectPage({
  params
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (error || !project) {
    notFound();
  }

  const { data: collaborator } = await supabase
    .from('project_collaborators')
    .select('*')
    .eq('project_id', project.id)
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: collaborators } = await supabase
    .from('project_collaborators')
    .select('*')
    .eq('project_id', project.id);

  const { data: invites } = await supabase
    .from('project_invites')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false });

  const canEdit = project.owner_id === user.id || collaborator?.role === 'editor';
  const schedule = isProjectSchedule(project.schedule) ? project.schedule : DEFAULT_SCHEDULE;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <div className={styles.wrapper}>
      <section className={styles.header}>
        <div className={styles.meta}>
          <h1>{project.title}</h1>
          <p>{project.description ?? 'Comece adicionando detalhes da produção e o cronograma.'}</p>
          <div className={styles.tags}>
            <span className={styles.tag}>{canEdit ? 'Edição liberada' : 'Somente leitura'}</span>
            {project.share_token ? <span className={styles.tag}>Link público ativo</span> : null}
          </div>
        </div>
      </section>

      <ProjectScheduleEditor projectId={project.id} canEdit={canEdit} initialSchedule={schedule} />

      <ProjectSharingPanel
        projectId={project.id}
        shareToken={project.share_token}
        shareRole={project.share_role}
        canEdit={canEdit}
        isOwner={project.owner_id === user.id}
        collaborators={collaborators ?? []}
        invites={invites ?? []}
        appUrl={appUrl}
      />
    </div>
  );
}
