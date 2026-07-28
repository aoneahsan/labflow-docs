import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * LabFlow documentation site IA.
 *
 * `tutorialSidebar` powers the main "Documentation" navbar entry.
 * `apiSidebar` powers the "API Reference" navbar entry.
 *
 * Every module has a detail page; the User Guide carries the core daily-workflow
 * recipes and links the rest to the module references. Add new docs files to the
 * matching category below.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: ['getting-started/quick-start', 'getting-started/installation'],
    },
    {
      type: 'category',
      label: 'Architecture',
      collapsed: true,
      items: [
        'architecture/overview',
        'architecture/data-model',
        'architecture/firestore-schema',
        'architecture/security-rules',
      ],
    },
    {
      type: 'category',
      label: 'Modules',
      collapsed: true,
      link: {type: 'doc', id: 'modules/index'},
      items: [
        'modules/index',
        'modules/authentication',
        'modules/dashboard',
        'modules/patient-management',
        'modules/test-catalog',
        'modules/test-orders',
        'modules/sample-tracking',
        'modules/results-management',
        'modules/quality-control',
        'modules/billing-insurance',
        'modules/inventory',
        'modules/appointments',
        'modules/home-collection',
        'modules/reports-analytics',
        'modules/user-management',
        'modules/settings',
        'modules/admin-panel',
        'modules/emr-integration',
        'modules/workflow-automation',
        'modules/communication-hub',
        'modules/mobile-app',
        'modules/wxt-extension',
        'modules/emr-chrome-extension',
      ],
    },
    {
      type: 'category',
      label: 'User Guide',
      collapsed: true,
      items: [
        'user-guide/overview',
        'user-guide/patients/registration',
        'user-guide/samples/accession',
        'user-guide/results/validate-and-release',
        'user-guide/quality-control/run-qc',
        'user-guide/billing/create-invoice',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      collapsed: true,
      items: [
        'deployment/overview',
        'deployment/github-publish',
        'deployment/search-engines',
        'deployment/algolia-docsearch',
        'deployment/launch-checklist',
      ],
    },
    'author',
  ],

  apiSidebar: [
    'api/overview',
    'api/authentication',
    'api/errors',
    'api/conventions',
  ],
};

export default sidebars;
