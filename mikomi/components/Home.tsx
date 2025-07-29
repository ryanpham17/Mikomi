import { useState } from 'react';
import Navbar from './Navbar';
import homePic from './images/homePic.jpeg';
import SearchBar from '../components/SearchBar'
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return ( 
    // Whichever rule is applied last wins: the inline style overrides the Tailwind class, so the gradient you set with bg-gradient-to-b never makes it to the browser.
    <div className='w-full h-screen bg-cover bg-center' style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.89), rgba(0, 0, 0, 1)), url(${homePic})` }}>
      <Navbar relative={false} />
      <div className='relative z-10 flex items-center justify-center min-h-screen font-body'>
        <div className='text-center max-w-4xl mx-auto space-y-8'>
          {/* Main Title */}
          <h1 className='text-5xl md:text-6xl text-white font-extraBold leading-tight'>
            Find Your Next Favorite Manga
          </h1>

          {/* Search Bar */}
          <SearchBar query={searchQuery} onSearch={handleSearch} />

          {/* Description */}
          <div className='max-w-3xl mx-auto space-y-2'>
            <p className='text-lg md:text-xl text-gray-400 leading-relaxed'>
              Welcome to <span className='text-white font-semibold'>MIKOMI 見込み</span> — your personal manga matchmaker! Enter a manga
            </p>
            <p className='text-lg md:text-xl text-gray-400 leading-relaxed'>
              you love, and we’ll use AI to find titles with the highest similarity scores.
            </p>
            <p className='text-lg md:text-xl text-gray-400 leading-relaxed'>
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