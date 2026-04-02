/**
 * Sticky footer bar (fixed to bottom of viewport). Keep pages that use it padded at the bottom
 * so main content is not hidden behind this strip (see `pb-16` on search page wrapper).
 */

const Footer = () => (
  <footer className="fixed bottom-0 bg-primary w-full text-white py-4">
    <p className="text-center text-sm font-body">
      © {new Date().getFullYear()}{' '}
      <span className="font-bold">MIKOMI 見込み</span> — All rights reserved
    </p>
    <p className="text-center text-sm font-body">Lists, Login, and Sign Up Coming Soon!</p>
  </footer>
);

export default Footer;
