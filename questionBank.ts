import { Category, Question } from '../types.ts';

type QuestionBank = {
  [key in Category]: {
    multipleChoice: Question[];
    openEnded: Question[];
  };
};

export const questionBank: QuestionBank = {
  [Category.Sport]: {
    multipleChoice: [
      {
        question: "Který tenista drží rekord v počtu vyhraných grandslamových titulů v mužské dvouhře?",
        options: ["Roger Federer", "Rafael Nadal", "Novak Djokovič", "Pete Sampras"],
        correctAnswer: "Novak Djokovič",
      },
      {
        question: "Jak se nazývá zimní sport kombinující běh na lyžích a střelbu?",
        options: ["Biatlon", "Severská kombinace", "Skikros", "Curling"],
        correctAnswer: "Biatlon",
      },
      {
        question: "Ve kterém městě se konaly letní olympijské hry v roce 2016?",
        options: ["Londýn", "Tokio", "Rio de Janeiro", "Peking"],
        correctAnswer: "Rio de Janeiro",
      },
      {
        question: "Která země vyhrála první Mistrovství světa ve fotbale v roce 1930?",
        options: ["Brazílie", "Argentina", "Itálie", "Uruguay"],
        correctAnswer: "Uruguay",
      },
      {
        question: "Jak se jmenuje nejslavnější cyklistický závod na světě?",
        options: ["Giro d'Italia", "Vuelta a España", "Tour de France", "Paříž-Roubaix"],
        correctAnswer: "Tour de France",
      },
      {
        question: "V jakém sportu proslul Michael Jordan?",
        options: ["Baseball", "Basketbal", "Americký fotbal", "Lední hokej"],
        correctAnswer: "Basketbal",
      },
      {
        question: "Kolik bodů má v šachu nejcennější figura, královna?",
        options: ["3", "5", "9", "Nekonečno"],
        correctAnswer: "9",
      },
      {
        question: "Který tým Formule 1 má nejvíce konstruktérských titulů?",
        options: ["McLaren", "Mercedes", "Ferrari", "Williams"],
        correctAnswer: "Ferrari",
      }
    ],
    openEnded: [
      {
        question: "Jaké je jméno nejvyšší hory světa, kterou se snaží zdolat horolezci?",
        correctAnswer: "Mount Everest",
      },
      {
          question: "Kolik hráčů je na hřišti v jednom fotbalovém týmu?",
          correctAnswer: "11",
      },
      {
        question: "Jak se v hokeji nazývá situace, kdy hráč vstřelí tři góly v jednom zápase?",
        correctAnswer: "Hattrick",
      },
      {
        question: "Na jakém povrchu se hraje slavný tenisový turnaj Wimbledon?",
        correctAnswer: "Tráva",
      },
      {
        question: "Jak se nazývá finálový zápas ligy amerického fotbalu (NFL)?",
        correctAnswer: "Super Bowl",
      },
      {
        question: "Jak dlouhý je maratonský běh (v kilometrech, stačí celé číslo)?",
        correctAnswer: "42",
      },
      {
        question: "Z jaké země pochází bojové umění judo?",
        correctAnswer: "Japonsko",
      }
    ],
  },
  [Category.Esport]: {
    multipleChoice: [
        {
            question: "Která hra je považována za průkopníka žánru MOBA (Multiplayer Online Battle Arena)?",
            options: ["Dota 2", "League of Legends", "Smite", "Defense of the Ancients (DotA)"],
            correctAnswer: "Defense of the Ancients (DotA)",
        },
        {
            question: "Jak se jmenuje nejprestižnější turnaj ve hře Counter-Strike: Global Offensive?",
            options: ["The International", "World Championship", "Major", "Captains Draft"],
            correctAnswer: "Major",
        },
        {
          question: "Která společnost vyvinula populární hru Fortnite?",
          options: ["Electronic Arts", "Ubisoft", "Epic Games", "Activision Blizzard"],
          correctAnswer: "Epic Games",
        },
        {
          question: "Jak se jmenuje herní platforma pro streamování, kterou vlastní Amazon?",
          options: ["YouTube Gaming", "Mixer", "Twitch", "Facebook Gaming"],
          correctAnswer: "Twitch",
        },
        {
          question: "Ve hře Valorant, kolik hráčů je v jednom týmu?",
          options: ["3", "4", "5", "6"],
          correctAnswer: "5",
        },
        {
          question: "Která z následujících her je strategická hra v reálném čase (RTS)?",
          options: ["StarCraft II", "Overwatch", "Rocket League", "Apex Legends"],
          correctAnswer: "StarCraft II",
        },
        {
          question: "Jak se jmenuje virtuální měna ve hře Minecraft?",
          options: ["Kredity", "Zlaťáky", "Smaragdy", "Minecoiny"],
          correctAnswer: "Smaragdy",
        }
    ],
    openEnded: [
        {
            question: "Z jaké země pochází profesionální hráč 'Faker', legenda hry League of Legends?",
            correctAnswer: "Jižní Korea",
        },
        {
          question: "Co znamená zkratka 'GG', často používaná na konci zápasu?",
          correctAnswer: "Good game",
        },
        {
          question: "Jak se jmenuje mapa, na které se nejčastěji hraje hra Dota 2?",
          correctAnswer: "Summoner's Rift",
        },
        {
          question: "Jaký je hlavní cíl ve hře Rocket League?",
          correctAnswer: "Dát gól",
        },
        {
          question: "Která herní série je známá svou post-apokalyptickou pustinou a postavou Vault Boy?",
          correctAnswer: "Fallout",
        },
        {
          question: "Jak se jmenuje fiktivní město, ve kterém se odehrává série her Grand Theft Auto (GTA)?",
          correctAnswer: "Los Santos",
        },
        {
          question: "Jak se jmenuje hlavní postava v sérii her The Legend of Zelda?",
          correctAnswer: "Link",
        }
    ],
  },
  [Category.SocialMedia]: {
    multipleChoice: [
      {
        question: "Která sociální síť byla původně vytvořena pro sdílení krátkých videí a je známá svými virálními tanečními výzvami?",
        options: ["Instagram", "Facebook", "TikTok", "Twitter"],
        correctAnswer: "TikTok",
      },
       {
        question: "Jak se jmenuje platforma, kterou vlastní Google a je primárně určena pro sdílení videí?",
        options: ["Vimeo", "YouTube", "Dailymotion", "Twitch"],
        correctAnswer: "YouTube",
      },
      {
        question: "Která společnost je mateřskou společností Instagramu a WhatsAppu?",
        options: ["Alphabet", "Meta", "Microsoft", "Apple"],
        correctAnswer: "Meta",
      },
      {
        question: "Jaká sociální síť je primárně zaměřena na profesionální networking a kariérní rozvoj?",
        options: ["Pinterest", "Reddit", "LinkedIn", "Tumblr"],
        correctAnswer: "LinkedIn",
      },
      {
        question: "Jak se nazývají mizející obrázky a videa na Snapchatu a Instagramu?",
        options: ["Momenty", "Příběhy (Stories)", "Záblesky", "Fleety"],
        correctAnswer: "Příběhy (Stories)",
      },
      {
        question: "Jak se nazývají komunitní fóra na platformě Reddit?",
        options: ["Groups", "Boards", "Channels", "Subreddits"],
        correctAnswer: "Subreddits",
      },
      {
        question: "Která platforma pro zasílání zpráv je známá svým zaměřením na soukromí a end-to-end šifrování?",
        options: ["Facebook Messenger", "Telegram", "Discord", "Skype"],
        correctAnswer: "Telegram",
      }
    ],
    openEnded: [
       {
        question: "Jaký je maximální počet znaků v jednom tweetu na platformě X (dříve Twitter) pro standardního uživatele?",
        correctAnswer: "280",
      },
      {
        question: "Kdo je hlavním zakladatelem a CEO společnosti Facebook (nyní Meta)?",
        correctAnswer: "Mark Zuckerberg",
      },
      {
        question: "Jak se jmenoval ptáček v původním logu Twitteru?",
        correctAnswer: "Larry",
      },
      {
        question: "Jak se nazývá funkce na Twitteru (nyní X), která umožňuje sdílet cizí příspěvek na svém profilu?",
        correctAnswer: "Retweet",
      },
      {
        question: "Co znamená zkratka 'DM' v kontextu sociálních sítí?",
        correctAnswer: "Direct Message",
      },
      {
        question: "Která sociální síť používá 'piny' a 'nástěnky' pro organizaci obsahu?",
        correctAnswer: "Pinterest",
      },
      {
        question: "Jak se jmenuje platforma, která kombinuje chat, audio a video hovory, a je populární hlavně mezi hráči?",
        correctAnswer: "Discord",
      }
    ],
  },
  [Category.Culture]: {
    multipleChoice: [
      {
        question: "Kdo je autorem slavného obrazu 'Mona Lisa'?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
        correctAnswer: "Leonardo da Vinci",
      },
      {
          question: "Která kapela vydala slavné album 'The Dark Side of the Moon'?",
          options: ["The Beatles", "Led Zeppelin", "Queen", "Pink Floyd"],
          correctAnswer: "Pink Floyd",
      },
      {
        question: "Kdo napsal slavnou tragédii 'Romeo a Julie'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austenová", "Homér"],
        correctAnswer: "William Shakespeare",
      },
      {
        question: "Ve kterém městě se nachází slavné muzeum Louvre?",
        options: ["Londýn", "Řím", "New York", "Paříž"],
        correctAnswer: "Paříž",
      },
      {
        question: "Kdo je režisérem filmové trilogie 'Pán prstenů'?",
        options: ["Steven Spielberg", "George Lucas", "James Cameron", "Peter Jackson"],
        correctAnswer: "Peter Jackson",
      },
      {
        question: "Který hudební skladatel je autorem slavné 'Ódy na radost'?",
        options: ["Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Ludwig van Beethoven", "Fryderyk Chopin"],
        correctAnswer: "Ludwig van Beethoven",
      },
      {
        question: "Jak se jmenuje autorka série knih o Harrym Potterovi?",
        options: ["J. R. R. Tolkien", "George R. R. Martin", "J. K. Rowlingová", "Suzanne Collinsová"],
        correctAnswer: "J. K. Rowlingová",
      }
    ],
    openEnded: [
      {
        question: "V jakém městě se nachází slavná opera La Scala?",
        correctAnswer: "Milán",
      },
      {
        question: "Kdo namaloval strop Sixtinské kaple ve Vatikánu?",
        correctAnswer: "Michelangelo",
      },
      {
        question: "Jak se jmenuje japonské umění skládání papíru?",
        correctAnswer: "Origami",
      },
      {
        question: "Kdo napsal dystopický román '1984'?",
        correctAnswer: "George Orwell",
      },
      {
        question: "Jak se jmenuje hlavní město Aztécké říše?",
        correctAnswer: "Tenochtitlán",
      },
      {
        question: "Z jaké země pochází hudební žánr flamenco?",
        correctAnswer: "Španělsko",
      },
      {
        question: "Jaké je jméno kytaristy kapely Queen?",
        correctAnswer: "Brian May",
      }
    ],
  },
  [Category.Geography]: {
    multipleChoice: [
      {
        question: "Která řeka je nejdelší na světě?",
        options: ["Nil", "Amazonka", "Jang-c'-ťiang", "Mississippi"],
        correctAnswer: "Amazonka",
      },
      {
          question: "Jaké je hlavní město Austrálie?",
          options: ["Sydney", "Melbourne", "Canberra", "Perth"],
          correctAnswer: "Canberra",
      },
      {
        question: "Který oceán je největší na světě?",
        options: ["Atlantský", "Indický", "Tichý", "Severní ledový"],
        correctAnswer: "Tichý",
      },
      {
        question: "Ve které zemi se nachází Machu Picchu?",
        options: ["Brazílie", "Mexiko", "Peru", "Kolumbie"],
        correctAnswer: "Peru",
      },
      {
        question: "Jak se jmenuje nejdelší pohoří na světě?",
        options: ["Himaláj", "Andy", "Skalnaté hory", "Ural"],
        correctAnswer: "Andy",
      },
      {
        question: "Která země má nejvíce obyvatel na světě?",
        options: ["Čína", "USA", "Indie", "Indonésie"],
        correctAnswer: "Indie",
      },
      {
        question: "Která řeka protéká Paříží?",
        options: ["Dunaj", "Rhôna", "Loira", "Seina"],
        correctAnswer: "Seina",
      }
    ],
    openEnded: [
      {
        question: "Jak se nazývá největší poušť světa?",
        correctAnswer: "Antarktická poušť",
      },
      {
        question: "Jaký je název nejvyššího vodopádu na světě?",
        correctAnswer: "Salto Ángel",
      },
      {
        question: "Která země je známá jako 'Země vycházejícího slunce'?",
        correctAnswer: "Japonsko",
      },
      {
        question: "Jak se jmenuje největší ostrov světa?",
        correctAnswer: "Grónsko",
      },
      {
        question: "Na kterém kontinentu se nachází poušť Sahara?",
        correctAnswer: "Afrika",
      },
      {
        question: "Jaké je hlavní město Kanady?",
        correctAnswer: "Ottawa",
      },
      {
        question: "Který průliv odděluje Evropu od Afriky?",
        correctAnswer: "Gibraltarský průliv",
      }
    ],
  },
  [Category.Science]: {
    multipleChoice: [
      {
        question: "Jaká je chemická značka pro zlato?",
        options: ["Ag", "Au", "Fe", "Pb"],
        correctAnswer: "Au",
      },
      {
        question: "Která planeta je v naší sluneční soustavě nejblíže Slunci?",
        options: ["Venuše", "Mars", "Merkur", "Země"],
        correctAnswer: "Merkur",
      },
      {
        question: "Kolik kostí má dospělý člověk?",
        options: ["206", "212", "198", "220"],
        correctAnswer: "206",
      },
      {
        question: "Jaký plyn je nejhojněji zastoupen v zemské atmosféře?",
        options: ["Kyslík", "Oxid uhličitý", "Argon", "Dusík"],
        correctAnswer: "Dusík",
      },
      {
        question: "Kdo je autorem teorie relativity?",
        options: ["Isaac Newton", "Galileo Galilei", "Albert Einstein", "Nikola Tesla"],
        correctAnswer: "Albert Einstein",
      },
      {
        question: "Jak se nazývá 'elektrárna' buňky?",
        options: ["Jádro", "Ribozom", "Mitochondrie", "Vakuola"],
        correctAnswer: "Mitochondrie",
      },
      {
        question: "Jaká je přibližná rychlost světla ve vakuu (v km/s)?",
        options: ["300 000", "150 000", "500 000", "1 000 000"],
        correctAnswer: "300 000",
      }
    ],
    openEnded: [
      {
        question: "Jak se nazývá proces, při kterém rostliny přeměňují světelnou energii na chemickou?",
        correctAnswer: "Fotosyntéza",
      },
      {
        question: "Co znamená zkratka DNA?",
        correctAnswer: "Deoxyribonukleová kyselina",
      },
      {
        question: "Jak se běžně nazývá chemická sloučenina H₂O?",
        correctAnswer: "Voda",
      },
      {
        question: "Který prvek má v periodické tabulce protonové číslo 1?",
        correctAnswer: "Vodík",
      },
      {
        question: "Kdo objevil penicilin?",
        correctAnswer: "Alexander Fleming",
      },
      {
        question: "Jak se nazývá síla, která přitahuje objekty k sobě?",
        correctAnswer: "Gravitace",
      },
      {
        question: "Která planeta je známá svými prstenci?",
        correctAnswer: "Saturn",
      }
    ],
  },
};