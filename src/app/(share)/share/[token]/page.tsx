import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStaticClient } from '@/lib/supabaseStatic';
import { isProjectSchedule, type ProjectSchedule } from '@/types/project';
import { ProjectScheduleEditor } from '@/app/(protected)/projects/[id]/components/ProjectScheduleEditor';
import styles from '@/styles/share.module.css';

const DEFAULT_SCHEDULE: ProjectSchedule = {
  scenes: [],
  milestones: [],
  departments: []
};

export default async function SharePage({
  params
}: {
  params: { token: string };
}) {
  const supabase = getStaticClient();
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('share_token', params.token)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const schedule = isProjectSchedule(project.schedule) ? project.schedule : DEFAULT_SCHEDULE;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h1>{project.title}</h1>
          <p>{project.description ?? 'Visualização somente leitura deste projeto.'}</p>
        </div>
        <Link href="/login" className={styles.cta}>
          Entrar para editar
        </Link>
      </header>

      <ProjectScheduleEditor projectId={project.id} canEdit={false} initialSchedule={schedule} />
    </div>
  );
}
