import { translate } from '@docusaurus/Translate';

/**
 * The feed page's words (LabFlow docs, GATE 4 approved 2026-10-26: kit OD-159, TASK-032). Each goes through
 * Docusaurus's `translate`, so a second locale needs a translation file and no edit here. "Published
 * {published_date}" lives in the page itself, because its date is a `<time>` element. The sitemap page reads the title
 * and meta description for the feed's own card.
 *
 * @returns the page's words
 */
export function feedWords() {
  return {
    title: translate({ id: 'docs.feed.title', message: 'Feed' }),
    metaDescription: translate({
      id: 'docs.feed.meta.description',
      message: 'The LabFlow blog, newest first, with RSS and Atom links for a feed reader.',
    }),
    intro: translate({ id: 'docs.feed.intro', message: 'Every post on the LabFlow blog, newest first.' }),
    rssHeading: translate({ id: 'docs.feed.rss.heading', message: 'Follow by RSS' }),
    rssBody: translate({
      id: 'docs.feed.rss.body',
      message:
        'RSS is a plain list of new posts that a feed reader checks for you. Copy the link below into yours, and new posts appear there by themselves.',
    }),
    rssLinkLabel: translate({ id: 'docs.feed.rss.link_label', message: 'RSS link' }),
    copy: translate({ id: 'docs.feed.copy', message: 'Copy link' }),
    copied: translate({ id: 'docs.feed.copied', message: 'Copied' }),
    copyFailed: translate({
      id: 'docs.feed.copy_failed',
      message: 'The link could not be copied. Select it and copy it yourself.',
    }),
    atomLabel: translate({ id: 'docs.feed.atom.label', message: 'Atom feed' }),
    atomHint: translate({ id: 'docs.feed.atom.hint', message: 'The same posts in Atom.' }),
    read: translate({ id: 'docs.feed.item.read', message: 'Read the post' }),
    emptyTitle: translate({ id: 'docs.feed.empty.title', message: 'No posts yet' }),
    emptyBody: translate({
      id: 'docs.feed.empty.body',
      message: 'The first one appears here, and in your feed reader, when it is published.',
    }),
  };
}
