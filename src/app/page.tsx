import Link from 'next/link';
import styles from '@/styles/landing.module.css';

export default function LandingPage() {
  return (
    <main className={styles.hero}>
      <header className={styles.header}>
        <div className={styles.logo}>MovieMagic<span>Online</span></div>
        <nav className={styles.nav}>
          <Link href="#recursos">Recursos</Link>
          <Link href="#colaboracao">Colaboração</Link>
          <Link href="/login" className={styles.navCta}>
            Entrar
          </Link>
        </nav>
      </header>

      <section className={styles.banner}>
        <div className={styles.bannerContent}>
          <h1>Planejamento cinematográfico reinventado para a web.</h1>
          <p>
            Crie cronogramas, distribua tarefas, acompanhe a pré-produção e compartilhe tudo com a
            equipe em tempo real. Uma experiência moderna, rápida e colaborativa — sem precisar
            instalar nada.
          </p>
          <div className={styles.actions}>
            <Link href="/login" className={styles.primaryAction}>
              Começar agora
            </Link>
            <Link href="#recursos" className={styles.secondaryAction}>
              Ver recursos
            </Link>
          </div>
        </div>
        <div className={styles.previewCard}>
          <div className={styles.previewHeader}>
            <span className={styles.status}>Projetos em andamento</span>
            <strong>Nova Série Sci-Fi</strong>
            <p>Resumo das próximas filmagens e status da equipe.</p>
          </div>
          <ul className={styles.previewList}>
            <li>
              <span>Roteiro</span>
              <strong>Versão 3 aprovada</strong>
            </li>
            <li>
              <span>Filmagem</span>
              <strong>Início em 14 de julho</strong>
            </li>
            <li>
              <span>Equipe</span>
              <strong>12 colaboradores ativos</strong>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.features} id="recursos">
        <article>
          <h2>Automação inteligente</h2>
          <p>Salvamento automático de cenas, cronogramas e planilhas diretamente na nuvem.</p>
        </article>
        <article>
          <h2>Dashboard unificado</h2>
          <p>Visualize milestones, status de departamentos e próximos passos em um único lugar.</p>
        </article>
        <article id="colaboracao">
          <h2>Colaboração segura</h2>
          <p>Compartilhe projetos com permissões de visualização ou edição via link ou convite por email.</p>
        </article>
      </section>
    </main>
  );
}
