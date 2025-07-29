const Navbar = ({relative = false}) => {
      return (
    <nav className={`${relative ? 'relative' : 'fixed'} w-full bg-primary text-white px-16 py-5 z-50`}>
      <div className="flex items-center justify-between max-w-7x1 mx-auto font-body">
        {/* Left side - Brand */}
        <div className="flex items-center">
          <a className="cursor-pointer text-2xl hover:text-gray-300 font-extraBold transition-colors duration-410 ease-in-out" href='/'>MIKOMI 見込み</a>
        </div>

        {/* Center - ChatBot */}
        <div className="flex items-center">
          <a className="cursor-pointer text-lg hover:text-gray-300 font-bold transition-colors duration-410 ease-in-out"></a> {/* a tag to bring you to new page, buttons to */}
        </div>

        {/* Right side - Auth buttons */}
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