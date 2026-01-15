
#include <Arduino.h>

// ============================================================================
// CONFIGURAZIONE TEST
// ============================================================================
static const float TEST_peso_min_kg = 0.0f;
static const float TEST_peso_max_kg = 40.0f;
static const uint64_t TEST_sleep_us = 20ULL * 1000000ULL; // 20 secondi

// ============================================================================
// CATALOGO ERRORI/ALERT COMUNI (cross-sensor)
// ============================================================================
enum ErroreComune {
  ERR_COMMON_NONE = 0,
  
  // Input Validation
  ERR_DATA_NULL = 100,
  ERR_DATA_INVALID_NUMBER,
  ERR_DATA_NEGATIVE_NOT_ALLOWED,
  
  // Out of Range
  ERR_MEASURE_OUT_OF_RANGE = 200,
  
  // Sensor Hardware
  ERR_SENSOR_NOT_READY = 300,
  ERR_SENSOR_TIMEOUT,
  ERR_SENSOR_OFFLINE,
  
  // Network/Delivery
  ERR_NETWORK_OFFLINE = 400,
  ERR_UPLOAD_FAILED,
  ERR_UPLOAD_RETRY_EXHAUSTED,
  
  // Alert Soglie
  ALERT_THRESHOLD_LOW = 500,
  ALERT_THRESHOLD_HIGH
};

// ============================================================================
// CATALOGO ERRORI SPECIFICI PESO (PS)
// ============================================================================
enum ErrorePeso {
  ERR_PS_NONE = 0,
  ERR_PS_SATURAZIONE_ADC = 2030,
  ERR_PS_TARATURA_NON_PRESENTE = 2060,
  ERR_PS_TARATURA_NON_VALIDA = 2070,
  ERR_PS_CONVERSIONE_KG_FALLITA = 2080
};

// ============================================================================
// STRUTTURA RISULTATO VALIDAZIONE PESO
// ============================================================================
struct RisultatoValidazionePeso {
  bool valido;
  ErroreComune errore_comune;
  ErrorePeso errore_specifico;
  float valore_kg;
};

// ============================================================================
// FUNZIONI VALIDAZIONE COMUNI
// ============================================================================

static bool validaDatoNumerico(float valore, ErroreComune* errore) {
  if (isnan(valore)) {
    *errore = ERR_DATA_INVALID_NUMBER;
    Serial.println("ERR_DATA_INVALID_NUMBER: valore NaN");
    return false;
  }
  
  if (isinf(valore)) {
    *errore = ERR_DATA_INVALID_NUMBER;
    Serial.println("ERR_DATA_INVALID_NUMBER: valore infinito");
    return false;
  }
  
  return true;
}

static bool validaDatoNegativo(float valore, ErroreComune* errore) {
  if (valore < 0.0f) {
    *errore = ERR_DATA_NEGATIVE_NOT_ALLOWED;
    Serial.println("ERR_DATA_NEGATIVE_NOT_ALLOWED: peso non può essere negativo");
    return false;
  }
  
  return true;
}

static bool validaRangePeso(float valore, ErroreComune* errore) {
  if (valore < TEST_peso_min_kg || valore > TEST_peso_max_kg) {
    *errore = ERR_MEASURE_OUT_OF_RANGE;
    Serial.print("ERR_MEASURE_OUT_OF_RANGE: ");
    Serial.print(valore, 3);
    Serial.print(" kg fuori da [");
    Serial.print(TEST_peso_min_kg, 1);
    Serial.print(", ");
    Serial.print(TEST_peso_max_kg, 1);
    Serial.println("]");
    return false;
  }
  
  return true;
}

// ============================================================================
// FUNZIONI SPECIFICHE PESO
// ============================================================================

static bool verificaTaraturaPeso(ErrorePeso* errore) {
  // TEST: simulazione taratura presente e valida
  // In produzione: controllare presenza calibrazione in EEPROM/NVS
  
  bool taratura_presente = true;
  bool taratura_valida = true;
  
  if (!taratura_presente) {
    *errore = ERR_PS_TARATURA_NON_PRESENTE;
    Serial.println("ERR_PS_TARATURA_NON_PRESENTE: calibrazione mancante");
    return false;
  }
  
  if (!taratura_valida) {
    *errore = ERR_PS_TARATURA_NON_VALIDA;
    Serial.println("ERR_PS_TARATURA_NON_VALIDA: calibrazione corrotta");
    return false;
  }
  
  return true;
}

static void taraturaDifferenzaPeso() {
  Serial.println("Esecuzione taratura peso...");
  // TEST: senza sensore fisico, la taratura non fa nulla
  // In produzione: applicare offset di taratura dal valore memorizzato
}

