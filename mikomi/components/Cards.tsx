/**
 * Cards.tsx — Search results page for MIKOMI.
 *
 * Responsibilities:
 * - Read the `q` query param from the URL (so `/search?q=naruto` is shareable).
 * - Fetch manga from the public Kitsu JSON:API (`/api/edge/manga`).
 * - Render a grid of cards with loading skeletons, pagination, footer, and “back to top”.
 *
 * Child components kept in this file:
 * `MangaCard` — one result tile; `Pagination` — page numbers + prev/next; `BackToTopButton` — scroll UX.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronUp, Star } from 'lucide-react';
import { searchManga } from '../src/api/Kitsu';
import Navbar from './Navbar';
import searchPic from './images/searchPic.jpeg';
import SearchBar from './SearchBar';
import Footer from './Footer';

// -----------------------------------------------------------------------------
// Types — mirror the JSON:API `attributes` shape returned by Kitsu for manga resources.
// Only the fields we actually display (or may use soon) are listed; the API can return more.
// -----------------------------------------------------------------------------

interface MangaAttributes {
  canonicalTitle: string;
  synopsis: string;
  /** Kitsu stores this as a string; numeric rating is derived in the UI (see `formatRating`). */
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

/** One JSON:API resource: `id` + nested `attributes`. */
interface MangaData {
  id: string;
  attributes: MangaAttributes;
  /** Resolved from `relationships.genres` + `included` on the Kitsu response. */
  genreNames: string[];
}

interface MangaCardProps {
  manga: MangaData;
}

/** Kitsu compound document pieces we need to resolve genre tags per manga. */
interface KitsuResourceIdentifier {
  type: string;
  id: string;
}

interface KitsuMangaRaw {
  id: string;
  type: string;
  attributes: MangaAttributes;
  relationships?: {
    genres?: { data: KitsuResourceIdentifier[] };
  };
}

interface KitsuGenreIncluded {
  id: string;
  type: string;
  attributes: { name: string };
}

interface KitsuMangaListResponse {
  data: KitsuMangaRaw[];
  included?: KitsuGenreIncluded[];
  meta?: { count?: number };
}

/** Build `type:id` → genre name from JSON:API `included`. */
function genreLookupFromIncluded(included: KitsuGenreIncluded[] | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!included) return map;
  for (const res of included) {
    if (res.type === 'genres' && res.attributes?.name) {
      map.set(`${res.type}:${res.id}`, res.attributes.name);
    }
  }
  return map;
}

function normalizeKitsuMangas(raw: KitsuMangaListResponse): MangaData[] {
  const lookup = genreLookupFromIncluded(raw.included);
  return (raw.data || []).map((item) => {
    const refs = item.relationships?.genres?.data ?? [];
    const genreNames = refs
      .map((ref) => lookup.get(`${ref.type}:${ref.id}`))
      .filter((name): name is string => Boolean(name));
    return {
      id: item.id,
      attributes: item.attributes,
      genreNames,
    };
  });
}

// -----------------------------------------------------------------------------
// MangaCard — presentation-only; no navigation yet (card is not wired to a detail route).
// -----------------------------------------------------------------------------

const MangaCard: React.FC<MangaCardProps> = ({ manga }) => {
  const navigate = useNavigate();
  // Track poster load so we can fade the image in and show a placeholder until it arrives.
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

  /** Shorten synopsis for the grid; empty API field gets a friendly default. */
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return 'No description available';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  /**
   * Kitsu’s `averageRating` is on a 0–100-style scale in the raw API; we show a /10 style label.
   * Example: "82" → 8.2/10 (see star row uses `normalizedRating` = value/10 for the 5-star UI).
   */
  const formatRating = (rating: string) => {
    if (!rating) return 'No Rating';
    return (parseFloat(rating) / 10).toFixed(1);
  };

  /** Rotate through Tailwind badge classes so genre chips are visually distinct. */
  const getGenreColors = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
    ];
    return colors[index % colors.length];
  };

  /** 0–5 star scale for icon fill (half-star when fractional part ≥ 0.5). */
  const normalizedRating = parseFloat(averageRating || '0') / 10;

  /** Match the old sample layout: one compact row of pills (max 4 + optional “+N”). */
  const maxGenreChips = 4;
  const visibleGenres = manga.genreNames.slice(0, maxGenreChips);
  const overflowCount = Math.max(0, manga.genreNames.length - maxGenreChips);

  return (
    <div onClick={() => navigate(`/${canonicalTitle}/${manga.id}`)} className="bg-primary rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg">
      {/* Poster area: image fades in over a neutral gradient; emoji fallback if no URL or load error. */}
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

        {(!imageLoaded || imageError) && (
          <div className="h-28.5 text-white text-4xl content-center">📚</div>
        )}
      </div>

      <div className="p-4 bg-primary text-white text-left">
        <h3 className="font-bold text-lg mb-2 text-white">{canonicalTitle}</h3>

        <div className="flex flex-wrap gap-1 mb-3 min-h-[1.75rem] items-center">
          {visibleGenres.length > 0 ? (
            <>
              {visibleGenres.map((genre, index) => (
                <span
                  key={`${manga.id}-${genre}-${index}`}
                  className={`px-2 py-1 rounded text-xs font-medium ${getGenreColors(index)}`}
                >
                  {genre}
                </span>
              ))}
              {overflowCount > 0 && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-600 text-gray-200">
                  +{overflowCount}
                </span>
              )}
            </>
          ) : (
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-700/80 text-gray-400">
              No genres
            </span>
          )}
        </div>

        <p className="font-medium text-gray-500 text-sm mb-3">{truncateText(synopsis, 100)}</p>

        <div className="flex items-center gap-1 text-yellow-400">
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = i < Math.floor(normalizedRating);
            const halfFilled =
              i === Math.floor(normalizedRating) && normalizedRating % 1 >= 0.5;

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

