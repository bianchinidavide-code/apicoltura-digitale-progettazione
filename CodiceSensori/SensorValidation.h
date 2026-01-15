#ifndef SENSOR_VALIDATION_H
#define SENSOR_VALIDATION_H

#include <Arduino. h>

// ============================================================================
// CATALOGO ERRORI/ALERT COMUNI (cross-sensor)
// ============================================================================
enum ErroreComune {
  ERR_COMMON_NONE = 0,
  
  // Input Validation
  ERR_DATA_NULL = 100,
  ERR_DATA_INVALID_NUMBER = 101,      // NaN, Inf
  ERR_DATA_NEGATIVE_NOT_ALLOWED = 102,
  
  // Out of Range
  ERR_MEASURE_OUT_OF_RANGE = 200,
  
  // Sensor Hardware
  ERR_SENSOR_NOT_READY = 300,
  ERR_SENSOR_TIMEOUT = 301,
  ERR_SENSOR_OFFLINE = 302,
  
  // Network/Delivery
  ERR_NETWORK_OFFLINE = 400,
  ERR_UPLOAD_FAILED = 401,
  ERR_UPLOAD_RETRY_EXHAUSTED = 402,
  
  // Timestamp
  ERR_TIMESTAMP_INVALID = 450,
  
  // Alert Soglie (non bloccanti)
  ALERT_THRESHOLD_LOW = 500,
  ALERT_THRESHOLD_HIGH = 501,
  ALERT_OUTLIER_DETECTED = 502
};

// ============================================================================
// STRUTTURA CONFIGURAZIONE VALIDAZIONE (per sensore)
// ============================================================================
struct ConfigValidazioneSensore {
  float rangeMin;           // Valore minimo ammesso
  float rangeMax;           // Valore massimo ammesso
  bool permettiNegativi;    // True se il sensore può dare valori negativi
  bool richiedeTimestamp;   // True se timestamp obbligatorio
  float valoreDefault;      // Valore di fallback in caso di errore
  const char* nomeSensore;  // Nome per logging (es. "TEMP", "HUM", "PESO")
};

// ============================================================================
// STRUTTURA RISULTATO VALIDAZIONE
// ============================================================================
struct RisultatoValidazione {
  bool valido;              // True se dato utilizzabile
  ErroreComune codiceErrore;
  float valorePulito;       // Valore sanitizzato o default
  char messaggioErrore[80]; // Messaggio human-readable
};

// ============================================================================
// FUNZIONI DI VALIDAZIONE COMUNI
// ============================================================================

/**
 * Valida un dato proveniente da un sensore secondo regole comuni. 
 * 
 * @param valoreGrezzo Il valore letto dal sensore
 * @param timestamp Timestamp della misura (0 se non disponibile)
 * @param sensoreReady True se il sensore è pronto/disponibile
 * @param config Configurazione di validazione
 * @return RisultatoValidazione con esito e dettagli
 */
