const BASE = 'https://kitsu.io/api/edge';

export async function searchManga(query: string, limit: number, offset: number) {
    const response = await fetch(
        `${BASE}/manga?filter[text]=${encodeURIComponent(query)}&page[limit]=${limit}&page[offset]=${offset}&fields[genres]=name&include=genres`,
    );
    if (!response.ok) throw new Error('Failed to fetch manga');
    const data = await response.json();
    return data;
}

export async function getMangaById(id: string) {
    const response = await fetch(`${BASE}/manga/${encodeURIComponent(id)}?fields[genres]=name&include=genres`);
    if (!response.ok) throw new Error('Manga not found');
    const data = await response.json();
    return data;
}