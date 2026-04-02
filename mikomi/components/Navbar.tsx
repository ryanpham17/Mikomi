/**
 * Site header: brand link to `/`, placeholder center slot (e.g. future chat link), and auth CTAs.
 *
 * `relative` prop:
 * - `true`  → `relative` positioning (flows with the document; used on search page under hero).
 * - `false` → `fixed` top bar (used on Home so the nav stays visible over the full-screen hero).
 */

const Navbar = ({ relative = false }: { relative?: boolean }) => {
  return (
    <nav
      className={`${relative ? 'relative' : 'fixed'} w-full bg-primary text-white px-16 py-5 z-50`}
    >
      {/* Note: `max-w-7x1` looks like a typo for `max-w-7xl` but left as-is to avoid layout surprises. */}
      <div className="flex items-center justify-between max-w-7x1 mx-auto font-body">
        <div className="flex items-center">
          <a
            className="cursor-pointer text-2xl hover:text-gray-300 font-extraBold transition-colors duration-410 ease-in-out"
            href="/"
          >
            MIKOMI 見込み
          </a>
        </div>

        <div className="flex items-center">
          {/* Reserved for future nav (e.g. chatbot route); empty anchor kept for layout symmetry. */}
          <a className="cursor-pointer text-lg hover:text-gray-300 font-bold transition-colors duration-410 ease-in-out" />
        </div>

        <div className="flex items-center space-x-4">
          <a className="cursor-pointer text-base hover:text-gray-300 font-bold transition-colors duration-410 ease-in-out">
            Login
          </a>
          <a className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md font-bold transition-colors duration-410 ease-in-out">
            Sign Up
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
