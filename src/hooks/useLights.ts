//src\hooks\useLights.ts

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Light } from "../types/light";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useLights() {
  const [lights, setLights] = useState<Light[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);

  // fetch + realtime subscribe
  useEffect(() => {
    const fetchLights = async (): Promise<void> => {
      const { data, error } = await supabase
        .from("lights")
        .select("*")
        .eq("act", true)
        .order("id");

      if (!error && data) {
        setLights(data as Light[]);
      }
      setLoading(false);
    };

    fetchLights();

    const channel = supabase
      .channel("lights-realtime")
      .on<Light>(
        "postgres_changes",
        { event: "*", schema: "public", table: "lights" },
        (payload: RealtimePostgresChangesPayload<Light>) => {
          const row = payload.new as Light;

          setLights((prev) => {
            if (payload.eventType === "DELETE" || !row.act) {
              return prev.filter(
                (l) => l.id !== (row.id ?? (payload.old as Light).id),
              );
            }
            const exists = prev.find((l) => l.id === row.id);
            if (exists) {
              return prev.map((l) => (l.id === row.id ? row : l));
            }
            return [...prev, row].sort((a, b) => a.id - b.id);
          });
        },
      )
      .subscribe((status: string) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // toggle single light
  const toggle = useCallback(
    async (id: number): Promise<void> => {
      const light = lights.find((l) => l.id === id);
      if (!light) return;

      setLights((prev) =>
        prev.map((l) => (l.id === id ? { ...l, s: !l.s } : l)),
      );

      const { error } = await supabase
        .from("lights")
        .update({ s: !light.s })
        .eq("id", id);

      if (error) {
        setLights((prev) =>
          prev.map((l) => (l.id === id ? { ...l, s: light.s } : l)),
        );
      }
    },
    [lights],
  );

  // all off
  const allOff = useCallback(async (): Promise<void> => {
    const onIds = lights.filter((l) => l.s).map((l) => l.id);
    if (onIds.length === 0) return;

    setLights((prev) => prev.map((l) => ({ ...l, s: false })));

    const { error } = await supabase
      .from("lights")
      .update({ s: false })
      .in("id", onIds);

    if (error) {
      const { data } = await supabase
        .from("lights")
        .select("*")
        .eq("act", true)
        .order("id");
      if (data) setLights(data as Light[]);
    }
  }, [lights]);

  // all on
  const allOn = useCallback(async (): Promise<void> => {
    const offIds = lights.filter((l) => !l.s).map((l) => l.id);
    if (offIds.length === 0) return;

    setLights((prev) => prev.map((l) => ({ ...l, s: true })));

    const { error } = await supabase
      .from("lights")
      .update({ s: true })
      .in("id", offIds);

    if (error) {
      const { data } = await supabase
        .from("lights")
        .select("*")
        .eq("act", true)
        .order("id");
      if (data) setLights(data as Light[]);
    }
  }, [lights]);

  return { lights, loading, connected, toggle, allOff, allOn };
}
