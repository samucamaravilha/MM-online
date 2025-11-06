'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { showToast } from '@/components/Toaster';
import styles from '@/styles/project-sharing.module.css';

type Collaborator = {
  id: string;
  user_id: string;
  role: 'viewer' | 'editor';
};

type Invite = {
  id: string;
  email: string;
  role: 'viewer' | 'editor';
  expires_at: string;
};

type Props = {
  projectId: string;
  shareToken: string | null;
  shareRole: 'viewer' | 'editor' | null;
  canEdit: boolean;
  isOwner: boolean;
  collaborators: Collaborator[];
  invites: Invite[];
  appUrl: string;
};

export function ProjectSharingPanel({
  projectId,
  shareToken,
  shareRole,
  canEdit,
  isOwner,
  collaborators,
  invites,
  appUrl
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor'>('viewer');
  const [linkRole, setLinkRole] = useState<'viewer' | 'editor'>(shareRole ?? 'viewer');

  async function toggleShareLink(enable: boolean) {
    if (!isOwner) {
      showToast({ title: 'Você não tem permissão para alterar o link', tone: 'error' });
      return;
    }

    setPending(true);
    const response = await fetch(`/api/projects/${projectId}/share-link`, {
      method: enable ? 'POST' : 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: enable ? JSON.stringify({ role: linkRole }) : undefined
    });

    setPending(false);

    if (!response.ok) {
      const error = await response.json();
      showToast({ title: 'Não foi possível atualizar o link', description: error.error, tone: 'error' });
      return;
    }

    router.refresh();
    showToast({
      title: enable ? 'Link compartilhável ativado' : 'Link desativado',
      tone: 'success'
    });
  }

  async function sendInvite() {
    if (!inviteEmail) return;
    setPending(true);

    const response = await fetch(`/api/projects/${projectId}/invites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole })
    });

    setPending(false);

    if (!response.ok) {
      const error = await response.json();
      showToast({ title: 'Convite não enviado', description: error.error, tone: 'error' });
      return;
    }

    setInviteEmail('');
    router.refresh();
    showToast({ title: 'Convite enviado com sucesso', tone: 'success' });
  }

  async function copyToClipboard(value: string) {
    if (!navigator?.clipboard) {
      showToast({ title: 'Não foi possível copiar automaticamente', tone: 'error' });
      return;
    }

    await navigator.clipboard.writeText(value);
    showToast({ title: 'Link copiado', tone: 'success' });
  }

  const shareUrl = shareToken ? `${appUrl}/share/${shareToken}` : '';

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h2>Compartilhamento</h2>
          <p>Defina permissões e convide sua equipe.</p>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Link compartilhável</h3>
          <p className={styles.muted}>
            Gere um link seguro para compartilhar o projeto com pessoas externas.
          </p>

          <div className={styles.linkRow}>
            <select value={linkRole} onChange={(event) => setLinkRole(event.target.value as 'viewer' | 'editor')}>
              <option value="viewer">Apenas visualização</option>
              <option value="editor">Pode editar</option>
            </select>
            <button
              type="button"
              onClick={() => toggleShareLink(!shareToken)}
              disabled={pending || !isOwner}
              className={clsx(styles.primary, { [styles.disabled]: !isOwner })}
            >
              {shareToken ? 'Desativar link' : 'Gerar link'}
            </button>
          </div>

          {shareToken ? (
            <div className={styles.copyGroup}>
              <input readOnly value={shareUrl} />
              <button type="button" onClick={() => copyToClipboard(shareUrl)}>
                Copiar
              </button>
            </div>
          ) : null}
        </div>

        <div className={styles.card}>
          <h3>Convites por email</h3>
          <p className={styles.muted}>Envie convites com expiração automática em 7 dias.</p>
          <div className={styles.inviteRow}>
            <input
              type="email"
              placeholder="colega@estudio.com"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
            />
            <select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as 'viewer' | 'editor')}>
              <option value="viewer">Visualizador</option>
              <option value="editor">Editor</option>
            </select>
            <button type="button" onClick={sendInvite} disabled={pending || !canEdit} className={styles.primary}>
              Enviar convite
            </button>
          </div>
          <ul className={styles.list}>
            {invites.map((invite) => (
              <li key={invite.id}>
                <strong>{invite.email}</strong>
                <span>{invite.role === 'editor' ? 'Editor' : 'Visualizador'}</span>
                <span>Expira em {new Date(invite.expires_at).toLocaleDateString('pt-BR')}</span>
              </li>
            ))}
            {invites.length === 0 ? <li className={styles.empty}>Nenhum convite ativo.</li> : null}
          </ul>
        </div>

        <div className={styles.card}>
          <h3>Colaboradores</h3>
          <p className={styles.muted}>Pessoas com acesso direto ao projeto.</p>
          <ul className={styles.list}>
            {collaborators.map((member) => (
              <li key={member.id}>
                <strong>{member.user_id}</strong>
                <span>{member.role === 'editor' ? 'Editor' : 'Visualizador'}</span>
              </li>
            ))}
            {collaborators.length === 0 ? <li className={styles.empty}>Somente você tem acesso no momento.</li> : null}
          </ul>
        </div>
      </div>
    </section>
  );
}
