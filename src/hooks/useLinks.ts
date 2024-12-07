import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const useLinks = (profileId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('links_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'links',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          console.log('Change received!', payload);
          queryClient.invalidateQueries({ queryKey: ['links', profileId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, queryClient]);

  const { data: links, isLoading } = useQuery({
    queryKey: ['links', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', profileId)
        .order('position');
      
      if (error) throw error;
      return data;
    },
  });

  const addLink = useMutation({
    mutationFn: async ({ title, url }: { title: string; url: string }) => {
      const { data, error } = await supabase
        .from('links')
        .insert([
          {
            profile_id: profileId,
            title,
            url,
            position: links ? links.length : 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', profileId] });
    },
  });

  const updateLink = useMutation({
    mutationFn: async ({
      id,
      title,
      url,
      position,
    }: {
      id: string;
      title?: string;
      url?: string;
      position?: number;
    }) => {
      const { data, error } = await supabase
        .from('links')
        .update({ title, url, position })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', profileId] });
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('links').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', profileId] });
    },
  });

  return {
    links,
    isLoading,
    addLink,
    updateLink,
    deleteLink,
  };
};