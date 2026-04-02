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
import React, { useState } from 'react';

const SearchBar: React.FC<{ query: string; onSearch: (query: string) => void }> = ({
  query,
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState(query);

  const handleSubmit = () => {
    onSearch(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative group">
        <input
          type="text"
          placeholder="Search Manga..."
          className="w-full px-8 py-4 text-lg bg-white bg-opacity-90 backdrop-blur-sm border-2 border-transparent rounded-full text-primary placeholder-gray-400 focus:outline-none focus:border-white focus:bg-white transition-all duration-300 shadow-2xl font-body font-semibold placeholder:font-semibold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-gray-100 hover:bg-gray-200 rounded-full shadow-lg cursor-pointer transition-colors duration-410 ease-in-out"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
