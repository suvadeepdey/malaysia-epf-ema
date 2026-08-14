/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: kwsp (www.kwsp.gov.my) site-wide cleanup.
 *
 * Scope is MAIN CONTENT ONLY. The importer selects #main-content; the global
 * site chrome that lives outside it must not survive into the import.
 *
 * Selectors verified against migration-work/cleaned.html:
 *   - header#banner  -> global site header (logo + Member/Employer/Corporate nav). Non-authorable.
 *   - footer#footer  -> global site footer (link-farm). Non-authorable.
 *
 * Retained as default content per authoring analysis (NOT removed here):
 *   - #main-content > div.component-html > h1.sr-only  (page intro heading)
 *   - #main-content > nav.breadcrumb-contribution        (breadcrumb)
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    // Remove global site chrome (header + footer). Handled defensively here in
    // case the selected root is broader than #main-content; harmless no-op when
    // the root is already scoped to #main-content.
    WebImporter.DOMUtils.remove(element, [
      'header#banner',
      'footer#footer',
      'header',
      'footer',
    ]);
  }
}
