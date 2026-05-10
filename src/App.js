import React, { useState, useEffect } from 'react';
import { Client, Databases, ID, Query } from 'appwrite';
import { ChevronDown, ChevronRight, Save, Users, Swords, Loader2, Plus, AlertCircle, Edit, FileText, X, Trash2, Waypoints, Trophy, RefreshCw, CheckCircle, Map } from 'lucide-react';

// --- APPWRITE CONFIGURATIE ---
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6a00adaf003bdb7301df');

const databases = new Databases(client);
const DATABASE_ID = '6a00adce000ac2b32209';
const COLL_TEAMS = 'teams';
const COLL_SPELERS = 'spelers';
const COLL_MATCHUPS = 'matchups';

// --- BATTLEPLANS DATA ---
const BATTLEPLANS = [
  { id: 1, name: "Passing seasons", image: "./battleplan1.png" },
  { id: 2, name: "Paths of the Fey", image: "./battleplan2.png" },
  { id: 3, name: "Roiling Roots", image: "./battleplan3.png" },
  { id: 4, name: "Cyclic Shifts", image: "./battleplan4.png" },
  { id: 5, name: "Surge of Slaughter", image: "./battleplan5.png" },
  { id: 6, name: "Linked Ley Lines", image: "./battleplan6.png" },
  { id: 7, name: "Noxious Nexus", image: "./battleplan7.png" },
  { id: 8, name: "The Liferoots", image: "./battleplan8.png" },
  { id: 9, name: "Bountiful Equinox", image: "./battleplan9.png" },
  { id: 10, name: "Lifecycle", image: "./battleplan10.png" },
  { id: 11, name: "Creeping Corruption", image: "./battleplan11.png" },
  { id: 12, name: "Grasp of Thorns", image: "./battleplan12.png" }
];

// --- AOS 4.0 BATTLE FORMATIONS DATA ---
const AOS_FACTIONS = {
  // --- ORDER ---
  "Stormcast Eternals": ["Lightning Echelon", "Sacrosanct Convocation", "Thunderhead Host", "Sentinels of the Bleak Citadels", "Vanguard Wing", "Draconith Skywing", "Heroes of the First-Forged", "Ruiniation Brotherhood"],
  "Cities of Sigmar": ["Dawnbringer Crusade", "Fortress-city Defenders", "Ironweld Guild Army", "Collegiate Arcane Expedition","Veteran Cannoneers", "Fearless Exemplars"],
  "Seraphon": ["Eternal Starhost", "Sunclaw Starhost", "Shadowstrike Starhost", "Thunderquake Starhost"],
  "Sylvaneth": ["Followers of Kurnoth", "Outcasts", "Lords of the Clan", "Glade Defenders", "Wargrove of the Burgeoning","Wargrove of Everdusk" ],
  "Lumineth Realm-lords": ["Warhost of Duality", "Pilgrims of Haixiah", "Aelementor Guardians", "Scinari Council"],
  "Daughters of Khaine": ["Coven of Blood", "Cold-Hearted Murderers", "Frenzied Devotees", "Fervent Ritualists", "Coven Zealots", "Arena Veterans"],
  "Idoneth Deepkin": ["Namarti Corps", "Isharann Council", "Akhelian Beastmasters", "Soul-raid Ambushers", "Deep-sea Stalkers", "Ethersea Predators"],
  "Kharadron Overlords": ["Pioneers and Scavengers", "Veteran Ground Troops", "Rapid Redeployment Squadron", "Endrineers Guild Expeditionary Force"],
  "Fyreslayers": ["Warrior Kinband", "Scales of Vulcatrix", "Forge Brethren", "Lords of the Lodge"],

  // --- CHAOS ---
  "Slaves to Darkness": ["Legion of Chaos", "Despoilers", "Legion of the First Prince", "Godswrath Warband", "Darkoath Horde", "Chaos Horde", "Champions of Chaos"],
  "Skaven": ["Fleshmeld Menagerie", "Virulent Procession", "Warpcog Convocation", "Claw-horde", "Kill‑Pack", "Envoys of the Deepengnaw", "Gathering of the Clans"],
  "Blades of Khorne": ["Khornate Legion", "Bloodbound Warhorde", "Brass Stampede", "Murderhost", "Tournament of Skulls", "The Goretide"],
  "Disciples of Tzeentch": ["Fated Blades", "Denizens of the Silver Towers", "Malevolent Schemers", "Mutants and Mad Thingst", "Masters of Fate", "Spellweaver Coven"],
  "Maggotkin of Nurgle": ["Tallyband of Nurgle", "Plague Cyst", "Nurgle’s Menagerie", "Affliction Cyst"],
  "Hedonites of Slaanesh": ["Supreme Sybarites", "Seeker Cavalcade", "Epicurean Revellers", "Depraved Carnival", "Pretenders", "Invaders"],
  "Helsmiths of Hashut": ["Hashutite Host", "The Bullfather’s Horns", "Castigation Battery", "Daemonsmith Cabal", "Domination Force", "Industrial Polluters"],

  // --- DEATH ---
  "Soulblight Gravelords": ["Bacchanal of Blood", "Deathmarch", "Deathstench Drove", "Legion of Shyish", "Legions of Ulfenkarn", "Cryptmasters", "Skinshifters"], 
  "Ossiarch Bonereapers": ["Border Guards", "Ruthless Legion", "The Inevitable Empire", "Remorseless Conquerors", "Tithe Guards", "Hekatos Drillmasters" ],
  "Nighthaunt": ["Quicksilver Gheists", "Shrieker Host", "Royal Procession", "Death Stalkers", "Hungry Nexus", "Deathrust Gheists"],
  "Flesh-eater Courts": ["Knightly Echelon", "The Royal Hunt", "Lords of the Manor", "Royal Menagerie", "Impassioned Serfs", "Questing Courtiers"],

  // --- DESTRUCTION ---
  "Ironjawz": ["Ironjawz Brawl", "Weirdfist", "Ironfist", "Grunta Stampede", "Brutefist", "Bigsnikkaz"],
  "Kruleboyz": ["Kruleboyz Klaw", "Light Finga", "Middul Finga", "Trophy Finga", "Swamphorde Bullies", "Badmouthing Baiterz"],
  "Gloomspite Gitz": ["Gloomspite Horde", "Squigalanche", "Troggherd", "Gitmob Pack", "Sunbiter Pack", "Gittish Tide"],
  "Ogor Mawtribes": ["Heralds of the Everwinter", "Prophets of the Gulping God", "Beast Handlers", "Blackpowder Fanatics", "Mawpath Menaces", "Greedy Eaters"],
  "Sons of Behemat": ["Stomper Tribe", "Taker Tribe", "Breaker Tribe", "Boss Tribe", "Manskittle Mob", "Big Toes"],

};

