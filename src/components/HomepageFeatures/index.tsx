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

const FeatureList: FeatureItem[] = [
  {
    title: 'Multi-tenant by design',
    description: (
      <>
        Every Firestore read and write is scoped to a single tenant — enforced
        in security rules, not just application code. Two laboratories share
        the same deployment without ever seeing each other&apos;s patients,
        orders, or results.
      </>
    ),
    ctaLabel: 'Architecture →',
    ctaTo: '/docs/architecture/overview',
  },
  {
    title: 'Five surfaces, one codebase',
    description: (
      <>
        Web app (live), native Android &amp; iOS via Capacitor, a WXT browser
        extension, an EMR Chrome add-on, and Cloud Functions. All share one
        React + TypeScript codebase backed by Firestore.
      </>
    ),
    ctaLabel: 'Modules catalogue →',
    ctaTo: '/docs/modules',
  },
  {
    title: 'Honest about what it is',
    description: (
      <>
        HIPAA-conscious in design, but no FDA / CAP / CLIA / SOC 2 attestation
        out of the box. Native distribution through Play / App / Chrome stores
        is pending. The docs say what LabFlow doesn&apos;t do as clearly as
        what it does.
      </>
    ),
    ctaLabel: 'Honest framing →',
    ctaTo: '/docs/intro',
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
