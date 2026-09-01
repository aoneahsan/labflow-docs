import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
  ctaLabel: string;
  ctaTo: string;
};

/**
 * 🔴 REWRITTEN 2026-09-01 — these three cards were the front page of the docs site and
 * every one of them described the RETIRED application: Firestore reads scoped by security
 * rules, "five surfaces" including iOS, a WXT browser extension, an EMR Chrome add-on and
 * Cloud Functions. None of that is this product. The middle card also linked to
 * `/docs/modules`, a section that no longer exists — which is what failed the build.
 */
const FeatureList: FeatureItem[] = [
  {
    title: 'One laboratory cannot see another',
    description: (
      <>
        Every row belongs to a laboratory, and the database refuses a read or a
        write that crosses that line — row-level security in Postgres, not a
        filter the application remembers to apply. Two laboratories share one
        deployment and never meet.
      </>
    ),
    ctaLabel: 'Tenancy and RLS →',
    ctaTo: '/docs/architecture/tenancy-and-rls',
  },
  {
    title: 'A specimen, end to end',
    description: (
      <>
        Ordered, collected, accessioned, labelled, benched, entered, reviewed
        and released — with an append-only chain of custody, and an amendment
        that keeps the original readable rather than overwriting it.
      </>
    ),
    ctaLabel: 'User guide →',
    ctaTo: '/docs/user-guide/overview',
  },
  {
    title: 'Honest about what it is',
    description: (
      <>
        HIPAA-conscious, never &ldquo;HIPAA-compliant&rdquo; — no software can
        be. Waves 0 to 3 are built; billing, quality control, scheduling,
        portals and interoperability are not, and the roadmap says so rather
        than implying otherwise.
      </>
    ),
    ctaLabel: 'What is not built →',
    ctaTo: '/docs/roadmap',
  },
];

function Feature({title, description, ctaLabel, ctaTo}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={clsx('text--center padding-horiz--md', styles.featureContent)}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <Link className="button button--primary button--sm" to={ctaTo}>
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
        <div className={clsx('text--center', styles.builtBy)}>
          <p>
            LabFlow is designed, built, and maintained by{' '}
            <Link to="/docs/author">
              <strong>Ahsan Mahmood</strong>
            </Link>{' '}
            — full-stack engineer specialising in React, Capacitor, and
            Firebase. See the <Link to="/docs/author">Author page</Link> for
            contact, portfolio, and how to support the project.
          </p>
        </div>
      </div>
    </section>
  );
}
