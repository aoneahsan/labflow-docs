import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          LabFlow Documentation
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <p className={styles.heroDescription}>
          Multi-tenant Laboratory Information Management System. Web, mobile,
          browser extension, and EMR add-on — one Firestore-backed codebase.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Read the docs
          </Link>
          <Link
            className="button button--outline button--lg"
            to="/docs/getting-started/quick-start">
            10-min Quick Start
          </Link>
          <Link
            className="button button--outline button--lg"
            href="https://labflow.aoneahsan.com">
            Open the App
          </Link>
        </div>
        <p className={styles.heroAuthor}>
          Built and maintained by{' '}
          <Link to="/docs/author">Ahsan Mahmood</Link> ·{' '}
          <Link href="https://github.com/aoneahsan/labflow-docs">
            GitHub
          </Link>{' '}
          ·{' '}
          <Link href="https://aoneahsan.com">aoneahsan.com</Link>
        </p>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="LabFlow Documentation — Multi-tenant LIMS"
      description="Complete documentation for LabFlow — a multi-tenant Laboratory Information Management System covering patients, orders, samples, results, QC, billing, inventory, and EMR integration. Built by Ahsan Mahmood.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
