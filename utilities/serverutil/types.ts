// utilities/serverutil/types.ts
export type RoomPost = {
  title: string;
  link: string;
  tag: string[];
  source: string;
  postedAt?: string;
  crawledAt?: string;
  price?: string;
};
