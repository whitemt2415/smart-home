// src/hooks/useLights.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Light = { id: number; s: boolean; act: boolean; label: string };

export function useLights() {
  const [lights, setLights] = useState<Light[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ดึงเฉพาะ act = true มาแสดง
    supabase
      .from("lights")
      .select("*")
      .eq("act", true)
      .order("id")
      .then(({ data }) => {
        if (data) setLights(data);
        setLoading(false);
      });

    // realtime: ถ้า act เปลี่ยน → เพิ่ม/ลบ card อัตโนมัติ
    const channel = supabase
      .channel("lights-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lights" },
        (payload) => {
          const row = payload.new as Light;
          setLights((prev) => {
            if (!row.act) return prev.filter((l) => l.id !== row.id);
            const exists = prev.find((l) => l.id === row.id);
            if (exists) return prev.map((l) => (l.id === row.id ? row : l));
            return [...prev, row].sort((a, b) => a.id - b.id);
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggle = async (id: number) => {
    const light = lights.find((l) => l.id === id);
    if (!light) return;
    await supabase.from("lights").update({ s: !light.s }).eq("id", id);
  };

  return { lights, loading, toggle };
}
