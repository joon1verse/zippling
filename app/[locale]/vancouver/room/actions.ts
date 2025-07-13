'use server';

import { createCacheFirstSupabaseServer } from "@server/supabaseCacheServer";
import { revalidatePath } from "next/cache";

export async function deleteRoomListingAction(postId: number, locale: string) {
  const supabase = createCacheFirstSupabaseServer();
  const { error } = await supabase
    .from('vancouver_roomlistings')
    .delete()
    .eq('id', postId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/${locale}/vancouver/rooms`);
  return { success: true };
}