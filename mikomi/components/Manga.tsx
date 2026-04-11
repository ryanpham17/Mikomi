import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { getMangaById } from '../src/api/Kitsu';
import Navbar from './Navbar';
import Footer from './Footer';
import searchPic from './images/searchPic.jpeg';


interface PosterImage {
    small?: string;
    medium?: string;
    large?: string;
}

interface MangaAttributes {
    canonicalTitle: string;
    synopsis: string | null;
    averageRating: string | null;
    posterImage: PosterImage | null;
}

interface ResourceIdentifier {
    id: string;
    type: string;
}

interface includedGenre {
    id: string;
    type: string;
    attributes: { name?: string}
}

interface MangaResource {
    id: string;
    attributes: MangaAttributes;
    relationships: {
        genres?: { data: ResourceIdentifier[] };
    };
}

interface KitsuSingleResponse {
    data: MangaResource;
    included?: includedGenre[];
}

type MangaLocationState = { returnTo?: string };

function genreNamesFromResponse(resource: MangaResource, included: includedGenre[]): string[] {
    const map = new Map<string, string>();
    for (const g of included ?? []) {
        if (g.type === 'genres' && g.attributes?.name) {
            map.set(`${g.type}:${g.id}`, g.attributes.name);
        }
    }
    const refs = resource.relationships?.genres?.data ?? [];
    return refs.map((ref) => map.get(`${ref.type}:${ref.id}`)).filter((name): name is string => Boolean(name));
}

const Manga: React.FC = () => {
    const { mangaId } = useParams<{ mangaId: string }>();
    const location = useLocation();
    const returnTo =
        (location.state as MangaLocationState | null)?.returnTo ?? '/search';
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resource, setResource] = useState<MangaResource | null>(null);
    const [genreNames, setGenreNames] = useState<string[]>([]);

    useEffect(() => {
        if (!mangaId) {
            setLoading(false);
            setError("Missing manga ID");
            return;
        }

        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const json = (await getMangaById(mangaId)) as KitsuSingleResponse;
                if (cancelled) return;
                if(!json.data) {
                    setError("No data returned");
                    setResource(null);
                    setGenreNames([]);
                    return;
                }
                setResource(json.data);
                setGenreNames(genreNamesFromResponse(json.data, json.included ?? []));
            } catch {
                if (!cancelled) {
                    setError("Could not load this manga.");
                    setResource(null);
                    setGenreNames([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [mangaId]);

    const formatRating = (rating: string | null) => {
        if (!rating) return 'No rating';
        return (parseFloat(rating) / 10).toFixed(1);
    };

    

  const attrs = resource?.attributes;
  const title = attrs?.canonicalTitle ?? 'Manga';
  const posterUrl = attrs?.posterImage?.large ?? attrs?.posterImage?.medium ?? attrs?.posterImage?.small;
  const synopsis = attrs?.synopsis?.trim() || 'No synopsis available.';
  const normalizedRating = parseFloat(attrs?.averageRating || '0') / 10;
  /** 0–1 share of the max score (Kitsu averageRating is 0–100 → displayed /10). */
  const ratingShare = Math.min(1, Math.max(0, normalizedRating / 10));
  /** How many full/partial stars (0–5) that share represents. */
  const starFillTotal = ratingShare * 5;

  return (
    <div className="min-h-screen w-full bg-black pb-32 font-body text-white max-[380px]:pb-40 sm:pb-36">
      <Navbar relative={true} />
      <div
        className="mx-auto w-full bg-cover bg-center px-5 pb-3 pt-16 sm:h-48 sm:px-6 sm:pb-6 sm:pt-24 md:h-56 md:pt-28 lg:h-64 lg:pt-32"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.89), rgba(0, 0, 0, 1)), url(${searchPic})`,
        }}
      >
      </div>
      <div className="mx-auto max-w-5xl px-5 pt-3 sm:px-6 sm:pt-6">
          <Link
            to={returnTo}
            className="mb-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-white transition-colors duration-410 ease-in-out hover:text-gray-300 sm:mb-6 sm:gap-2 sm:text-base"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
            Back to results
          </Link>
          {loading && <p className="text-white text-center">Loading…</p>}
          {!loading && error && <p className="text-red-400 text-center">{error}</p>}
          {!loading && !error && resource && (
            <div className="flex min-w-0 flex-col gap-5 sm:gap-8 md:flex-row md:items-start">
              <div className="mx-auto w-full max-w-[11rem] shrink-0 sm:max-w-xs md:mx-0 md:w-72">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={title}
                    className="aspect-[2/3] w-full rounded-lg object-cover shadow-lg"
                  />
                ) : (
                  <div className="grid aspect-[2/3] w-full place-items-center rounded-lg bg-gradient-to-br from-gray-300 to-gray-100 text-4xl sm:text-6xl">
                    📚
                  </div>
                )}
              </div>


              <div className="min-w-0 flex-1 space-y-3 sm:space-y-5">
                <h1 className="text-balance break-words text-xl font-extrabold leading-snug sm:text-3xl md:text-4xl">
                  {title}
                </h1>


                <div>
                  <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:mb-2 sm:text-sm">
                    Genres
                  </h2>
                  {genreNames.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {genreNames.map((g, i) => (
                        <span
                          key={`${g}-${i}`}
                          className="rounded bg-white px-1.5 py-0.5 text-[0.65rem] font-medium text-black sm:px-2 sm:py-1 sm:text-xs"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 sm:text-sm">No genres listed.</p>
                  )}
                </div>


                <div className="flex flex-wrap items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const portion = Math.min(1, Math.max(0, starFillTotal - i));
                    return (
                      <div key={i} className="relative h-4 w-4 shrink-0 text-yellow-400 sm:h-5 sm:w-5">
                        <Star
                          className="absolute inset-0 h-4 w-4 fill-none stroke-white text-white sm:h-5 sm:w-5"
                          strokeWidth={1.5}
                        />
                        <div
                          className="absolute inset-y-0 left-0 overflow-hidden"
                          style={{ width: `${portion * 100}%` }}
                          aria-hidden
                        >
                          <Star
                            className="absolute left-0 top-0 h-4 w-4 fill-current stroke-current text-yellow-400 sm:h-5 sm:w-5"
                            strokeWidth={1.5}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <span className="ml-2 text-xs font-bold text-white sm:text-sm">
                    {formatRating(attrs?.averageRating ?? null)}/10
                  </span>
                </div>


                <div>
                  <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:mb-2 sm:text-sm">
                    Synopsis
                  </h2>
                  <p className="text-pretty whitespace-pre-wrap break-words text-xs leading-relaxed text-white sm:text-base">
                    {synopsis}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      <Footer />
    </div>
  );
};


export default Manga;
