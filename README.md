# 🏠 Smart Home Light Control

ระบบควบคุมไฟในบ้านผ่านเว็บ แบบ Realtime ด้วย React + Supabase + NodeMCU

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase)
![ESP8266](https://img.shields.io/badge/NodeMCU-ESP8266-E7352C?logo=espressif)
![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-222?logo=github)

---

## สถาปัตยกรรม

```
┌──────────────┐       Realtime (WebSocket)       ┌──────────────┐
│   React App  │ ◄──────────────────────────────► │   Supabase   │
│ (GitHub Pages)│  UPDATE lights SET s = true/false │  (PostgreSQL) │
└──────────────┘                                   └──────┬───────┘
                                                          │
                                                   REST API (polling)
                                                          │
                                                   ┌──────▼───────┐
                                                   │   NodeMCU    │
                                                   │  (ESP8266)   │
                                                   │  → Relay     │
                                                   │  → หลอดไฟ    │
                                                   └──────────────┘
```

## โครงสร้างโปรเจค

```
smart-home/
├── src/
│   ├── App.tsx          # UI หลัก (sticky header, light grid, toggle)
│   ├── supabase.ts      # Supabase client config + Light type
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles (ถ้ามี)
├── nodemcu/
│   └── nodemcu.ino      # โค้ด Arduino สำหรับ ESP8266
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Database Schema

| Column     | Type        | Default | คำอธิบาย                    |
| ---------- | ----------- | ------- | --------------------------- |
| id         | INT (PK)    | —       | ID ของหลอดไฟ                |
| s          | BOOLEAN     | false   | สถานะเปิด/ปิด              |
| act        | BOOLEAN     | true    | เปิดใช้งานอุปกรณ์นี้หรือไม่ |
| label      | TEXT        | ''      | ชื่อห้อง/ตำแหน่ง            |
| updated_at | TIMESTAMPTZ | now()   | เวลาอัพเดทล่าสุด           |

---

## เริ่มต้นใช้งาน

### 1. สร้าง Supabase Project

สมัครที่ [supabase.com](https://supabase.com) แล้วสร้าง project ใหม่ จากนั้นไป **SQL Editor** รัน:

```sql
CREATE TABLE lights (
  id INT PRIMARY KEY,
  s BOOLEAN DEFAULT false,
  act BOOLEAN DEFAULT true,
  label TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO lights (id, s, act, label) VALUES
(1, false, true, 'ห้องนั่งเล่น'),
(2, false, true, 'ห้องนอน'),
(3, false, true, 'ห้องครัว');

-- เปิด Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE lights;

-- เปิด RLS
ALTER TABLE lights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_read" ON lights
  FOR SELECT USING (true);

CREATE POLICY "allow_update" ON lights
  FOR UPDATE USING (true)
  WITH CHECK (true);
```

จด **Project URL** และ **anon key** จาก Settings → API

### 2. สร้าง React Project

```bash
npm create vite@latest smart-home -- --template react-ts
cd smart-home
npm install @supabase/supabase-js
```

### 3. ตั้งค่า Supabase Client

สร้างไฟล์ `src/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Light = {
  id: number;
  s: boolean;
  act: boolean;
  label: string;
};
```

แล้ววาง `App.tsx` ที่ให้ไว้แทนที่ `src/App.tsx`

### 4. Deploy GitHub Pages

```bash
npm install -D gh-pages
```

แก้ `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/smart-home/",   // ← ชื่อ repo
  plugins: [react()],
});
```

เพิ่มใน `package.json`:

```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

```bash
npm run deploy
```

เว็บจะอยู่ที่ `https://YOUR_USERNAME.github.io/smart-home/`

### 5. NodeMCU (Arduino IDE)

ติดตั้ง Board ESP8266 และ Library `ArduinoJson`, `ESP8266WiFi`, `ESP8266HTTPClient`

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASS";
const char* supabaseUrl = "https://YOUR_PROJECT.supabase.co";
const char* apiKey = "YOUR_ANON_KEY";

#define RELAY_PIN D1
int myLightId = 1;

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println("Connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure();

    HTTPClient http;
    String url = String(supabaseUrl) +
      "/rest/v1/lights?id=eq." + myLightId +
      "&select=s,act";
    http.begin(client, url);
    http.addHeader("apikey", apiKey);
    http.addHeader("Authorization", "Bearer " + String(apiKey));

    int code = http.GET();
    if (code == 200) {
      String payload = http.getString();
      DynamicJsonDocument doc(256);
      deserializeJson(doc, payload);

      bool s = doc[0]["s"];
      bool act = doc[0]["act"];

      digitalWrite(RELAY_PIN, (s && act) ? HIGH : LOW);
    }
    http.end();
  }
  delay(2000);
}
```

---

## ฟีเจอร์

- **Realtime Sync** — กดเปิด/ปิดไฟจากเว็บ อัพเดททันทีผ่าน WebSocket
- **Optimistic Update** — UI เปลี่ยนทันทีไม่ต้องรอ server ถ้า error จะ rollback
- **Dynamic Cards** — แสดงเฉพาะอุปกรณ์ที่ `act = true` เพิ่ม/ลบใน DB = card โผล่/หายอัตโนมัติ
- **Responsive** — 1 col (มือถือ) → 2 col (≥480px) → 3 col (≥768px) → 4 col (≥1024px)
- **Sticky Header** — แถบควบคุมติดด้านบนตลอดขณะ scroll
- **กดที่การ์ดทั้งใบ** — ไม่ต้องกดที่ switch อย่างเดียว
- **Keyboard Accessible** — รองรับ Enter / Space

---

## การต่อวงจร

```
NodeMCU          Relay Module          หลอดไฟ
────────         ────────────          ────────
D1  ──────────►  IN
3V3 ──────────►  VCC
GND ──────────►  GND
                 COM  ──────────────►  สาย L (AC)
                 NO   ──────────────►  หลอดไฟ
```

> ⚠️ **ระวัง** การต่อไฟ AC 220V ต้องระมัดระวัง ควรใช้ relay module ที่รองรับแรงดันสูง

---

## License

MIT