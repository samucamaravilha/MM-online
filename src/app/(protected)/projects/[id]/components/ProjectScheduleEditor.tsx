'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { showToast } from '@/components/Toaster';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import type {
  ProjectSchedule,
  ScheduleDepartment,
  ScheduleMilestone,
  ScheduleScene
} from '@/types/project';
import styles from '@/styles/project-editor.module.css';

type Props = {
  projectId: string;
  canEdit: boolean;
  initialSchedule: ProjectSchedule;
};

export function ProjectScheduleEditor({ projectId, canEdit, initialSchedule }: Props) {
  const supabase = useSupabaseClient();
  const [schedule, setSchedule] = useState<ProjectSchedule>(initialSchedule);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const statusOptions = useMemo(
    () => [
      { value: 'planejado' as const, label: 'Planejado' },
      { value: 'em_andamento' as const, label: 'Em andamento' },
      { value: 'concluido' as const, label: 'Concluído' }
    ],
    []
  );

  useEffect(() => {
    setSchedule(initialSchedule);
  }, [initialSchedule]);

  const debouncedPersist = useDebouncedCallback(async (snapshot: ProjectSchedule) => {
    if (!canEdit) return;
    setSaving(true);

    const { error } = await supabase
      .from('projects')
      .update({ schedule: snapshot })
      .eq('id', projectId);

    if (error) {
      showToast({ title: 'Falha ao salvar', description: error.message, tone: 'error' });
    } else {
      setLastSavedAt(new Date());
    }

    setSaving(false);
  }, 800);

  useEffect(() => {
    if (!canEdit) return;
    debouncedPersist(schedule);
  }, [schedule, canEdit, debouncedPersist]);

  const nextSceneTemplate = useMemo<ScheduleScene>(
    () => ({
      id: crypto.randomUUID(),
      scene: '',
      location: '',
      shootDate: new Date().toISOString().slice(0, 10),
      department: ''
    }),
    []
  );

  const nextDepartmentTemplate = useMemo<ScheduleDepartment>(
    () => ({
      id: crypto.randomUUID(),
      name: '',
      lead: '',
      status: 'planejado'
    }),
    []
  );

  function updateScene(id: string, field: keyof ScheduleScene, value: string) {
    setSchedule((current) => ({
      ...current,
      scenes: current.scenes.map((scene) => (scene.id === id ? { ...scene, [field]: value } : scene))
    }));
  }

  function addScene() {
    setSchedule((current) => ({
      ...current,
      scenes: [
        ...current.scenes,
        {
          ...nextSceneTemplate,
          id: crypto.randomUUID()
        }
      ]
    }));
  }

  function removeScene(id: string) {
    setSchedule((current) => ({
      ...current,
      scenes: current.scenes.filter((scene) => scene.id !== id)
    }));
  }

  function updateMilestone(id: string, field: keyof ScheduleMilestone, value: string) {
    setSchedule((current) => ({
      ...current,
      milestones: current.milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    }));
  }

  function addMilestone() {
    setSchedule((current) => ({
      ...current,
      milestones: [
        ...current.milestones,
        {
          id: crypto.randomUUID(),
          title: 'Novo marco',
          dueDate: new Date().toISOString().slice(0, 10),
          status: 'planejado',
          owner: ''
        }
      ]
    }));
  }

  function removeMilestone(id: string) {
    setSchedule((current) => ({
      ...current,
      milestones: current.milestones.filter((milestone) => milestone.id !== id)
    }));
  }

  function updateDepartment(id: string, field: keyof ScheduleDepartment, value: string) {
    setSchedule((current) => ({
      ...current,
      departments: current.departments.map((department) =>
        department.id === id ? { ...department, [field]: value } : department
      )
    }));
  }

  function addDepartment() {
    setSchedule((current) => ({
      ...current,
      departments: [
        ...current.departments,
        {
          ...nextDepartmentTemplate,
          id: crypto.randomUUID()
        }
      ]
    }));
  }

  function removeDepartment(id: string) {
    setSchedule((current) => ({
      ...current,
      departments: current.departments.filter((department) => department.id !== id)
    }));
  }

  const statusLabel = saving
    ? 'Salvando alterações...'
    : lastSavedAt
      ? `Última atualização ${lastSavedAt.toLocaleTimeString('pt-BR')}`
      : 'Salvo automaticamente';

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h2>Plano de filmagem</h2>
          <p>Gerencie cenas, datas e marcos importantes da produção.</p>
        </div>
        <span className={styles.status}>{statusLabel}</span>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <header>
            <h3>Cenas</h3>
            {canEdit ? (
              <button type="button" onClick={addScene}>
                Adicionar cena
              </button>
            ) : null}
          </header>
          <div className={styles.list}>
            {schedule.scenes.map((scene) => (
              <div key={scene.id} className={styles.row}>
                <input
                  disabled={!canEdit}
                  value={scene.scene}
                  onChange={(event) => updateScene(scene.id, 'scene', event.target.value)}
                  placeholder="Cena 12 - Laboratório"
                />
                <input
                  disabled={!canEdit}
                  value={scene.location}
                  onChange={(event) => updateScene(scene.id, 'location', event.target.value)}
                  placeholder="Locação"
                />
                <input
                  disabled={!canEdit}
                  value={scene.department ?? ''}
                  onChange={(event) => updateScene(scene.id, 'department', event.target.value)}
                  placeholder="Departamento"
                />
                <input
                  disabled={!canEdit}
                  type="date"
                  value={scene.shootDate}
                  onChange={(event) => updateScene(scene.id, 'shootDate', event.target.value)}
                />
                {canEdit ? (
                  <button type="button" onClick={() => removeScene(scene.id)} className={styles.remove}>
                    ×
                  </button>
                ) : null}
              </div>
            ))}
            {schedule.scenes.length === 0 ? (
              <p className={styles.empty}>Nenhuma cena cadastrada ainda.</p>
            ) : null}
          </div>
        </div>

        <div className={styles.card}>
          <header>
            <h3>Marcos</h3>
            {canEdit ? (
              <button type="button" onClick={addMilestone}>
                Adicionar marco
              </button>
            ) : null}
          </header>
          <div className={styles.list}>
            {schedule.milestones.map((milestone) => (
              <div key={milestone.id} className={styles.row}>
                <input
                  disabled={!canEdit}
                  value={milestone.title}
                  onChange={(event) => updateMilestone(milestone.id, 'title', event.target.value)}
                  placeholder="Pré-produção"
                />
                <input
                  disabled={!canEdit}
                  type="date"
                  value={milestone.dueDate}
                  onChange={(event) => updateMilestone(milestone.id, 'dueDate', event.target.value)}
                />
                <input
                  disabled={!canEdit}
                  value={milestone.owner ?? ''}
                  onChange={(event) => updateMilestone(milestone.id, 'owner', event.target.value)}
                  placeholder="Responsável"
                />
                <select
                  disabled={!canEdit}
                  value={milestone.status ?? 'planejado'}
                  onChange={(event) =>
                    updateMilestone(
                      milestone.id,
                      'status',
                      event.target.value as ScheduleMilestone['status']
                    )
                  }
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {canEdit ? (
                  <button type="button" onClick={() => removeMilestone(milestone.id)} className={styles.remove}>
                    ×
                  </button>
                ) : null}
              </div>
            ))}
            {schedule.milestones.length === 0 ? (
              <p className={styles.empty}>Adicione os marcos principais para acompanhar o progresso.</p>
            ) : null}
          </div>
        </div>

        <div className={styles.card}>
          <header>
            <h3>Departamentos</h3>
            {canEdit ? (
              <button type="button" onClick={addDepartment}>
                Adicionar departamento
              </button>
            ) : null}
          </header>
          <div className={styles.list}>
            {schedule.departments.map((department) => (
              <div key={department.id} className={styles.row}>
                <input
                  disabled={!canEdit}
                  value={department.name}
                  onChange={(event) => updateDepartment(department.id, 'name', event.target.value)}
                  placeholder="Departamento de arte"
                />
                <input
                  disabled={!canEdit}
                  value={department.lead ?? ''}
                  onChange={(event) => updateDepartment(department.id, 'lead', event.target.value)}
                  placeholder="Responsável"
                />
                <select
                  disabled={!canEdit}
                  value={department.status ?? 'planejado'}
                  onChange={(event) =>
                    updateDepartment(
                      department.id,
                      'status',
                      event.target.value as ScheduleDepartment['status']
                    )
                  }
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => removeDepartment(department.id)}
                    className={styles.remove}
                  >
                    ×
                  </button>
                ) : null}
              </div>
            ))}
            {schedule.departments.length === 0 ? (
              <p className={styles.empty}>Mapeie os departamentos e líderes da produção.</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