RisultatoValidazione validaDatoSensore(
  float valoreGrezzo,
  unsigned long timestamp,
  bool sensoreReady,
  ConfigValidazioneSensore config
) {
  RisultatoValidazione risultato;
  risultato.valido = true;
  risultato.codiceErrore = ERR_COMMON_NONE;
  risultato.valorePulito = valoreGrezzo;
  strcpy(risultato.messaggioErrore, "OK");
  
  // 1) SENSORE NON PRONTO/OFFLINE
  if (!sensoreReady) {
    risultato.valido = false;
    risultato.codiceErrore = ERR_SENSOR_NOT_READY;
    risultato.valorePulito = config.valoreDefault;
    snprintf(risultato.messaggioErrore, 80, 
             "[%s] ERR_SENSOR_NOT_READY: sensore non disponibile", 
             config.nomeSensore);
    return risultato;
  }
  
  // 2) DATO NaN
  if (isnan(valoreGrezzo)) {
    risultato.valido = false;
    risultato.codiceErrore = ERR_DATA_INVALID_NUMBER;
    risultato.valorePulito = config.valoreDefault;
    snprintf(risultato.messaggioErrore, 80, 
             "[%s] ERR_DATA_INVALID_NUMBER: valore NaN", 
             config.nomeSensore);
    return risultato;
  }
  
  // 3) DATO INFINITO
  if (isinf(valoreGrezzo)) {
    risultato.valido = false;
    risultato.codiceErrore = ERR_DATA_INVALID_NUMBER;
    risultato.valorePulito = config.valoreDefault;
    snprintf(risultato.messaggioErrore, 80, 
             "[%s] ERR_DATA_INVALID_NUMBER: valore infinito", 
             config.nomeSensore);
    return risultato;
  }
  
  // 4) NEGATIVO NON AMMESSO
  if (! config.permettiNegativi && valoreGrezzo < 0.0f) {
    risultato.valido = false;
    risultato.codiceErrore = ERR_DATA_NEGATIVE_NOT_ALLOWED;
    risultato.valorePulito = config. valoreDefault;
    snprintf(risultato.messaggioErrore, 80, 
             "[%s] ERR_DATA_NEGATIVE_NOT_ALLOWED: %. 2f (negativi non ammessi)", 
             config. nomeSensore, valoreGrezzo);
    return risultato;
  }
  
  // 5) FUORI RANGE
  if (valoreGrezzo < config.rangeMin || valoreGrezzo > config.rangeMax) {
    risultato.valido = false;
    risultato.codiceErrore = ERR_MEASURE_OUT_OF_RANGE;
    risultato.valorePulito = config.valoreDefault;
    snprintf(risultato.messaggioErrore, 80, 
             "[%s] ERR_MEASURE_OUT_OF_RANGE: %.2f fuori da [%.2f, %.2f]", 
             config.nomeSensore, valoreGrezzo, config.rangeMin, config. rangeMax);
    return risultato;
  }
  
  // 6) TIMESTAMP MANCANTE (se richiesto)
  if (config.richiedeTimestamp && (timestamp == 0 || timestamp == ULONG_MAX)) {
    risultato.valido = false;
    risultato.codiceErrore = ERR_TIMESTAMP_INVALID;
    risultato.valorePulito = valoreGrezzo; // valore ok, manca solo timestamp
    snprintf(risultato.messaggioErrore, 80, 
             "[%s] ERR_TIMESTAMP_INVALID: timestamp mancante o non valido", 
             config. nomeSensore);
    return risultato;
  }
  
  // ✅ TUTTO OK
  risultato.valido = true;
  risultato.codiceErrore = ERR_COMMON_NONE;
  risultato.valorePulito = valoreGrezzo;
  snprintf(risultato.messaggioErrore, 80, 
           "[%s] Valore valido: %.2f", 
           config.nomeSensore, valoreGrezzo);
  
  return risultato;
}

// ============================================================================
// FUNZIONE DI LOGGING/GESTIONE ERRORE
// ============================================================================

/**
 * Gestisce il risultato di una validazione: 
 * - Log su Serial
 * - (Opzionale) Salvataggio su SD
 * - (Opzionale) Invio alert via rete
 */
void gestisciRisultatoValidazione(RisultatoValidazione risultato) {
  if (!risultato.valido) {
    Serial.print("❌ ERRORE:  ");
    Serial.println(risultato.messaggioErrore);
    
    // TODO: Qui puoi aggiungere: 
    // - Salvataggio su SD/SPIFFS
    // - Invio alert via MQTT/HTTP
    // - Accensione LED rosso
    // - Incremento contatore errori in EEPROM
    
  } else {
    Serial.print("✓ OK: ");
    Serial.println(risultato.messaggioErrore);
  }
}

/**
 * Verifica soglie MIN/MAX e genera alert (senza invalidare il dato)
 * @return codice alert o ERR_COMMON_NONE
 */
ErroreComune verificaSoglie(float valore, float sogliaMin, float sogliaMax, const char* nomeSensore) {
  if (valore > sogliaMax) {
    Serial.print("[ALERT] ");
    Serial.print(nomeSensore);
    Serial.print(" sopra soglia MAX: ");
    Serial.print(valore);
    Serial.print(" > ");
    Serial.println(sogliaMax);
    return ALERT_THRESHOLD_HIGH;
  }
  
  if (valore < sogliaMin) {
    Serial.print("[ALERT] ");
    Serial.print(nomeSensore);
    Serial.print(" sotto soglia MIN: ");
    Serial.print(valore);
    Serial.print(" < ");
    Serial.println(sogliaMin);
    return ALERT_THRESHOLD_LOW;
  }
  
  return ERR_COMMON_NONE;
}

#endif // SENSOR_VALIDATION_H
