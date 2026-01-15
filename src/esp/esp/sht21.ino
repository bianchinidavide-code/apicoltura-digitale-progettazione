
#include "Adafruit_HTU21DF.h" // Libreria per SHT21
#define PIN_SDA 14        // Pin SDA per SHT21
#define PIN_SCL 15        // Pin SCL per SHT21
Adafruit_HTU21DF htu = Adafruit_HTU21DF();

void setup_sht21(){
  Wire.begin(PIN_SDA, PIN_SCL);
  if (!htu.begin()) {
    Serial.println("ERRORE: SHT21 non trovato! Controlla pin 14 e 15.");
  } else {
    Serial.println("SHT21 OK.");
  }
}

float sht21_read_hum(){
  return htu.readHumidity();
}


float sht21_read_temp(){
  return htu.readTemperature();
}
