import { Category, Question, QuestionDifficulty } from '../types';

type DifficultyBank = Record<QuestionDifficulty, Question[]>;

type QuestionTypeBank = {
  multipleChoice: DifficultyBank;
  openEnded: DifficultyBank;
};

type QuestionBank = {
  [key in Category]: QuestionTypeBank;
};

export const questionBank: QuestionBank = {
  [Category.Sport]: {
    multipleChoice: {
      easy: [
        { question: "Jak se nazývá zimní sport kombinující běh na lyžích a střelbu?", options: ["Biatlon", "Severská kombinace", "Skikros", "Curling"], correctAnswer: "Biatlon", difficulty: "easy" },
        { question: "Ve kterém městě se konaly letní olympijské hry v roce 2016?", options: ["Londýn", "Tokio", "Rio de Janeiro", "Peking"], correctAnswer: "Rio de Janeiro", difficulty: "easy" },
        { question: "V jakém sportu proslul Michael Jordan?", options: ["Baseball", "Basketbal", "Americký fotbal", "Lední hokej"], correctAnswer: "Basketbal", difficulty: "easy" },
        { question: "Kolik hráčů je v curlingovém týmu?", options: ["2", "4", "5", "6"], correctAnswer: "4", difficulty: "easy" },
      ],
      medium: [
        { question: "Jak se jmenuje nejslavnější cyklistický závod na světě?", options: ["Giro d'Italia", "Vuelta a España", "Tour de France", "Paříž-Roubaix"], correctAnswer: "Tour de France", difficulty: "medium" },
        { question: "Která země vyhrála první Mistrovství světa ve fotbale v roce 1930?", options: ["Brazílie", "Argentina", "Itálie", "Uruguay"], correctAnswer: "Uruguay", difficulty: "medium" },
        { question: "Kolik bodů má v šachu nejcennější figura, královna?", options: ["3", "5", "9", "Nekonečno"], correctAnswer: "9", difficulty: "medium" },
        { question: "Jak se nazývá hodnota 180 bodů v šipkách, dosažená třemi šipkami v triple 20?", options: ["Bullseye", "Full house", "Maximum", "Tři v řadě"], correctAnswer: "Maximum", difficulty: "medium" },
      ],
      hard: [
        { question: "Který tenista drží rekord v počtu vyhraných grandslamových titulů v mužské dvouhře?", options: ["Roger Federer", "Rafael Nadal", "Novak Djokovič", "Pete Sampras"], correctAnswer: "Novak Djokovič", difficulty: "hard" },
        { question: "Který tým Formule 1 má nejvíce konstruktérských titulů?", options: ["McLaren", "Mercedes", "Ferrari", "Williams"], correctAnswer: "Ferrari", difficulty: "hard" },
        { question: "Který boxer byl známý jako 'The Greatest' a proslul svým 'tancem' v ringu?", options: ["Mike Tyson", "Rocky Marciano", "Muhammad Ali", "Joe Frazier"], correctAnswer: "Muhammad Ali", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "Kolik hráčů je na hřišti v jednom fotbalovém týmu?", correctAnswer: "11", difficulty: "easy" },
        { question: "Jak se v hokeji nazývá situace, kdy hráč vstřelí tři góly v jednom zápase?", correctAnswer: "Hattrick", difficulty: "easy" },
        { question: "Na jakém povrchu se hraje slavný tenisový turnaj Wimbledon?", correctAnswer: "Tráva", difficulty: "easy" },
        { question: "Jaká barva je střed terče v lukostřelbě?", correctAnswer: "Žlutá", difficulty: "easy" },
      ],
      medium: [
        { question: "Jak se nazývá finálový zápas ligy amerického fotbalu (NFL)?", correctAnswer: "Super Bowl", difficulty: "medium" },
        { question: "Jak dlouhý je maratonský běh (v kilometrech, stačí celé číslo)?", correctAnswer: "42", difficulty: "medium" },
        { question: "Z jaké země pochází bojové umění judo?", correctAnswer: "Japonsko", difficulty: "medium" },
        { question: "Kolik kol má standardní boxerský zápas o titul mistra světa?", correctAnswer: "12", difficulty: "medium" },
      ],
      hard: [
        { question: "Jaké je jméno nejvyšší hory světa, kterou se snaží zdolat horolezci?", correctAnswer: "Mount Everest", difficulty: "hard" },
        { question: "Jak se jmenuje jediný sportovec, který vyhrál zlatou medaili na letních i zimních olympijských hrách v různých sportech?", correctAnswer: "Eddie Eagan", difficulty: "hard" },
      ]
    },
  },
  [Category.Esport]: {
    multipleChoice: {
      easy: [
        { question: "Která společnost vyvinula populární hru Fortnite?", options: ["Electronic Arts", "Ubisoft", "Epic Games", "Activision Blizzard"], correctAnswer: "Epic Games", difficulty: "easy" },
        { question: "Jak se jmenuje herní platforma pro streamování, kterou vlastní Amazon?", options: ["YouTube Gaming", "Mixer", "Twitch", "Facebook Gaming"], correctAnswer: "Twitch", difficulty: "easy" },
        { question: "Ve hře Valorant, kolik hráčů je v jednom týmu?", options: ["3", "4", "5", "6"], correctAnswer: "5", difficulty: "easy" },
        { question: "Jak se jmenuje hlavní hrdina série The Witcher?", options: ["Geralt z Rivie", "Ciri", "Yennefer", "Triss"], correctAnswer: "Geralt z Rivie", difficulty: "easy" },
      ],
      medium: [
        { question: "Která z následujících her je strategická hra v reálném čase (RTS)?", options: ["StarCraft II", "Overwatch", "Rocket League", "Apex Legends"], correctAnswer: "StarCraft II", difficulty: "medium" },
        { question: "Jak se jmenuje virtuální měna ve hře Minecraft?", options: ["Kredity", "Zlaťáky", "Smaragdy", "Minecoiny"], correctAnswer: "Smaragdy", difficulty: "medium" },
        { question: "Která hra je považována za průkopníka žánru MOBA (Multiplayer Online Battle Arena)?", options: ["Dota 2", "League of Legends", "Smite", "Defense of the Ancients (DotA)"], correctAnswer: "Defense of the Ancients (DotA)", difficulty: "medium" },
        { question: "Která hra popularizovala žánr 'Battle Royale' na masovou úroveň?", options: ["Fortnite", "Apex Legends", "PlayerUnknown's Battlegrounds (PUBG)", "Call of Duty: Warzone"], correctAnswer: "PlayerUnknown's Battlegrounds (PUBG)", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se jmenuje nejprestižnější turnaj ve hře Counter-Strike: Global Offensive?", options: ["The International", "World Championship", "Major", "Captains Draft"], correctAnswer: "Major", difficulty: "hard" },
        { question: "Jak se jmenuje první hra, která byla v Jižní Koreji oficiálně uznána jako e-sport a odstartovala tamní fenomén?", options: ["Warcraft III", "StarCraft: Brood War", "Counter-Strike 1.6", "Quake"], correctAnswer: "StarCraft: Brood War", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "Co znamená zkratka 'GG', často používaná na konci zápasu?", correctAnswer: "Good game", difficulty: "easy" },
        { question: "Jaký je hlavní cíl ve hře Rocket League?", correctAnswer: "Dát gól", difficulty: "easy" },
        { question: "Jak se jmenuje hlavní postava v sérii her The Legend of Zelda?", correctAnswer: "Link", difficulty: "easy" },
        { question: "Co znamená zkratka FPS ve hrách?", correctAnswer: "Frames Per Second", difficulty: "easy" },
      ],
      medium: [
        { question: "Z jaké země pochází profesionální hráč 'Faker', legenda hry League of Legends?", correctAnswer: "Jižní Korea", difficulty: "medium" },
        { question: "Která herní série je známá svou post-apokalyptickou pustinou a postavou Vault Boy?", correctAnswer: "Fallout", difficulty: "medium" },
        { question: "Jak se jmenuje fiktivní město, ve kterém se odehrává série her Grand Theft Auto (GTA)?", correctAnswer: "Los Santos", difficulty: "medium" },
        { question: "Jak se jmenuje měna používaná ve hře 'Animal Crossing'?", correctAnswer: "Bells", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se jmenuje hlavní mapa, na které se hraje League of Legends?", correctAnswer: "Summoner's Rift", difficulty: "hard" },
        { question: "Který tým vyhrál první 'The International' turnaj ve hře Dota 2 v roce 2011?", correctAnswer: "Natus Vincere", difficulty: "hard" },
      ]
    },
  },
  [Category.SocialMedia]: {
    multipleChoice: {
      easy: [
        { question: "Která sociální síť byla původně vytvořena pro sdílení krátkých videí a je známá svými virálními tanečními výzvami?", options: ["Instagram", "Facebook", "TikTok", "Twitter"], correctAnswer: "TikTok", difficulty: "easy" },
        { question: "Která společnost je mateřskou společností Instagramu a WhatsAppu?", options: ["Alphabet", "Meta", "Microsoft", "Apple"], correctAnswer: "Meta", difficulty: "easy" },
        { question: "Jak se nazývají mizející obrázky a videa na Snapchatu a Instagramu?", options: ["Momenty", "Příběhy (Stories)", "Záblesky", "Fleety"], correctAnswer: "Příběhy (Stories)", difficulty: "easy" },
        { question: "Jakou barvu má logo aplikace Snapchat?", options: ["Modrá", "Červená", "Zelená", "Žlutá"], correctAnswer: "Žlutá", difficulty: "easy" },
      ],
      medium: [
        { question: "Jaká sociální síť je primárně zaměřena na profesionální networking a kariérní rozvoj?", options: ["Pinterest", "Reddit", "LinkedIn", "Tumblr"], correctAnswer: "LinkedIn", difficulty: "medium" },
        { question: "Jak se nazývají komunitní fóra na platformě Reddit?", options: ["Groups", "Boards", "Channels", "Subreddits"], correctAnswer: "Subreddits", difficulty: "medium" },
        { question: "Jak se jmenuje platforma, kterou vlastní Google a je primárně určena pro sdílení videí?", options: ["Vimeo", "YouTube", "Dailymotion", "Twitch"], correctAnswer: "YouTube", difficulty: "medium" },
        { question: "Která z následujících sociálních sítí byla spuštěna jako první?", options: ["Facebook", "MySpace", "SixDegrees", "Friendster"], correctAnswer: "SixDegrees", difficulty: "medium" },
      ],
      hard: [
        { question: "Která platforma pro zasílání zpráv je známá svým zaměřením na soukromí a end-to-end šifrování?", options: ["Facebook Messenger", "Telegram", "Discord", "Skype"], correctAnswer: "Telegram", difficulty: "hard" },
        { question: "Jak se jmenuje algoritmus, který používá TikTok k doporučování videí uživatelům na stránce 'Pro tebe'?", options: ["PageRank", "EdgeRank", "For You", "The Algorithm"], correctAnswer: "For You", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "Co znamená zkratka 'DM' v kontextu sociálních sítí?", correctAnswer: "Direct Message", difficulty: "easy" },
        { question: "Která sociální síť používá 'piny' a 'nástěnky' pro organizaci obsahu?", correctAnswer: "Pinterest", difficulty: "easy" },
        { question: "Jak se jmenuje platforma, která kombinuje chat, audio a video hovory, a je populární hlavně mezi hráči?", correctAnswer: "Discord", difficulty: "easy" },
        { question: "Jak se nazývá krátké video na Instagramu, které je podobné videím na TikToku?", correctAnswer: "Reels", difficulty: "easy" },
      ],
      medium: [
        { question: "Jaký je maximální počet znaků v jednom tweetu na platformě X (dříve Twitter) pro standardního uživatele?", correctAnswer: "280", difficulty: "medium" },
        { question: "Kdo je hlavním zakladatelem a CEO společnosti Facebook (nyní Meta)?", correctAnswer: "Mark Zuckerberg", difficulty: "medium" },
        { question: "Jak se nazývá funkce na Twitteru (nyní X), která umožňuje sdílet cizí příspěvek na svém profilu?", correctAnswer: "Retweet", difficulty: "medium" },
        { question: "Kdo je jedním z hlavních zakladatelů platformy X (dříve Twitter)?", correctAnswer: "Jack Dorsey", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se jmenoval ptáček v původním logu Twitteru?", correctAnswer: "Larry", difficulty: "hard" },
        { question: "Jaké bylo původní jméno Instagramu, než byl přejmenován?", correctAnswer: "Burbn", difficulty: "hard" },
      ]
    },
  },
  [Category.Culture]: {
    multipleChoice: {
      easy: [
        { question: "Kdo je autorem slavného obrazu 'Mona Lisa'?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"], correctAnswer: "Leonardo da Vinci", difficulty: "easy" },
        { question: "Kdo napsal slavnou tragédii 'Romeo a Julie'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austenová", "Homér"], correctAnswer: "William Shakespeare", difficulty: "easy" },
        { question: "Ve kterém městě se nachází slavné muzeum Louvre?", options: ["Londýn", "Řím", "New York", "Paříž"], correctAnswer: "Paříž", difficulty: "easy" },
        { question: "Který nástroj hraje fiktivní postava Sherlock Holmes?", options: ["Klavír", "Housle", "Violoncello", "Flétna"], correctAnswer: "Housle", difficulty: "easy" },
      ],
      medium: [
        { question: "Která kapela vydala slavné album 'The Dark Side of the Moon'?", options: ["The Beatles", "Led Zeppelin", "Queen", "Pink Floyd"], correctAnswer: "Pink Floyd", difficulty: "medium" },
        { question: "Kdo je režisérem filmové trilogie 'Pán prstenů'?", options: ["Steven Spielberg", "George Lucas", "James Cameron", "Peter Jackson"], correctAnswer: "Peter Jackson", difficulty: "medium" },
        { question: "Jak se jmenuje autorka série knih o Harrym Potterovi?", options: ["J. R. R. Tolkien", "George R. R. Martin", "J. K. Rowlingová", "Suzanne Collinsová"], correctAnswer: "J. K. Rowlingová", difficulty: "medium" },
        { question: "Kdo režíroval kultovní film 'Pulp Fiction'?", options: ["Martin Scorsese", "Steven Spielberg", "Quentin Tarantino", "David Fincher"], correctAnswer: "Quentin Tarantino", difficulty: "medium" },
      ],
      hard: [
        { question: "Který hudební skladatel je autorem slavné 'Ódy na radost'?", options: ["Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Ludwig van Beethoven", "Fryderyk Chopin"], correctAnswer: "Ludwig van Beethoven", difficulty: "hard" },
        { question: "Jak se jmenuje literární směr charakterizovaný pocity úzkosti, absurdity a odcizení, jehož klíčovým představitelem byl Franz Kafka?", options: ["Romantismus", "Realismus", "Existencialismus", "Surrealismus"], correctAnswer: "Existencialismus", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "V jakém městě se nachází slavná opera La Scala?", correctAnswer: "Milán", difficulty: "easy" },
        { question: "Jak se jmenuje japonské umění skládání papíru?", correctAnswer: "Origami", difficulty: "easy" },
        { question: "Z jaké země pochází hudební žánr flamenco?", correctAnswer: "Španělsko", difficulty: "easy" },
        { question: "Z jakého města pocházela legendární kapela The Beatles?", correctAnswer: "Liverpool", difficulty: "easy" },
      ],
      medium: [
        { question: "Kdo namaloval strop Sixtinské kaple ve Vatikánu?", correctAnswer: "Michelangelo", difficulty: "medium" },
        { question: "Kdo napsal dystopický román '1984'?", correctAnswer: "George Orwell", difficulty: "medium" },
        { question: "Jaké je jméno kytaristy kapely Queen?", correctAnswer: "Brian May", difficulty: "medium" },
        { question: "Jak se jmenuje slavná socha nahého muže od Michelangela?", correctAnswer: "David", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se jmenuje hlavní město Aztécké říše?", correctAnswer: "Tenochtitlán", difficulty: "hard" },
        { question: "Který film získal jako úplně první cenu Akademie (Oscara) za nejlepší film v roce 1929?", correctAnswer: "Wings", difficulty: "hard" },
      ]
    },
  },
  [Category.Geography]: {
    multipleChoice: {
      easy: [
        { question: "Jaké je hlavní město Austrálie?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correctAnswer: "Canberra", difficulty: "easy" },
        { question: "Který oceán je největší na světě?", options: ["Atlantský", "Indický", "Tichý", "Severní ledový"], correctAnswer: "Tichý", difficulty: "easy" },
        { question: "Která řeka protéká Paříží?", options: ["Dunaj", "Rhôna", "Loira", "Seina"], correctAnswer: "Seina", difficulty: "easy" },
        { question: "Který stát je největší na světě podle rozlohy?", options: ["Kanada", "Čína", "USA", "Rusko"], correctAnswer: "Rusko", difficulty: "easy" },
      ],
      medium: [
        { question: "Ve které zemi se nachází Machu Picchu?", options: ["Brazílie", "Mexiko", "Peru", "Kolumbie"], correctAnswer: "Peru", difficulty: "medium" },
        { question: "Jak se jmenuje nejdelší pohoří na světě?", options: ["Himaláj", "Andy", "Skalnaté hory", "Ural"], correctAnswer: "Andy", difficulty: "medium" },
        { question: "Která země má nejvíce obyvatel na světě?", options: ["Čína", "USA", "Indie", "Indonésie"], correctAnswer: "Indie", difficulty: "medium" },
        { question: "Jak se jmenuje nejhlubší místo na Zemi, nacházející se v Tichém oceánu?", options: ["Portorický příkop", "Jávský příkop", "Marianský příkop", "Tichomořský příkop"], correctAnswer: "Marianský příkop", difficulty: "medium" },
      ],
      hard: [
        { question: "Která řeka je nejdelší na světě?", options: ["Nil", "Amazonka", "Jang-c'-ťiang", "Mississippi"], correctAnswer: "Amazonka", difficulty: "hard" },
        { question: "Které město leží na dvou kontinentech, v Evropě i v Asii?", options: ["Káhira", "Istanbul", "Moskva", "Jeruzalém"], correctAnswer: "Istanbul", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "Která země je známá jako 'Země vycházejícího slunce'?", correctAnswer: "Japonsko", difficulty: "easy" },
        { question: "Na kterém kontinentu se nachází poušť Sahara?", correctAnswer: "Afrika", difficulty: "easy" },
        { question: "Jaké je hlavní město Kanady?", correctAnswer: "Ottawa", difficulty: "easy" },
        { question: "Jaká je nejlidnatější země v Africe?", correctAnswer: "Nigérie", difficulty: "easy" },
      ],
      medium: [
        { question: "Jaký je název nejvyššího vodopádu na světě?", correctAnswer: "Salto Ángel", difficulty: "medium" },
        { question: "Jak se jmenuje největší ostrov světa?", correctAnswer: "Grónsko", difficulty: "medium" },
        { question: "Který průliv odděluje Evropu od Afriky?", correctAnswer: "Gibraltarský průliv", difficulty: "medium" },
        { question: "Jak se nazývá pohoří oddělující Evropu a Asii?", correctAnswer: "Ural", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se nazývá největší poušť světa (včetně polárních)?", correctAnswer: "Antarktická poušť", difficulty: "hard" },
        { question: "Jak se jmenuje jediná země na světě, která leží na všech čtyřech polokoulích (severní, jižní, východní, západní)?", correctAnswer: "Kiribati", difficulty: "hard" },
      ]
    },
  },
  [Category.Science]: {
    multipleChoice: {
      easy: [
        { question: "Jaká je chemická značka pro zlato?", options: ["Ag", "Au", "Fe", "Pb"], correctAnswer: "Au", difficulty: "easy" },
        { question: "Která planeta je v naší sluneční soustavě nejblíže Slunci?", options: ["Venuše", "Mars", "Merkur", "Země"], correctAnswer: "Merkur", difficulty: "easy" },
        { question: "Jaký plyn je nejhojněji zastoupen v zemské atmosféře?", options: ["Kyslík", "Oxid uhličitý", "Argon", "Dusík"], correctAnswer: "Dusík", difficulty: "easy" },
        { question: "Který plyn je nezbytný pro dýchání většiny živých organismů?", options: ["Vodík", "Kyslík", "Helium", "Dusík"], correctAnswer: "Kyslík", difficulty: "easy" },
      ],
      medium: [
        { question: "Kolik kostí má dospělý člověk?", options: ["206", "212", "198", "220"], correctAnswer: "206", difficulty: "medium" },
        { question: "Jak se nazývá 'elektrárna' buňky?", options: ["Jádro", "Ribozom", "Mitochondrie", "Vakuola"], correctAnswer: "Mitochondrie", difficulty: "medium" },
        { question: "Jaká je přibližná rychlost světla ve vakuu (v km/s)?", options: ["300 000", "150 000", "500 000", "1 000 000"], correctAnswer: "300 000", difficulty: "medium" },
        { question: "Jak se nazývá studium živých organismů?", options: ["Chemie", "Fyzika", "Geologie", "Biologie"], correctAnswer: "Biologie", difficulty: "medium" },
      ],
      hard: [
        { question: "Kdo je autorem teorie relativity?", options: ["Isaac Newton", "Galileo Galilei", "Albert Einstein", "Nikola Tesla"], correctAnswer: "Albert Einstein", difficulty: "hard" },
        { question: "Co je to 'černá díra' v kontextu astronomie?", options: ["Planeta bez světla", "Oblast s extrémně silnou gravitací", "Temná mlhovina", "Vyhaslá hvězda"], correctAnswer: "Oblast s extrémně silnou gravitací", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "Jak se běžně nazývá chemická sloučenina H₂O?", correctAnswer: "Voda", difficulty: "easy" },
        { question: "Který prvek má v periodické tabulce protonové číslo 1?", correctAnswer: "Vodík", difficulty: "easy" },
        { question: "Která planeta je známá svými prstenci?", correctAnswer: "Saturn", difficulty: "easy" },
        { question: "Kolik planet má naše sluneční soustava?", correctAnswer: "8", difficulty: "easy" },
      ],
      medium: [
        { question: "Co znamená zkratka DNA?", correctAnswer: "Deoxyribonukleová kyselina", difficulty: "medium" },
        { question: "Kdo objevil penicilin?", correctAnswer: "Alexander Fleming", difficulty: "medium" },
        { question: "Jak se nazývá síla, která přitahuje objekty k sobě?", correctAnswer: "Gravitace", difficulty: "medium" },
        { question: "Jaký je chemický symbol pro stříbro?", correctAnswer: "Ag", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se nazývá proces, při kterém rostliny přeměňují světelnou energii na chemickou?", correctAnswer: "Fotosyntéza", difficulty: "hard" },
        { question: "Jak se nazývá jednotka elektrického odporu?", correctAnswer: "Ohm", difficulty: "hard" },
      ]
    },
  },
};