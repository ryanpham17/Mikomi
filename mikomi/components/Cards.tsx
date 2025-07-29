import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronUp, Star } from 'lucide-react';
import Navbar from './Navbar'
import searchPic from './images/searchPic.jpeg';
import SearchBar from './SearchBar';
import Footer from './Footer';

// Types for manga data
interface MangaAttributes {
  canonicalTitle: string;
  synopsis: string;
  averageRating: string;
  startDate: string;
  endDate: string;
  chapterCount: number;
  volumeCount: number;
  status: string;
  posterImage: {
    small: string;
    medium: string;
    large: string;
  };
  popularityRank: number;
  ratingRank: number;
  ageRating: string;
}

//edit later for genres
interface CategoryData {
  id: string;
  type: string;
  attributes: {
    title: string;
    slug: string;
  };
}

interface MangaData {
  id: string;
  type: string;
  attributes: MangaAttributes;
}

interface MangaCardProps {
  manga: MangaData;
  onClick?: (manga: MangaData) => void;
}

const MangaCard: React.FC<MangaCardProps> = ({ manga, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    canonicalTitle,
    synopsis,
    averageRating,
    posterImage,
  } = manga.attributes;

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return 'No description available';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const formatRating = (rating: string) => {
    if (!rating) return 'No Rating';
    return (parseFloat(rating) / 10).toFixed(1);
  };

  const getGenreColors = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800', 
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800'
    ];
    return colors[index % colors.length];
  };

  // Sample genres for demo - in real app, you'd get these from the API include
  const sampleGenres = ['Action', 'Adventure', 'Shounen', 'Drama'];

  return (
    <div 
      className="bg-primary rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg"
      onClick={() => onClick?.(manga)}
    >
      {/* Image Section with Purple Gradient */}
      <div className="h-28.5 relative bg-gradient-to-br from-gray-300 to-gray-100 flex items-center justify-center">
        {!imageError && posterImage?.medium && (
          <img
            src={posterImage.medium}
            alt={canonicalTitle}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-30' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        {/* Fallback Icon */}
        {(!imageLoaded || imageError) && (
          <div className="h-28.5 text-white text-4xl content-center">
            📚
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 bg-primary text-white text-left">
        {/* Title */}
        <h3 className="font-bold text-lg mb-2 text-white">
          {canonicalTitle}
        </h3>

        {/* Genres */}
        <div className="flex flex-wrap gap-1 mb-3">
          {sampleGenres.map((genre, index) => (
            <span 
              key={genre}
              className={`px-2 py-1 rounded text-xs font-medium ${getGenreColors(index)}`}
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Synopsis */}
        <p className="font-medium text-gray-500 text-sm mb-3">
          {truncateText(synopsis, 100)}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 text-yellow-400">
          {Array.from({ length: 5 }).map((_, i) => {
            const rating = parseFloat(averageRating) / 10;
            const filled = i < Math.floor(rating);
            const halfFilled = i === Math.floor(rating) && rating % 1 >= 0.5;
            
            return (
              <Star 
                key={i} 
                className={`h-4 w-4 ${
                  filled ? 'fill-current' : halfFilled ? 'fill-current opacity-50' : ''
                }`} 
              />
            );
          })}
          <span className="font-bold text-sm ml-1">{formatRating(averageRating)}/10</span>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-gray-200 text-white hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {getVisiblePages().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-3 py-2 rounded-lg font-medium ${
            page === currentPage
              ? 'bg-gray-300 text-white'
              : page === '...'
              ? 'text-gray-400 cursor-default'
              : 'bg-primary text-white hover:bg-gray-400'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-gray-200 text-white hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

// Back to Top Button
const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      className={`fixed bottom-8 right-8 bg-gray-300 text-white p-3 rounded-full shadow-lg hover:bg-gray-300 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      onClick={scrollToTop}
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
};

// Main Search Results Page Component
const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [mangas, setMangas] = useState<MangaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(247);
  const navigate = useNavigate();
  
  const mangasPerPage = 12;
  const totalPages = Math.ceil(totalResults / mangasPerPage);

  // Kitsu API integration
  const fetchMangaFromKitsu = async (query: string, page: number) => {
    try {
      const offset = (page - 1) * mangasPerPage;
      const response = await fetch(
        `https://kitsu.io/api/edge/manga?filter[text]=${encodeURIComponent(query)}&page[limit]=${mangasPerPage}&page[offset]=${offset}&fields[manga]=canonicalTitle,synopsis,averageRating,startDate,endDate,chapterCount,volumeCount,status,posterImage,popularityRank,ratingRank,ageRating&include=genres,categories`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch manga');
      }
      
      const data = await response.json();
      return {
        mangas: data.data || [],
        totalCount: data.meta?.count || 0
      };
    } catch (error) {
      console.error('Error fetching manga:', error);
      return { mangas: [], totalCount: 0 };
    }
  };

  useEffect(() => {
    const loadMangas = async () => {
      setLoading(true);
      
      try {
        const result = await fetchMangaFromKitsu(searchQuery, currentPage);
        setMangas(result.mangas);
        setTotalResults(result.totalCount);
      } catch (error) {
        console.error('Error loading mangas:', error);
        setMangas([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    loadMangas();
  }, [currentPage, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    navigate(`/search?q=${encodeURIComponent(query)}`); //update the url dynamically
  };

  const handleMangaClick = (manga: MangaData) => {
    console.log('Clicked manga:', manga.attributes.canonicalTitle);
  };

  return (
  <div className="bg-black w-full min-h-screen font-body">
    <Navbar relative={true}/>
    {/* Top section with background image - only behind search bar */}
    <div className='bg-cover text-center w-full h-64 mx-auto pt-32' style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.89), rgba(0, 0, 0, 1)), url(${searchPic})`}}>
      <SearchBar query={searchQuery} onSearch={handleSearch}/> 
    </div>
    
    {/* Rest of the content with solid black background */}
    <div className="bg-black w-full space-y-8 pb-16">
    
      {/* Manga Grid */}
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="grid grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-gray-300 rounded-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {mangas.map((manga) => (
              <MangaCard
                key={manga.id}
                manga={manga}
                onClick={handleMangaClick}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
  
      <Footer />
      <BackToTopButton />
    </div>
  </div>
  );
};

export default SearchResultsPage;