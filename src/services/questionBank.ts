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
      ],
      medium: [
        { question: "Jak se jmenuje nejslavnější cyklistický závod na světě?", options: ["Giro d'Italia", "Vuelta a España", "Tour de France", "Paříž-Roubaix"], correctAnswer: "Tour de France", difficulty: "medium" },
        { question: "Která země vyhrála první Mistrovství světa ve fotbale v roce 1930?", options: ["Brazílie", "Argentina", "Itálie", "Uruguay"], correctAnswer: "Uruguay", difficulty: "medium" },
        { question: "Kolik bodů má v šachu nejcennější figura, královna?", options: ["3", "5", "9", "Nekonečno"], correctAnswer: "9", difficulty: "medium" },
      ],
      hard: [
        { question: "Který tenista drží rekord v počtu vyhraných grandslamových titulů v mužské dvouhře?", options: ["Roger Federer", "Rafael Nadal", "Novak Djokovič", "Pete Sampras"], correctAnswer: "Novak Djokovič", difficulty: "hard" },
        { question: "Který tým Formule 1 má nejvíce konstruktérských titulů?", options: ["McLaren", "Mercedes", "Ferrari", "Williams"], correctAnswer: "Ferrari", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "Kolik hráčů je na hřišti v jednom fotbalovém týmu?", correctAnswer: "11", difficulty: "easy" },
        { question: "Jak se v hokeji nazývá situace, kdy hráč vstřelí tři góly v jednom zápase?", correctAnswer: "Hattrick", difficulty: "easy" },
        { question: "Na jakém povrchu se hraje slavný tenisový turnaj Wimbledon?", correctAnswer: "Tráva", difficulty: "easy" },
      ],
      medium: [
        { question: "Jak se nazývá finálový zápas ligy amerického fotbalu (NFL)?", correctAnswer: "Super Bowl", difficulty: "medium" },
        { question: "Jak dlouhý je maratonský běh (v kilometrech, stačí celé číslo)?", correctAnswer: "42", difficulty: "medium" },
        { question: "Z jaké země pochází bojové umění judo?", correctAnswer: "Japonsko", difficulty: "medium" },
      ],
      hard: [
        { question: "Jaké je jméno nejvyšší hory světa, kterou se snaží zdolat horolezci?", correctAnswer: "Mount Everest", difficulty: "hard" },
      ]
    },
  },
  [Category.Esport]: {
    multipleChoice: {
      easy: [
        { question: "Která společnost vyvinula populární hru Fortnite?", options: ["Electronic Arts", "Ubisoft", "Epic Games", "Activision Blizzard"], correctAnswer: "Epic Games", difficulty: "easy" },
        { question: "Jak se jmenuje herní platforma pro streamování, kterou vlastní Amazon?", options: ["YouTube Gaming", "Mixer", "Twitch", "Facebook Gaming"], correctAnswer: "Twitch", difficulty: "easy" },
        { question: "Ve hře Valorant, kolik hráčů je v jednom týmu?", options: ["3", "4", "5", "6"], correctAnswer: "5", difficulty: "easy" },
      ],
      medium: [
        { question: "Která z následujících her je strategická hra v reálném čase (RTS)?", options: ["StarCraft II", "Overwatch", "Rocket League", "Apex Legends"], correctAnswer: "StarCraft II", difficulty: "medium" },
        { question: "Jak se jmenuje virtuální měna ve hře Minecraft?", options: ["Kredity", "Zlaťáky", "Smaragdy", "Minecoiny"], correctAnswer: "Smaragdy", difficulty: "medium" },
        { question: "Která hra je považována za průkopníka žánru MOBA (Multiplayer Online Battle Arena)?", options: ["Dota 2", "League of Legends", "Smite", "Defense of the Ancients (DotA)"], correctAnswer: "Defense of the Ancients (DotA)", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se jmenuje nejprestižnější turnaj ve hře Counter-Strike: Global Offensive?", options: ["The International", "World Championship", "Major", "Captains Draft"], correctAnswer: "Major", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "Co znamená zkratka 'GG', často používaná na konci zápasu?", correctAnswer: "Good game", difficulty: "easy" },
        { question: "Jaký je hlavní cíl ve hře Rocket League?", correctAnswer: "Dát gól", difficulty: "easy" },
        { question: "Jak se jmenuje hlavní postava v sérii her The Legend of Zelda?", correctAnswer: "Link", difficulty: "easy" },
      ],
      medium: [
        { question: "Z jaké země pochází profesionální hráč 'Faker', legenda hry League of Legends?", correctAnswer: "Jižní Korea", difficulty: "medium" },
        { question: "Která herní série je známá svou post-apokalyptickou pustinou a postavou Vault Boy?", correctAnswer: "Fallout", difficulty: "medium" },
        { question: "Jak se jmenuje fiktivní město, ve kterém se odehrává série her Grand Theft Auto (GTA)?", correctAnswer: "Los Santos", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se jmenuje hlavní mapa, na které se hraje League of Legends?", correctAnswer: "Summoner's Rift", difficulty: "hard" },
      ]
    },
  },
  [Category.SocialMedia]: {
    multipleChoice: {
      easy: [
        { question: "Která sociální síť byla původně vytvořena pro sdílení krátkých videí a je známá svými virálními tanečními výzvami?", options: ["Instagram", "Facebook", "TikTok", "Twitter"], correctAnswer: "TikTok", difficulty: "easy" },
        { question: "Která společnost je mateřskou společností Instagramu a WhatsAppu?", options: ["Alphabet", "Meta", "Microsoft", "Apple"], correctAnswer: "Meta", difficulty: "easy" },
        { question: "Jak se nazývají mizející obrázky a videa na Snapchatu a Instagramu?", options: ["Momenty", "Příběhy (Stories)", "Záblesky", "Fleety"], correctAnswer: "Příběhy (Stories)", difficulty: "easy" },
      ],
      medium: [
        { question: "Jaká sociální síť je primárně zaměřena na profesionální networking a kariérní rozvoj?", options: ["Pinterest", "Reddit", "LinkedIn", "Tumblr"], correctAnswer: "LinkedIn", difficulty: "medium" },
        { question: "Jak se nazývají komunitní fóra na platformě Reddit?", options: ["Groups", "Boards", "Channels", "Subreddits"], correctAnswer: "Subreddits", difficulty: "medium" },
        { question: "Jak se jmenuje platforma, kterou vlastní Google a je primárně určena pro sdílení videí?", options: ["Vimeo", "YouTube", "Dailymotion", "Twitch"], correctAnswer: "YouTube", difficulty: "medium" },
      ],
      hard: [
        { question: "Která platforma pro zasílání zpráv je známá svým zaměřením na soukromí a end-to-end šifrování?", options: ["Facebook Messenger", "Telegram", "Discord", "Skype"], correctAnswer: "Telegram", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "Co znamená zkratka 'DM' v kontextu sociálních sítí?", correctAnswer: "Direct Message", difficulty: "easy" },
        { question: "Která sociální síť používá 'piny' a 'nástěnky' pro organizaci obsahu?", correctAnswer: "Pinterest", difficulty: "easy" },
        { question: "Jak se jmenuje platforma, která kombinuje chat, audio a video hovory, a je populární hlavně mezi hráči?", correctAnswer: "Discord", difficulty: "easy" },
      ],
      medium: [
        { question: "Jaký je maximální počet znaků v jednom tweetu na platformě X (dříve Twitter) pro standardního uživatele?", correctAnswer: "280", difficulty: "medium" },
        { question: "Kdo je hlavním zakladatelem a CEO společnosti Facebook (nyní Meta)?", correctAnswer: "Mark Zuckerberg", difficulty: "medium" },
        { question: "Jak se nazývá funkce na Twitteru (nyní X), která umožňuje sdílet cizí příspěvek na svém profilu?", correctAnswer: "Retweet", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se jmenoval ptáček v původním logu Twitteru?", correctAnswer: "Larry", difficulty: "hard" },
      ]
    },
  },
  [Category.Culture]: {
    multipleChoice: {
      easy: [
        { question: "Kdo je autorem slavného obrazu 'Mona Lisa'?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"], correctAnswer: "Leonardo da Vinci", difficulty: "easy" },
        { question: "Kdo napsal slavnou tragédii 'Romeo a Julie'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austenová", "Homér"], correctAnswer: "William Shakespeare", difficulty: "easy" },
        { question: "Ve kterém městě se nachází slavné muzeum Louvre?", options: ["Londýn", "Řím", "New York", "Paříž"], correctAnswer: "Paříž", difficulty: "easy" },
      ],
      medium: [
        { question: "Která kapela vydala slavné album 'The Dark Side of the Moon'?", options: ["The Beatles", "Led Zeppelin", "Queen", "Pink Floyd"], correctAnswer: "Pink Floyd", difficulty: "medium" },
        { question: "Kdo je režisérem filmové trilogie 'Pán prstenů'?", options: ["Steven Spielberg", "George Lucas", "James Cameron", "Peter Jackson"], correctAnswer: "Peter Jackson", difficulty: "medium" },
        { question: "Jak se jmenuje autorka série knih o Harrym Potterovi?", options: ["J. R. R. Tolkien", "George R. R. Martin", "J. K. Rowlingová", "Suzanne Collinsová"], correctAnswer: "J. K. Rowlingová", difficulty: "medium" },
      ],
      hard: [
        { question: "Který hudební skladatel je autorem slavné 'Ódy na radost'?", options: ["Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Ludwig van Beethoven", "Fryderyk Chopin"], correctAnswer: "Ludwig van Beethoven", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "V jakém městě se nachází slavná opera La Scala?", correctAnswer: "Milán", difficulty: "easy" },
        { question: "Jak se jmenuje japonské umění skládání papíru?", correctAnswer: "Origami", difficulty: "easy" },
        { question: "Z jaké země pochází hudební žánr flamenco?", correctAnswer: "Španělsko", difficulty: "easy" },
      ],
      medium: [
        { question: "Kdo namaloval strop Sixtinské kaple ve Vatikánu?", correctAnswer: "Michelangelo", difficulty: "medium" },
        { question: "Kdo napsal dystopický román '1984'?", correctAnswer: "George Orwell", difficulty: "medium" },
        { question: "Jaké je jméno kytaristy kapely Queen?", correctAnswer: "Brian May", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se jmenuje hlavní město Aztécké říše?", correctAnswer: "Tenochtitlán", difficulty: "hard" },
      ]
    },
  },
  [Category.Geography]: {
    multipleChoice: {
      easy: [
        { question: "Jaké je hlavní město Austrálie?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correctAnswer: "Canberra", difficulty: "easy" },
        { question: "Který oceán je největší na světě?", options: ["Atlantský", "Indický", "Tichý", "Severní ledový"], correctAnswer: "Tichý", difficulty: "easy" },
        { question: "Která řeka protéká Paříží?", options: ["Dunaj", "Rhôna", "Loira", "Seina"], correctAnswer: "Seina", difficulty: "easy" },
      ],
      medium: [
        { question: "Ve které zemi se nachází Machu Picchu?", options: ["Brazílie", "Mexiko", "Peru", "Kolumbie"], correctAnswer: "Peru", difficulty: "medium" },
        { question: "Jak se jmenuje nejdelší pohoří na světě?", options: ["Himaláj", "Andy", "Skalnaté hory", "Ural"], correctAnswer: "Andy", difficulty: "medium" },
        { question: "Která země má nejvíce obyvatel na světě?", options: ["Čína", "USA", "Indie", "Indonésie"], correctAnswer: "Indie", difficulty: "medium" },
      ],
      hard: [
        { question: "Která řeka je nejdelší na světě?", options: ["Nil", "Amazonka", "Jang-c'-ťiang", "Mississippi"], correctAnswer: "Amazonka", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "Která země je známá jako 'Země vycházejícího slunce'?", correctAnswer: "Japonsko", difficulty: "easy" },
        { question: "Na kterém kontinentu se nachází poušť Sahara?", correctAnswer: "Afrika", difficulty: "easy" },
        { question: "Jaké je hlavní město Kanady?", correctAnswer: "Ottawa", difficulty: "easy" },
      ],
      medium: [
        { question: "Jaký je název nejvyššího vodopádu na světě?", correctAnswer: "Salto Ángel", difficulty: "medium" },
        { question: "Jak se jmenuje největší ostrov světa?", correctAnswer: "Grónsko", difficulty: "medium" },
        { question: "Který průliv odděluje Evropu od Afriky?", correctAnswer: "Gibraltarský průliv", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se nazývá největší poušť světa?", correctAnswer: "Antarktická poušť", difficulty: "hard" },
      ]
    },
  },
  [Category.Science]: {
    multipleChoice: {
      easy: [
        { question: "Jaká je chemická značka pro zlato?", options: ["Ag", "Au", "Fe", "Pb"], correctAnswer: "Au", difficulty: "easy" },
        { question: "Která planeta je v naší sluneční soustavě nejblíže Slunci?", options: ["Venuše", "Mars", "Merkur", "Země"], correctAnswer: "Merkur", difficulty: "easy" },
        { question: "Jaký plyn je nejhojněji zastoupen v zemské atmosféře?", options: ["Kyslík", "Oxid uhličitý", "Argon", "Dusík"], correctAnswer: "Dusík", difficulty: "easy" },
      ],
      medium: [
        { question: "Kolik kostí má dospělý člověk?", options: ["206", "212", "198", "220"], correctAnswer: "206", difficulty: "medium" },
        { question: "Jak se nazývá 'elektrárna' buňky?", options: ["Jádro", "Ribozom", "Mitochondrie", "Vakuola"], correctAnswer: "Mitochondrie", difficulty: "medium" },
        { question: "Jaká je přibližná rychlost světla ve vakuu (v km/s)?", options: ["300 000", "150 000", "500 000", "1 000 000"], correctAnswer: "300 000", difficulty: "medium" },
      ],
      hard: [
        { question: "Kdo je autorem teorie relativity?", options: ["Isaac Newton", "Galileo Galilei", "Albert Einstein", "Nikola Tesla"], correctAnswer: "Albert Einstein", difficulty: "hard" },
      ]
    },
    openEnded: {
      easy: [
        { question: "Jak se běžně nazývá chemická sloučenina H₂O?", correctAnswer: "Voda", difficulty: "easy" },
        { question: "Který prvek má v periodické tabulce protonové číslo 1?", correctAnswer: "Vodík", difficulty: "easy" },
        { question: "Která planeta je známá svými prstenci?", correctAnswer: "Saturn", difficulty: "easy" },
      ],
      medium: [
        { question: "Co znamená zkratka DNA?", correctAnswer: "Deoxyribonukleová kyselina", difficulty: "medium" },
        { question: "Kdo objevil penicilin?", correctAnswer: "Alexander Fleming", difficulty: "medium" },
        { question: "Jak se nazývá síla, která přitahuje objekty k sobě?", correctAnswer: "Gravitace", difficulty: "medium" },
      ],
      hard: [
        { question: "Jak se nazývá proces, při kterém rostliny přeměňují světelnou energii na chemickou?", correctAnswer: "Fotosyntéza", difficulty: "hard" },
      ]
    },
  },
};