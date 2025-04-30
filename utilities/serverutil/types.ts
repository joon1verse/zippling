// utilities/serverutil/types.ts
export type RoomPost = {
  id: string;
  title: string;
  link: string;
  tag: string[];
  source?: string | null;
  price?: string | null;
  postedAt?: string | null;
  crawledAt?: string | null;
  event_time: string;        
};
