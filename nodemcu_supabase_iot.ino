#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASS";
const char* supabaseUrl = "https://YOUR_PROJECT.supabase.co";
const char* apiKey = "YOUR_ANON_KEY";

const int NUM_LIGHTS = 4;
int lightIds[NUM_LIGHTS] = {1, 2, 3, 4};
int relayPins[NUM_LIGHTS] = {D1, D2, D5, D6};

// === สถานะ LED แจ้งเตือน (ใช้ LED บน board) ===
#define STATUS_LED D4  // LED_BUILTIN บน NodeMCU (active LOW)

void setupWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);  // ให้ reconnect เอง
  WiFi.begin(ssid, password);

  Serial.print("Connecting WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));  // กระพริบ
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected: " + WiFi.localIP().toString());
    digitalWrite(STATUS_LED, LOW);   // ติดค้าง = online
  } else {
    Serial.println("\nWiFi Failed — will retry in loop");
    digitalWrite(STATUS_LED, HIGH);  // ดับ = offline
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(STATUS_LED, OUTPUT);

  for (int i = 0; i < NUM_LIGHTS; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], LOW);
  }

  setupWiFi();
}

void loop() {
  // === ถ้า WiFi หลุด → พยายาม reconnect ===
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost — reconnecting...");
    digitalWrite(STATUS_LED, HIGH);  // ดับ LED = offline
    WiFi.disconnect();
    WiFi.begin(ssid, password);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
      attempts++;
    }

    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("Reconnect failed — retry next loop");
      delay(5000);  // รอ 5 วิ แล้วลองใหม่
      return;
    }

    Serial.println("Reconnected!");
    digitalWrite(STATUS_LED, LOW);
  }

  // === poll ปกติ ===
  for (int i = 0; i < NUM_LIGHTS; i++) {
    WiFiClientSecure client;
    client.setInsecure();

    HTTPClient http;
    String url = String(supabaseUrl) +
      "/rest/v1/lights?id=eq." + lightIds[i] +
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

      digitalWrite(relayPins[i], (s && act) ? HIGH : LOW);
    } else {
      Serial.println("HTTP error light " + String(lightIds[i]) + ": " + String(code));
    }
    http.end();
    delay(100);
  }

  delay(2000);
}