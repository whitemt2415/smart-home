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

  // ref เก็บ lights ล่าสุด — ให้ toggle อ่านได้โดยไม่มี stale closure
  const lightsRef = useRef<Light[]>([]);
  useEffect(() => {
    lightsRef.current = lights;
  }, [lights]);

  // Set ของ id ที่กำลัง pending อยู่ — realtime จะข้ามการ overwrite id พวกนี้
  const pendingIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const fetchLights = async (): Promise<void> => {
      const { data, error } = await supabase
        .from("lights")
        .select("*")
        .eq("act", true)
        .order("id");

      if (!error && data) setLights(data as Light[]);
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

            // ✅ ถ้า id นี้กำลัง pending อยู่ → ข้ามไป ไม่ overwrite optimistic state
            if (pendingIds.current.has(row.id)) return prev;

            const exists = prev.find((l) => l.id === row.id);
            if (exists) return prev.map((l) => (l.id === row.id ? row : l));
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

  // toggle — อ่านจาก ref, ล็อก id ใน pendingIds ระหว่าง await
  const toggle = useCallback(async (id: number): Promise<void> => {
    const light = lightsRef.current.find((l) => l.id === id);
    if (!light || pendingIds.current.has(id)) return;

    const nextState = !light.s;

    // ล็อก id ก่อน optimistic update
    pendingIds.current.add(id);
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

    // ปลดล็อก — realtime รับ event ได้ตามปกติแล้ว
    pendingIds.current.delete(id);
  }, []);

  // allOff — ล็อกทุก id ที่ on ระหว่าง await
  const allOff = useCallback(async (): Promise<void> => {
    if (busy) return;
    const onIds = lightsRef.current.filter((l) => l.s).map((l) => l.id);
    if (onIds.length === 0) return;

    setBusy(true);
    onIds.forEach((id) => pendingIds.current.add(id));
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

    onIds.forEach((id) => pendingIds.current.delete(id));
    setBusy(false);
  }, [busy]);

  // allOn — ล็อกทุก id ที่ off ระหว่าง await
  const allOn = useCallback(async (): Promise<void> => {
    if (busy) return;
    const offIds = lightsRef.current.filter((l) => !l.s).map((l) => l.id);
    if (offIds.length === 0) return;

    setBusy(true);
    offIds.forEach((id) => pendingIds.current.add(id));
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

    offIds.forEach((id) => pendingIds.current.delete(id));
    setBusy(false);
  }, [busy]);

  return { lights, loading, connected, busy, toggle, allOff, allOn };
}