// src/hooks/useLights.ts

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import type { Light } from "../types/light";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useLights() {
  const [lights, setLights] = useState<Light[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);

  // ✅ useRef เก็บค่า lights ล่าสุดเสมอ — ไม่มี stale closure
  const lightsRef = useRef<Light[]>([]);
  useEffect(() => {
    lightsRef.current = lights;
  }, [lights]);

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

  // ✅ toggle — อ่านค่าจาก lightsRef แทน lights (ไม่มี stale closure)
  //    ไม่ depend on [lights] จึงไม่ recreate ทุก render
  const toggle = useCallback(async (id: number): Promise<void> => {
    const light = lightsRef.current.find((l) => l.id === id);
    if (!light) return;

    const nextState = !light.s;

    // optimistic update ด้วยค่าที่อ่านจาก ref
    setLights((prev) =>
      prev.map((l) => (l.id === id ? { ...l, s: nextState } : l)),
    );

    const { error } = await supabase
      .from("lights")
      .update({ s: nextState })
      .eq("id", id);

    if (error) {
      // rollback กลับค่าเดิม
      setLights((prev) =>
        prev.map((l) => (l.id === id ? { ...l, s: light.s } : l)),
      );
    }
  }, []); // ✅ [] — stable function ไม่ recreate ทุก render

  // ✅ allOff — มี busy lock ป้องกันกด 2 ครั้งซ้อน
  const allOff = useCallback(async (): Promise<void> => {
    if (busy) return;

    const onIds = lightsRef.current.filter((l) => l.s).map((l) => l.id);
    if (onIds.length === 0) return;

    setBusy(true);
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

    setBusy(false);
  }, [busy]);

  // ✅ allOn — มี busy lock ป้องกันกด 2 ครั้งซ้อน
  const allOn = useCallback(async (): Promise<void> => {
    if (busy) return;

    const offIds = lightsRef.current.filter((l) => !l.s).map((l) => l.id);
    if (offIds.length === 0) return;

    setBusy(true);
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

    setBusy(false);
  }, [busy]);

  return { lights, loading, connected, busy, toggle, allOff, allOn };
}