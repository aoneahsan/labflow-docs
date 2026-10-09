import React, { type ReactNode } from 'react';

import LegalNotice from '@site/src/components/LegalNotice';

/**
 * The site's root wrapper (Docusaurus `Root` swizzle): every page, plus the first-visit legal notice.
 * Fleet law `legal-notice.md`, OD-149 §B.
 */
export default function Root({ children }: { children: ReactNode }): ReactNode {
  return (
    <>
      {children}
      <LegalNotice />
    </>
  );
}
