import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * LabFlow documentation site IA.
 *
 * 🔴 THIS SITE DOCUMENTS SHIPPED BEHAVIOUR ONLY. Waves 0–3 of 12 are built, and
 * every page below describes one of them. Unbuilt areas appear in exactly one
 * place — `roadmap` — and never as a feature page. Adding a category for an
 * unbuilt module is the failure this comment exists to prevent.
 *
 * There is no API sidebar: LabFlow exposes no public or REST API.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/quick-start',
        'getting-started/create-or-join-a-laboratory',
        'getting-started/finding-your-way-around',
      ],
    },
    {
      type: 'category',
      label: 'User Guide',
      collapsed: false,
      link: {type: 'doc', id: 'user-guide/overview'},
      items: [
        'user-guide/patients',
        'user-guide/test-catalogue',
        'user-guide/panels-and-reference-ranges',
        'user-guide/orders',
        'user-guide/specimens',
        'user-guide/accessioning',
        'user-guide/labels',
        'user-guide/result-entry',
        'user-guide/result-review-and-release',
        'user-guide/dashboard',
        'user-guide/users-and-access',
        'user-guide/profile-and-identity',
        'user-guide/settings',
        'user-guide/forms',
        'user-guide/tools',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      collapsed: true,
      link: {type: 'doc', id: 'architecture/overview'},
      items: ['architecture/tenancy-and-rls', 'architecture/records-and-trails'],
    },
    'roadmap',
    {
      type: 'category',
      label: 'Hosting & Publishing',
      collapsed: true,
      items: ['deployment/overview'],
    },
    'author',
  ],
};

export default sidebars;
