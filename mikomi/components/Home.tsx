/**
 * Home — landing route (`/`).
 *
 * Full-viewport hero with background image + dark gradient overlay, brand nav, marketing copy,
 * and the shared `SearchBar`. Submitting a search navigates to `/search?q=...` where `Cards.tsx`
 * loads results from Kitsu.
 */

import { useState } from 'react';
import Navbar from './Navbar';
import homePic from './images/homePic.jpeg';
import SearchBar from './SearchBar';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    /*
     * Background: Tailwind `bg-cover` / `bg-center` apply to the box; the inline `backgroundImage`
     * stacks a dark linear-gradient on top of the JPEG. Inline style wins over conflicting utilities,
     * so any `bg-gradient-*` class on the same div would be overridden.
     */
    <div
      className="min-h-screen w-full bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.89), rgba(0, 0, 0, 1)), url(${homePic})`,
      }}
    >
      {/* `relative={false}` → Navbar uses `fixed` so it stays on screen while scrolling (if content grows). */}
      <Navbar relative={false} />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 pb-32 pt-16 font-body sm:px-6 sm:pb-36 sm:pt-24 md:pt-28">
        <div className="mx-auto w-full max-w-4xl space-y-5 text-center sm:space-y-8">
          <h1 className="text-balance text-2xl font-extraBold leading-snug text-white sm:text-4xl sm:leading-tight md:text-5xl lg:text-6xl">
            Find Your Next Favorite Manga
          </h1>

          <div className="mx-auto w-full max-w-[min(100%,22rem)] sm:max-w-2xl">
            <SearchBar query={searchQuery} onSearch={handleSearch} />
          </div>

          <div className="mx-auto max-w-3xl space-y-1.5 sm:space-y-3">
            <p className="text-pretty text-sm leading-relaxed text-gray-400 sm:text-lg md:text-xl">
              Welcome to <span className="font-semibold text-white">MIKOMI 見込み</span> — your personal
              manga matchmaker! Enter a manga
            </p>
            <p className="text-pretty text-sm leading-relaxed text-gray-400 sm:text-lg md:text-xl">
              you love, and we’ll use AI to find titles with the highest similarity scores.
            </p>
            <p className="text-pretty text-sm leading-relaxed text-gray-400 sm:text-lg md:text-xl">
              Discover your next favorite series, tailored just for you ツ
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
