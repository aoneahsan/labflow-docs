import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js — don't use client-side code (browser APIs, JSX) here.

const SITE_URL = 'https://docs.labflow.aoneahsan.com';
const APP_URL = 'https://labflow.aoneahsan.com';
// The LabFlow source (app + this docs site) lives in ONE private repository.
// There is no public docs repo, so "edit this page" / public GitHub-repo links
// are intentionally omitted; the GitHub link points to the author's profile.
const AUTHOR_NAME = 'Ahsan Mahmood';
const AUTHOR_PORTFOLIO = 'https://aoneahsan.com';
const AUTHOR_LINKEDIN = 'https://linkedin.com/in/aoneahsan';
const AUTHOR_GITHUB = 'https://github.com/aoneahsan';
const AUTHOR_EMAIL = 'aoneahsan@gmail.com';
const SUPPORT_URL =
  'https://aoneahsan.com/payment?project-id=labflow&project-identifier=com.aoneahsan.labflow';

const organisationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LabFlow',
  url: APP_URL,
  logo: `${SITE_URL}/img/logo.svg`,
  sameAs: [AUTHOR_GITHUB, AUTHOR_LINKEDIN, 'https://npmjs.com/~aoneahsan'],
  founder: {
    '@type': 'Person',
    name: AUTHOR_NAME,
    url: AUTHOR_PORTFOLIO,
    email: AUTHOR_EMAIL,
    sameAs: [AUTHOR_LINKEDIN, AUTHOR_GITHUB, 'https://npmjs.com/~aoneahsan'],
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'LabFlow Documentation',
  url: SITE_URL,
  description:
    'Complete documentation for LabFlow — a multi-tenant Laboratory Information Management System (LIMS) covering patients, orders, samples, results, quality control, billing, inventory, and integrations.',
  inLanguage: 'en',
  publisher: {
    '@type': 'Organization',
    name: 'LabFlow',
    url: APP_URL,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const softwareApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'LabFlow',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Laboratory Information Management System (LIMS)',
  operatingSystem: 'Web, Android, iOS',
  url: APP_URL,
  installUrl: APP_URL,
  softwareVersion: '1.2.1',
  image: `${SITE_URL}/img/labflow-social-card.png`,
  description:
    'LabFlow is a multi-tenant Laboratory Information Management System (LIMS) covering patient registration, LOINC-integrated test ordering, sample tracking with chain of custody, four-state result validation, Levey-Jennings + Westgard quality control, billing and insurance, inventory, appointments, home collection, and HL7 v2 / FHIR R4 EMR integration across web, mobile, and browser-extension surfaces.',
  featureList: [
    'Multi-tenant data isolation',
    'LOINC-integrated test catalog and ordering',
    'Sample tracking with chain of custody',
    'Draft → Reviewed → Approved → Released result validation',
    'Levey-Jennings + Westgard quality control',
    'Billing, insurance claims, and inventory',
    'HL7 v2 / FHIR R4 EMR integration',
    'Role-based access (11 roles, 177 permissions) with audit logging',
  ],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Person',
    name: AUTHOR_NAME,
    url: AUTHOR_PORTFOLIO,
  },
};

