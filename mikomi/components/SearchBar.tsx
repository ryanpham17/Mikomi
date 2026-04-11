/**
 * SearchBar — controlled-style search input used on Home and the `/search` page.
 *
 * Props:
 * - `query` — initial / external value (e.g. from URL on search results). Note: internal state is only
 *   initialized from `query` on mount; if the parent changes `query` later, the input does not auto-sync
 *   (consider a `useEffect` if deep-linking or history navigation must update the field).
 * - `onSearch` — fired when the user submits via button click or Enter.
 */

import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const SearchBar: React.FC<{ query: string; onSearch: (query: string) => void }> = ({
  query,
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const handleSubmit = () => {
    onSearch(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-0 sm:px-0">
      <div className="group relative">
        <input
          type="text"
          placeholder="Search Manga..."
          className="w-full rounded-full border-2 border-transparent bg-white/90 py-2.5 pl-3.5 pr-12 text-sm font-body font-semibold text-primary shadow-lg backdrop-blur-sm transition-all duration-300 placeholder:font-semibold placeholder:text-gray-400 focus:border-white focus:bg-white focus:outline-none sm:py-4 sm:pl-8 sm:pr-16 sm:text-lg sm:shadow-2xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-gray-100 p-1.5 shadow-md transition-colors duration-410 ease-in-out hover:bg-gray-200 sm:right-2 sm:p-3 sm:shadow-lg"
          aria-label="Search"
        >
          <Search className="h-3.5 w-3.5 text-white sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
