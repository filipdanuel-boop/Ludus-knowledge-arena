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
        { question: "Jaká barva dresu označuje vedoucího jezdce v celkovém pořadí na Tour de France?", options: ["Zelená", "Bílá", "Puntíkovaná", "Žlutá"], correctAnswer: "Žlutá", difficulty: "easy" },
        { question: "Ve kterém sportu se používá termín 'love' pro skóre nula?", options: ["Stolní tenis", "Badminton", "Tenis", "Volejbal"], correctAnswer: "Tenis", difficulty: "easy" },
        { question: "Která země je považována za kolébku fotbalu?", options: ["Brazílie", "Anglie", "Itálie", "Německo"], correctAnswer: "Anglie", difficulty: "easy" },
        { question: "Kolik jamek má standardní golfové hřiště?", options: ["9", "12", "18", "24"], correctAnswer: "18", difficulty: "easy" },
        { question: "Jak se jmenuje sport, kde se jezdí na koni a holí se snaží trefit míček do branky?", options: ["Kriket", "Lakros", "Pólo", "Jezdecká"], correctAnswer: "Pólo", difficulty: "easy" },
        { question: "Které město hostilo letní olympijské hry v roce 2020 (konané v 2021)?", options: ["Paříž", "Los Angeles", "Tokio", "Řím"], correctAnswer: "Tokio", difficulty: "easy" },
      ],
      medium: [
        { question: "Jak se jmenuje nejslavnější cyklistický závod na světě?", options: ["Giro d'Italia", "Vuelta a España", "Tour de France", "Paříž-Roubaix"], correctAnswer: "Tour de France", difficulty: "medium" },
        { question: "Která země vyhrála první Mistrovství světa ve fotbale v roce 1930?", options: ["Brazílie", "Argentina", "Itálie", "Uruguay"], correctAnswer: "Uruguay", difficulty: "medium" },
        { question: "Kolik bodů má v šachu nejcennější figura, královna?", options: ["3", "5", "9", "Nekonečno"], correctAnswer: "9", difficulty: "medium" },
        { question: "Jak se nazývá hodnota 180 bodů v šipkách, dosažená třemi šipkami v triple 20?", options: ["Bullseye", "Full house", "Maximum", "Tři v řadě"], correctAnswer: "Maximum", difficulty: "medium" },
        { question: "Ve kterém sportu se soutěží o Stanley Cup?", options: ["Baseball", "Americký fotbal", "Basketbal", "Lední hokej"], correctAnswer: "Lední hokej", difficulty: "medium" },
        { question: "Jak se jmenuje bojové umění, které v překladu znamená 'jemná cesta'?", options: ["Karate", "Kung-fu", "Judo", "Taekwondo"], correctAnswer: "Judo", difficulty: "medium" },
        { question: "Který atlet drží světový rekord v běhu na 100 metrů mužů?", options: ["Tyson Gay", "Yohan Blake", "Justin Gatlin", "Usain Bolt"], correctAnswer: "Usain Bolt", difficulty: "medium" },
        { question: "Jaký je maximální počet holí, které může mít golfista v bagu během turnaje?", options: ["10", "12", "14", "16"], correctAnswer: "14", difficulty: "medium" },
        { question: "Která země vyhrála nejvíce Mistrovství světa ve fotbale?", options: ["Německo", "Itálie", "Argentina", "Brazílie"], correctAnswer: "Brazílie", difficulty: "medium" },
        { question: "Jak se nazývá finále americké baseballové ligy MLB?", options: ["Super Bowl", "World Series", "Stanley Cup", "NBA Finals"], correctAnswer: "World Series", difficulty: "medium" },
      ],
      hard: [
        { question: "Který tenista drží rekord v počtu vyhraných grandslamových titulů v mužské dvouhře?", options: ["Roger Federer", "Rafael Nadal", "Novak Djokovič", "Pete Sampras"], correctAnswer: "Novak Djokovič", difficulty: "hard" },
        { question: "Který tým Formule 1 má nejvíce konstruktérských titulů?", options: ["McLaren", "Mercedes", "Ferrari", "Williams"], correctAnswer: "Ferrari", difficulty: "hard" },
        { question: "Který boxer byl známý jako 'The Greatest' a proslul svým 'tancem' v ringu?", options: ["Mike Tyson", "Rocky Marciano", "Muhammad Ali", "Joe Frazier"], correctAnswer: "Muhammad Ali", difficulty: "hard" },
        { question: "Jak se jmenuje jediný neporažený mistr světa v těžké váze v boxu?", options: ["Muhammad Ali", "Joe Louis", "Rocky Marciano", "Mike Tyson"], correctAnswer: "Rocky Marciano", difficulty: "hard" },
        { question: "Která žena jako první obeplula sama svět na plachetnici?", options: ["Laura Dekker", "Ellen MacArthur", "Jeanne Baret", "Krystyna Chojnowska-Liskiewicz"], correctAnswer: "Krystyna Chojnowska-Liskiewicz", difficulty: "hard" },
        { question: "V jakém roce byly obnoveny moderní olympijské hry?", options: ["1896", "1900", "1924", "1936"], correctAnswer: "1896", difficulty: "hard" },
        { question: "Jak se jmenuje sport, ve kterém se týmy snaží dopravit plochý kámen po ledě co nejblíže ke středu kruhu?", options: ["Bandy", "Curling", "Broomball", "Sledge hokej"], correctAnswer: "Curling", difficulty: "hard" },
        { question: "Který fotbalista je jediným hráčem, který vyhrál Mistrovství světa třikrát?", options: ["Diego Maradona", "Lionel Messi", "Cristiano Ronaldo", "Pelé"], correctAnswer: "Pelé", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "Kolik hráčů je na hřišti v jednom fotbalovém týmu?", correctAnswer: "11", difficulty: "easy" },
        { question: "Jak se v hokeji nazývá situace, kdy hráč vstřelí tři góly v jednom zápase?", correctAnswer: "Hattrick", difficulty: "easy" },
        { question: "Na jakém povrchu se hraje slavný tenisový turnaj Wimbledon?", correctAnswer: "Tráva", difficulty: "easy" },
        { question: "Jaká barva je střed terče v lukostřelbě?", correctAnswer: "Žlutá", difficulty: "easy" },
        { question: "Kolik je dohromady figur (kamenů) na začátku šachové partie?", correctAnswer: "32", difficulty: "easy" },
        { question: "Jak se nazývá hřiště, kde se hraje baseball?", correctAnswer: "Diamant", difficulty: "easy" },
        { question: "Jak se nazývá japonský národní sport, kde dva zápasníci (rikishi) soutěží v kruhovém ringu (dohyo)?", correctAnswer: "Sumo", difficulty: "easy" },
        { question: "Kolik kol trvá jeden poločas v házené?", correctAnswer: "30", difficulty: "easy" },
      ],
      medium: [
        { question: "Jak se nazývá finálový zápas ligy amerického fotbalu (NFL)?", correctAnswer: "Super Bowl", difficulty: "medium" },
        { question: "Jak dlouhý je maratonský běh (v kilometrech, stačí celé číslo)?", correctAnswer: "42", difficulty: "medium" },
        { question: "Z jaké země pochází bojové umění judo?", correctAnswer: "Japonsko", difficulty: "medium" },
        { question: "Kolik kol má standardní boxerský zápas o titul mistra světa?", correctAnswer: "12", difficulty: "medium" },
        { question: "Jak se nazývá trofej pro vítěze anglické fotbalové Premier League?", correctAnswer: "Premier League Trophy", difficulty: "medium" },
        { question: "Jak se jmenuje hod v basketbalu, který je proveden zpoza tříbodové čáry?", correctAnswer: "Trojka", difficulty: "medium" },
        { question: "Které město je domovem slavného fotbalového klubu Real Madrid?", correctAnswer: "Madrid", difficulty: "medium" },
      ],
      hard: [
        { question: "Jaké je jméno nejvyšší hory světa, kterou se snaží zdolat horolezci?", correctAnswer: "Mount Everest", difficulty: "hard" },
        { question: "Jak se jmenuje jediný sportovec, který vyhrál zlatou medaili na letních i zimních olympijských hrách v různých sportech?", correctAnswer: "Eddie Eagan", difficulty: "hard" },
        { question: "Jak se nazývá skóre tří úderů (strike) za sebou v bowlingu?", correctAnswer: "Turkey", difficulty: "hard" },
        { question: "Jaké je příjmení dvou bratrů, kteří dominovali světovému boxu v těžké váze na začátku 21. století?", correctAnswer: "Kličko", difficulty: "hard" },
        { question: "V jakém sportu se uděluje 'Zelené sako' vítězi turnaje Masters?", correctAnswer: "Golf", difficulty: "hard" },
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
        { question: "Která z těchto her je o stavění z kostek v otevřeném světě?", options: ["Terraria", "Minecraft", "Roblox", "Stardew Valley"], correctAnswer: "Minecraft", difficulty: "easy" },
        { question: "Jak se jmenuje ikonická postava instalatéra od Nintenda?", options: ["Sonic", "Link", "Mario", "Donkey Kong"], correctAnswer: "Mario", difficulty: "easy" },
        { question: "Co sbírá ježek Sonic, aby získal rychlost a ochranu?", options: ["Mince", "Hvězdy", "Prsteny", "Smaragdy"], correctAnswer: "Prsteny", difficulty: "easy" },
        { question: "Ve hře 'Among Us', jak se nazývá role hráče, který sabotuje a eliminuje ostatní?", options: ["Detektiv", "Inženýr", "Podvodník (Impostor)", "Vědec"], correctAnswer: "Podvodník (Impostor)", difficulty: "easy" },
      ],
      medium: [
        { question: "Která z následujících her je strategická hra v reálném čase (RTS)?", options: ["StarCraft II", "Overwatch", "Rocket League", "Apex Legends"], correctAnswer: "StarCraft II", difficulty: "medium" },
        { question: "Která hra je považována za průkopníka žánru MOBA (Multiplayer Online Battle Arena)?", options: ["Dota 2", "League of Legends", "Smite", "Defense of the Ancients (DotA)"], correctAnswer: "Defense of the Ancients (DotA)", difficulty: "medium" },
        { question: "Která hra popularizovala žánr 'Battle Royale' na masovou úroveň?", options: ["Fortnite", "Apex Legends", "PlayerUnknown's Battlegrounds (PUBG)", "Call of Duty: Warzone"], correctAnswer: "PlayerUnknown's Battlegrounds (PUBG)", difficulty: "medium" },
        { question: "Jak se jmenuje hlavní nepřítel v sérii her Super Mario?", options: ["Wario", "Bowser", "Waluigi", "Goomba"], correctAnswer: "Bowser", difficulty: "medium" },
        { question: "Ve hře 'The Elder Scrolls V: Skyrim', jaké je jméno vaší postavy?", options: ["Hrdina z Kvatchu", "Nerevarine", "Dovahkiin (Drakorozený)", "Věčný šampion"], correctAnswer: "Dovahkiin (Drakorozený)", difficulty: "medium" },
        { question: "Která společnost stojí za herními konzolemi PlayStation?", options: ["Microsoft", "Nintendo", "Sega", "Sony"], correctAnswer: "Sony", difficulty: "medium" },
        { question: "Jak se jmenuje město, ve kterém se odehrává hra 'Cyberpunk 2077'?", options: ["Neo-Tokyo", "Mega-City One", "Night City", "Coruscant"], correctAnswer: "Night City", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se jmenuje nejprestižnější turnaj ve hře Counter-Strike: Global Offensive?", options: ["The International", "World Championship", "Major", "Captains Draft"], correctAnswer: "Major", difficulty: "hard" },
        { question: "Jak se jmenuje první hra, která byla v Jižní Koreji oficiálně uznána jako e-sport a odstartovala tamní fenomén?", options: ["Warcraft III", "StarCraft: Brood War", "Counter-Strike 1.6", "Quake"], correctAnswer: "StarCraft: Brood War", difficulty: "hard" },
        { question: "Jak se jmenuje fiktivní společnost zodpovědná za T-virus v sérii Resident Evil?", options: ["Shinra", "Abstergo", "Umbrella Corporation", "Aperture Science"], correctAnswer: "Umbrella Corporation", difficulty: "hard" },
        { question: "Který tým vyhrál nejvíce titulů mistra světa v League of Legends?", options: ["G2 Esports", "Fnatic", "T1", "Invictus Gaming"], correctAnswer: "T1", difficulty: "hard" },
        { question: "Ve hře 'Dark Souls', jak se jmenuje měna, kterou získáváte od nepřátel?", options: ["Zlaťáky", "Kredity", "Duše", "Echa krve"], correctAnswer: "Duše", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "Co znamená zkratka 'GG', často používaná na konci zápasu?", correctAnswer: "Good game", difficulty: "easy" },
        { question: "Jaký je hlavní cíl ve hře Rocket League?", correctAnswer: "Dát gól", difficulty: "easy" },
        { question: "Jak se jmenuje hlavní postava v sérii her The Legend of Zelda?", correctAnswer: "Link", difficulty: "easy" },
        { question: "Co znamená zkratka FPS ve hrách (měření výkonu)?", correctAnswer: "Frames Per Second", difficulty: "easy" },
        { question: "Jak se jmenuje hlavní hrdina série 'God of War'?", correctAnswer: "Kratos", difficulty: "easy" },
        { question: "Jaký typ zvířete je postava 'Pikachu'?", correctAnswer: "Myš", difficulty: "easy" },
      ],
      medium: [
        { question: "Z jaké země pochází profesionální hráč 'Faker', legenda hry League of Legends?", correctAnswer: "Jižní Korea", difficulty: "medium" },
        { question: "Která herní série je známá svou post-apokalyptickou pustinou a postavou Vault Boy?", correctAnswer: "Fallout", difficulty: "medium" },
        { question: "Jak se jmenuje fiktivní město, ve kterém se odehrává série her Grand Theft Auto (GTA)?", correctAnswer: "Los Santos", difficulty: "medium" },
        { question: "Jak se jmenuje měna používaná ve hře 'Animal Crossing'?", correctAnswer: "Bells", difficulty: "medium" },
        { question: "Co znamená zkratka 'NPC' v kontextu videoher?", correctAnswer: "Non-Player Character", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se jmenuje hlavní mapa, na které se hraje League of Legends?", correctAnswer: "Summoner's Rift", difficulty: "hard" },
        { question: "Který tým vyhrál první 'The International' turnaj ve hře Dota 2 v roce 2011?", correctAnswer: "Natus Vincere", difficulty: "hard" },
        { question: "V jakém roce byla vydána původní hra 'Doom'?", correctAnswer: "1993", difficulty: "hard" },
        { question: "Jak se jmenuje zlá umělá inteligence v sérii her 'Portal'?", correctAnswer: "GLaDOS", difficulty: "hard" },
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
        { question: "Jaká sociální síť je známá svým logem s bílým 'f' na modrém pozadí?", options: ["Twitter", "LinkedIn", "Facebook", "Tumblr"], correctAnswer: "Facebook", difficulty: "easy" },
        { question: "Co znamená ikona palce nahoru na Facebooku?", options: ["Sdílet", "Komentovat", "Líbí se mi", "Nahlásit"], correctAnswer: "Líbí se mi", difficulty: "easy" },
        { question: "Která platforma je primárně zaměřena na vizuální obsah a sdílení fotografií?", options: ["LinkedIn", "Twitter", "Instagram", "Reddit"], correctAnswer: "Instagram", difficulty: "easy" },
      ],
      medium: [
        { question: "Jaká sociální síť je primárně zaměřena na profesionální networking a kariérní rozvoj?", options: ["Pinterest", "Reddit", "LinkedIn", "Tumblr"], correctAnswer: "LinkedIn", difficulty: "medium" },
        { question: "Jak se nazývají komunitní fóra na platformě Reddit?", options: ["Groups", "Boards", "Channels", "Subreddits"], correctAnswer: "Subreddits", difficulty: "medium" },
        { question: "Jak se jmenuje platforma, kterou vlastní Google a je primárně určena pro sdílení videí?", options: ["Vimeo", "YouTube", "Dailymotion", "Twitch"], correctAnswer: "YouTube", difficulty: "medium" },
        { question: "Která z následujících sociálních sítí byla spuštěna jako první?", options: ["Facebook", "MySpace", "SixDegrees", "Friendster"], correctAnswer: "SixDegrees", difficulty: "medium" },
        { question: "Jak se nazývá funkce na Instagramu, která umožňuje vysílat živé video?", options: ["Reels", "Stories", "Live", "IGTV"], correctAnswer: "Live", difficulty: "medium" },
        { question: "Jaký je název pro krátká, smyčková videa, která byla populární na platformě Vine?", options: ["Clips", "Loops", "Vines", "Snaps"], correctAnswer: "Vines", difficulty: "medium" },
      ],
      hard: [
        { question: "Která platforma pro zasílání zpráv je známá svým zaměřením na soukromí a end-to-end šifrování?", options: ["Facebook Messenger", "Telegram", "Discord", "Skype"], correctAnswer: "Telegram", difficulty: "hard" },
        { question: "Jak se jmenuje algoritmus, který používá TikTok k doporučování videí uživatelům na stránce 'Pro tebe'?", options: ["PageRank", "EdgeRank", "For You", "The Algorithm"], correctAnswer: "For You", difficulty: "hard" },
        { question: "Který z spoluzakladatelů opustil WhatsApp po akvizici Facebookem kvůli neshodám ohledně soukromí a monetizace?", options: ["Jan Koum", "Brian Acton", "Oba", "Ani jeden"], correctAnswer: "Brian Acton", difficulty: "hard" },
        { question: "V jakém roce koupil Facebook společnost Instagram?", options: ["2010", "2012", "2014", "2016"], correctAnswer: "2012", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "Co znamená zkratka 'DM' v kontextu sociálních sítí?", correctAnswer: "Direct Message", difficulty: "easy" },
        { question: "Která sociální síť používá 'piny' a 'nástěnky' pro organizaci obsahu?", correctAnswer: "Pinterest", difficulty: "easy" },
        { question: "Jak se jmenuje platforma, která kombinuje chat, audio a video hovory, a je populární hlavně mezi hráči?", correctAnswer: "Discord", difficulty: "easy" },
        { question: "Jak se nazývá krátké video na Instagramu, které je podobné videím na TikToku?", correctAnswer: "Reels", difficulty: "easy" },
        { question: "Co je to 'hashtag'?", correctAnswer: "Klíčové slovo", difficulty: "easy" },
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
        { question: "Jaké bylo původní jméno společnosti Snapchat?", correctAnswer: "Picaboo", difficulty: "hard" },
        { question: "Jak se jmenuje mateřská společnost Googlu a YouTube?", correctAnswer: "Alphabet", difficulty: "hard" },
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
        { question: "Která kapela je známá jako 'The Fab Four'?", options: ["The Rolling Stones", "Queen", "The Beatles", "Led Zeppelin"], correctAnswer: "The Beatles", difficulty: "easy" },
        { question: "Jak se jmenuje hlavní postava ve filmové sérii 'Piráti z Karibiku'?", options: ["Will Turner", "Hector Barbossa", "Davy Jones", "Jack Sparrow"], correctAnswer: "Jack Sparrow", difficulty: "easy" },
        { question: "Který z těchto filmů režíroval James Cameron?", options: ["Jurský park", "Star Wars", "Titanic", "Pán prstenů"], correctAnswer: "Titanic", difficulty: "easy" },
        { question: "Kdo je autorem knihy 'Malý princ'?", options: ["Jules Verne", "Antoine de Saint-Exupéry", "Victor Hugo", "Alexandre Dumas"], correctAnswer: "Antoine de Saint-Exupéry", difficulty: "easy" },
      ],
      medium: [
        { question: "Která kapela vydala slavné album 'The Dark Side of the Moon'?", options: ["The Beatles", "Led Zeppelin", "Queen", "Pink Floyd"], correctAnswer: "Pink Floyd", difficulty: "medium" },
        { question: "Kdo je režisérem filmové trilogie 'Pán prstenů'?", options: ["Steven Spielberg", "George Lucas", "James Cameron", "Peter Jackson"], correctAnswer: "Peter Jackson", difficulty: "medium" },
        { question: "Jak se jmenuje autorka série knih o Harrym Potterovi?", options: ["J. R. R. Tolkien", "George R. R. Martin", "J. K. Rowlingová", "Suzanne Collinsová"], correctAnswer: "J. K. Rowlingová", difficulty: "medium" },
        { question: "Kdo režíroval kultovní film 'Pulp Fiction'?", options: ["Martin Scorsese", "Steven Spielberg", "Quentin Tarantino", "David Fincher"], correctAnswer: "Quentin Tarantino", difficulty: "medium" },
        { question: "Který umělecký směr je spojován s Pablem Picassem a Georgesem Braquem?", options: ["Impresionismus", "Surrealismus", "Kubismus", "Expresionismus"], correctAnswer: "Kubismus", difficulty: "medium" },
        { question: "Jak se jmenuje zpěvák kapely Nirvana?", options: ["Eddie Vedder", "Chris Cornell", "Kurt Cobain", "Layne Staley"], correctAnswer: "Kurt Cobain", difficulty: "medium" },
        { question: "Které z těchto děl nenapsal Franz Kafka?", options: ["Proces", "Zámek", "Proměna", "Cizinec"], correctAnswer: "Cizinec", difficulty: "medium" },
      ],
      hard: [
        { question: "Který hudební skladatel je autorem slavné 'Ódy na radost'?", options: ["Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Ludwig van Beethoven", "Fryderyk Chopin"], correctAnswer: "Ludwig van Beethoven", difficulty: "hard" },
        { question: "Jak se jmenuje literární směr charakterizovaný pocity úzkosti, absurdity a odcizení, jehož klíčovým představitelem byl Franz Kafka?", options: ["Romantismus", "Realismus", "Existencialismus", "Surrealismus"], correctAnswer: "Existencialismus", difficulty: "hard" },
        { question: "Který film jako první vyhrál Oscara za nejlepší film, nejlepší režii, nejlepšího herce, nejlepší herečku a nejlepší scénář (tzv. 'Big Five')?", options: ["Stalo se jedné noci", "Přelet nad kukaččím hnízdem", "Mlčení jehňátek", "Kmotr"], correctAnswer: "Stalo se jedné noci", difficulty: "hard" },
        { question: "Jaký je název prvního celovečerního animovaného filmu od Walta Disneyho?", options: ["Pinocchio", "Bambi", "Sněhurka a sedm trpaslíků", "Popelka"], correctAnswer: "Sněhurka a sedm trpaslíků", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "V jakém městě se nachází slavná opera La Scala?", correctAnswer: "Milán", difficulty: "easy" },
        { question: "Jak se jmenuje japonské umění skládání papíru?", correctAnswer: "Origami", difficulty: "easy" },
        { question: "Z jaké země pochází hudební žánr flamenco?", correctAnswer: "Španělsko", difficulty: "easy" },
        { question: "Z jakého města pocházela legendární kapela The Beatles?", correctAnswer: "Liverpool", difficulty: "easy" },
        { question: "Jak se jmenuje kouzelnická škola v Harrym Potterovi?", correctAnswer: "Bradavice", difficulty: "easy" },
      ],
      medium: [
        { question: "Kdo namaloval strop Sixtinské kaple ve Vatikánu?", correctAnswer: "Michelangelo", difficulty: "medium" },
        { question: "Kdo napsal dystopický román '1984'?", correctAnswer: "George Orwell", difficulty: "medium" },
        { question: "Jaké je jméno kytaristy kapely Queen?", correctAnswer: "Brian May", difficulty: "medium" },
        { question: "Jak se jmenuje slavná socha nahého muže od Michelangela?", correctAnswer: "David", difficulty: "medium" },
        { question: "Kdo je režisérem filmu 'Kmotr'?", correctAnswer: "Francis Ford Coppola", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se jmenuje hlavní město Aztécké říše?", correctAnswer: "Tenochtitlán", difficulty: "hard" },
        { question: "Který film získal jako úplně první cenu Akademie (Oscara) za nejlepší film v roce 1929?", correctAnswer: "Wings", difficulty: "hard" },
        { question: "Kdo je autorem slavné rockové opery 'Tommy'?", correctAnswer: "The Who", difficulty: "hard" },
        { question: "Jak se jmenuje umělecký styl charakterizovaný snovými výjevy a automatickým psaním, jehož představitelem byl Salvador Dalí?", correctAnswer: "Surrealismus", difficulty: "hard" },
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
        { question: "Na kterém kontinentu leží Egypt?", options: ["Asie", "Evropa", "Afrika", "Jižní Amerika"], correctAnswer: "Afrika", difficulty: "easy" },
        { question: "Jak se jmenuje nejvyšší pohoří v Evropě?", options: ["Pyreneje", "Karpaty", "Alpy", "Ural"], correctAnswer: "Alpy", difficulty: "easy" },
        { question: "Která země je známá svými pyramidami?", options: ["Mexiko", "Řecko", "Egypt", "Indie"], correctAnswer: "Egypt", difficulty: "easy" },
        { question: "Jaké je hlavní město Itálie?", options: ["Milán", "Neapol", "Řím", "Florencie"], correctAnswer: "Řím", difficulty: "easy" },
      ],
      medium: [
        { question: "Ve které zemi se nachází Machu Picchu?", options: ["Brazílie", "Mexiko", "Peru", "Kolumbie"], correctAnswer: "Peru", difficulty: "medium" },
        { question: "Jak se jmenuje nejdelší pohoří na světě?", options: ["Himaláj", "Andy", "Skalnaté hory", "Ural"], correctAnswer: "Andy", difficulty: "medium" },
        { question: "Která země má nejvíce obyvatel na světě?", options: ["Čína", "USA", "Indie", "Indonésie"], correctAnswer: "Indie", difficulty: "medium" },
        { question: "Jak se jmenuje nejhlubší místo na Zemi, nacházející se v Tichém oceánu?", options: ["Portorický příkop", "Jávský příkop", "Marianský příkop", "Tichomořský příkop"], correctAnswer: "Marianský příkop", difficulty: "medium" },
        { question: "Které moře odděluje Evropu a Afriku?", options: ["Černé moře", "Rudé moře", "Středozemní moře", "Arabské moře"], correctAnswer: "Středozemní moře", difficulty: "medium" },
        { question: "Která země je známá jako 'Země tisíců jezer'?", options: ["Švédsko", "Kanada", "Finsko", "Norsko"], correctAnswer: "Finsko", difficulty: "medium" },
        { question: "Jak se nazývá největší korálový útes na světě?", options: ["Útes Apo", "Útes Belize Barrier", "Velký bariérový útes", "Rudomořský útes"], correctAnswer: "Velký bariérový útes", difficulty: "medium" },
      ],
      hard: [
        { question: "Která řeka je nejdelší na světě?", options: ["Nil", "Amazonka", "Jang-c'-ťiang", "Mississippi"], correctAnswer: "Amazonka", difficulty: "hard" },
        { question: "Které město leží na dvou kontinentech, v Evropě i v Asii?", options: ["Káhira", "Istanbul", "Moskva", "Jeruzalém"], correctAnswer: "Istanbul", difficulty: "hard" },
        { question: "Jak se jmenuje největší aktivní sopka v Evropě?", options: ["Vesuv", "Stromboli", "Etna", "Hekla"], correctAnswer: "Etna", difficulty: "hard" },
        { question: "Která země nemá žádné hlavní město?", options: ["Švýcarsko", "Nauru", "Vatikán", "Monako"], correctAnswer: "Nauru", difficulty: "hard" },
        { question: "Jak se nazývá nejjižnější bod Afriky?", options: ["Mys Dobré naděje", "Střelkový mys", "Mys Horn", "Zelený mys"], correctAnswer: "Střelkový mys", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "Která země je známá jako 'Země vycházejícího slunce'?", correctAnswer: "Japonsko", difficulty: "easy" },
        { question: "Na kterém kontinentu se nachází poušť Sahara?", correctAnswer: "Afrika", difficulty: "easy" },
        { question: "Jaké je hlavní město Kanady?", correctAnswer: "Ottawa", difficulty: "easy" },
        { question: "Jaká je nejlidnatější země v Africe?", correctAnswer: "Nigérie", difficulty: "easy" },
        { question: "Jak se jmenuje nejdelší řeka v České republice?", correctAnswer: "Vltava", difficulty: "easy" },
      ],
      medium: [
        { question: "Jaký je název nejvyššího vodopádu na světě?", correctAnswer: "Salto Ángel", difficulty: "medium" },
        { question: "Jak se jmenuje největší ostrov světa?", correctAnswer: "Grónsko", difficulty: "medium" },
        { question: "Který průliv odděluje Evropu od Afriky?", correctAnswer: "Gibraltarský průliv", difficulty: "medium" },
        { question: "Jak se nazývá pohoří oddělující Evropu a Asii?", correctAnswer: "Ural", difficulty: "medium" },
        { question: "Které město je hlavní město Spojených států amerických?", correctAnswer: "Washington, D.C.", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se nazývá největší poušť světa (včetně polárních)?", correctAnswer: "Antarktická poušť", difficulty: "hard" },
        { question: "Jak se jmenuje jediná země na světě, která leží na všech čtyřech polokoulích (severní, jižní, východní, západní)?", correctAnswer: "Kiribati", difficulty: "hard" },
        { question: "Jak se jmenuje nejvýše položené splavné jezero na světě?", correctAnswer: "Titicaca", difficulty: "hard" },
        { question: "Ve které zemi se nachází poušť Gobi?", correctAnswer: "Čína", difficulty: "hard" },
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
        { question: "Kolik má voda bod varu ve stupních Celsia na úrovni moře?", options: ["90", "100", "110", "120"], correctAnswer: "100", difficulty: "easy" },
        { question: "Který z těchto orgánů pumpuje krev v lidském těle?", options: ["Plíce", "Játra", "Srdce", "Mozek"], correctAnswer: "Srdce", difficulty: "easy" },
        { question: "Jak se nazývá přirozený satelit Země?", options: ["Měsíc", "Slunce", "Mars", "Phobos"], correctAnswer: "Měsíc", difficulty: "easy" },
      ],
      medium: [
        { question: "Kolik kostí má dospělý člověk?", options: ["206", "212", "198", "220"], correctAnswer: "206", difficulty: "medium" },
        { question: "Jak se nazývá 'elektrárna' buňky?", options: ["Jádro", "Ribozom", "Mitochondrie", "Vakuola"], correctAnswer: "Mitochondrie", difficulty: "medium" },
        { question: "Jaká je přibližná rychlost světla ve vakuu (v km/s)?", options: ["300 000", "150 000", "500 000", "1 000 000"], correctAnswer: "300 000", difficulty: "medium" },
        { question: "Jak se nazývá studium živých organismů?", options: ["Chemie", "Fyzika", "Geologie", "Biologie"], correctAnswer: "Biologie", difficulty: "medium" },
        { question: "Kdo je považován za otce moderní fyziky a formuloval zákony pohybu?", options: ["Albert Einstein", "Galileo Galilei", "Isaac Newton", "Nikola Tesla"], correctAnswer: "Isaac Newton", difficulty: "medium" },
        { question: "Který prvek je hlavní složkou diamantů?", options: ["Křemík", "Uhlík", "Kyslík", "Železo"], correctAnswer: "Uhlík", difficulty: "medium" },
        { question: "Jak se nazývá největší planeta v naší sluneční soustavě?", options: ["Saturn", "Neptun", "Jupiter", "Uran"], correctAnswer: "Jupiter", difficulty: "medium" },
      ],
      hard: [
        { question: "Kdo je autorem teorie relativity?", options: ["Isaac Newton", "Galileo Galilei", "Albert Einstein", "Nikola Tesla"], correctAnswer: "Albert Einstein", difficulty: "hard" },
        { question: "Co je to 'černá díra' v kontextu astronomie?", options: ["Planeta bez světla", "Oblast s extrémně silnou gravitací", "Temná mlhovina", "Vyhaslá hvězda"], correctAnswer: "Oblast s extrémně silnou gravitací", difficulty: "hard" },
        { question: "Jak se nazývá nejtvrdší přírodní látka na Zemi?", options: ["Křemen", "Topaz", "Diamant", "Korund"], correctAnswer: "Diamant", difficulty: "hard" },
        { question: "Co měří Richterova stupnice?", options: ["Sílu větru", "Intenzitu zvuku", "Sílu zemětřesení", "Teplotu"], correctAnswer: "Sílu zemětřesení", difficulty: "hard" },
        { question: "Která krevní skupina je považována za univerzálního dárce?", options: ["A", "B", "AB", "0 negativní"], correctAnswer: "0 negativní", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "Jak se běžně nazývá chemická sloučenina H₂O?", correctAnswer: "Voda", difficulty: "easy" },
        { question: "Který prvek má v periodické tabulce protonové číslo 1?", correctAnswer: "Vodík", difficulty: "easy" },
        { question: "Která planeta je známá svými prstenci?", correctAnswer: "Saturn", difficulty: "easy" },
        { question: "Kolik planet má naše sluneční soustava?", correctAnswer: "8", difficulty: "easy" },
        { question: "Jak se nazývá věda o počasí?", correctAnswer: "Meteorologie", difficulty: "easy" },
      ],
      medium: [
        { question: "Co znamená zkratka DNA?", correctAnswer: "Deoxyribonukleová kyselina", difficulty: "medium" },
        { question: "Kdo objevil penicilin?", correctAnswer: "Alexander Fleming", difficulty: "medium" },
        { question: "Jak se nazývá síla, která přitahuje objekty k sobě?", correctAnswer: "Gravitace", difficulty: "medium" },
        { question: "Jaký je chemický symbol pro stříbro?", correctAnswer: "Ag", difficulty: "medium" },
        { question: "Jak se nazývá proces, při kterém se kapalina mění v plyn?", correctAnswer: "Vypařování", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se nazývá proces, při kterém rostliny přeměňují světelnou energii na chemickou?", correctAnswer: "Fotosyntéza", difficulty: "hard" },
        { question: "Jak se nazývá jednotka elektrického odporu?", correctAnswer: "Ohm", difficulty: "hard" },
        { question: "Kdo zformuloval periodickou tabulku prvků?", correctAnswer: "Dmitrij Mendělejev", difficulty: "hard" },
        { question: "Jak se nazývá největší tepna v lidském těle?", correctAnswer: "Aorta", difficulty: "hard" },
      ]
    },
  },
};