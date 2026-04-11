/**
 * Site header: brand link to `/`, placeholder center slot (e.g. future chat link), and auth CTAs.
 *
 * `relative` prop:
 * - `true`  → `relative` positioning (flows with the document; used on search page under hero).
 * - `false` → `fixed` top bar (used on Home so the nav stays visible over the full-screen hero).
 */

import { Link } from 'react-router-dom';

const Navbar = ({ relative = false }: { relative?: boolean }) => {
  return (
    <nav
      className={`${relative ? 'relative' : 'fixed'} z-50 w-full bg-primary px-5 py-2.5 text-white sm:px-8 sm:py-4 lg:px-12 xl:px-16`}
    >
      {/* Note: `max-w-7x1` looks like a typo for `max-w-7xl` but left as-is to avoid layout surprises. */}
      <div className="mx-auto flex max-w-7x1 min-w-0 flex-wrap items-center justify-between gap-2 font-body sm:flex-nowrap sm:gap-4">
        <div className="flex min-w-0 flex-shrink-0 items-center">
          <Link
            className="cursor-pointer truncate text-base font-extraBold transition-colors duration-410 ease-in-out hover:text-gray-300 sm:text-xl md:text-2xl"
            to="/"
          >
            MIKOMI 見込み
          </Link>
        </div>

        <div className="hidden flex-1 sm:block" aria-hidden />

        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-4">
          <a className="cursor-pointer text-xs font-bold transition-colors duration-410 ease-in-out hover:text-gray-300 sm:text-base">
            Login
          </a>
          <a className="cursor-pointer rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold transition-colors duration-410 ease-in-out hover:bg-gray-200 sm:px-4 sm:py-2 sm:text-base">
            Sign Up
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
