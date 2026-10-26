import { translate } from '@docusaurus/Translate';

/**
 * The sitemap page's words (LabFlow docs, GATE 4 approved 2026-10-26: kit OD-159, TASK-032). Each goes through
 * Docusaurus's `translate`, so a second locale needs a translation file and no edit here. The draft's `_one` and
 * `_other` count keys are one plural message each (`one|other`). Each documentation group's heading is the category's
 * own label, read from the sidebar.
 *
 * @returns the page's words
 */
export function sitemapWords() {
  return {
    title: translate({ id: 'docs.sitemap.title', message: 'Sitemap' }),
    metaDescription: translate({
      id: 'docs.sitemap.meta.description',
      message:
        'Every page of the LabFlow documentation in one place, grouped and searchable: getting started, the user guide, the portals, the architecture and the blog.',
    }),
    intro: translate({
      id: 'docs.sitemap.intro',
      message: 'Every page of the LabFlow documentation, grouped and searchable.',
    }),
    filesLabel: translate({ id: 'docs.sitemap.files.label', message: 'Files' }),
    sitemapXml: {
      label: translate({ id: 'docs.sitemap.file.sitemap_xml.label', message: 'sitemap.xml' }),
      hint: translate({
        id: 'docs.sitemap.file.sitemap_xml.hint',
        message: 'The same list, in the format search engines read.',
      }),
    },
    feedXml: {
      label: translate({ id: 'docs.sitemap.file.feed_xml.label', message: 'feed.xml' }),
      hint: translate({ id: 'docs.sitemap.file.feed_xml.hint', message: 'New blog posts, for a feed reader.' }),
    },
    rss: {
      label: translate({ id: 'docs.sitemap.file.rss.label', message: 'RSS feed' }),
      hint: translate({
        id: 'docs.sitemap.file.rss.hint',
        message: 'The same posts as feed.xml, at the blog’s address.',
      }),
    },
    atom: {
      label: translate({ id: 'docs.sitemap.file.atom.label', message: 'Atom feed' }),
      hint: translate({ id: 'docs.sitemap.file.atom.hint', message: 'The same posts in Atom.' }),
    },
    llms: {
      label: translate({ id: 'docs.sitemap.file.llms.label', message: 'llms.txt' }),
      hint: translate({
        id: 'docs.sitemap.file.llms.hint',
        message: 'A plain-text summary of the documentation, with a link to every page.',
      }),
    },
    searchLabel: translate({ id: 'docs.sitemap.search.label', message: 'Search pages' }),
    searchPlaceholder: translate({ id: 'docs.sitemap.search.placeholder', message: 'Try “accession” or “release”' }),
    count: translate({ id: 'docs.sitemap.search.count', message: '1 page|{count} pages' }),
    countQuery: translate({
      id: 'docs.sitemap.search.count_query',
      message: '1 page matches “{query}”|{count} pages match “{query}”',
    }),
    groupDocs: translate({ id: 'docs.sitemap.group.docs', message: 'Documentation' }),
    groupPosts: translate({ id: 'docs.sitemap.group.posts', message: 'Blog' }),
    emptyTitle: translate({ id: 'docs.sitemap.empty.title', message: 'No pages match “{query}”' }),
    emptyBody: translate({
      id: 'docs.sitemap.empty.body',
      message: 'Try a shorter word, or clear the search to see every page.',
    }),
    emptyAction: translate({ id: 'docs.sitemap.empty.action', message: 'Clear search' }),
  };
}
