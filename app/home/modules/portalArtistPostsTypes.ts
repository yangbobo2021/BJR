import type { PortableTextBlock } from "@portabletext/types";

export type Visibility = "public" | "friend" | "patron" | "partner";
export type PostType = "qa" | "creative" | "civic" | "cosmic";

export const POST_TYPES: { value: "" | PostType; label: string }[] = [
  { value: "", label: "All" },
  { value: "qa", label: "Q&A" },
  { value: "creative", label: "Creative" },
  { value: "civic", label: "Civic" },
  { value: "cosmic", label: "Cosmic" },
];

export type SanityImageValue = {
  _type: "image";
  url?: string;
  maxWidth?: number | string;
  width?: number | string;
  metadata?: {
    dimensions?: {
      width?: number;
      height?: number;
      aspectRatio?: number;
    };
  };
};

export type Post = {
  slug: string;
  title?: string;
  publishedAt: string;
  visibility: Visibility;
  pinned?: boolean;
  postType?: PostType;
  body: PortableTextBlock[];
};

export type ArtistPostsResponse = {
  ok: boolean;
  posts: Post[];
  nextCursor: string | null;
  correlationId?: string;
};

export type SeenOkResponse = {
  ok: true;
  already?: boolean;
  seenCount?: number;
  correlationId?: string;
};

export type SubmitFailCode =
  | "NOT_AUTHED"
  | "TIER_REQUIRED"
  | "RATE_LIMIT"
  | "TOO_LONG"
  | "EMPTY"
  | "BAD_REQUEST"
  | "SERVER_ERROR";

export type SubmitOk = { ok: true };

export type SubmitFail = {
  ok: false;
  code: SubmitFailCode;
  maxChars?: number;
  limitPerDay?: number;
};

export type SubmitResponse = SubmitOk | SubmitFail;

export type PortalArtistPostsProps = {
  title?: string;
  pageSize: number;
  requireAuthAfter: number;
  minVisibility: Visibility;
  authorName?: string;
  authorInitials?: string;
  authorAvatarSrc?: string;
  defaultInlineImageMaxWidthPx?: number;
};