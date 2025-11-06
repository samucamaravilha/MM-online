'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { showToast } from '@/components/Toaster';
import styles from '@/styles/auth.module.css';

export default function LoginPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showToast({ title: 'Erro ao entrar', description: error.message, tone: 'error' });
    } else {
      showToast({ title: 'Bem-vindo de volta!', tone: 'success' });
      router.push('/dashboard');
    }

    setLoading(false);
  }

  async function handleMagicLink() {
    if (!email) {
      showToast({ title: 'Informe um email válido', tone: 'info' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      showToast({ title: 'Não foi possível enviar o link', description: error.message, tone: 'error' });
    } else {
      showToast({
        title: 'Verifique seu email',
        description: 'Enviamos um link seguro para acessar sua conta.',
        tone: 'success'
      });
    }
    setLoading(false);
  }

  async function handleSignUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      showToast({ title: 'Não foi possível criar a conta', description: error.message, tone: 'error' });
    } else {
      showToast({
        title: 'Conta criada com sucesso',
        description: 'Enviamos um email de confirmação para você.',
        tone: 'success'
      });
    }

    setLoading(false);
  }

  return (
    <main className={styles.wrapper}>
      <div className={styles.panel}>
        <div className={styles.branding}>
          <Link href="/" className={styles.logo}>
            MovieMagic<span>Online</span>
          </Link>
          <h1>Entre na sua conta</h1>
          <p>Planeje a próxima produção com uma interface moderna e colaborativa.</p>
        </div>

        <form className={styles.form} onSubmit={handleEmailSignIn}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@estudio.com"
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          <button type="submit" disabled={loading} className={styles.primaryButton}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className={styles.actions}>
          <button type="button" onClick={handleMagicLink} disabled={loading}>
            Receber link mágico
          </button>
          <button type="button" onClick={handleSignUp} disabled={loading}>
            Criar conta
          </button>
        </div>
      </div>
    </main>
  );
}