// --- TRANSLATIONS / VERTALINGEN ---
const DICTIONARY = {
  appTitle: { nl: "AOS Team-Tournament Prep", en: "AOS Team-Tournament Prep" },
  tabTeams: { nl: "Teams", en: "Teams" },
  tabMatchups: { nl: "Matchups", en: "Matchups" },
  tabPairings: { nl: "Pairings Simulator", en: "Pairings Simulator" },
  errorFetch: { nl: "Kon data niet ophalen. Heb je de Appwrite permissies op 'Any' gezet en de attributen correct aangemaakt?", en: "Could not fetch data. Have you set Appwrite permissions to 'Any' and created the attributes correctly?" },
  manageTeams: { nl: "Teams Beheren", en: "Manage Teams" },
  editTeamHeader: { nl: "Team Bewerken", en: "Edit Team" },
  newTeam: { nl: "Nieuw Team Aanmaken", en: "Create New Team" },
  teamName: { nl: "Team Naam", en: "Team Name" },
  exTeamName: { nl: "Bijv. The Dice Breakers", en: "E.g. The Dice Breakers" },
  playerCount: { nl: "Aantal Spelers", en: "Player Count" },
  playersLabel: { nl: "Spelers", en: "Players" },
  playerSingular: { nl: "Speler", en: "Player" },
  teamNotes: { nl: "Team Notes", en: "Team Notes" },
  teamNotesPlaceholder: { nl: "Algemene opmerkingen over dit team...", en: "General notes about this team..." },
  enterPlayers: { nl: "Spelers Invoeren", en: "Enter Players" },
  playerName: { nl: "Speler Naam", en: "Player Name" },
  selectArmy: { nl: "Selecteer Leger...", en: "Select Army..." },
  selectFormation: { nl: "Selecteer Formatie...", en: "Select Formation..." },
  notesProxies: { nl: "Opmerkingen (bijv. proxies)", en: "Notes (e.g. proxies)" },
  rateBattleplans: { nl: "Battleplans", en: "Battleplans" },
  editList: { nl: "Bewerk Legerlijst", en: "Edit Army List" },
  expectedScoreBp: { nl: "Verwachte score per Battleplan (0-20)", en: "Expected score per Battleplan (0-20)" },
  cancel: { nl: "Annuleren", en: "Cancel" },
  saveChanges: { nl: "Wijzigingen Opslaan", en: "Save Changes" },
  saveTeam: { nl: "Team Opslaan", en: "Save Team" },
  deletePrompt: { nl: "Weet je zeker dat je dit team en al zijn spelers wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.", en: "Are you sure you want to delete this team and all its players? This action cannot be undone." },
  deleteTeam: { nl: "Team verwijderen", en: "Delete Team" },
  editTeamBtn: { nl: "Team bewerken", en: "Edit Team" },
  noPlayersFound: { nl: "Geen spelers gevonden voor dit team.", en: "No players found for this team." },
  note: { nl: "Notitie:", en: "Note:" },
  listOf: { nl: "Lijst van", en: "Army list of" },
  noListProvided: { nl: "Geen legerlijst ingevuld.", en: "No army list provided." },
  noListPlayer: { nl: "Geen legerlijst ingevuld voor deze speler.", en: "No army list provided for this player." },
  pasteList: { nl: "Plak hier je Warscroll Builder of App legerlijst...", en: "Paste your Warscroll Builder or App army list here..." },
  saveList: { nl: "Lijst Opslaan", en: "Save List" },
  fillTeamName: { nl: "Vul een teamnaam in.", en: "Please enter a team name." },
  saveError: { nl: "Er is iets misgegaan bij het opslaan.", en: "Something went wrong while saving." },
  deleteError: { nl: "Er is iets misgegaan bij het verwijderen van het team.", en: "Something went wrong while deleting the team." },
  rateMatchups: { nl: "Matchups Beoordelen (WTC 0-20 Schaal)", en: "Rate Matchups (WTC 0-20 Scale)" },
  createMatchup: { nl: "Nieuwe / Bestaande Matchup Maken", en: "Create / Edit Matchup" },
  ourTeam: { nl: "Ons Team (Team 1)", en: "Our Team (Team 1)" },
  oppTeam: { nl: "Tegenstander (Team 2)", en: "Opponent (Team 2)" },
  selectOurTeam: { nl: "Selecteer Team 1...", en: "Select Team 1..." },
  selectOppTeam2: { nl: "Selecteer Team 2...", en: "Select Team 2..." },
  savedMatchups: { nl: "Opgeslagen Matchups", en: "Saved Matchups" },
  noMatchupsSaved: { nl: "Nog geen matchups opgeslagen.", en: "No matchups saved yet." },
  deleteMatchupPrompt: { nl: "Weet je zeker dat je deze matchup scores wilt verwijderen?", en: "Are you sure you want to delete these matchup scores?" },
  deleteMatchup: { nl: "Verwijder Matchup", en: "Delete Matchup" },
  matchupInstructions: { nl: "Klik op een speler van Team 1 om in te schatten hoe ze scoren tegen de legers van Team 2. Een score van 10 is een draw. De slider naar links trekken is winst voor Team 1.", en: "Click on a Team 1 player to estimate how they score against Team 2's armies. A score of 10 is a draw. Pulling the slider left means a win for Team 1." },
  saveMatchup: { nl: "Matchup Opslaan", en: "Save Matchup" },
  matchupNotesTitle: { nl: "Opmerkingen / Strategie voor deze Matchup", en: "Notes / Strategy for this Matchup" },
  matchupNotesPlaceholder: { nl: "Bijv. Let op hun drop advantage, focus op battle tactic X...", en: "E.g. Watch out for their drop advantage, focus on battle tactic X..." },
  average: { nl: "Gemiddelde:", en: "Average:" },
  vs: { nl: "vs", en: "vs" },
  specificNote: { nl: "Notitie voor deze specifieke matchup...", en: "Note for this specific matchup..." },
  matchupSaveSuccess: { nl: "Matchup scores succesvol opgeslagen!", en: "Matchup scores successfully saved!" },
  matchupSaveError: { nl: "Fout bij opslaan. Heb je de attributen aangemaakt en permissies goed gezet?", en: "Error saving. Did you create the attributes and set permissions correctly?" },
  matchupDeleteError: { nl: "Er is iets misgegaan bij het verwijderen van de matchup.", en: "Something went wrong while deleting the matchup." },
  startSim: { nl: "Start Pairings Simulatie", en: "Start Pairings Simulation" },
  simDesc1: { nl: "Kies jouw team en een tegenstander om de draft te simuleren. Je kunt alleen tegenstanders kiezen waarvan de matchup scores zijn opgeslagen.", en: "Choose your team and an opponent to simulate the draft. You can only select opponents for whom matchup scores are saved." },
  selectYourTeam: { nl: "Selecteer jouw team...", en: "Select your team..." },
  selectOppTeam: { nl: "Selecteer tegenstander...", en: "Select opponent..." },
  noMatchupFound: { nl: "Geen ingevulde matchups gevonden voor dit team.", en: "No saved matchups found for this team." },
  startDraftBtn: { nl: "Start Draft Simulatie", en: "Start Draft Simulation" },
  mission: { nl: "Missie:", en: "Mission:" },
  viewCard: { nl: "Bekijk Kaart", en: "View Card" },
  restart: { nl: "Opnieuw Beginnen", en: "Restart" },
  yourPool: { nl: "Jouw Pool", en: "Your Pool" },
  oppPoolLabel: { nl: "Hun Pool", en: "Their Pool" },
  noPlayersLeft: { nl: "Geen spelers over.", en: "No players left." },
  completedPairings: { nl: "Voltooide Pairings", en: "Completed Pairings" },
  phase1Title: { nl: "1. Selecteer Battleplan voor deze ronde", en: "1. Select Battleplan for this round" },
  selectMission: { nl: "-- Kies een Missie --", en: "-- Choose a Mission --" },
  phase2Title: { nl: "2. Selecteer Defenders", en: "2. Select Defenders" },
  yourDefender: { nl: "Jouw Defender", en: "Your Defender" },
  oppDefender: { nl: "Hun Defender", en: "Their Defender" },
  confirmDefenders: { nl: "Bevestig Defenders", en: "Confirm Defenders" },
  phase2SelectAtt: { nl: "Fase 2: Selecteer Attackers", en: "Phase 2: Select Attackers" },
  dragAttackers: { nl: "Sleep 2 spelers naar het midden om ze aan te bieden als attacker.", en: "Drag 2 players to the middle to offer them as attackers." },
  againstOppDef: { nl: "Tegen hun Defender", en: "Against their Defender" },
  againstYourDef: { nl: "Tegen jouw Defender", en: "Against your Defender" },
  yourAtt1: { nl: "Jouw Attacker 1", en: "Your Attacker 1" },
  yourAtt2: { nl: "Jouw Attacker 2", en: "Your Attacker 2" },
  oppAtt1: { nl: "Hun Attacker 1", en: "Their Attacker 1" },
  oppAtt2: { nl: "Hun Attacker 2", en: "Their Attacker 2" },
  confirmAttackers: { nl: "Bevestig Attackers", en: "Confirm Attackers" },
  phase3Resolve: { nl: "Fase 3: Kies Matchups", en: "Phase 3: Choose Matchups" },
  youChoose: { nl: "Jij kiest wie van hun Attackers tegen jouw Defender speelt:", en: "You choose which of their Attackers plays against your Defender:" },
  oppChooses: { nl: "Tegenstander kiest wie van jouw Attackers tegen hun Defender speelt:", en: "Opponent chooses which of your Attackers plays against their Defender:" },
  confirmMatchups: { nl: "Matchups Vastleggen", en: "Confirm Matchups" },
  autoLastPairings: { nl: "Automatische Laatste Pairings", en: "Automatic Final Pairings" },
  autoLastDesc: { nl: "Er zijn nog 2 of minder spelers over. Deze worden automatisch aan elkaar gekoppeld.", en: "There are 2 or fewer players left. These are automatically paired up." },
  selectLastBp: { nl: "Selecteer Battleplan voor de laatste ronde", en: "Select Battleplan for the final round" },
  yourReturned: { nl: "Jouw Returned Attacker", en: "Your Returned Attacker" },
  oppLeftover: { nl: "Hun Overgebleven Defender", en: "Their Remaining Defender" },
  yourLeftover: { nl: "Jouw Overgebleven Defender", en: "Your Remaining Defender" },
  oppReturned: { nl: "Hun Returned Attacker", en: "Their Returned Attacker" },
  yourLast: { nl: "Jouw Laatste Speler", en: "Your Last Player" },
  oppLast: { nl: "Hun Laatste Speler", en: "Their Last Player" },
  confirmFinal: { nl: "Laatste Pairings Vastleggen", en: "Confirm Final Pairings" },
  draftCompleted: { nl: "Draft Voltooid!", en: "Draft Completed!" },
  scoreExpected: { nl: "Score (Verwacht)", en: "Score (Expected)" },
  totalExpected: { nl: "Totale Verwachte Score:", en: "Total Expected Score:" },
  close: { nl: "Sluiten", en: "Close" },
  noOppInPool: { nl: "Geen tegenstanders in deze pool.", en: "No opponents in this pool." },
  bpScores: { nl: "BP Scores", en: "BP Scores" },
  viewExpectedMatchups: { nl: "Bekijk Verwachte Matchups", en: "View Expected Matchups" },
  viewList: { nl: "Bekijk Lijst", en: "View List" },
  removeFromSelection: { nl: "Verwijder uit selectie", en: "Remove from selection" },
  dragPlayerHere: { nl: "Sleep speler hierheen", en: "Drag player here" },
  bpMissing: { nl: "Kan afbeelding niet inladen:", en: "Cannot load image:" },
  matchupNotFound: { nl: "Kan matchup data niet vinden. Controleer of deze is opgeslagen.", en: "Matchup data not found. Ensure it has been saved." },
  chooseBothDefenders: { nl: "Kies voor beide kanten een defender.", en: "Choose a defender for both sides." },
  chooseTwoAttackers: { nl: "Kies voor beide kanten precies twee attackers.", en: "Choose exactly two attackers for both sides." },
  sameAttackerError: { nl: "Je kunt niet twee keer dezelfde speler als attacker kiezen.", en: "You cannot choose the same player twice as an attacker." },
  selectMatchToPlay: { nl: "Selecteer welke match er gespeeld gaat worden.", en: "Select which match will be played." },
  vsOppDef: { nl: "vs Hun Defender", en: "vs Their Defender" },
  yourScoreAgainstThem: { nl: "Jouw score ertegen", en: "Your score against them" },
  scoreFor: { nl: "Score voor", en: "Score for" },
  expectedMatchupsFor: { nl: "Matchups:", en: "Matchups:" }
};

export default function App() {
  const [language, setLanguage] = useState('nl');
  const [activeTab, setActiveTab] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [spelers, setSpelers] = useState([]);
  const [matchups, setMatchups] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Translation helper function
  const t = (key) => DICTIONARY[key]?.[language] || key;

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
      const matchupsResponse = await databases.listDocuments(DATABASE_ID, COLL_MATCHUPS, [Query.limit(100)]);
      
      setTeams(teamsResponse.documents);
      setSpelers(spelersResponse.documents);
      setMatchups(matchupsResponse.documents);
    } catch (error) {
      console.error("Fout bij ophalen data:", error);
      setErrorMsg(t('errorFetch'));
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Swords className="text-rose-500 w-8 h-8" />
            <h1 className="text-xl font-bold text-white tracking-tight">{t('appTitle')}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="flex bg-slate-800 p-1 rounded-md border border-slate-700">
              <button 
                onClick={() => setLanguage('nl')} 
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${language === 'nl' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                NL
              </button>
              <button 
                onClick={() => setLanguage('en')} 
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>

            <nav className="flex space-x-2 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setActiveTab('teams')}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === 'teams' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                <Users size={18} />
                <span>{t('tabTeams')}</span>
              </button>
              <button
                onClick={() => setActiveTab('matchups')}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === 'matchups' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                <Swords size={18} />
                <span>{t('tabMatchups')}</span>
              </button>
              <button
                onClick={() => setActiveTab('pairings')}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === 'pairings' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                <Waypoints size={18} />
                <span>{t('tabPairings')}</span>
              </button>
            </nav>
          </div>
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
      <main className="max-w-[1400px] mx-auto p-4 py-8">
        {loadingData ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
          </div>
        ) : (
          <>
            {activeTab === 'teams' && <TeamsView teams={teams} spelers={spelers} onDataChanged={fetchData} t={t} />}
            {activeTab === 'matchups' && <MatchupsView teams={teams} spelers={spelers} matchups={matchups} onDataChanged={fetchData} t={t} />}
            {activeTab === 'pairings' && <PairingsSimulator teams={teams} spelers={spelers} matchups={matchups} t={t} />}
          </>
        )}
      </main>
    </div>
  );
}

