import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { getMangaById } from '../src/api/Kitsu';
import Navbar from './Navbar';
import Footer from './Footer';

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

function genreNamesFromResponse(resource: MangaResource, included: includedGenre[]): string[] {
    const map = new Map<string, string>();
    for (const g of included ?? []) {
        if (g.type === 'genres' && g.attributes?.name) {
            map.set('${g.type}:${g.id}', g.attributes.name);
        }
    }
    const refs = resource.relationships?.genres?.data ?? [];
    return refs.map((ref) => map.get(`${ref.type}:${ref.id}`)).filter((name): name is string => Boolean(name));
}

const Manga: React.FC = () => {
    const { mangaId } = useParams<{ mangaId: string }>();
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
    <div className="bg-black w-full min-h-screen font-body text-white pb-16">
      <Navbar relative={true} />
      <div className="max-w-5xl mx-auto px-6 pt-8">
          {loading && <p className="text-white text-center">Loading…</p>}
          {!loading && error && <p className="text-red-400 text-center">{error}</p>}
          {!loading && !error && resource && (
            <div className="flex flex-col gap-8 md:flex-row md:items-start">
              <div className="w-full max-w-xs mx-auto md:mx-0 md:w-72 shrink-0">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={title}
                    className="w-full rounded-lg object-cover aspect-[2/3] shadow-lg"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] rounded-lg bg-gray-800 grid place-items-center text-6xl">
                    📚
                  </div>
                )}
              </div>


              <div className="min-w-0 flex-1 space-y-4">
                <h1 className="text-3xl font-bold">{title}</h1>


                {genreNames.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {genreNames.map((g) => (
                      <span
                        key={g}
                        className="px-2 py-1 rounded text-xs font-medium bg-gray-800 text-gray-200"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}


                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const portion = Math.min(1, Math.max(0, starFillTotal - i));
                    return (
                      <div key={i} className="relative h-5 w-5 shrink-0 text-yellow-400">
                        <Star
                          className="absolute inset-0 h-5 w-5 fill-none stroke-white text-white"
                          strokeWidth={1.5}
                        />
                        <div
                          className="absolute inset-y-0 left-0 overflow-hidden"
                          style={{ width: `${portion * 100}%` }}
                          aria-hidden
                        >
                          <Star
                            className="absolute left-0 top-0 h-5 w-5 fill-current stroke-current text-yellow-400"
                            strokeWidth={1.5}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <span className="font-bold text-sm ml-2 text-white">
                    {formatRating(attrs?.averageRating ?? null)}/10
                  </span>
                </div>


                <div>
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Synopsis
                  </h2>
                  <p className="text-white leading-relaxed whitespace-pre-wrap">{synopsis}</p>
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