const config: Config = {
  title: 'LabFlow Documentation',
  tagline:
    'Multi-tenant LIMS — patients, orders, samples, results, QC, billing, inventory, EMR integration',
  favicon: 'img/favicon.ico',

  future: {
    // Adopt v4 future flags, but keep the standard webpack bundler. The `v4: true`
    // shortcut sets `fasterByDefault: true`, which pulls in the optional
    // `@docusaurus/faster` (rspack) package; it isn't a dependency here, so the
    // build fails without it. `faster: false` uses the installed webpack bundler.
    v4: true,
    faster: false,
  },

  url: SITE_URL,
  baseUrl: '/',

  organizationName: 'aoneahsan',
  projectName: 'lab-system',

  // Warn rather than throw — early-stage content has cross-links that may not
  // exist yet. Tighten to 'throw' once all cross-links are verified.
  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    // Migrated from the deprecated top-level `onBrokenMarkdownLinks`.
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'description',
        content:
          'LabFlow Documentation — multi-tenant Laboratory Information Management System (LIMS). Modules, API, deployment, mobile, EMR integration. Built by Ahsan Mahmood.',
      },
    },
    {
      tagName: 'meta',
      attributes: {name: 'author', content: AUTHOR_NAME},
    },
    {
      tagName: 'meta',
      attributes: {name: 'application-name', content: 'LabFlow'},
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'keywords',
        content:
          'LIMS, laboratory information management system, lab software, HL7, FHIR, LOINC, multi-tenant lab, clinical lab software, sample tracking, result validation, quality control, Levey-Jennings, Westgard rules, lab billing, EMR integration, LabFlow',
      },
    },
    {
      tagName: 'meta',
      attributes: {property: 'og:type', content: 'website'},
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:site_name',
        content: 'LabFlow Documentation',
      },
    },
    {
      tagName: 'meta',
      attributes: {name: 'twitter:card', content: 'summary_large_image'},
    },
    {
      tagName: 'link',
      attributes: {rel: 'canonical', href: SITE_URL},
    },
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify(organisationJsonLd),
    },
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify(websiteJsonLd),
    },
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify(softwareApplicationJsonLd),
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // No editUrl: the source repo is private (no public "edit this page").
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
            title: 'LabFlow Blog',
            description:
              'Updates, release notes, and engineering deep-dives from LabFlow.',
            copyright: `© ${new Date().getFullYear()} LabFlow. Built by ${AUTHOR_NAME}.`,
            language: 'en',
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'ignore',
          onUntruncatedBlogPosts: 'warn',
          blogTitle: 'LabFlow Blog',
          blogDescription: 'Updates, release notes, and engineering deep-dives.',
          postsPerPage: 10,
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          lastmod: 'date',
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    // Local, offline full-text search. Pagefind indexes the emitted static HTML
    // in a postBuild hook (so `yarn build` alone produces a working search — no
    // separate step, no third-party service) and ships a DocSearch-style
    // Cmd/Ctrl+K SearchBar. Chosen over Algolia DocSearch (no crawler/account
    // needed) and over the Canary theme (which peers React 17/18; this site is
    // React 19).
    ['docusaurus-plugin-pagefind', {}],
  ],

  themeConfig: {
    image: 'img/labflow-social-card.png',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    metadata: [{name: 'theme-color', content: '#0d9488'}],
    navbar: {
      title: 'LabFlow',
      logo: {
        alt: 'LabFlow logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API Reference',
        },
        {
          to: '/docs/architecture/overview',
          label: 'Architecture',
          position: 'left',
        },
        {to: '/docs/modules', label: 'Modules', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/docs/author', label: 'Author', position: 'right'},
        {href: APP_URL, label: 'Open App', position: 'right'},
        {href: AUTHOR_GITHUB, label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'LabFlow logo',
        src: 'img/logo.svg',
        width: 48,
        height: 48,
      },
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Introduction', to: '/docs/intro'},
            {label: 'Getting Started', to: '/docs/getting-started/quick-start'},
            {label: 'Architecture', to: '/docs/architecture/overview'},
            {label: 'Modules', to: '/docs/modules'},
            {label: 'API Reference', to: '/docs/api/overview'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'Open the App', href: APP_URL},
            {label: 'Author on GitHub', href: AUTHOR_GITHUB},
            {label: 'Blog', to: '/blog'},
            {label: 'RSS Feed', href: `${SITE_URL}/blog/rss.xml`},
            {label: 'Sitemap', href: `${SITE_URL}/sitemap.xml`},
          ],
        },
        {
          title: 'Author — Ahsan Mahmood',
          items: [
            {label: 'About the Author', to: '/docs/author'},
            {label: 'Portfolio', href: AUTHOR_PORTFOLIO},
            {label: 'LinkedIn', href: AUTHOR_LINKEDIN},
            {label: 'GitHub', href: AUTHOR_GITHUB},
            {label: 'Email', href: `mailto:${AUTHOR_EMAIL}`},
            {label: 'Support the Project', href: SUPPORT_URL},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} LabFlow. Documentation built with Docusaurus by ${AUTHOR_NAME} (aoneahsan@gmail.com).`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml', 'typescript', 'jsx', 'tsx'],
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
