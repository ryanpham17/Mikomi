/**
 * Sticky footer bar (fixed to bottom of viewport). Keep pages that use it padded at the bottom
 * so main content is not hidden behind this strip (see `pb-16` on search page wrapper).
 */

const Footer = () => (
  <footer className="fixed bottom-0 z-40 w-full bg-primary px-3 py-3 text-white sm:px-4 sm:py-4">
    <p className="text-center text-xs font-body leading-snug sm:text-sm">
      © {new Date().getFullYear()}{' '}
      <span className="font-bold">MIKOMI 見込み</span> — All rights reserved
    </p>
    <p className="mt-0.5 text-center text-xs font-body leading-snug sm:text-sm">
      Lists, Login, and Sign Up Coming Soon!
    </p>
  </footer>
);

export default Footer;
