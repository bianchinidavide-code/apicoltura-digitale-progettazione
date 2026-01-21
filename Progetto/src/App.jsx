import React, { useState, useEffect } from 'react';
import { Home, Bell } from 'lucide-react';

// CANCELLA TUTTO QUELLO CHE C'ERA QUI IN MEZZO

const ArniaDigitaleApp = () => {
  // ... qui inizia il codice vero e proprio ...
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userCode, setUserCode] = useState('');
  const [selectedTab, setSelectedTab] = useState('temperatura');
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedArnia, setSelectedArnia] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [accounts, setAccounts] = useState([
    { id: 1, code: 'key123' },
    { id: 2, code: 'key456' }
  ]);
  const [newAccount, setNewAccount] = useState({ code: '' });
  const [editingAccount, setEditingAccount] = useState(null);
  
// --- DATABASE RESTDB ---
  const [dati, setDati] = useState([]);
  // Usiamo 'apiari' per coerenza
  const [apiari, setApiari] = useState([]);

  useEffect(() => {
    const headers = {
      "x-apikey": "6970c4753731f7a69d3fd7ed",
      "Content-Type": "application/json"
    };

    // 1. Fetch Tipi Rilevazione
    fetch("https://dthfcrcukr6yuk54r6u-981e.restdb.io/rest/apiari", { headers })
      .then(res => res.json())
      .then(data => {
        setDati(data);
      })
      .catch(err => console.error("Errore Tipologie:", err));

    // 2. FETCH APIARI (Database apiari)
    fetch("https://dthfcrcukr6yuk54r6u-981e.restdb.io/rest/apiari", { headers })
      .then(res => res.json())
      .then(data => {
        setApiari(data); // Salviamo dentro 'apiari'
        console.log("Apiari scaricati:", data);
      })
      .catch(err => console.error("Errore Apiari:", err));

  }, []);

  // Funzione Helper per trovare l'unità di misura dal DB in base alla Tab selezionata
  const getCurrentUnit = () => {
    if (!dati.length) return '';
    // Mappa i nomi delle tab (chiavi app) ai nomi nel DB (valori tipologia)
    const mapping = {
      'temperatura': 'Temperatura',
      'umidita': 'Umidità',
      'peso': 'Peso',
      'melario': 'Melario'
    };
    const dbType = mapping[selectedTab] || selectedTab;
    
    // Cerca nel DB l'elemento corrispondente
    const found = dati.find(item => 
      item.tipologia && item.tipologia.toLowerCase().includes(dbType.toLowerCase())
    );
    // Restituisce l'unità trovata (gestisce sia 'unita' che 'unità')
    return found ? (found.unità || found.unita || '') : '';
  };
  // -----------------------

  // Dati di esempio per arnie per località (Hardcoded)
  // NOTA: Se crei un apiario nel DB chiamato "test castello", assicurati di aggiungere una voce qui sotto
  // per vedere le arnie associate, altrimenti la lista arnie sarà vuota.
  const arniaByLocation = {
    'Città di Castello': ['Arnia 1', 'Arnia 2', 'Arnia 3', 'Arnia 4', 'Arnia 5'],
    'Umbertide': ['Arnia 6', 'Arnia 7', 'Arnia 8'],
    'Lerchi': ['Arnia 9', 'Arnia 10'],
    'test castello': ['Arnia Test A', 'Arnia Test B'] // Esempio per far funzionare il dato del tuo DB
  };

  // Soglie per ogni metrica
  const [thresholds, setThresholds] = useState({
    temperatura: { min: 30, max: 40 },
    peso: { min: 3, max: 15 },
    umidita: { min: 15, max: 23 }
  });
  const [tempThresholds, setTempThresholds] = useState({ min: '', max: '' });

  // Dati di esempio per i grafici
  const [currentData, setCurrentData] = useState({
    temperatura: 38,
    peso: 12,
    umidita: 21
  });

  // Genera dati casuali per il grafico (simulazione)
  const generateChartData = () => {
    const dates = [];
    for (let i = 23; i <= 30; i++) {
      dates.push(`${i}`);
    }
    return dates;
  };
  
  const chartDates = generateChartData();

  // Controlla se i valori superano le soglie ogni 20 secondi
  useEffect(() => {
    if (isLoggedIn && selectedLocation && selectedArnia) {
      const checkThresholds = () => {
        const newNotifications = [];
        
        if (currentData.temperatura < thresholds.temperatura.min) {
          newNotifications.push({
            id: `temp-min-${selectedArnia}-${Date.now()}`,
            type: 'temperatura',
            message: `Temperatura sotto soglia minima (${thresholds.temperatura.min}°C) in ${selectedArnia} a ${selectedLocation}`,
            value: currentData.temperatura
          });
        }
        if (currentData.temperatura > thresholds.temperatura.max) {
          newNotifications.push({
            id: `temp-max-${selectedArnia}-${Date.now()}`,
            type: 'temperatura',
            message: `Temperatura sopra soglia massima (${thresholds.temperatura.max}°C) in ${selectedArnia} a ${selectedLocation}`,
            value: currentData.temperatura
          });
        }
        
        if (currentData.peso < thresholds.peso.min) {
          newNotifications.push({
            id: `peso-min-${selectedArnia}-${Date.now()}`,
            type: 'peso',
            message: `Peso sotto soglia minima (${thresholds.peso.min}kg) in ${selectedArnia} a ${selectedLocation}`,
            value: currentData.peso
          });
        }
        if (currentData.peso > thresholds.peso.max) {
          newNotifications.push({
            id: `peso-max-${selectedArnia}-${Date.now()}`,
            type: 'peso',
            message: `Peso sopra soglia massima (${thresholds.peso.max}kg) in ${selectedArnia} a ${selectedLocation}`,
            value: currentData.peso
          });
        }
        
        if (currentData.umidita < thresholds.umidita.min) {
          newNotifications.push({
            id: `umidita-min-${selectedArnia}-${Date.now()}`,
            type: 'umidita',
            message: `Umidità sotto soglia minima (${thresholds.umidita.min}%) in ${selectedArnia} a ${selectedLocation}`,
            value: currentData.umidita
          });
        }
        if (currentData.umidita > thresholds.umidita.max) {
          newNotifications.push({
            id: `umidita-max-${selectedArnia}-${Date.now()}`,
            type: 'umidita',
            message: `Umidità sopra soglia massima (${thresholds.umidita.max}%) in ${selectedArnia} a ${selectedLocation}`,
            value: currentData.umidita
          });
        }
        
        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev].slice(0, 10));
        }
      };
      
      // Controllo iniziale
      checkThresholds();
      // Controllo ogni 20 secondi
      const interval = setInterval(checkThresholds, 20000);
      
      return () => clearInterval(interval);
    }
  }, [thresholds, currentData, isLoggedIn, selectedLocation, selectedArnia]);
  
  const handleLogin = () => {
    const accountExists = accounts.some(acc => acc.code === userCode);
    if (accountExists) {
      setIsLoggedIn(true);
      setIsAdmin(false);
      setCurrentPage('home');
    } else {
      alert("Codice utente non registrato. Contatta l'amministratore.");
    }
  };
  
  const handleAdminLogin = () => {
    if (adminPassword === '123456') {
      setIsLoggedIn(true);
      setIsAdmin(true);
      setCurrentPage('home');
    }
  };
  
  const handleCreateAccount = () => {
    if (newAccount.code.trim()) {
      setAccounts([...accounts, { 
        id: accounts.length + 1, 
        code: newAccount.code 
      }]);
      setNewAccount({ code: '' });
    }
  };
  
  const handleDeleteAccount = (id) => {
    setAccounts(accounts.filter(acc => acc.id !== id));
  };
  
  const handleUpdateAccount = () => {
    if (editingAccount) {
      setAccounts(accounts.map(acc => 
        acc.id === editingAccount.id ? editingAccount : acc
      ));
      setEditingAccount(null);
    }
  };
  
  const handleSaveThreshold = () => {
    const min = parseFloat(tempThresholds.min);
    const max = parseFloat(tempThresholds.max);
    
    if (!isNaN(min) && !isNaN(max) && min < max) {
      setThresholds(prev => ({
        ...prev,
        [selectedTab]: { min, max }
      }));
      setShowThresholdModal(false);
      setTempThresholds({ min: '', max: '' });
    }
  };

  const handleModifyThreshold = () => {
    setTempThresholds({
      min: thresholds[selectedTab].min.toString(),
      max: thresholds[selectedTab].max.toString()
    });
  };
  
  // Pagina di Login
  if (currentPage === 'login') {
    return (
      <div className="h-screen bg-gradient-to-br from-amber-300 via-amber-200 to-amber-100 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute border-2 border-amber-400"
              style={{
                width: '80px',
                height: '70px',
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
        
        <div className="bg-amber-100 bg-opacity-80 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10">
          <h1 className="text-5xl font-black text-center mb-2">ARNIA</h1>
          <h2 className="text-5xl font-black text-center mb-12">DIGITALE</h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">Accedi all' account</h3>
            <p className="text-sm text-gray-700 mb-4">Entra con il tuo codice</p>
            
            <input
              type="text"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              className="w-full px-4 py-4 rounded-xl bg-amber-50 border-none mb-4 text-lg"
              placeholder="Inserisci codice"
            />
            
            <button
              onClick={handleLogin}
              className="w-full bg-black text-white py-4 rounded-xl text-lg font-bold hover:bg-gray-900 transition"
            >
              Continua
            </button>
          </div>
          
          <p className="text-center text-sm text-gray-600 mb-6">
            Entra per vedere come stanno le tue <span className="font-bold">api</span> scegli la tua <span className="font-bold">arnia</span> e controlla i dati
          </p>
          
          <button
            onClick={() => setCurrentPage('admin-login')}
            className="w-full bg-gray-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition"
          >
            Accesso Admin
          </button>
        </div>
      </div>
    );
  }
  
  // Pagina Admin Login
  if (currentPage === 'admin-login') {
    return (
      <div className="h-screen bg-gradient-to-br from-amber-300 via-amber-200 to-amber-100 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute border-2 border-amber-400"
              style={{
                width: '80px',
                height: '70px',
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
        
        <div className="bg-amber-100 bg-opacity-80 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10">
          <h1 className="text-5xl font-black text-center mb-2">ARNIA</h1>
          <h2 className="text-5xl font-black text-center mb-12">DIGITALE</h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">Accesso Admin</h3>
            <p className="text-sm text-gray-700 mb-4">Inserisci la password admin</p>
            
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-4 py-4 rounded-xl bg-amber-50 border-none mb-4 text-lg"
              placeholder="Password"
            />
            
            <button
              onClick={handleAdminLogin}
              className="w-full bg-black text-white py-4 rounded-xl text-lg font-bold hover:bg-gray-900 transition mb-3"
            >
              Accedi
            </button>
            
            <button
              onClick={() => {
                setCurrentPage('login');
                setAdminPassword('');
              }}
              className="w-full bg-gray-300 text-gray-700 py-3 rounded-xl text-sm font-bold hover:bg-gray-400 transition"
            >
              Torna indietro
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Pagina Home
  if (currentPage === 'home') {
    return (
      <div className="h-screen bg-gradient-to-br from-amber-300 via-amber-200 to-amber-100 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute border-2 border-amber-400"
              style={{
                width: '80px',
                height: '70px',
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
        
        <div className="bg-amber-100 bg-opacity-90 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10 max-h-screen overflow-y-auto">
          <h1 className="text-4xl font-black text-center mb-2">ARNIA</h1>
          <h2 className="text-4xl font-black text-center mb-8">DIGITALE</h2>
          
          <div className="mb-8">
            <p className="text-blue-600 mb-2">Arnia statistiche:</p>
            <p className="text-blue-600 mb-6">seleziona per controllare i grafici:</p>
            
            <div className="flex justify-around mb-8">
              <button
                onClick={() => {
                  setSelectedTab('temperatura');
                  setCurrentPage('dashboard');
                }}
                className="flex flex-col items-center justify-center w-24 h-24 bg-amber-50 rounded-full shadow-lg hover:shadow-xl transition"
              >
                <div className="text-4xl mb-1">🌡️</div>
              </button>
              
              <button
                onClick={() => {
                  setSelectedTab('peso');
                  setCurrentPage('dashboard');
                }}
                className="flex flex-col items-center justify-center w-24 h-24 bg-amber-50 rounded-full shadow-lg hover:shadow-xl transition"
              >
                <div className="text-4xl mb-1">⚖️</div>
              </button>
              
              <button
                onClick={() => {
                  setSelectedTab('umidita');
                  setCurrentPage('dashboard');
                }}
                className="flex flex-col items-center justify-center w-24 h-24 bg-amber-50 rounded-full shadow-lg hover:shadow-xl transition"
              >
                <div className="text-4xl mb-1">💧</div>
              </button>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-black flex items-center gap-2">
                Notifiche <span className="text-4xl">⚠️</span>
              </h3>
            </div>
            
            <button
              onClick={() => setCurrentPage('notifications')}
              className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition"
            >
              Visualizza Notifiche
            </button>
            
            {notifications.length > 0 && (
              <div className="mt-4 text-sm text-red-600 font-bold">
                {notifications.length} {notifications.length === 1 ? 'nuova notifica' : 'nuove notifiche'}
              </div>
            )}
          </div>
          
          {isAdmin && (
            <div className="bg-white bg-opacity-50 rounded-2xl p-6">
              <button
                onClick={() => setCurrentPage('admin-panel')}
                className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition"
              >
                Gestione Account
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Pagina Admin Panel
  if (currentPage === 'admin-panel') {
    return (
      <div className="h-screen bg-gradient-to-br from-amber-300 via-amber-200 to-amber-100 p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           {/* (Codice sfondo) */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute border-2 border-amber-400"
              style={{
                width: '80px', height: '70px',
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
        
        <div className="max-w-md mx-auto relative z-10 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black">Admin</h1>
            <button
              onClick={() => setCurrentPage('home')}
              className="p-2 bg-black text-white rounded-full"
            >
              <Home size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Crea nuovo account */}
            <div className="bg-white bg-opacity-70 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-black mb-4">Crea nuovo Account</h2>
              <label className="block mb-2 font-bold">Nuovo Codice Accesso (API Key)</label>
              <input
                type="text"
                value={newAccount.code}
                onChange={(e) => setNewAccount({ code: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-amber-50 border-none mb-4"
                placeholder="Es. KEY_USER_001"
              />
              <button
                onClick={handleCreateAccount}
                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition"
              >
                Crea Utente
              </button>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-black mb-4">Notifiche</h2>
              <button 
                onClick={() => setCurrentPage('notifications')}
                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition mb-4"
              >
                Visualizza Notifiche
              </button>
            </div>

            {/* --- TABELLA DATI APIARI (DEBUG) --- */}
            <div className="bg-white bg-opacity-70 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-black mb-4">Apiari Caricati (DB)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                     <tr className="bg-amber-100">
                      <th className="p-3 border-b-2 border-amber-300 font-bold text-gray-800">Nome</th>
                      <th className="p-3 border-b-2 border-amber-300 font-bold text-gray-800">Coord.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaApiari.map((apiario, index) => (
                      <tr key={index} className="hover:bg-amber-50 border-b border-gray-200">
                        <td className="p-3 font-bold text-gray-700">{apiario.api_nome}</td>
                        <td className="p-3 font-medium text-gray-600">
                          {apiario.api_lat}, {apiario.api_lon}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- TABELLA DATI DATABASE TIPOLOGIE --- */}
            <div className="bg-white bg-opacity-70 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-black mb-4">Configurazione Sensori (DB)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                     <tr className="bg-amber-100">
                      <th className="p-3 border-b-2 border-amber-300 font-bold text-gray-800">Tipologia</th>
                      <th className="p-3 border-b-2 border-amber-300 font-bold text-gray-800">Unità</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dati.map((riga, index) => (
                      <tr key={index} className="hover:bg-amber-50 border-b border-gray-200">
                        <td className="p-3 font-bold text-gray-700">{riga.tipologia}</td>
                        <td className="p-3 font-medium text-gray-600">{riga.unità || riga.unita}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {dati.length === 0 && (
                  <p className="text-center py-4 text-gray-500 italic">Caricamento dati...</p>
                )}
              </div>
            </div>
            {/* -------------------------------------------------------- */}
            
            {/* Lista Account */}
            {accounts.map((account) => (
              <div key={account.id} className="bg-white bg-opacity-70 rounded-2xl p-4 shadow-lg">
                 {editingAccount && editingAccount.id === account.id ? (
                  <div>
                    <input
                      type="text"
                      value={editingAccount.code}
                      onChange={(e) => setEditingAccount({...editingAccount, code: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl bg-amber-50 border-none mb-2"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleUpdateAccount} className="flex-1 bg-black text-white py-2 rounded-xl font-bold">Salva</button>
                      <button onClick={() => setEditingAccount(null)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-xl font-bold">Annulla</button>
                    </div>
                  </div>
                ) : (
                  <div>
                     <p className="font-bold mb-1">Codice: <span className="text-blue-600">{account.code}</span></p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => setEditingAccount(account)} className="flex-1 bg-black text-white py-2 rounded-xl text-sm font-bold">Modifica</button>
                      <button onClick={() => handleDeleteAccount(account.id)} className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm font-bold">Elimina</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Pagina Notifiche
  if (currentPage === 'notifications') {
    return (
      <div className="h-screen bg-gradient-to-br from-amber-300 via-amber-200 to-amber-100 p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute border-2 border-amber-400"
              style={{
                width: '80px', height: '70px',
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
        
        <div className="max-w-md mx-auto relative z-10 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black">Notifiche</h1>
            <button
              onClick={() => setCurrentPage('home')}
              className="p-2 bg-black text-white rounded-full"
            >
              <Home size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            {notifications.length === 0 ? (
              <div className="bg-white bg-opacity-70 rounded-2xl p-8 text-center">
                <Bell size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Nessuna notifica al momento</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white bg-opacity-70 rounded-2xl p-4 shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">
                      {notif.type === 'temperatura' && '🌡️'}
                      {notif.type === 'peso' && '⚖️'}
                      {notif.type === 'umidita' && '💧'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-red-600 mb-1">ALERT</p>
                      <p className="text-sm">{notif.message}</p>
                      <p className="text-xs text-gray-600 mt-2">
                        Valore attuale: {notif.value}
                        {notif.type === 'temperatura' && '°C'}
                        {notif.type === 'peso' && 'kg'}
                        {notif.type === 'umidita' && '%'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Pagina Dashboard con grafici
  const getTabIcon = () => {
    if (selectedTab === 'temperatura') return '🌡️';
    if (selectedTab === 'peso') return '⚖️';
    return '💧';
  };
  
  const getTabUnit = () => {
    if (selectedTab === 'temperatura') return '°C';
    if (selectedTab === 'peso') return 'kg';
    return '%';
  };
  
  const getCurrentValue = () => {
    if (selectedTab === 'temperatura') return currentData.temperatura;
    if (selectedTab === 'peso') return currentData.peso;
    return currentData.umidita;
  };
  
  return (
    <div className="h-screen bg-gradient-to-br from-amber-300 via-amber-200 to-amber-100 p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute border-2 border-amber-400"
            style={{
              width: '80px', height: '70px',
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>
      
      <div className="max-w-md mx-auto relative z-10 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-black">ARNIA<br/>DIGITALE</h1>
          <button
            onClick={() => setShowThresholdModal(true)}
            className="px-6 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-900 transition"
          >
            SOGLIE
          </button>
        </div>
        
        <div className="bg-white bg-opacity-70 rounded-2xl p-4 mb-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <label className="font-bold">Seleziona il luogo:</label>
          </div>
          
          {/* MODIFICA: Select popolata dinamicamente dal DB */}
          <select
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setSelectedArnia('');
            }}
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 mb-4"
          >
            <option value="">Seleziona Luogo...</option>
            
            {/* Mappa i dati presi dal database */}
            {apiari.length > 0 ? (
              apiari.map((apiario) => (
                <option key={apiario._id} value={apiario.api_nome}>
                  {apiario.api_nome}
                </option>
              ))
            ) : (
              <option disabled>Nessun apiario trovato</option>
            )}
          </select>
          
          <label className="font-bold mb-2 block">Seleziona l'arnia che vuoi visitare:</label>
          <select
            value={selectedArnia}
            onChange={(e) => setSelectedArnia(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300"
            disabled={!selectedLocation}
          >
            <option value="">Arnia</option>
            {/* Controllo di sicurezza: se il luogo dal DB non ha arnie definite localmente, evita il crash */}
            {selectedLocation && (arniaByLocation[selectedLocation] || []).map((arnia) => (
              <option key={arnia} value={arnia}>{arnia}</option>
            ))}
          </select>
        </div>
        
        {selectedLocation && selectedArnia && (
          <>
            <div className="bg-white bg-opacity-70 rounded-2xl p-4 mb-4 shadow-lg flex items-center justify-center gap-4">
              <div className="text-5xl">{getTabIcon()}</div>
              <div className="text-3xl">→</div>
              <div className="text-3xl">...</div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-2xl p-4 mb-4 shadow-lg flex-1 overflow-hidden">
              <h3 className="font-bold mb-2">
                Grafico {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
              </h3>
              <div className="text-sm text-blue-600 mb-2">
                Valore attuale: {getCurrentValue()}{getTabUnit()}
              </div>
              <div className="text-xs text-gray-600 mb-3">
                Soglia: {thresholds[selectedTab].min} - {thresholds[selectedTab].max}{getTabUnit()}
              </div>
              <div className="relative h-40">
                <svg viewBox="0 0 300 150" className="w-full h-full">
                  <polyline
                    points="10,120 30,115 50,110 70,105 90,108 110,100 130,95 150,98 170,90 190,85 210,82 230,78 250,70 270,60 290,50"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 px-2">
                  {chartDates.map((date, i) => i % 2 === 0 && (
                    <span key={date}>Jan {date}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage('home')}
                className="flex items-center justify-center p-3 bg-black text-white rounded-xl"
              >
                <Home size={24} />
              </button>
              <button
                onClick={() => setSelectedTab('temperatura')}
                className={`flex-1 py-3 rounded-xl font-black text-sm ${
                  selectedTab === 'temperatura'
                    ? 'bg-black text-white'
                    : 'bg-white bg-opacity-70'
                }`}
              >
                TEMPERATURA
              </button>
              <button
                onClick={() => setSelectedTab('peso')}
                className={`flex-1 py-3 rounded-xl font-black text-sm ${
                  selectedTab === 'peso'
                    ? 'bg-black text-white'
                    : 'bg-white bg-opacity-70'
                }`}
              >
                PESO
              </button>
              <button
                onClick={() => setSelectedTab('umidita')}
                className={`flex-1 py-3 rounded-xl font-black text-sm ${
                  selectedTab === 'umidita'
                    ? 'bg-black text-white'
                    : 'bg-white bg-opacity-70'
                }`}
              >
                UMIDITÀ
              </button>
            </div>
          </>
        )}
      </div>
      
      {showThresholdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-amber-100 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Soglia:</h2>
              <button
                onClick={() => setCurrentPage('home')}
                className="p-2 bg-black text-white rounded-full"
              >
                <Home size={20} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <label className="font-bold text-lg">MAX:</label>
                <input
                  type="number"
                  value={tempThresholds.max}
                  onChange={(e) => setTempThresholds(prev => ({ ...prev, max: e.target.value }))}
                  className="flex-1 px-4 py-3 rounded-xl bg-amber-50"
                  placeholder={thresholds[selectedTab].max.toString()}
                />
              </div>
              
              <button
                onClick={handleModifyThreshold}
                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition"
              >
                Modifica Soglia
              </button>
              
              <div className="flex items-center gap-3">
                <label className="font-bold text-lg">MIN:</label>
                <input
                  type="number"
                  value={tempThresholds.min}
                  onChange={(e) => setTempThresholds(prev => ({ ...prev, min: e.target.value }))}
                  className="flex-1 px-4 py-3 rounded-xl bg-amber-50"
                  placeholder={thresholds[selectedTab].min.toString()}
                />
              </div>
              
              <button
                onClick={handleSaveThreshold}
                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition"
              >
                Salva
              </button>
            </div>
            
            <button
              onClick={() => {
                setShowThresholdModal(false);
                setTempThresholds({ min: '', max: '' });
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-800"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArniaDigitaleApp;