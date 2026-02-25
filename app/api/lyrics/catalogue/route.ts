// web/app/api/lyrics/catalogue/route.ts
import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

type LyricsIdDoc = { trackId?: string };

type AlbumDoc = {
  _id: string;
  title?: string;
  slug?: string;
  tracks?: Array<{ id?: string }>;
};

function uniqNonEmpty(ids: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of ids) {
    const s = (raw ?? "").trim();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

export async function GET() {
  const qLyrics = `*[_type == "lyrics" && defined(trackId)]{ trackId }`;
  const qAlbums = `
    *[_type == "album" && publicPageVisible != false] | order(year desc, title asc) {
      _id,
      title,
      "slug": slug.current,
      tracks[]{ id }
    }
  `;

  const [lyricsDocs, albums] = await Promise.all([
    client.fetch<LyricsIdDoc[]>(qLyrics),
    client.fetch<AlbumDoc[]>(qAlbums),
  ]);

  const lyricTrackIds = new Set(
    uniqNonEmpty((lyricsDocs ?? []).map((d) => String(d.trackId ?? ""))),
  );

  const albumGroups = (albums ?? [])
    .map((a) => {
      const albumTrackIds = uniqNonEmpty(
        (a.tracks ?? []).map((t) => String(t?.id ?? "")),
      );

      const withLyrics = albumTrackIds.filter((tid) => lyricTrackIds.has(tid));

      return {
        albumId: a._id,
        albumSlug: (a.slug ?? "").trim() || null,
        albumTitle: (a.title ?? "").trim() || null,
        trackIds: withLyrics,
      };
    })
    .filter((g) => g.trackIds.length > 0);

  return NextResponse.json(
    { ok: true, albums: albumGroups },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}