// -----------------------------------------------------------------------------
// Pagination — builds a compact window of page numbers with ellipses (e.g. 1 … 5 6 7 … 20).
// `delta` = how many numbered buttons to show on each side of the current page (excluding 1 and last).
// -----------------------------------------------------------------------------

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | '...')[] = [];

    // Middle slice: pages strictly between 1 and totalPages, centered around currentPage.
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Always show 1 on the left; add "..." if there’s a gap between 1 and the middle slice.
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    // Append last page; add "..." if there’s a gap before it.
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
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-gray-200 text-white hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {getVisiblePages().map((page, index) => (
        <button
          type="button"
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
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-gray-200 text-white hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

// -----------------------------------------------------------------------------
// BackToTopButton — listens to window scroll; fades in after 300px for long result lists.
// Cleanup removes the listener to avoid leaks when leaving the route.
// -----------------------------------------------------------------------------

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
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      className={`fixed bottom-8 right-8 bg-gray-300 text-white p-3 rounded-full shadow-lg hover:bg-gray-300 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      onClick={scrollToTop}
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
};

// -----------------------------------------------------------------------------
// SearchResultsPage (default export) — owns fetch + URL/search state.
// -----------------------------------------------------------------------------

const SearchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  // `q` from `/search?q=...` — initial paint uses this; further searches update state + navigate.
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [mangas, setMangas] = useState<MangaData[]>([]);
  const [loading, setLoading] = useState(false);
  /** Total matching manga for this text filter (from `meta.count`), drives page count. */
  const [totalResults, setTotalResults] = useState(0);

  const mangasPerPage = 12;
  const totalPages = Math.max(1, Math.ceil(totalResults / mangasPerPage));

  /**
   * Kitsu JSON:API request:
   * - `filter[text]` — full-text style filter on manga.
   * - `page[limit]` / `page[offset]` — classic offset pagination (offset = (page-1) * limit).
   * - Do not use `fields[manga]=...` here: Kitsu omits `relationships` when that sparse fieldset
   *   is set, so `relationships.genres` disappears and genre chips cannot be resolved from `include`.
   * - `fields[genres]=name` — keep included genre objects small.
   * - `include=genres` — compound documents; names resolved in `normalizeKitsuMangas`.
   */
  const fetchMangaFromKitsu = async (query: string, page: number) => {
    try {
      const offset = (page - 1) * mangasPerPage;
      const data = (await searchManga(query, mangasPerPage, offset)) as KitsuMangaListResponse;
      return {
        mangas: normalizeKitsuMangas(data),
        totalCount: data.meta?.count || 0,
      };
    } catch (error) {
      console.error('Error fetching manga:', error);
      return { mangas: [], totalCount: 0 };
    }
  };

  // Refetch whenever the user changes page or search text (dependencies match “what the list depends on”).
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

  /** Called by `SearchBar`; resets to page 1 and keeps the address bar in sync for sharing/bookmarking. */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="bg-black w-full min-h-screen font-body">
      <Navbar relative={true} />
      {/* Hero strip: CSS gradient overlay on top of imported JPEG for readability behind the input. */}
      <div
        className="bg-cover text-center w-full h-64 mx-auto pt-32"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.89), rgba(0, 0, 0, 1)), url(${searchPic})`,
        }}
      >
        <SearchBar query={searchQuery} onSearch={handleSearch} />
      </div>

      <div className="bg-black w-full space-y-8 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            // Skeleton grid: pulse placeholders approximating card shape while `fetch` is in flight.
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
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          )}
        </div>

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