// ==========================================
// COMPONENT: TEAMS VIEW (Deel 1)
// ==========================================
function TeamsView({ teams, spelers, onDataChanged, t }) {
  const getEmptyPlayer = () => ({ Naam: '', Army: '', Subfaction: '', Lijst: '', Opmerkingen: '', BattleplanScores: {} });

  const [isCreating, setIsCreating] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);
  
  const [teamName, setTeamName] = useState('');
  const [playerCount, setPlayerCount] = useState(6);
  const [teamNotes, setTeamNotes] = useState('');
  const [playersForm, setPlayersForm] = useState(Array(6).fill().map(getEmptyPlayer));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modal, setModal] = useState({ isOpen: false, content: '', isReadOnly: false, playerIndex: null, title: '' });
  const [openBpIndex, setOpenBpIndex] = useState(null);

  const resetForm = () => {
    setIsCreating(false);
    setEditingTeamId(null);
    setTeamName('');
    setTeamNotes('');
    setPlayerCount(6);
    setPlayersForm(Array(6).fill().map(getEmptyPlayer));
    setOpenBpIndex(null);
  };

  const openEditTeam = (team) => {
    setEditingTeamId(team.$id);
    setTeamName(team.Naam);
    setTeamNotes(team.Notes || '');
    setPlayerCount(Number(team.AantalSpelers));

    const teamSpelers = spelers.filter(s => s.teamId === team.$id);
    const formSpelers = [];
    for (let i = 0; i < Number(team.AantalSpelers); i++) {
      if (teamSpelers[i]) {
        let bpScores = {};
        if (teamSpelers[i].BattleplanScores) {
          try { bpScores = JSON.parse(teamSpelers[i].BattleplanScores); } catch(e) {}
        }

        formSpelers.push({
          $id: teamSpelers[i].$id,
          Naam: teamSpelers[i].Naam,
          Army: teamSpelers[i].Army,
          Subfaction: teamSpelers[i].Subfaction,
          Lijst: teamSpelers[i].Lijst || '',
          Opmerkingen: teamSpelers[i].Opmerkingen || '',
          BattleplanScores: bpScores
        });
      } else {
        formSpelers.push(getEmptyPlayer());
      }
    }
    setPlayersForm(formSpelers);
    setIsCreating(true);
  };

  const handlePlayerCountChange = (count) => {
    setPlayerCount(count);
    const newForm = [...playersForm];
    if (count > newForm.length) {
      newForm.push(...Array(count - newForm.length).fill().map(getEmptyPlayer));
    } else {
      newForm.splice(count);
    }
    setPlayersForm(newForm);
  };

  const updatePlayerField = (index, field, value) => {
    const newForm = [...playersForm];
    newForm[index] = { ...newForm[index], [field]: value };
    if (field === 'Army') newForm[index].Subfaction = '';
    setPlayersForm(newForm);
  };

  const updateBattleplanScore = (playerIndex, bpId, score) => {
    const newForm = [...playersForm];
    const currentScores = newForm[playerIndex].BattleplanScores || {};
    newForm[playerIndex].BattleplanScores = { ...currentScores, [bpId]: parseInt(score) || 0 };
    setPlayersForm(newForm);
  };

  const getScoreColor = (score) => {
    if (score < 8) return "text-red-400";
    if (score > 12) return "text-emerald-400";
    return "text-slate-300";
  };

  const saveTeam = async () => {
    if (!teamName) return alert(t('fillTeamName'));
    setIsSubmitting(true);
    
    try {
      let currentTeamId = editingTeamId;

      if (editingTeamId) {
        await databases.updateDocument(DATABASE_ID, COLL_TEAMS, editingTeamId, {
          Naam: teamName,
          AantalSpelers: String(playerCount),
          Notes: teamNotes
        });
      } else {
        const teamDoc = await databases.createDocument(DATABASE_ID, COLL_TEAMS, ID.unique(), {
          Naam: teamName,
          AantalSpelers: String(playerCount),
          Notes: teamNotes
        });
        currentTeamId = teamDoc.$id;
      }

      const existingSpelers = editingTeamId ? spelers.filter(s => s.teamId === editingTeamId) : [];
      const idsToKeep = [];

      const playerPromises = playersForm.map(player => {
        if (!player.Naam) return Promise.resolve();

        const bpString = JSON.stringify(player.BattleplanScores || {});

        if (player.$id) {
          idsToKeep.push(player.$id);
          return databases.updateDocument(DATABASE_ID, COLL_SPELERS, player.$id, {
            Naam: player.Naam,
            Army: player.Army,
            Subfaction: player.Subfaction,
            Lijst: player.Lijst,
            Opmerkingen: player.Opmerkingen,
            BattleplanScores: bpString
          });
        } else {
          return databases.createDocument(DATABASE_ID, COLL_SPELERS, ID.unique(), {
            Naam: player.Naam,
            Army: player.Army,
            Subfaction: player.Subfaction,
            Lijst: player.Lijst,
            Opmerkingen: player.Opmerkingen,
            BattleplanScores: bpString,
            teamId: currentTeamId
          });
        }
      });

      const idsToDelete = existingSpelers.filter(s => !idsToKeep.includes(s.$id)).map(s => s.$id);
      const deletePromises = idsToDelete.map(id => databases.deleteDocument(DATABASE_ID, COLL_SPELERS, id));

      await Promise.all([...playerPromises, ...deletePromises]);
      
      resetForm();
      onDataChanged();
    } catch (error) {
      console.error("Error saving team:", error);
      alert(t('saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTeam = async (teamId) => {
    if (window.confirm(t('deletePrompt'))) {
      try {
        const teamSpelers = spelers.filter(s => s.teamId === teamId);
        const deletePlayerPromises = teamSpelers.map(s => databases.deleteDocument(DATABASE_ID, COLL_SPELERS, s.$id));
        await Promise.all([...deletePlayerPromises, databases.deleteDocument(DATABASE_ID, COLL_TEAMS, teamId)]);
        onDataChanged();
      } catch (error) {
        console.error("Fout bij verwijderen team:", error);
        alert(t('deleteError'));
      }
    }
  };

  return (
    <div className="space-y-8 relative max-w-6xl mx-auto">
      {/* --- LIJST MODAL (Pop-up) --- */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <FileText className="text-rose-500" />
                <span>{modal.title}</span>
              </h3>
              <button onClick={() => setModal({ ...modal, isOpen: false })} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
              {modal.isReadOnly ? (
                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 min-h-[200px]">
                  <pre className="text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {modal.content || <span className="text-slate-500 italic">{t('noListProvided')}</span>}
                  </pre>
                </div>
              ) : (
                <textarea 
                  value={modal.content}
                  onChange={(e) => setModal({ ...modal, content: e.target.value })}
                  className="w-full h-96 bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 font-mono text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none resize-none"
                  placeholder={t('pasteList')}
                />
              )}
            </div>
            {!modal.isReadOnly && (
              <div className="p-4 border-t border-slate-800 flex justify-end space-x-3">
                <button onClick={() => setModal({ ...modal, isOpen: false })} className="px-4 py-2 text-slate-400 hover:text-white">{t('cancel')}</button>
                <button 
                  onClick={() => {
                    updatePlayerField(modal.playerIndex, 'Lijst', modal.content);
                    setModal({ ...modal, isOpen: false });
                  }} 
                  className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-md font-medium"
                >
                  {t('saveList')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Creatie/Edit Formulier */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{editingTeamId ? t('editTeamHeader') : t('manageTeams')}</h2>
          {!isCreating && (
            <button onClick={() => setIsCreating(true)} className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-md flex items-center space-x-2 font-medium">
              <Plus size={18} /> <span>{t('newTeam')}</span>
            </button>
          )}
        </div>

        {isCreating && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-5 rounded-lg border border-slate-800">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">{t('teamName')}</label>
                <input 
                  type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white focus:border-rose-500 outline-none"
                  placeholder={t('exTeamName')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">{t('playerCount')}</label>
                <select 
                  value={playerCount} onChange={(e) => handlePlayerCountChange(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white focus:border-rose-500 outline-none"
                >
                  <option value={4}>4 {t('playersLabel')}</option>
                  <option value={5}>5 {t('playersLabel')}</option>
                  <option value={6}>6 {t('playersLabel')}</option>
                  <option value={8}>8 {t('playersLabel')}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-1">{t('teamNotes')}</label>
                <textarea 
                  value={teamNotes} onChange={(e) => setTeamNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white focus:border-rose-500 outline-none resize-none h-20"
                  placeholder={t('teamNotesPlaceholder')}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-800 pb-2">{t('enterPlayers')}</h3>
              <div className="grid gap-4">
                {playersForm.map((player, idx) => (
                  <div key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col gap-4">
                    <div className="flex flex-col xl:flex-row gap-4 items-start w-full">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-400 flex-shrink-0 mt-1">
                        {idx + 1}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 flex-grow w-full">
                        <input 
                          type="text" placeholder={t('playerName')} value={player.Naam} onChange={(e) => updatePlayerField(idx, 'Naam', e.target.value)}
                          className="xl:col-span-2 bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-white"
                        />
                        <select 
                          value={player.Army} onChange={(e) => updatePlayerField(idx, 'Army', e.target.value)}
                          className="xl:col-span-2 bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-white"
                        >
                          <option value="">{t('selectArmy')}</option>
                          {Object.keys(AOS_FACTIONS).map(army => <option key={army} value={army}>{army}</option>)}
                        </select>
                        <select 
                          value={player.Subfaction} onChange={(e) => updatePlayerField(idx, 'Subfaction', e.target.value)}
                          disabled={!player.Army}
                          className="xl:col-span-2 bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-white disabled:opacity-50"
                        >
                          <option value="">{t('selectFormation')}</option>
                          {player.Army && AOS_FACTIONS[player.Army]?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                        <input 
                          type="text" placeholder={t('notesProxies')} value={player.Opmerkingen} onChange={(e) => updatePlayerField(idx, 'Opmerkingen', e.target.value)}
                          className="xl:col-span-3 bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-white"
                        />
                        
                        {/* Battleplan Score Button */}
                        <button 
                          onClick={() => setOpenBpIndex(openBpIndex === idx ? null : idx)}
                          className={`xl:col-span-2 p-2 rounded-md flex items-center justify-center transition-colors text-sm font-medium ${openBpIndex === idx ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                          title={t('rateBattleplans')}
                        >
                          <Map size={16} className="mr-2" /> {t('rateBattleplans')}
                        </button>

                        <button 
                          onClick={() => setModal({ isOpen: true, content: player.Lijst, isReadOnly: false, playerIndex: idx, title: `${t('listOf')} ${player.Naam || `${t('playerSingular')} ${idx+1}`}` })}
                          className={`xl:col-span-1 p-2 rounded-md flex items-center justify-center transition-colors ${player.Lijst ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/50' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                          title={t('editList')}
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Battleplan Accordion Panel */}
                    {openBpIndex === idx && (
                      <div className="bg-slate-900 p-4 rounded-lg border border-purple-500/30 mt-2 ml-12 animate-in slide-in-from-top-2">
                        <h4 className="text-purple-400 text-sm font-bold mb-3 flex items-center"><Map size={16} className="mr-2"/> {t('expectedScoreBp')}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {BATTLEPLANS.map(bp => {
                            const score = player.BattleplanScores?.[bp.id] ?? 10;
                            return (
                              <div key={bp.id} className="flex flex-col bg-slate-950 p-3 rounded border border-slate-800">
                                <span className="text-xs font-semibold text-slate-300 mb-2 truncate">{bp.id}. {bp.name}</span>
                                <div className="flex items-center space-x-3">
                                  <input 
                                    type="range" min="0" max="20" step="1" value={score}
                                    onChange={(e) => updateBattleplanScore(idx, bp.id, e.target.value)}
                                    className="flex-grow h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                  />
                                  <div className={`w-8 text-center font-bold text-sm bg-slate-800 rounded py-0.5 ${getScoreColor(score)}`}>
                                    {score}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button onClick={resetForm} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">{t('cancel')}</button>
              <button 
                onClick={saveTeam} 
                disabled={isSubmitting}
                className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-md flex items-center space-x-2 font-medium disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={18} />}
                <span>{editingTeamId ? t('saveChanges') : t('saveTeam')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lijst van bestaande teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map(team => {
          const teamSpelers = spelers.filter(s => s.teamId === team.$id);
          return (
            <div key={team.$id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
              <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center space-x-3">
                    <span>{team.Naam}</span>
                    <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full font-normal">{team.AantalSpelers} {t('playersLabel')}</span>
                  </h3>
                  {team.Notes && <p className="text-sm text-slate-400 mt-2 italic">"{team.Notes}"</p>}
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => openEditTeam(team)}
                    className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 rounded-md border border-slate-800 transition-colors"
                    title={t('editTeamBtn')}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => deleteTeam(team.$id)}
                    className="p-2 text-slate-400 hover:text-red-400 bg-slate-950 rounded-md border border-slate-800 transition-colors"
                    title={t('deleteTeam')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <ul className="space-y-3 flex-grow">
                {teamSpelers.map(speler => {
                  let hasBpScores = false;
                  if (speler.BattleplanScores && speler.BattleplanScores !== "{}" && speler.BattleplanScores !== "") hasBpScores = true;

                  return (
                    <li key={speler.$id} className="flex flex-col bg-slate-950 p-3 rounded-md border border-slate-800">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <button 
                            onClick={() => setModal({ isOpen: true, content: speler.Lijst, isReadOnly: true, playerIndex: null, title: `${t('listOf')} ${speler.Naam}` })}
                            className="font-semibold text-slate-200 hover:text-rose-400 text-left transition-colors flex items-center space-x-2"
                          >
                            <span>{speler.Naam}</span>
                            {speler.Lijst && <FileText size={14} className="text-slate-500" />}
                          </button>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-rose-400 font-medium">{speler.Army} {speler.Subfaction && `- ${speler.Subfaction}`}</span>
                            {hasBpScores && <span className="flex items-center text-[10px] bg-purple-900/30 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded"><Map size={10} className="mr-1"/> {t('bpScores')}</span>}
                          </div>
                        </div>
                      </div>
                      {speler.Opmerkingen && (
                        <div className="mt-2 text-xs text-slate-400 bg-slate-900 p-2 rounded">
                          <span className="font-semibold text-slate-500">{t('note')}</span> {speler.Opmerkingen}
                        </div>
                      )}
                    </li>
                  )
                })}
                {teamSpelers.length === 0 && <p className="text-slate-500 text-sm italic">{t('noPlayersFound')}</p>}
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
function MatchupsView({ teams, spelers, matchups, onDataChanged, t }) {
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [expandedPlayerId, setExpandedPlayerId] = useState(null);
  
  const [matrix, setMatrix] = useState({});
  const [matrixNotes, setMatrixNotes] = useState({});
  const [matchupNotes, setMatchupNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [existingMatchupId, setExistingMatchupId] = useState(null);

  useEffect(() => {
    if (team1Id && team2Id) {
      const existing = matchups.find(d => 
        (d.team1Id === team1Id && d.team2Id === team2Id) || (d.team1Id === team2Id && d.team2Id === team1Id)
      );

      if (existing) {
        setExistingMatchupId(existing.$id);
        setMatchupNotes(existing.Notes || '');
        let loadedMatrix = JSON.parse(existing.matrixData);
        let loadedNotes = existing.matrixNotes ? JSON.parse(existing.matrixNotes) : {};
        if (existing.team1Id === team2Id) {
           loadedMatrix = invertMatrix(loadedMatrix);
           loadedNotes = invertMatrixNotes(loadedNotes);
        }
        setMatrix(loadedMatrix);
        setMatrixNotes(loadedNotes);
      } else {
        setExistingMatchupId(null);
        setMatchupNotes('');
        initializeEmptyMatrix(team1Id, team2Id);
      }
    } else {
      setMatrix({});
      setMatrixNotes({});
      setMatchupNotes('');
      setExistingMatchupId(null);
    }
  }, [team1Id, team2Id, matchups]);

  const initializeEmptyMatrix = (t1, t2) => {
    const t1Spelers = spelers.filter(s => s.teamId === t1);
    const t2Spelers = spelers.filter(s => s.teamId === t2);
    const newMatrix = {};
    const newNotes = {};
    
    t1Spelers.forEach(p1 => {
      newMatrix[p1.$id] = {};
      newNotes[p1.$id] = {};
      t2Spelers.forEach(p2 => {
        newMatrix[p1.$id][p2.$id] = 10; 
        newNotes[p1.$id][p2.$id] = '';
      });
    });
    setMatrix(newMatrix);
    setMatrixNotes(newNotes);
  };

  const invertMatrix = (mat) => {
    const newMat = {};
    for (const t1PlayerId in mat) {
      for (const t2PlayerId in mat[t1PlayerId]) {
        if (!newMat[t2PlayerId]) newMat[t2PlayerId] = {};
        newMat[t2PlayerId][t1PlayerId] = 20 - mat[t1PlayerId][t2PlayerId];
      }
    }
    return newMat;
  };

  const invertMatrixNotes = (notes) => {
    const newNotes = {};
    for (const t1PlayerId in notes) {
      for (const t2PlayerId in notes[t1PlayerId]) {
        if (!newNotes[t2PlayerId]) newNotes[t2PlayerId] = {};
        newNotes[t2PlayerId][t1PlayerId] = notes[t1PlayerId][t2PlayerId];
      }
    }
    return newNotes;
  };

  const handleScoreChange = (p1Id, p2Id, score) => {
    const newMatrix = { ...matrix };
    if (!newMatrix[p1Id]) newMatrix[p1Id] = {};
    newMatrix[p1Id][p2Id] = parseInt(score, 10);
    setMatrix(newMatrix);
  };

  const handleNoteChange = (p1Id, p2Id, text) => {
    const newNotes = { ...matrixNotes };
    if (!newNotes[p1Id]) newNotes[p1Id] = {};
    newNotes[p1Id][p2Id] = text;
    setMatrixNotes(newNotes);
  };

  const saveMatchup = async () => {
    setIsSaving(true);
    try {
      const payload = {
        team1Id: team1Id,
        team2Id: team2Id,
        matrixData: JSON.stringify(matrix),
        matrixNotes: JSON.stringify(matrixNotes),
        Notes: matchupNotes
      };

      if (existingMatchupId) {
        await databases.updateDocument(DATABASE_ID, COLL_MATCHUPS, existingMatchupId, payload);
      } else {
        await databases.createDocument(DATABASE_ID, COLL_MATCHUPS, ID.unique(), payload);
      }
      
      await onDataChanged(); 
      alert(t('matchupSaveSuccess')); 
    } catch (error) {
      console.error(error);
      alert(t('matchupSaveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMatchup = async (matchupId, e) => {
    e.stopPropagation();
    if (window.confirm(t('deleteMatchupPrompt'))) {
      try {
        await databases.deleteDocument(DATABASE_ID, COLL_MATCHUPS, matchupId);
        
        if (existingMatchupId === matchupId) {
          setExistingMatchupId(null);
          initializeEmptyMatrix(team1Id, team2Id);
        }
        await onDataChanged();
      } catch (error) {
        console.error("Fout bij verwijderen matchup:", error);
        alert(t('matchupDeleteError'));
      }
    }
  };

  const getScoreColor = (score) => {
    if (score < 8) return "text-red-400";
    if (score > 12) return "text-emerald-400";
    return "text-slate-300";
  };

  const t1Spelers = spelers.filter(s => s.teamId === team1Id);
  const t2Spelers = spelers.filter(s => s.teamId === team2Id);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6">{t('rateMatchups')}</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-4">
            <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-800 pb-2">{t('createMatchup')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-rose-400 mb-2">{t('ourTeam')}</label>
                <select 
                  value={team1Id} onChange={(e) => setTeam1Id(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-white focus:border-rose-500 outline-none"
                >
                  <option value="">{t('selectOurTeam')}</option>
                  {teams.map(t => <option key={t.$id} value={t.$id} disabled={t.$id === team2Id}>{t.Naam}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-400 mb-2">{t('oppTeam')}</label>
                <select 
                  value={team2Id} onChange={(e) => setTeam2Id(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-white focus:border-blue-500 outline-none"
                >
                  <option value="">{t('selectOppTeam2')}</option>
                  {teams.map(t => <option key={t.$id} value={t.$id} disabled={t.$id === team1Id}>{t.Naam}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-slate-950 p-5 rounded-lg border border-slate-800 flex flex-col max-h-[220px]">
             <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-800 pb-2 mb-3">{t('savedMatchups')}</h3>
             <div className="overflow-y-auto flex-grow pr-2">
               {matchups.length === 0 ? (
                 <p className="text-slate-500 text-sm italic mt-2">{t('noMatchupsSaved')}</p>
               ) : (
                 <ul className="space-y-2">
                   {matchups.map(m => {
                     const t1 = teams.find(t => t.$id === m.team1Id);
                     const t2 = teams.find(t => t.$id === m.team2Id);
                     if (!t1 || !t2) return null;

                     const isActive = (m.team1Id === team1Id && m.team2Id === team2Id) || (m.team1Id === team2Id && m.team2Id === team1Id);

                     return (
                       <li key={m.$id} className="flex space-x-2">
                         <button 
                           onClick={() => { setTeam1Id(t1.$id); setTeam2Id(t2.$id); }} 
                           className={`w-full text-left p-3 border rounded-md transition-colors flex justify-between items-center ${isActive ? 'bg-rose-600/20 border-rose-500 text-white' : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-300'}`}
                         >
                           <span className="text-sm font-medium truncate">{t1.Naam} <span className="text-slate-500 mx-1">{t('vs')}</span> {t2.Naam}</span>
                           <ChevronRight size={16} className={isActive ? "text-rose-400" : "text-slate-500"} />
                         </button>
                         <button 
                           onClick={(e) => deleteMatchup(m.$id, e)}
                           className="p-3 bg-slate-900 border border-slate-700 hover:border-red-500 hover:text-red-400 text-slate-400 rounded-md transition-colors"
                           title={t('deleteMatchup')}
                         >
                           <Trash2 size={16} />
                         </button>
                       </li>
                     );
                   })}
                 </ul>
               )}
             </div>
          </div>
        </div>

        {team1Id && team2Id && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-slate-950 p-4 rounded-lg border border-slate-800">
              <p className="text-slate-400 text-sm">
                {t('matchupInstructions')}
              </p>
              <button 
                onClick={saveMatchup} disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-md flex items-center justify-center space-x-2 font-medium flex-shrink-0"
              >
                {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={18} />}
                <span>{existingMatchupId ? t('saveChanges') : t('saveMatchup')}</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <label className="block text-sm font-medium text-slate-400 mb-2">{t('matchupNotesTitle')}</label>
              <textarea 
                value={matchupNotes} onChange={(e) => setMatchupNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-white focus:border-rose-500 outline-none resize-none h-24"
                placeholder={t('matchupNotesPlaceholder')}
              />
            </div>

            <div className="space-y-3">
              {t1Spelers.map((p1) => {
                const isExpanded = expandedPlayerId === p1.$id;
                
                const p1Scores = matrix[p1.$id] || {};
                const avgScore = Object.values(p1Scores).length > 0 
                  ? (Object.values(p1Scores).reduce((a, b) => a + b, 0) / Object.values(p1Scores).length).toFixed(1)
                  : 10;

                return (
                  <div key={p1.$id} className="border border-slate-800 rounded-lg overflow-hidden transition-all">
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
                        <span className="text-xs text-slate-400 hidden sm:inline">{t('average')}</span>
                        <span className={`font-bold text-xl ${getScoreColor(avgScore)}`}>{avgScore}</span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="bg-slate-900 p-5 space-y-5 border-t border-slate-800">
                        {t2Spelers.map(p2 => {
                          const currentScore = matrix[p1.$id]?.[p2.$id] ?? 10;
                          return (
                            <div key={p2.$id} className="flex flex-col lg:flex-row lg:items-center gap-4 bg-slate-950 p-4 rounded-md border border-slate-800/50">
                              <div className="lg:w-1/3">
                                <p className="font-semibold text-slate-200">{t('vs')} {p2.Naam}</p>
                                <p className="text-xs text-blue-300">{p2.Army}</p>
                              </div>
                              <div className="lg:w-2/3 flex flex-col gap-2 w-full">
                                <div className="flex items-center space-x-2 sm:space-x-4 w-full">
                                  <div className={`w-10 sm:w-12 text-center font-bold text-sm sm:text-lg bg-slate-800 border border-slate-700 rounded py-1 ${getScoreColor(currentScore)}`} title={`${t('scoreFor')} ${p1.Naam}`}>
                                    {currentScore}
                                  </div>
                                  <input 
                                    type="range" 
                                    min="0" max="20" step="1"
                                    dir="rtl"
                                    value={currentScore}
                                    onChange={(e) => handleScoreChange(p1.$id, p2.$id, e.target.value)}
                                    className="flex-grow h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                  />
                                  <div className={`w-10 sm:w-12 text-center font-bold text-sm sm:text-lg bg-slate-800 border border-slate-700 rounded py-1 ${getScoreColor(20 - currentScore)}`} title={`${t('scoreFor')} ${p2.Naam}`}>
                                    {20 - currentScore}
                                  </div>
                                </div>
                                <input 
                                  type="text"
                                  placeholder={t('specificNote')}
                                  value={matrixNotes[p1.$id]?.[p2.$id] || ''}
                                  onChange={(e) => handleNoteChange(p1.$id, p2.$id, e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-xs text-white focus:border-rose-500 outline-none"
                                />
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

// ==========================================
// COMPONENT: PAIRINGS SIMULATOR (Deel 3)
// ==========================================
function PairingsSimulator({ teams, spelers, matchups, t }) {
  const [myTeamId, setMyTeamId] = useState('');
  const [oppTeamId, setOppTeamId] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  
  const [matrix, setMatrix] = useState({});
  const [matrixNotes, setMatrixNotes] = useState({});
  const [activeBattleplan, setActiveBattleplan] = useState(null);
  const [autoResolveData, setAutoResolveData] = useState(null);
  
  const [myPool, setMyPool] = useState([]);
  const [oppPool, setOppPool] = useState([]); 
  const [phase, setPhase] = useState('DEFENDERS'); 
  const [matches, setMatches] = useState([]); 

  const [myDefId, setMyDefId] = useState('');
  const [oppDefId, setOppDefId] = useState('');
  
  const [myAtt1Id, setMyAtt1Id] = useState('');
  const [myAtt2Id, setMyAtt2Id] = useState('');
  const [oppAtt1Id, setOppAtt1Id] = useState('');
  const [oppAtt2Id, setOppAtt2Id] = useState('');

  const [selectedOppAttId, setSelectedOppAttId] = useState(''); 
  const [selectedMyAttId, setSelectedMyAttId] = useState(''); 
  
  const [listModal, setListModal] = useState({ isOpen: false, content: '', title: '' });
  const [matchupsModal, setMatchupsModal] = useState({ isOpen: false, player: null, oppPoolList: [], isMyTeam: true });
  const [battleplanModal, setBattleplanModal] = useState({ isOpen: false, image: '', title: '' });

  const resetSimulator = () => {
    setIsStarted(false);
    setPhase('DEFENDERS');
    setMatches([]);
    setMyDefId(''); setOppDefId('');
    setMyAtt1Id(''); setMyAtt2Id('');
    setOppAtt1Id(''); setOppAtt2Id('');
    setSelectedMyAttId(''); setSelectedOppAttId('');
    setActiveBattleplan(null);
    setAutoResolveData(null);
  };

  const invertMatrix = (mat) => {
    const newMat = {};
    for (const t1Id in mat) {
      for (const t2Id in mat[t1Id]) {
        if (!newMat[t2Id]) newMat[t2Id] = {};
        newMat[t2Id][t1Id] = 20 - mat[t1Id][t2Id];
      }
    }
    return newMat;
  };

  const invertMatrixNotes = (notes) => {
    const newNotes = {};
    for (const t1Id in notes) {
      for (const t2Id in notes[t1Id]) {
        if (!newNotes[t2Id]) newNotes[t2Id] = {};
        newNotes[t2Id][t1Id] = notes[t1Id][t2Id];
      }
    }
    return newNotes;
  };

  const startDraft = () => {
    if (!myTeamId || !oppTeamId) return;

    const matchupDoc = matchups.find(m => 
      (m.team1Id === myTeamId && m.team2Id === oppTeamId) || 
      (m.team1Id === oppTeamId && m.team2Id === myTeamId)
    );

    if (!matchupDoc) {
      alert(t('matchupNotFound'));
      return;
    }

    let loadedMatrix = JSON.parse(matchupDoc.matrixData);
    let loadedNotes = matchupDoc.matrixNotes ? JSON.parse(matchupDoc.matrixNotes) : {};
    if (matchupDoc.team1Id === oppTeamId) {
      loadedMatrix = invertMatrix(loadedMatrix); 
      loadedNotes = invertMatrixNotes(loadedNotes);
    }
    setMatrix(loadedMatrix);
    setMatrixNotes(loadedNotes);

    setMyPool(spelers.filter(s => s.teamId === myTeamId));
    setOppPool(spelers.filter(s => s.teamId === oppTeamId));

    setActiveBattleplan(null);
    setIsStarted(true);
    setPhase('DEFENDERS');
  };

  const getExpectedScore = (myId, oppId) => matrix[myId]?.[oppId] ?? 10;
  
  const getPlayerBpScore = (player) => {
    if (!activeBattleplan || !player.BattleplanScores) return null;
    try {
      const scores = JSON.parse(player.BattleplanScores);
      return scores[activeBattleplan.id] !== undefined ? scores[activeBattleplan.id] : null;
    } catch(e) {
      return null;
    }
  };

  const getScoreColor = (score) => {
    if (score < 8) return "text-red-400";
    if (score > 12) return "text-emerald-400";
    return "text-slate-300";
  };

  const availableOpponents = myTeamId ? teams.filter(t => 
    t.$id !== myTeamId && matchups.some(m => (m.team1Id === myTeamId && m.team2Id === t.$id) || (m.team1Id === t.$id && m.team2Id === myTeamId))
  ) : [];

  const confirmDefenders = () => {
    if (!myDefId || !oppDefId) return alert(t('chooseBothDefenders'));
    setPhase('ATTACKERS');
  };

  const confirmAttackers = () => {
    if (!myAtt1Id || !myAtt2Id || !oppAtt1Id || !oppAtt2Id) return alert(t('chooseTwoAttackers'));
    if (myAtt1Id === myAtt2Id || oppAtt1Id === oppAtt2Id) return alert(t('sameAttackerError'));
    setPhase('RESOLVE');
  };

  const confirmResolve = () => {
    if (!selectedMyAttId || !selectedOppAttId) return alert(t('selectMatchToPlay'));
    
    const myDefPlayer = myPool.find(p => p.$id === myDefId);
    const oppAttPlayer = oppPool.find(p => p.$id === selectedOppAttId);
    const myAttPlayer = myPool.find(p => p.$id === selectedMyAttId);
    const oppDefPlayer = oppPool.find(p => p.$id === oppDefId);

    const newMatches = [
      { my: myDefPlayer, opp: oppAttPlayer, score: getExpectedScore(myDefPlayer.$id, oppAttPlayer.$id) },
      { my: myAttPlayer, opp: oppDefPlayer, score: getExpectedScore(myAttPlayer.$id, oppDefPlayer.$id) }
    ];
    
    const newMyPool = myPool.filter(p => p.$id !== myDefId && p.$id !== selectedMyAttId);
    const newOppPool = oppPool.filter(p => p.$id !== oppDefId && p.$id !== selectedOppAttId);

    const myReturnedId = myAtt1Id === selectedMyAttId ? myAtt2Id : myAtt1Id;
    const oppReturnedId = oppAtt1Id === selectedOppAttId ? oppAtt2Id : oppAtt1Id;

    const myReturnedPlayer = myPool.find(p => p.$id === myReturnedId);
    const oppReturnedPlayer = oppPool.find(p => p.$id === oppReturnedId);

    const myLeftoverPlayer = newMyPool.find(p => p.$id !== myReturnedId);
    const oppLeftoverPlayer = newOppPool.find(p => p.$id !== oppReturnedId);

    if (newMyPool.length > 2) {
      setMatches([...matches, ...newMatches]);
      setMyPool(newMyPool);
      setOppPool(newOppPool);
      setMyDefId(''); setOppDefId('');
      setMyAtt1Id(''); setMyAtt2Id(''); setOppAtt1Id(''); setOppAtt2Id('');
      setSelectedMyAttId(''); setSelectedOppAttId('');
      
      setActiveBattleplan(null);
      setPhase('DEFENDERS');
    } else if (newMyPool.length === 2) {
      setMatches([...matches, ...newMatches]);
      setMyPool(newMyPool);
      setOppPool(newOppPool);
      setAutoResolveData({
        type: '2',
        myReturned: myReturnedPlayer,
        oppReturned: oppReturnedPlayer,
        myLeftover: myLeftoverPlayer,
        oppLeftover: oppLeftoverPlayer
      });
      setActiveBattleplan(null);
      setPhase('FINAL');
    } else if (newMyPool.length === 1) {
      setMatches([...matches, ...newMatches]);
      setMyPool(newMyPool);
      setOppPool(newOppPool);
      setAutoResolveData({
        type: '1',
        myPlayer: newMyPool[0],
        oppPlayer: newOppPool[0]
      });
      setActiveBattleplan(null);
      setPhase('FINAL');
    } else {
      setMatches([...matches, ...newMatches]);
      setMyPool([]);
      setOppPool([]);
      setPhase('DONE');
    }
  };

  const confirmFinal = () => {
    if (autoResolveData.type === '2') {
      const finalMatches = [
        { my: autoResolveData.myReturned, opp: autoResolveData.oppLeftover, score: getExpectedScore(autoResolveData.myReturned.$id, autoResolveData.oppLeftover.$id) },
        { my: autoResolveData.myLeftover, opp: autoResolveData.oppReturned, score: getExpectedScore(autoResolveData.myLeftover.$id, autoResolveData.oppReturned.$id) }
      ];
      setMatches([...matches, ...finalMatches]);
    } else {
      const lastMatch = { my: autoResolveData.myPlayer, opp: autoResolveData.oppPlayer, score: getExpectedScore(autoResolveData.myPlayer.$id, autoResolveData.oppPlayer.$id) };
      setMatches([...matches, ...lastMatch]);
    }
    setMyPool([]);
    setOppPool([]);
    setPhase('DONE');
  };

  const isSelected = (id) => [myDefId, oppDefId, myAtt1Id, myAtt2Id, oppAtt1Id, oppAtt2Id].includes(id);

  // --- Universeel Spelerskaartje Component ---
  const SharedPlayerCard = ({ player, isMyTeam, oppPoolList, isDraggable, isDimmed, showRemove, onRemove, isSelectable, isSelectedCard, onClick, highlightMatchup }) => {
    const bpScore = getPlayerBpScore(player);

    return (
      <div 
        draggable={isDraggable && !isDimmed}
        onDragStart={(e) => {
          if (isDraggable && !isDimmed) {
            e.dataTransfer.setData('playerId', player.$id);
            e.dataTransfer.setData('pool', isMyTeam ? 'my' : 'opp');
          }
        }}
        onClick={isSelectable ? onClick : undefined}
        className={`bg-slate-800 border-2 rounded-md p-3 transition-all relative w-full
          ${isDimmed ? 'opacity-30 cursor-not-allowed border-slate-700' : ''}
          ${isDraggable && !isDimmed ? 'cursor-grab hover:border-slate-500 shadow-md mb-3' : 'mb-0'}
          ${isSelectable ? 'cursor-pointer hover:scale-105 transform duration-200' : ''}
          ${isSelectedCard ? (isMyTeam ? 'border-emerald-500 bg-emerald-500/20' : 'border-blue-500 bg-blue-500/20') : 'border-slate-700'}
          ${!isDimmed && !isSelectable && !isSelectedCard ? 'border-slate-700' : ''}
        `}
      >
        <div className="flex justify-between items-start">
          <div className="flex-grow pr-2">
            <div className="flex items-center space-x-2">
              <p className="font-bold text-white text-sm leading-tight">{player.Naam}</p>
              {bpScore !== null && (
                <span className={`text-[10px] flex items-center px-1.5 py-0.5 rounded font-bold bg-slate-900 border ${getScoreColor(bpScore)} border-current`}>
                  <Map size={10} className="mr-1"/> BP: {bpScore}
                </span>
              )}
            </div>
            <p className="text-xs text-rose-300 mt-1">{player.Army}</p>
          </div>
          <div className="flex space-x-1.5 flex-shrink-0">
            {/* Matchups Knop */}
            <button 
              onClick={(e) => { e.stopPropagation(); setMatchupsModal({ isOpen: true, player, oppPoolList, isMyTeam }); }}
              className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 rounded transition-colors"
              title={t('viewExpectedMatchups')}
            >
              <Waypoints size={14} />
            </button>
            {/* Lijst Knop */}
            {player.Lijst && (
              <button 
                onClick={(e) => { e.stopPropagation(); setListModal({ isOpen: true, content: player.Lijst, title: player.Naam }); }}
                className="p-1.5 text-slate-400 hover:text-emerald-400 bg-slate-900 rounded transition-colors"
                title={t('viewList')}
              >
                <FileText size={14} />
              </button>
            )}
            {/* Verwijder Knop (alleen in dropzone) */}
            {showRemove && (
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-900 rounded transition-colors ml-1"
                title={t('removeFromSelection')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        
        {/* Highlight Matchup Score */}
        {highlightMatchup && (
          <div className={`mt-3 w-full text-center py-1.5 rounded bg-slate-950/80 border border-slate-700 text-xs font-bold ${getScoreColor(highlightMatchup.score)}`}>
            {highlightMatchup.label}: <span className="text-sm ml-1">{highlightMatchup.score}</span>
          </div>
        )}
      </div>
    );
  };

  const DropZone = ({ label, labelClass, borderClass, poolType, selectedId, onDrop, onRemove }) => {
    const player = poolType === 'my' 
      ? myPool.find(p => p.$id === selectedId) 
      : oppPool.find(p => p.$id === selectedId);

    return (
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const pId = e.dataTransfer.getData('playerId');
          const pPool = e.dataTransfer.getData('pool');
          if (pPool === poolType) onDrop(pId);
        }}
        className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center min-h-[120px] transition-colors ${player ? `bg-slate-800 border-solid ${borderClass}` : `bg-slate-950 border-dashed border-slate-700 hover:border-slate-500`}`}
      >
        <label className={`block ${labelClass} font-bold mb-3 text-center text-sm`}>{label}</label>
        {player ? (
          <div className="w-full animate-in zoom-in-95">
             <SharedPlayerCard 
               player={player} 
               isMyTeam={poolType === 'my'} 
               oppPoolList={poolType === 'my' ? oppPool : myPool} 
               isDraggable={false} 
               isDimmed={false}
               showRemove={true}
               onRemove={onRemove}
             />
          </div>
        ) : (
          <p className="text-slate-500 text-xs italic">{t('dragPlayerHere')}</p>
        )}
      </div>
    );
  };

  if (!isStarted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <Waypoints className="text-emerald-500" />
            <span>{t('startSim')}</span>
          </h2>
          <p className="text-slate-400 mb-6">
            {t('simDesc1')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-emerald-400 mb-2">{t('yourTeam')}</label>
              <select 
                value={myTeamId} onChange={(e) => { setMyTeamId(e.target.value); setOppTeamId(''); }}
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-3 text-white focus:border-emerald-500 outline-none"
              >
                <option value="">{t('selectYourTeam')}</option>
                {teams.map(t => <option key={t.$id} value={t.$id}>{t.Naam}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-400 mb-2">{t('oppTeam')}</label>
              <select 
                value={oppTeamId} onChange={(e) => setOppTeamId(e.target.value)}
                disabled={!myTeamId || availableOpponents.length === 0}
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-3 text-white focus:border-blue-500 outline-none disabled:opacity-50"
              >
                <option value="">{t('selectOppTeam')}</option>
                {availableOpponents.map(t => <option key={t.$id} value={t.$id}>{t.Naam}</option>)}
              </select>
              {myTeamId && availableOpponents.length === 0 && (
                <p className="text-xs text-red-400 mt-2">{t('noMatchupFound')}</p>
              )}
            </div>
          </div>
          
          <button 
            onClick={startDraft}
            disabled={!myTeamId || !oppTeamId}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            {t('startDraftBtn')}
          </button>
        </div>
      </div>
    );
  }

  const myTeam = teams.find(t => t.$id === myTeamId);
  const oppTeam = teams.find(t => t.$id === oppTeamId);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header balkje simulatie */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-emerald-400">{myTeam?.Naam}</h2>
          <span className="text-slate-500 font-bold">{t('vs')}</span>
          <h2 className="text-xl font-bold text-blue-400">{oppTeam?.Naam}</h2>
        </div>
        
        {/* Huidige Battleplan Indicator (alleen in de Attackers en Resolve fase) */}
        {activeBattleplan && phase !== 'DEFENDERS' && phase !== 'FINAL' && (
          <button 
            onClick={() => setBattleplanModal({ isOpen: true, image: activeBattleplan.image, title: activeBattleplan.name })}
            className="flex items-center px-4 py-2 bg-purple-900/40 border border-purple-500/50 rounded-lg hover:bg-purple-800/40 transition-colors"
          >
            <Map className="text-purple-400 mr-2" size={20} />
            <span className="font-bold text-purple-300">{t('mission')} {activeBattleplan.name}</span>
          </button>
        )}

        <button onClick={resetSimulator} className="text-slate-400 hover:text-white flex items-center space-x-2 text-sm bg-slate-800 px-3 py-1.5 rounded-md shrink-0">
          <RefreshCw size={14} /> <span>{t('restart')}</span>
        </button>
      </div>

      {/* Grid Layout: Sidebar L | Center | Sidebar R */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Linker Sidebar: Mijn Pool */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-[75vh] overflow-hidden">
          <h3 className="text-emerald-400 font-bold mb-4 border-b border-slate-800 pb-2">{t('yourPool')} ({myPool.length})</h3>
          <div className="overflow-y-auto flex-grow pr-1 space-y-3">
            {myPool.map(p => {
              let highlight = null;
              if (phase === 'ATTACKERS' && oppDefId) {
                highlight = { score: getExpectedScore(p.$id, oppDefId), label: t('vsOppDef') };
              }
              return (
                <SharedPlayerCard 
                  key={p.$id} player={p} isMyTeam={true} oppPoolList={oppPool}
                  isDraggable={true} isDimmed={isSelected(p.$id)} highlightMatchup={highlight}
                />
              );
            })}
            {myPool.length === 0 && <p className="text-slate-500 italic text-sm">{t('noPlayersLeft')}</p>}
          </div>
        </div>

        {/* Midden: Draft Board */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-col h-[75vh] overflow-hidden">
          
          {/* Phase indicator */}
          <div className="flex justify-center border-b border-slate-800 shrink-0">
            {['DEFENDERS', 'ATTACKERS', 'RESOLVE', 'FINAL', 'DONE'].map((step) => (
               <div key={step} className={`px-4 py-3 text-xs font-bold uppercase ${phase === step ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-600'}`}>
                 {step}
               </div>
            ))}
          </div>

          {/* Draft Content */}
          <div className="p-6 overflow-y-auto flex-grow bg-slate-950">
            
            {/* VOLTOOIDE PAIRINGS OVERZICHT */}
            {matches.length > 0 && phase !== 'DONE' && (
              <div className="mb-8 border-b border-slate-800 pb-6 animate-in fade-in">
                <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('completedPairings')}</h3>
                <div className="flex flex-col gap-3">
                  {matches.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-md">
                      <div className="flex-1">
                        <p className="font-bold text-emerald-400 text-sm">{m.my?.Naam}</p>
                        <p className="text-xs text-slate-400">{m.my?.Army}</p>
                      </div>
                      <div className={`mx-4 px-4 py-1.5 text-xl font-black rounded-lg border border-slate-700 bg-slate-950 ${getScoreColor(m.score)}`}>
                        {m.score}
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-bold text-blue-400 text-sm">{m.opp?.Naam}</p>
                        <p className="text-xs text-slate-400">{m.opp?.Army}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {phase === 'DEFENDERS' && (
              <div className="space-y-6 animate-in fade-in">
                
                {/* 1. Battleplan Selectie */}
                <div className="bg-slate-900 border border-purple-500/30 p-5 rounded-xl shadow-inner mb-6">
                  <label className="block text-purple-400 font-bold mb-3 text-lg flex items-center"><Map className="mr-2"/> {t('phase1Title')}</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={activeBattleplan?.id || ''}
                      onChange={(e) => setActiveBattleplan(BATTLEPLANS.find(b => b.id === Number(e.target.value)))}
                      className="flex-grow bg-slate-950 border border-slate-700 rounded-md p-3 text-white focus:border-purple-500 outline-none font-medium text-lg"
                    >
                      <option value="">{t('selectMission')}</option>
                      {BATTLEPLANS.map(bp => <option key={bp.id} value={bp.id}>{bp.id}. {bp.name}</option>)}
                    </select>
                    {activeBattleplan && (
                      <button
                        onClick={() => setBattleplanModal({ isOpen: true, image: activeBattleplan.image, title: activeBattleplan.name })}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-md font-bold transition-colors flex items-center justify-center space-x-2 shrink-0"
                      >
                        <Map size={20} /> <span>{t('viewCard')}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className={`transition-opacity duration-300 ${!activeBattleplan ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                  <h3 className="text-center text-xl font-bold text-white mb-8 border-t border-slate-800 pt-6">{t('phase2Title')}</h3>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <DropZone 
                      label={t('yourDefender')} labelClass="text-emerald-400" borderClass="border-emerald-900/50"
                      poolType="my" selectedId={myDefId}
                      onDrop={(id) => setMyDefId(id)} onRemove={() => setMyDefId('')}
                    />
                    <DropZone 
                      label={t('oppDefender')} labelClass="text-blue-400" borderClass="border-blue-900/50"
                      poolType="opp" selectedId={oppDefId}
                      onDrop={(id) => setOppDefId(id)} onRemove={() => setOppDefId('')}
                    />
                  </div>

                  <div className="flex justify-center mt-8 pt-4">
                    <button onClick={confirmDefenders} disabled={!myDefId || !oppDefId || !activeBattleplan} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50">
                      {t('confirmDefenders')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {phase === 'ATTACKERS' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-center text-xl font-bold text-white mb-2">{t('phase2SelectAtt')}</h3>
                <p className="text-center text-slate-400 text-sm mb-6">{t('dragAttackers')}</p>
                
                <div className="grid grid-cols-2 gap-8">
                  
                  {/* Linker kolom: Tegen Hun Defender */}
                  <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col space-y-4 shadow-inner">
                    <h4 className="text-center font-bold text-blue-400 border-b border-slate-800 pb-2">{t('againstOppDef')}</h4>
                    <div className="flex justify-center pb-2">
                      <div className="w-full max-w-[280px]">
                        {oppPool.find(p=>p.$id===oppDefId) && (
                          <SharedPlayerCard player={oppPool.find(p=>p.$id===oppDefId)} isMyTeam={false} oppPoolList={myPool} isDraggable={false} />
                        )}
                      </div>
                    </div>
                    <DropZone label={t('yourAtt1')} labelClass="text-emerald-400" borderClass="border-emerald-900/50" poolType="my" selectedId={myAtt1Id} onDrop={(id) => { if(id !== myAtt2Id) setMyAtt1Id(id); }} onRemove={() => setMyAtt1Id('')} />
                    <DropZone label={t('yourAtt2')} labelClass="text-emerald-400" borderClass="border-emerald-900/50" poolType="my" selectedId={myAtt2Id} onDrop={(id) => { if(id !== myAtt1Id) setMyAtt2Id(id); }} onRemove={() => setMyAtt2Id('')} />
                  </div>
                  
                  {/* Rechter kolom: Tegen Mijn Defender */}
                  <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col space-y-4 shadow-inner">
                    <h4 className="text-center font-bold text-emerald-400 border-b border-slate-800 pb-2">{t('againstYourDef')}</h4>
                    <div className="flex justify-center pb-2">
                      <div className="w-full max-w-[280px]">
                        {myPool.find(p=>p.$id===myDefId) && (
                          <SharedPlayerCard player={myPool.find(p=>p.$id===myDefId)} isMyTeam={true} oppPoolList={oppPool} isDraggable={false} />
                        )}
                      </div>
                    </div>
                    <DropZone label={t('oppAtt1')} labelClass="text-blue-400" borderClass="border-blue-900/50" poolType="opp" selectedId={oppAtt1Id} onDrop={(id) => { if(id !== oppAtt2Id) setOppAtt1Id(id); }} onRemove={() => setOppAtt1Id('')} />
                    <DropZone label={t('oppAtt2')} labelClass="text-blue-400" borderClass="border-blue-900/50" poolType="opp" selectedId={oppAtt2Id} onDrop={(id) => { if(id !== oppAtt1Id) setOppAtt2Id(id); }} onRemove={() => setOppAtt2Id('')} />
                  </div>

                </div>

                <div className="flex justify-center mt-8 pt-4">
                  <button onClick={confirmAttackers} disabled={!myAtt1Id || !myAtt2Id || !oppAtt1Id || !oppAtt2Id} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50">
                    {t('confirmAttackers')}
                  </button>
                </div>
              </div>
            )}

            {phase === 'RESOLVE' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-center text-xl font-bold text-white mb-6">{t('phase3Resolve')}</h3>
                
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 mb-6 shadow-inner">
                  <p className="text-center mb-6 text-slate-300">{t('youChoose')}</p>
                  <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                    <div className="w-full sm:w-64">
                       <h4 className="text-center font-bold text-emerald-400 mb-2">{t('yourDefender')}</h4>
                       <SharedPlayerCard player={myPool.find(p=>p.$id===myDefId)} isMyTeam={true} oppPoolList={oppPool} isDraggable={false} />
                    </div>
                    <div className="text-slate-500 font-bold px-4">{t('vs')}</div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {[oppAtt1Id, oppAtt2Id].map(id => {
                        const p = oppPool.find(x=>x.$id===id);
                        if(!p) return null;
                        const score = getExpectedScore(myDefId, p.$id);
                        return (
                          <div key={id} className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedOppAttId === id ? 'border-emerald-500 bg-emerald-900/20' : 'border-slate-800 bg-slate-950 hover:border-slate-600'}`} onClick={() => setSelectedOppAttId(id)}>
                            <div className={`text-center mb-2 text-2xl font-black ${getScoreColor(score)}`}>{score}</div>
                            <SharedPlayerCard player={p} isMyTeam={false} oppPoolList={myPool} isDraggable={false} isSelectable={false} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-inner">
                  <p className="text-center mb-6 text-slate-300">{t('oppChooses')}</p>
                  <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {[myAtt1Id, myAtt2Id].map(id => {
                        const p = myPool.find(x=>x.$id===id);
                        if(!p) return null;
                        const score = getExpectedScore(p.$id, oppDefId);
                        return (
                          <div key={id} className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedMyAttId === id ? 'border-blue-500 bg-blue-900/20' : 'border-slate-800 bg-slate-950 hover:border-slate-600'}`} onClick={() => setSelectedMyAttId(id)}>
                            <div className={`text-center mb-2 text-2xl font-black ${getScoreColor(score)}`}>{score}</div>
                            <SharedPlayerCard player={p} isMyTeam={true} oppPoolList={oppPool} isDraggable={false} isSelectable={false} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-slate-500 font-bold px-4">{t('vs')}</div>
                    <div className="w-full sm:w-64">
                       <h4 className="text-center font-bold text-blue-400 mb-2">{t('oppDefender')}</h4>
                       <SharedPlayerCard player={oppPool.find(p=>p.$id===oppDefId)} isMyTeam={false} oppPoolList={myPool} isDraggable={false} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <button onClick={confirmResolve} disabled={!selectedMyAttId || !selectedOppAttId} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50">
                    {t('confirmMatchups')}
                  </button>
                </div>
              </div>
            )}

            {phase === 'FINAL' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-center text-xl font-bold text-white mb-2">{t('autoLastPairings')}</h3>
                <p className="text-center text-slate-400 text-sm mb-6">{t('autoLastDesc')}</p>

                <div className="bg-slate-900 border border-purple-500/30 p-5 rounded-xl shadow-inner mb-6">
                  <label className="block text-purple-400 font-bold mb-3 text-lg flex items-center"><Map className="mr-2"/> {t('selectLastBp')}</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={activeBattleplan?.id || ''}
                      onChange={(e) => setActiveBattleplan(BATTLEPLANS.find(b => b.id === Number(e.target.value)))}
                      className="flex-grow bg-slate-950 border border-slate-700 rounded-md p-3 text-white focus:border-purple-500 outline-none font-medium text-lg"
                    >
                      <option value="">{t('selectMission')}</option>
                      {BATTLEPLANS.map(bp => <option key={bp.id} value={bp.id}>{bp.id}. {bp.name}</option>)}
                    </select>
                    {activeBattleplan && (
                      <button
                        onClick={() => setBattleplanModal({ isOpen: true, image: activeBattleplan.image, title: activeBattleplan.name })}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-md font-bold transition-colors flex items-center justify-center space-x-2 shrink-0"
                      >
                        <Map size={20} /> <span>{t('viewCard')}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className={`transition-opacity duration-300 ${!activeBattleplan ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 mb-6 shadow-inner space-y-8">
                    
                    {autoResolveData?.type === '2' && (
                      <>
                        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                          <div className="w-full sm:w-64">
                            <h4 className="text-center font-bold text-emerald-400 mb-2">{t('yourReturned')}</h4>
                            <SharedPlayerCard player={autoResolveData.myReturned} isMyTeam={true} oppPoolList={oppPool} isDraggable={false} />
                          </div>
                          <div className="text-slate-500 font-bold px-4">{t('vs')}</div>
                          <div className="w-full sm:w-64">
                            <h4 className="text-center font-bold text-blue-400 mb-2">{t('oppLeftover')}</h4>
                            <SharedPlayerCard player={autoResolveData.oppLeftover} isMyTeam={false} oppPoolList={myPool} isDraggable={false} />
                          </div>
                        </div>

                        <hr className="border-slate-800" />

                        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                          <div className="w-full sm:w-64">
                            <h4 className="text-center font-bold text-emerald-400 mb-2">{t('yourLeftover')}</h4>
                            <SharedPlayerCard player={autoResolveData.myLeftover} isMyTeam={true} oppPoolList={oppPool} isDraggable={false} />
                          </div>
                          <div className="text-slate-500 font-bold px-4">{t('vs')}</div>
                          <div className="w-full sm:w-64">
                            <h4 className="text-center font-bold text-blue-400 mb-2">{t('oppReturned')}</h4>
                            <SharedPlayerCard player={autoResolveData.oppReturned} isMyTeam={false} oppPoolList={myPool} isDraggable={false} />
                          </div>
                        </div>
                      </>
                    )}

                    {autoResolveData?.type === '1' && (
                      <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                        <div className="w-full sm:w-64">
                          <h4 className="text-center font-bold text-emerald-400 mb-2">{t('yourLast')}</h4>
                          <SharedPlayerCard player={autoResolveData.myPlayer} isMyTeam={true} oppPoolList={oppPool} isDraggable={false} />
                        </div>
                        <div className="text-slate-500 font-bold px-4">{t('vs')}</div>
                        <div className="w-full sm:w-64">
                          <h4 className="text-center font-bold text-blue-400 mb-2">{t('oppLast')}</h4>
                          <SharedPlayerCard player={autoResolveData.oppPlayer} isMyTeam={false} oppPoolList={myPool} isDraggable={false} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center mt-6">
                    <button onClick={confirmFinal} disabled={!activeBattleplan} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50">
                      {t('confirmFinal')}
                    </button>
                  </div>
                </div>

              </div>
            )}

            {phase === 'DONE' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="text-center mb-8">
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white">{t('draftCompleted')}</h3>
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                  <div className="grid grid-cols-3 bg-slate-800 p-3 text-sm font-bold text-slate-400 border-b border-slate-700">
                    <div>{myTeam?.Naam}</div>
                    <div className="text-center">{t('scoreExpected')}</div>
                    <div className="text-right">{oppTeam?.Naam}</div>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {matches.map((m, idx) => (
                      <div key={idx} className="grid grid-cols-3 p-4 items-center bg-slate-950">
                        <div className="font-semibold text-emerald-400">{m.my?.Naam}</div>
                        <div className="text-center flex justify-center">
                          <span className={`text-xl font-black w-12 py-1 rounded bg-slate-900 border border-slate-700 ${getScoreColor(m.score)}`}>
                            {m.score}
                          </span>
                        </div>
                        <div className="font-semibold text-blue-400 text-right">{m.opp?.Naam}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-800 p-4 border-t border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-white uppercase tracking-wider">{t('totalExpected')}</span>
                    <span className="text-2xl font-black text-yellow-500 bg-slate-900 px-4 py-1 rounded border border-yellow-500/30">
                      {matches.reduce((sum, m) => sum + m.score, 0)} / {matches.length * 20}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Rechter Sidebar: Opponent Pool */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-[75vh] overflow-hidden">
          <h3 className="text-blue-400 font-bold mb-4 border-b border-slate-800 pb-2">{t('oppPoolLabel')} ({oppPool.length})</h3>
          <div className="overflow-y-auto flex-grow pr-1 space-y-3">
            {oppPool.map(p => {
              let highlight = null;
              if (phase === 'ATTACKERS' && myDefId) {
                highlight = { score: getExpectedScore(myDefId, p.$id), label: t('yourScoreAgainstThem') };
              }
              return (
                <SharedPlayerCard 
                  key={p.$id} player={p} isMyTeam={false} oppPoolList={myPool}
                  isDraggable={true} isDimmed={isSelected(p.$id)} highlightMatchup={highlight}
                />
              );
            })}
            {oppPool.length === 0 && <p className="text-slate-500 italic text-sm">{t('noPlayersLeft')}</p>}
          </div>
        </div>

      </div>

      {/* --- LIJST MODAL (Pop-up voor Pairings) --- */}
      {listModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <FileText className="text-emerald-500" />
                <span>{t('listOf')} {listModal.title}</span>
              </h3>
              <button onClick={() => setListModal({ isOpen: false, content: '', title: '' })} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 min-h-[200px]">
                <pre className="text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {listModal.content || <span className="text-slate-500 italic">{t('noListPlayer')}</span>}
                </pre>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button onClick={() => setListModal({ isOpen: false, content: '', title: '' })} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MATCHUPS MODAL (Pop-up voor de verwachte scores) --- */}
      {matchupsModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Waypoints className="text-rose-500" />
                <span>{t('expectedMatchupsFor')} {matchupsModal.player?.Naam}</span>
              </h3>
              <button onClick={() => setMatchupsModal({ isOpen: false, player: null, oppPoolList: [], isMyTeam: true })} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
              <ul className="space-y-2">
                {matchupsModal.oppPoolList.map(opp => {
                  const score = matchupsModal.isMyTeam ? getExpectedScore(matchupsModal.player.$id, opp.$id) : getExpectedScore(opp.$id, matchupsModal.player.$id);
                  const note = matchupsModal.isMyTeam ? matrixNotes[matchupsModal.player.$id]?.[opp.$id] : matrixNotes[opp.$id]?.[matchupsModal.player.$id];
                  return (
                    <li key={opp.$id} className="flex flex-col bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center w-full">
                        <div>
                          <p className="font-bold text-white">{opp.Naam}</p>
                          <p className="text-xs text-slate-400">{opp.Army}</p>
                        </div>
                        <div className={`text-xl font-black bg-slate-900 border border-slate-700 px-3 py-1 rounded ${getScoreColor(score)}`}>
                          {score}
                        </div>
                      </div>
                      {note && (
                        <div className="mt-2 pt-2 border-t border-slate-800 text-xs text-slate-400 italic">
                          <span className="font-semibold text-slate-500">{t('note')}</span> {note}
                        </div>
                      )}
                    </li>
                  );
                })}
                {matchupsModal.oppPoolList.length === 0 && (
                  <p className="text-slate-500 italic text-sm text-center">{t('noOppInPool')}</p>
                )}
              </ul>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button onClick={() => setMatchupsModal({ isOpen: false, player: null, oppPoolList: [], isMyTeam: true })} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BATTLEPLAN MODAL --- */}
      {battleplanModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setBattleplanModal({ isOpen: false, image: '', title: '' })}>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setBattleplanModal({ isOpen: false, image: '', title: '' })} 
              className="absolute -top-10 right-0 text-slate-400 hover:text-white transition-colors flex items-center space-x-2"
            >
              <X size={24} /> <span className="font-bold">{t('close')}</span>
            </button>
            <img 
              src={battleplanModal.image} 
              alt={battleplanModal.title} 
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWUwZjFjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTRhM2I4IiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4iICsgYmF0dGxlcGxhbk1vZGFsLnRpdGxlICsgIiBuaWV0IGdldm9uZGVuPC90ZXh0Pjwvc3ZnPg==";
                console.error(`${t('bpMissing')} ${battleplanModal.image}.`);
              }}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg border-2 border-purple-500/50 shadow-2xl shadow-purple-900/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}