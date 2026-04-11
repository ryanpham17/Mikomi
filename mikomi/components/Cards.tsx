/**
 * Cards.tsx — Search results page for MIKOMI.
 *
 * Responsibilities:
 * - Read `q` and optional `page` from the URL (e.g. `/search?q=naruto&page=8`) so pagination is shareable and restorable.
 * - Fetch manga from the public Kitsu JSON:API (`/api/edge/manga`).
 * - Render a grid of cards with loading skeletons, pagination, footer, and “back to top”.
 *
 * Child components kept in this file:
 * `MangaCard` — one result tile; `Pagination` — page numbers + prev/next; `BackToTopButton` — scroll UX.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
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
  /** Full path to restore search (query + page + optional #manga-id) when returning from detail. */
  returnTo: string;
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

/** `/search?q=…&page=…` plus `#manga-{id}` so we can scroll back to the opened card. */
function buildSearchReturnPath(query: string, page: number, highlightMangaId: string): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  const path = qs ? `/search?${qs}` : '/search';
  return `${path}#manga-${highlightMangaId}`;
}

const MangaCard: React.FC<MangaCardProps> = ({ manga, returnTo }) => {
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
   * Example: "82" → 8.2/10; stars fill in proportion to that score (0–100 → five stars).
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

  const normalizedRating = parseFloat(averageRating || '0') / 10;
  const ratingShare = Math.min(1, Math.max(0, normalizedRating / 10));
  const starFillTotal = ratingShare * 5;

  /** Match the old sample layout: one compact row of pills (max 4 + optional “+N”). */
  const maxGenreChips = 4;
  const visibleGenres = manga.genreNames.slice(0, maxGenreChips);
  const overflowCount = Math.max(0, manga.genreNames.length - maxGenreChips);

  const detailPath = `/${encodeURIComponent(canonicalTitle)}/${manga.id}`;

  return (
    <div
      id={`manga-card-${manga.id}`}
      role="link"
      tabIndex={0}
      onClick={() => navigate(detailPath, { state: { returnTo } })}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(detailPath, { state: { returnTo } });
        }
      }}
      className="mx-auto w-full max-w-[min(100%,20rem)] cursor-pointer overflow-hidden rounded-lg bg-primary shadow-lg transition-all duration-300 hover:transform sm:mx-0 sm:max-w-none sm:hover:scale-[1.02] md:hover:scale-105"
    >
      {/* Poster area: image fades in over a neutral gradient; emoji fallback if no URL or load error. */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-gray-300 to-gray-100 sm:h-52 md:h-60 lg:h-28.5">
        {!imageError && posterImage?.medium && (
          <img
            src={posterImage.medium}
            alt={canonicalTitle}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-30' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {(!imageLoaded || imageError) && (
          <div className="absolute inset-0 flex items-center justify-center text-3xl text-white sm:text-4xl">
            📚
          </div>
        )}
      </div>

      <div className="bg-primary p-2.5 text-left text-white sm:p-4">
        <h3 className="mb-1.5 line-clamp-2 text-sm font-bold leading-snug text-white sm:mb-2 sm:text-lg">
          {canonicalTitle}
        </h3>

        <div className="mb-2 flex min-h-[1.5rem] flex-wrap items-center gap-1 sm:mb-3 sm:min-h-[1.75rem]">
          {visibleGenres.length > 0 ? (
            <>
              {visibleGenres.map((genre, index) => (
                <span
                  key={`${manga.id}-${genre}-${index}`}
                  className={`rounded px-1.5 py-0.5 text-[0.65rem] font-medium sm:px-2 sm:py-1 sm:text-xs ${getGenreColors(index)}`}
                >
                  {genre}
                </span>
              ))}
              {overflowCount > 0 && (
                <span className="rounded bg-gray-600 px-1.5 py-0.5 text-[0.65rem] font-medium text-gray-200 sm:px-2 sm:py-1 sm:text-xs">
                  +{overflowCount}
                </span>
              )}
            </>
          ) : (
            <span className="rounded bg-gray-700/80 px-1.5 py-0.5 text-[0.65rem] font-medium text-gray-400 sm:px-2 sm:py-1 sm:text-xs">
              No genres
            </span>
          )}
        </div>

        <p className="mb-2 line-clamp-3 text-xs font-medium leading-snug text-gray-500 sm:mb-3 sm:line-clamp-3 sm:text-sm">
          {truncateText(synopsis, 100)}
        </p>

        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => {
            const portion = Math.min(1, Math.max(0, starFillTotal - i));
            return (
              <div key={i} className="relative h-3.5 w-3.5 shrink-0 text-yellow-400 sm:h-4 sm:w-4">
                <Star
                  className="absolute inset-0 h-3.5 w-3.5 fill-none stroke-white text-white sm:h-4 sm:w-4"
                  strokeWidth={1.5}
                />
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${portion * 100}%` }}
                  aria-hidden
                >
                  <Star
                    className="absolute left-0 top-0 h-3.5 w-3.5 fill-current stroke-current text-yellow-400 sm:h-4 sm:w-4"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            );
          })}
          <span className="ml-1 text-xs font-bold sm:text-sm">{formatRating(averageRating)}/10</span>
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
    <div className="flex max-w-full flex-wrap items-center justify-center gap-1 px-3 py-5 sm:gap-2 sm:px-4 sm:py-8">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg bg-gray-200 p-1.5 text-white hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50 sm:p-2"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {getVisiblePages().map((page, index) => (
        <button
          type="button"
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`min-w-[2rem] rounded-lg px-2 py-1.5 text-sm font-medium sm:min-w-[2.25rem] sm:px-3 sm:py-2 sm:text-base ${
            page === currentPage
              ? 'bg-gray-300 text-white'
              : page === '...'
                ? 'cursor-default text-gray-400'
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
        className="rounded-lg bg-gray-200 p-1.5 text-white hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50 sm:p-2"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
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
      className={`fixed bottom-24 right-4 z-50 rounded-full bg-gray-300 p-2.5 text-white shadow-lg transition-all duration-300 hover:bg-gray-300 sm:bottom-8 sm:right-8 sm:p-3 ${
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
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
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const searchQuery = searchParams.get('q') ?? '';
  const currentPage = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);

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

  /** After returning from a manga detail, scroll the grid so the card that was opened is in view. */
  useEffect(() => {
    if (loading) return;
    if (!location.hash.startsWith('#manga-')) return;
    const id = location.hash.replace('#manga-', '');
    const t = window.setTimeout(() => {
      document.getElementById(`manga-card-${id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 0);
    return () => clearTimeout(t);
  }, [loading, mangas, location.hash]);

  /** Called by `SearchBar`; resets to page 1 and syncs `q` in the URL (page + hash cleared). */
  const handleSearch = (query: string) => {
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    const search = next.toString();
    navigate({ pathname: '/search', search: search ? `?${search}` : '', hash: '' });
  };

  /** Updates `page` in the URL and clears any `#manga-…` hash so pagination does not trigger a stale scroll. */
  const goToPage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    if (page <= 1) next.delete('page');
    else next.set('page', String(page));
    const search = next.toString();
    navigate({ pathname: '/search', search: search ? `?${search}` : '', hash: '' });
  };

  return (
    <div className="bg-black w-full min-h-screen font-body">
      <Navbar relative={true} />
      {/* Hero strip: CSS gradient overlay on top of imported JPEG for readability behind the input. */}
      <div
        className="mx-auto w-full bg-cover bg-center px-5 pb-5 pt-20 text-center sm:h-56 sm:px-6 sm:pb-8 sm:pt-28 md:h-64 md:pt-32"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.89), rgba(0, 0, 0, 1)), url(${searchPic})`,
        }}
      >
        <div className="mx-auto w-full max-w-[min(100%,22rem)] sm:max-w-2xl">
          <SearchBar query={searchQuery} onSearch={handleSearch} />
        </div>
      </div>

      <div className="w-full space-y-5 bg-black pb-32 max-[380px]:pb-40 sm:space-y-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          {loading ? (
            // Skeleton grid: pulse placeholders approximating card shape while `fetch` is in flight.
            <div className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 sm:justify-items-stretch sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full max-w-[min(100%,20rem)] overflow-hidden rounded-lg bg-gray-300 animate-pulse sm:max-w-none"
                >
                  <div className="h-36 bg-gray-300 sm:h-52 md:h-60 lg:h-28.5" />
                  <div className="p-4">
                    <div className="mb-2 h-6 rounded bg-gray-300" />
                    <div className="mb-2 h-4 w-3/4 rounded bg-gray-300" />
                    <div className="mb-1 h-3 rounded bg-gray-300" />
                    <div className="h-3 w-1/2 rounded bg-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 sm:justify-items-stretch sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {mangas.map((manga) => (
                <MangaCard
                  key={manga.id}
                  manga={manga}
                  returnTo={buildSearchReturnPath(searchQuery, currentPage, manga.id)}
                />
              ))}
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
        />

        <Footer />
        <BackToTopButton />
      </div>
    </div>
  );
};

export default SearchResultsPage;
