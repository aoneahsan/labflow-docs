import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js — don't use client-side code (browser APIs, JSX) here.

// 🔴 Derived from the PARENT project's real deployed domain, per the global
// docs-site law: labflow.aoneahsan.com is a SUBDOMAIN, so the docs host appends
// `-docs` to its first label — labflow-docs.aoneahsan.com. NOT docs.labflow…,
// which is the apex form wrongly applied to a subdomain, and which never had a
// DNS record (probed 2026-07-28: it returns 000, while labflow-docs returns 404
// — the record already resolves to GitHub Pages and is waiting for a publish).
const SITE_URL = 'https://labflow-docs.aoneahsan.com';
const APP_URL = 'https://labflow.aoneahsan.com';
// The APP source is a private repository; THIS DOCS SITE is its own PUBLIC repo
// (aoneahsan/labflow-docs), which is what makes GitHub Pages possible and what
// lets "edit this page" work. 🔴 Because it is public, no secret may ever enter
// it — placeholders only, real values in Actions secrets.
const DOCS_REPO = 'https://github.com/aoneahsan/labflow-docs';
// 🔴 The product speaks as the LabFlow team, never as one person (owner rule,
// storytelling-content.md, 2026-09-25): no founder byline, no personal
// profile links, no Person in the structured data.
const TEAM_NAME = 'The LabFlow team';
const CONTACT_EMAIL = 'aoneahsan@gmail.com';
const SUPPORT_URL =
  'https://aoneahsan.com/payment?project-id=labflow&project-identifier=com.aoneahsan.labflow';

const organisationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LabFlow',
  url: APP_URL,
  logo: `${SITE_URL}/img/logo.svg`,
  email: CONTACT_EMAIL,
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'LabFlow Documentation',
  url: SITE_URL,
  description:
    'Documentation for LabFlow — a multi-tenant Laboratory Information Management System (LIMS) for clinical laboratories, covering the clinical spine from patient to released result, laboratory operations, the patient and clinician portals, analytics, HL7 v2 and FHIR as files, and platform administration.',
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
  // 🔴 Web only, because that is what a person can use today. The Android app is
  // built but not released on Google Play; add 'Android' here only once it is.
  // There is no iOS application in any form.
  operatingSystem: 'Web',
  url: APP_URL,
  installUrl: APP_URL,
  image: `${SITE_URL}/img/labflow-social-card.png`,
  description:
    'LabFlow is a multi-tenant Laboratory Information Management System (LIMS) for clinical laboratories, fronted by a public marketplace, with patient and clinician portals. It runs on hosted Supabase Postgres with row-level security, and covers patients, a LOINC-coded test catalogue, orders, specimens with chain of custody, accessioning, result entry, review and release, billing, quality control, compliance, analytics and platform administration.',
  // 🔴 Only capabilities that are BUILT and reachable today. Unreleased or
  // unbuilt items belong on the Status and limits page (docs/roadmap.md).
  featureList: [
    'Multi-tenant data isolation enforced by row-level security',
    'LOINC-coded test catalogue, panels and resolved reference ranges',
    'Specimen chain of custody with an append-only trail',
    'Accessioning with database-minted accession numbers and a check digit',
    'Label templates and a print queue',
    'Result entry with an idempotent write path that works offline',
    'Result review and release with critical-value escalation',
    'Versioned results — an amendment is a new version, never an edit',
    'Invoices, payment allocation and insurance claims',
    'Quality control with Westgard rules',
    'Patient portal with sharing and a one-result link',
    'Clinician portal for ordering and acknowledging critical results',
    'HL7 v2 and FHIR R4 export and import as files',
  ],
  author: {
    '@type': 'Organization',
    name: 'LabFlow',
    url: APP_URL,
  },
};

const config: Config = {
  title: 'LabFlow Documentation',
  tagline:
    'Multi-tenant LIMS for clinical laboratories — from order to released result, with patient and clinician portals. What is built, and what is not.',
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
  // 🔴 The PAGES repo, not the app repo. `lab-system` is private and is not what
  // publishes this site; getting this wrong breaks the deploy target.
  projectName: 'labflow-docs',

  // 🔴 THROW. The build IS the link checker: a page whose target was deleted is
  // a build failure here rather than a 404 a reader finds. Never downgrade this
  // to 'warn' to make a build pass — fix the link.
  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    // Migrated from the deprecated top-level `onBrokenMarkdownLinks`.
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: 'LabFlow documentation updates',
        href: `${SITE_URL}/feed.xml`,
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'description',
        content:
          'LabFlow Documentation — a multi-tenant Laboratory Information Management System (LIMS) for clinical laboratories, on hosted Supabase Postgres with row-level security. Getting started, the user guide for every shipped area, the architecture, and an honest page on what is not built.',
      },
    },
    {
      tagName: 'meta',
      attributes: {name: 'author', content: TEAM_NAME},
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
          'LIMS, laboratory information management system, clinical lab software, multi-tenant LIMS, LOINC, test catalogue, reference ranges, specimen chain of custody, accessioning, accession number, specimen labels, result entry, result review, result release, critical value escalation, row-level security, Supabase Postgres, LabFlow',
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
          editUrl: `${DOCS_REPO}/edit/main/`,
          showLastUpdateTime: true,
          showLastUpdateAuthor: false,
          // 🔴 `docs/` is BOTH the published content directory AND the fixed home
          // of the internal manual-tasks file, so without this exclude
          // MANUAL-TASKS.md ships as a live public page. That has already
          // happened on two sibling docs sites.
          // `exclude` REPLACES the plugin defaults, so they are restated here —
          // dropping them would start publishing _partials and test files.
          exclude: [
            '**/_*.{js,jsx,ts,tsx,md,mdx}',
            '**/_*/**',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__tests__/**',
            'MANUAL-TASKS.md',
          ],
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
            title: 'LabFlow Blog',
            description:
              'Updates, release notes, and engineering deep-dives from LabFlow.',
            copyright: `© ${new Date().getFullYear()} LabFlow.`,
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
    // The product's recorded brand accent (OKLCH hue 288, "Assay Violet"). The
    // teal that stood here belonged to the retired application.
    metadata: [{name: 'theme-color', content: '#6e2bf6'}],
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
          to: '/docs/user-guide/overview',
          label: 'User Guide',
          position: 'left',
        },
        {
          to: '/docs/architecture/overview',
          label: 'Architecture',
          position: 'left',
        },
        {to: '/docs/roadmap', label: 'Status', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/docs/author', label: 'About', position: 'right'},
        {href: APP_URL, label: 'Open App', position: 'right'},
        {href: DOCS_REPO, label: 'GitHub', position: 'right'},
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
            {label: 'User Guide', to: '/docs/user-guide/overview'},
            {label: 'Architecture', to: '/docs/architecture/overview'},
            {label: 'Status and limits', to: '/docs/roadmap'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'Open the App', href: APP_URL},
            {label: 'Documentation source', href: DOCS_REPO},
            {label: 'Blog', to: '/blog'},
            {label: 'RSS Feed', href: `${SITE_URL}/blog/rss.xml`},
            {label: 'Sitemap', href: `${SITE_URL}/sitemap.xml`},
          ],
        },
        {
          title: 'Contact',
          items: [
            {label: 'About LabFlow', to: '/docs/author'},
            {label: 'Email the LabFlow team', href: `mailto:${CONTACT_EMAIL}`},
            {label: 'Support the Project', href: SUPPORT_URL},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} LabFlow.`,
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
