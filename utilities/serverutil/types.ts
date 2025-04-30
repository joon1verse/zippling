// utilities/serverutil/types.ts
export type RoomPost = {
  id: string;           // uuid
  title: string;
  link: string;
  tag: string[];
  source?: string | null;
  postedAt?: string | null;
  crawledAt?: string | null;
  price?: string | null;
};