static RisultatoValidazionePeso acquisisciEValidaPeso() {
  RisultatoValidazionePeso risultato = {
    .valido = true,
    .errore_comune = ERR_COMMON_NONE,
    .errore_specifico = ERR_PS_NONE,
    .valore_kg = 0.0f
  };
  
  // STEP 1: Verifica taratura presente e valida
  if (!verificaTaraturaPeso(&risultato.errore_specifico)) {
    risultato.valido = false;
    return risultato;
  }
  
  // STEP 2: Lettura ADC (simulata in TEST)
  // In produzione: leggere valore ADC reale da load cell
  float valore_adc_raw = 12.5f; // TEST
  
  // STEP 3: Controllo saturazione ADC
  // In produzione: verificare se ADC è a 0 o full-scale
  // const uint32_t ADC_MIN = 0;
  // const uint32_t ADC_MAX = 8388607; // 24-bit ADC esempio
  // if (adc_reading <= ADC_MIN || adc_reading >= ADC_MAX) {
  //   risultato.errore_specifico = ERR_PS_SATURAZIONE_ADC;
  //   Serial.println("ERR_PS_SATURAZIONE_ADC: ADC saturo");
  //   risultato.valido = false;
  //   return risultato;
  // }
  
  // STEP 4: Conversione in kg con taratura
  float valore_kg = valore_adc_raw; // TEST: conversione simulata
  // In produzione: applicare formula calibrazione
  // valore_kg = (adc_raw - offset_taratura) * fattore_scala;
  
  if (isnan(valore_kg) || isinf(valore_kg)) {
    risultato.errore_specifico = ERR_PS_CONVERSIONE_KG_FALLITA;
    Serial.println("ERR_PS_CONVERSIONE_KG_FALLITA: conversione ha prodotto valore non valido");
    risultato.valido = false;
    return risultato;
  }
  
  risultato.valore_kg = valore_kg;
  
  // STEP 5: Validazioni comuni
  if (!validaDatoNumerico(valore_kg, &risultato.errore_comune)) {
    risultato.valido = false;
    return risultato;
  }
  
  if (!validaDatoNegativo(valore_kg, &risultato.errore_comune)) {
    risultato.valido = false;
    return risultato;
  }
  
  if (!validaRangePeso(valore_kg, &risultato.errore_comune)) {
    risultato.valido = false;
    return risultato;
  }
  
  return risultato;
}

// ============================================================================
// GESTIONE ALERT E CONFERME
// ============================================================================

static void invioAlertPesoFuoriRange(RisultatoValidazionePeso* risultato) {
  Serial.println("\n╔════════════════════════════════════╗");
  Serial.println("║        ALERT PESO ANOMALO         ║");
  Serial.println("╚════════════════════════════════════╝");
  
  if (risultato->errore_comune != ERR_COMMON_NONE) {
    Serial.print("Errore comune: ");
    Serial.print(risultato->errore_comune);
    Serial.print(" (");
    switch(risultato->errore_comune) {
      case ERR_DATA_INVALID_NUMBER: Serial.print("Dato non valido"); break;
      case ERR_DATA_NEGATIVE_NOT_ALLOWED: Serial.print("Valore negativo"); break;
      case ERR_MEASURE_OUT_OF_RANGE: Serial.print("Fuori range"); break;
      default: Serial.print("Altro"); break;
    }
    Serial.println(")");
  }
  
  if (risultato->errore_specifico != ERR_PS_NONE) {
    Serial.print("Errore specifico: ");
    Serial.print(risultato->errore_specifico);
    Serial.print(" (");
    switch(risultato->errore_specifico) {
      case ERR_PS_SATURAZIONE_ADC: Serial.print("Saturazione ADC"); break;
      case ERR_PS_TARATURA_NON_PRESENTE: Serial.print("Taratura assente"); break;
      case ERR_PS_TARATURA_NON_VALIDA: Serial.print("Taratura non valida"); break;
      case ERR_PS_CONVERSIONE_KG_FALLITA: Serial.print("Conversione fallita"); break;
      default: Serial.print("Altro"); break;
    }
    Serial.println(")");
  }
  
  Serial.print("Valore letto: ");
  Serial.print(risultato->valore_kg, 3);
  Serial.println(" kg");
  
  // In produzione: inviare alert via MQTT/HTTP
  // Payload esempio: {"error_common": 200, "error_ps": 0, "value": 45.3, "timestamp": ...}
  
  Serial.println();
}

static void confermaPesoValido(float valore_peso_kg) {
  Serial.println("\n✓ PESO VALIDO");
  Serial.print("  Peso misurato: ");
  Serial.print(valore_peso_kg, 3);
  Serial.println(" kg");
  
  // In produzione: inviare misura al cloud/database
  // Payload esempio: {"weight_kg": 12.5, "device_id": "PS001", "timestamp": ...}
  
  Serial.println();
}

// ============================================================================
// DEEP SLEEP
// ============================================================================

static void ritornoInDeepSleep() {
  Serial.print("→ Deep Sleep per ");
  Serial.print(TEST_sleep_us / 1000000);
  Serial.println(" secondi\n");
  
  delay(100); // Flush seriale
  
  esp_sleep_enable_timer_wakeup(TEST_sleep_us);
  esp_deep_sleep_start();
}

// ============================================================================
// CICLO PRINCIPALE SENSORE PESO
// ============================================================================

static void cicloSensorePeso() {
  Serial.println("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.println("  CICLO SENSORE PESO - AVVIO");
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 1) Esegui taratura
  taraturaDifferenzaPeso();
  
  // 2) Acquisizione e validazione completa
  RisultatoValidazionePeso risultato = acquisisciEValidaPeso();
  
  // 3) Gestione risultato
  if (!risultato.valido) {
    invioAlertPesoFuoriRange(&risultato);
  } else {
    confermaPesoValido(risultato.valore_kg);
  }
  
  // 4) Ritorno in deep sleep
  ritornoInDeepSleep();
}

// ============================================================================
// SETUP E LOOP
// ============================================================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("╔═══════════════════════════════════════╗");
  Serial.println("║   SENSORE PESO - Sistema Validazione ║");
  Serial.println("║   Firmware v1.0 - TEST MODE          ║");
  Serial.println("╚═══════════════════════════════════════╝");
  
  cicloSensorePeso();
}

void loop() {
  // Non utilizzato: tutto gestito da deep sleep
}
