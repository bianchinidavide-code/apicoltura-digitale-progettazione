// VERSIONE 1.0

#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// --- PIN DEFINITIONS (ESP32-CAM) ---
#define PIN_DS18B20 13    // Pin dati sensore temperatura (Ricorda la resistenza!)
#define PIN_MIC_DO 12     // Pin digitale microfono (KY-037)


// --- OGGETTI SENSORI ---
OneWire oneWire(PIN_DS18B20);
DallasTemperature sensors(&oneWire);

// Variabili
float temp_acqua = 0.0;
float umidita = 0.0;
float temp_aria = 0.0;
String stato_rumore = "Silenzio";

void setup() {
  // Inizializza il Monitor Seriale
  Serial.begin(115200);
  Serial.println("--- AVVIO TEST SENSORI ---");
  delay(1000);

  // 1. Configurazione Microfono
  pinMode(PIN_MIC_DO, INPUT);
  Serial.println("Microfono configurato su Pin 12");

  setup_sht21();


  // 3. Avvio Sonda Temperatura
  sensors.begin();
  Serial.println("DS18B20 Inizializzato su Pin 13");
  
  Serial.println("--------------------------------");
}

void loop() {
  // --- A. Lettura Sonda Acqua (DS18B20) ---
  sensors.requestTemperatures(); 
  temp_acqua = sensors.getTempCByIndex(0);

  // --- B. Lettura SHT21 (Aria) ---
  umidita = sht21_read_hum();
  temp_aria = sht21_read_temp();

  // --- C. Lettura Microfono ---
  // Nota: Leggiamo lo stato attuale. Se il rumore è durato un millisecondo
  // potremmo non vederlo in questo istante esatto.
  int mic_val = digitalRead(PIN_MIC_DO);
  
  // Molti moduli KY-037 danno HIGH quando c'è rumore, altri LOW.
  // Regola la vite blu finché non cambia valore quando parli.
  if (mic_val == HIGH) { 
    stato_rumore = "RUMORE !!!";
  } else {
    stato_rumore = "Silenzio...";
  }

  // --- STAMPA SU MONITOR SERIALE ---
  Serial.print("Sonda Acqua: "); 
  if(temp_acqua == -127.00) {
    Serial.print("ERRORE COLLEGAMENTO");
  } else {
    Serial.print(temp_acqua);
    Serial.print(" C");
  }

  Serial.print(" | Aria: "); 
  Serial.print(temp_aria);
  Serial.print(" C / ");
  Serial.print(umidita);
  Serial.print(" %");

  Serial.print(" | Mic: "); 
  Serial.println(stato_rumore);

  // Rallentiamo a 1 secondo per leggere bene i dati
  delay(1000);
}
