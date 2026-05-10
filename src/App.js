import React, { useState, useEffect } from 'react';
import { Client, Databases, ID, Query } from 'appwrite';
import { ChevronDown, ChevronRight, Save, Users, Swords, Loader2, Plus, AlertCircle } from 'lucide';

// --- APPWRITE CONFIGURATIE ---
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6a00adaf003bdb7301df');

const databases = new Databases(client);
const DATABASE_ID = '6a00adce000ac2b32209';
const COLL_TEAMS = 'teams';
const COLL_SPELERS = 'spelers';
const COLL_MATCHUPS = 'matchups';

// --- AOS 4 DATA (Voorbeeld set, kan uitgebreid worden) ---
const AOS_FACTIONS = {
  "Stormcast Eternals": ["Ruination Chamber", "Warrior Chamber", "Vanguard Chamber", "Extremis Chamber"],
  "Skaven": ["Clans Skryre", "Clans Pestilens", "Clans Moulder", "Clans Eshin", "Clans Verminus"],
  "Slaves to Darkness": ["Legion of the First Prince", "Host of the Everchosen", "Despoilers"],
  "Seraphon": ["Starborne", "Coalesced"],
  "Cities of Sigmar": ["Dawnbringer Crusade", "Ironweld Arsenal", "Collegiate Arcane"],
  "Gloomspite Gitz": ["Moonclan", "Spiderfang", "Troggoths", "Squigs"],
  "Orruk Warclans": ["Ironjawz", "Kruleboyz", "Bonesplitterz"],
  "Soulblight Gravelords": ["Legion of Blood", "Legion of Night", "Vyrkos", "Kastelai"],
  "Overig": ["Standaard Formatie"]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [spelers, setSpelers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Haal data op bij het laden van de app
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    setErrorMsg('');
    try {
      const teamsResponse = await databases.listDocuments(DATABASE_ID, COLL_TEAMS, [Query.limit(100)]);
      const spelersResponse = await databases.listDocuments(DATABASE_ID, COLL_SPELERS, [Query.limit(500)]);
      
      setTeams(teamsResponse.documents);
      setSpelers(spelersResponse.documents);
    } catch (error) {
      console.error("Fout bij ophalen data:", error);
      setErrorMsg("Kon data niet ophalen. Heb je de Appwrite permissies op 'Any' gezet en de attributen correct aangemaakt?");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Swords className="text-rose-500 w-8 h-8" />
            <h1 className="text-xl font-bold text-white tracking-tight">AOS Team-Tournament Prep</h1>
          </div>
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${activeTab === 'teams' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              <Users size={18} />
              <span>Teams</span>
            </button>
            <button
              onClick={() => setActiveTab('matchups')}
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${activeTab === 'matchups' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              <Swords size={18} />
              <span>Matchups</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Error Message */}
      {errorMsg && (
        <div className="max-w-6xl mx-auto mt-6 bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 py-8">
        {loadingData ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
          </div>
        ) : (
          <>
            {activeTab === 'teams' && <TeamsView teams={teams} spelers={spelers} onDataChanged={fetchData} />}
            {activeTab === 'matchups' && <MatchupsView teams={teams} spelers={spelers} />}
          </>
        )}
      </main>
    </div>
  );
}

// ==========================================
// COMPONENT: TEAMS VIEW (Deel 1)
// ==========================================
function TeamsView({ teams, spelers, onDataChanged }) {
  const [isCreating, setIsCreating] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [playerCount, setPlayerCount] = useState(6);
  const [playersForm, setPlayersForm] = useState(Array(6).fill({ Naam: '', Army: '', Subfaction: '', Lijst: '' }));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlayerCountChange = (count) => {
    setPlayerCount(count);
    const newForm = [...playersForm];
    if (count > newForm.length) {
      newForm.push(...Array(count - newForm.length).fill({ Naam: '', Army: '', Subfaction: '', Lijst: '' }));
    } else {
      newForm.splice(count);
    }
    setPlayersForm(newForm);
  };

  const updatePlayerField = (index, field, value) => {
    const newForm = [...playersForm];
    newForm[index] = { ...newForm[index], [field]: value };
    // Reset subfaction if army changes
    if (field === 'Army') newForm[index].Subfaction = '';
    setPlayersForm(newForm);
  };

  const saveTeam = async () => {
    if (!teamName) return alert("Vul een teamnaam in.");
    setIsSubmitting(true);
    
    try {
      // 1. Maak Team aan
      const teamDoc = await databases.createDocument(DATABASE_ID, COLL_TEAMS, ID.unique(), {
        Naam: teamName,
        AantalSpelers: String(playerCount)
      });

      // 2. Maak Spelers aan met referentie naar Team
      const playerPromises = playersForm.map(player => {
        if (!player.Naam) return Promise.resolve(); // Sla lege spelers over
        return databases.createDocument(DATABASE_ID, COLL_SPELERS, ID.unique(), {
          Naam: player.Naam,
          Army: player.Army,
          Subfaction: player.Subfaction,
          Lijst: player.Lijst,
          teamId: teamDoc.$id // Hier gebruiken we het nieuwe attribuut!
        });
      });

      await Promise.all(playerPromises);
      
      setIsCreating(false);
      setTeamName('');
      onDataChanged(); // Ververs data
    } catch (error) {
      console.error("Error saving team:", error);
      alert("Er is iets misgegaan bij het opslaan. Controleer de console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Team Creatie Formulier */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Teams Beheren</h2>
          {!isCreating && (
            <button onClick={() => setIsCreating(true)} className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-md flex items-center space-x-2 font-medium">
              <Plus size={18} /> <span>Nieuw Team Aanmaken</span>
            </button>
          )}
        </div>

        {isCreating && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-5 rounded-lg border border-slate-800">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Team Naam</label>
                <input 
                  type="text" 
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                  placeholder="Bijv. The Dice Breakers"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Aantal Spelers</label>
                <select 
                  value={playerCount}
                  onChange={(e) => handlePlayerCountChange(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white focus:border-rose-500 outline-none"
                >
                  <option value={4}>4 Spelers</option>
                  <option value={6}>6 Spelers</option>
                  <option value={8}>8 Spelers</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-800 pb-2">Spelers Invoeren</h3>
              <div className="grid gap-4">
                {playersForm.map((player, idx) => (
                  <div key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col md:flex-row gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-400 flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow">
                      <input 
                        type="text" placeholder="Speler Naam" value={player.Naam} onChange={(e) => updatePlayerField(idx, 'Naam', e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-white"
                      />
                      <select 
                        value={player.Army} onChange={(e) => updatePlayerField(idx, 'Army', e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-white"
                      >
                        <option value="">Selecteer Leger...</option>
                        {Object.keys(AOS_FACTIONS).map(army => <option key={army} value={army}>{army}</option>)}
                      </select>
                      <select 
                        value={player.Subfaction} onChange={(e) => updatePlayerField(idx, 'Subfaction', e.target.value)}
                        disabled={!player.Army}
                        className="bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-white disabled:opacity-50"
                      >
                        <option value="">Selecteer Formatie...</option>
                        {player.Army && AOS_FACTIONS[player.Army]?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                      </select>
                      <input 
                        type="text" placeholder="Lijst / Notities" value={player.Lijst} onChange={(e) => updatePlayerField(idx, 'Lijst', e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Annuleren</button>
              <button 
                onClick={saveTeam} 
                disabled={isSubmitting}
                className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-md flex items-center space-x-2 font-medium disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={18} />}
                <span>Team Opslaan</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lijst van bestaande teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map(team => {
          const teamSpelers = spelers.filter(s => s.teamId === team.$id);
          return (
            <div key={team.$id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                <h3 className="text-xl font-bold text-white">{team.Naam}</h3>
                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full">{team.AantalSpelers} Spelers</span>
              </div>
              <ul className="space-y-3">
                {teamSpelers.map(speler => (
                  <li key={speler.$id} className="flex flex-col bg-slate-950 p-3 rounded-md border border-slate-800">
                    <span className="font-semibold text-slate-200">{speler.Naam}</span>
                    <span className="text-xs text-rose-400 font-medium">{speler.Army} {speler.Subfaction && `- ${speler.Subfaction}`}</span>
                  </li>
                ))}
                {teamSpelers.length === 0 && <p className="text-slate-500 text-sm italic">Geen spelers gevonden voor dit team.</p>}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT: MATCHUPS VIEW (Deel 2)
// ==========================================
function MatchupsView({ teams, spelers }) {
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [expandedPlayerId, setExpandedPlayerId] = useState(null);
  
  // matrix: { "team1SpelerId": { "team2SpelerId": 10 } } (10 is WTC draw op schaal 0-20)
  const [matrix, setMatrix] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [existingMatchupId, setExistingMatchupId] = useState(null);

  // Haal bestaande matchup op als team1 en team2 geselecteerd zijn
  useEffect(() => {
    if (team1Id && team2Id) {
      loadMatchup(team1Id, team2Id);
    } else {
      setMatrix({});
      setExistingMatchupId(null);
    }
  }, [team1Id, team2Id]);

  const loadMatchup = async (t1, t2) => {
    try {
      // Simpele check (in een echte app wil je een specifieke query doen)
      const res = await databases.listDocuments(DATABASE_ID, COLL_MATCHUPS);
      const existing = res.documents.find(d => 
        (d.team1Id === t1 && d.team2Id === t2) || (d.team1Id === t2 && d.team2Id === t1)
      );

      if (existing) {
        setExistingMatchupId(existing.$id);
        // Zorg dat de matrix georiënteerd is vanuit Team 1
        let loadedMatrix = JSON.parse(existing.matrixData);
        if (existing.team1Id === t2) {
           // Inverse matrix als de database het andersom heeft opgeslagen
           loadedMatrix = invertMatrix(loadedMatrix);
        }
        setMatrix(loadedMatrix);
      } else {
        setExistingMatchupId(null);
        // Initialiseer lege matrix met scores van 10 (draw)
        initializeEmptyMatrix(t1, t2);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const initializeEmptyMatrix = (t1, t2) => {
    const t1Spelers = spelers.filter(s => s.teamId === t1);
    const t2Spelers = spelers.filter(s => s.teamId === t2);
    const newMatrix = {};
    
    t1Spelers.forEach(p1 => {
      newMatrix[p1.$id] = {};
      t2Spelers.forEach(p2 => {
        newMatrix[p1.$id][p2.$id] = 10; // 10 is neutraal op 0-20 schaal
      });
    });
    setMatrix(newMatrix);
  };

  const invertMatrix = (mat) => {
    // Draait de matrix om: p2 vs p1 = 20 - (p1 vs p2)
    const newMat = {};
    for (const p2Id in mat) {
      for (const p1Id in mat[p2Id]) {
        if (!newMat[p1Id]) newMat[p1Id] = {};
        newMat[p1Id][p2Id] = 20 - mat[p2Id][p1Id];
      }
    }
    return newMat;
  };

  const handleScoreChange = (p1Id, p2Id, score) => {
    const newMatrix = { ...matrix };
    if (!newMatrix[p1Id]) newMatrix[p1Id] = {};
    newMatrix[p1Id][p2Id] = parseInt(score, 10);
    setMatrix(newMatrix);
  };

  const saveMatchup = async () => {
    setIsSaving(true);
    try {
      const payload = {
        team1Id: team1Id,
        team2Id: team2Id,
        matrixData: JSON.stringify(matrix)
      };

      if (existingMatchupId) {
        await databases.updateDocument(DATABASE_ID, COLL_MATCHUPS, existingMatchupId, payload);
      } else {
        const doc = await databases.createDocument(DATABASE_ID, COLL_MATCHUPS, ID.unique(), payload);
        setExistingMatchupId(doc.$id);
      }
      alert("Matchup scores succesvol opgeslagen!"); // Eenvoudige feedback
    } catch (error) {
      console.error(error);
      alert("Fout bij opslaan. Heb je de attributen aangemaakt en permissies goed gezet?");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper om kleur te bepalen op basis van score (0 = rood, 10 = grijs, 20 = groen)
  const getScoreColor = (score) => {
    if (score < 8) return "text-red-400";
    if (score > 12) return "text-emerald-400";
    return "text-slate-300";
  };

  const t1Spelers = spelers.filter(s => s.teamId === team1Id);
  const t2Spelers = spelers.filter(s => s.teamId === team2Id);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6">Matchups Beoordelen (WTC 0-20 Schaal)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-rose-400 mb-2">Ons Team (Team 1)</label>
            <select 
              value={team1Id} onChange={(e) => setTeam1Id(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-3 text-white focus:border-rose-500 outline-none"
            >
              <option value="">Selecteer Team 1...</option>
              {teams.map(t => <option key={t.$id} value={t.$id} disabled={t.$id === team2Id}>{t.Naam}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-400 mb-2">Tegenstander (Team 2)</label>
            <select 
              value={team2Id} onChange={(e) => setTeam2Id(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-3 text-white focus:border-blue-500 outline-none"
            >
              <option value="">Selecteer Team 2...</option>
              {teams.map(t => <option key={t.$id} value={t.$id} disabled={t.$id === team1Id}>{t.Naam}</option>)}
            </select>
          </div>
        </div>

        {team1Id && team2Id && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-lg border border-slate-800">
              <p className="text-slate-400 text-sm">
                Klik op een speler van Team 1 om in te schatten hoe ze scoren tegen de legers van Team 2.
                Een score van 10 is een draw. 20 is een maximale win.
              </p>
              <button 
                onClick={saveMatchup} disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-md flex items-center space-x-2 font-medium"
              >
                {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={18} />}
                <span>Opslaan</span>
              </button>
            </div>

            <div className="space-y-3">
              {t1Spelers.map((p1) => {
                const isExpanded = expandedPlayerId === p1.$id;
                
                // Bereken een gemiddelde verwachting voor deze speler
                const p1Scores = matrix[p1.$id] || {};
                const avgScore = Object.values(p1Scores).length > 0 
                  ? (Object.values(p1Scores).reduce((a, b) => a + b, 0) / Object.values(p1Scores).length).toFixed(1)
                  : 10;

                return (
                  <div key={p1.$id} className="border border-slate-800 rounded-lg overflow-hidden transition-all">
                    {/* Accordion Header */}
                    <button 
                      onClick={() => setExpandedPlayerId(isExpanded ? null : p1.$id)}
                      className="w-full bg-slate-800 p-4 flex items-center justify-between hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        {isExpanded ? <ChevronDown className="text-rose-400" /> : <ChevronRight className="text-slate-500" />}
                        <div className="text-left">
                          <p className="font-bold text-white text-lg">{p1.Naam}</p>
                          <p className="text-xs text-rose-300">{p1.Army} {p1.Subfaction && `(${p1.Subfaction})`}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-slate-400">Gemiddelde:</span>
                        <span className={`font-bold text-xl ${getScoreColor(avgScore)}`}>{avgScore}</span>
                      </div>
                    </button>

                    {/* Accordion Body (Sliders) */}
                    {isExpanded && (
                      <div className="bg-slate-900 p-5 space-y-5 border-t border-slate-800">
                        {t2Spelers.map(p2 => {
                          const currentScore = matrix[p1.$id]?.[p2.$id] ?? 10;
                          return (
                            <div key={p2.$id} className="flex flex-col md:flex-row md:items-center gap-4 bg-slate-950 p-4 rounded-md border border-slate-800/50">
                              <div className="md:w-1/3">
                                <p className="font-semibold text-slate-200">vs {p2.Naam}</p>
                                <p className="text-xs text-blue-300">{p2.Army}</p>
                              </div>
                              <div className="md:w-2/3 flex items-center space-x-4">
                                <span className="text-red-400 text-xs font-bold w-6">0</span>
                                <input 
                                  type="range" 
                                  min="0" max="20" step="1"
                                  value={currentScore}
                                  onChange={(e) => handleScoreChange(p1.$id, p2.$id, e.target.value)}
                                  className="flex-grow h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                />
                                <span className="text-emerald-400 text-xs font-bold w-6 text-right">20</span>
                                <div className={`w-12 text-center font-bold text-lg bg-slate-800 rounded py-1 ${getScoreColor(currentScore)}`}>
                                  {currentScore}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}