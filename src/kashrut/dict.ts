/**
 * Ingredient dictionary — kashrut by animal origin only.
 *
 * We flag ingredients that come from non-kosher animals: pork, shellfish and
 * molluscs, fish without fins & scales, rabbit/hare, horse, donkey, camel,
 * ostrich, frogs, snails and insects (incl. carmine E120).
 * Out of scope on purpose: hechsher, shechita, shared equipment, "may contain",
 * wine, rennet in cheese. Kosher-animal meat and kosher fish are fine.
 *
 * Levels: 0 clean · 1 low · 2 medium · 3 high · 4 not kosher.
 *
 * Term syntax (matched on normalised text — lower-case, accents stripped):
 *   "word"     whole word
 *   "word*"    word starting with…          (gamber* → gambero, gamberetti)
 *   "*word"    word ending with…            (*schmalz → schweineschmalz)
 *   "*word*"   anywhere inside a word       (*wurst* → bratwurstchen)
 *   "two words" words in sequence, any whitespace/hyphen between them
 *
 * Qualifiers refine a hit from the words around it (same ingredient only):
 * the first qualifier that matches sets the level (null = not a finding).
 */

export type RiskLevel = 0 | 1 | 2 | 3 | 4;
export type Lang = 'it' | 'en' | 'de' | 'fr' | 'es' | 'he';

export type Qualifier = {
  /** Tested on the words just before, just after, and the whole word containing the hit. */
  re: RegExp;
  level: RiskLevel | null;
  reason?: string;
};

export type Entry = {
  id: string;
  level: RiskLevel;
  /** One short Hebrew sentence: why this ingredient is flagged. */
  reason: string;
  group: 'pork' | 'seafood' | 'fish' | 'animal' | 'insect' | 'gelatin' | 'fat' | 'additive' | 'meat' | 'processed';
  terms: Partial<Record<Lang, string[]>>;
  qualifiers?: Qualifier[];
};

/** Build a "word starts with one of these stems" regex. */
const stems = (list: string[]) => new RegExp(`(?<![\\p{L}])(?:${list.join('|')})`, 'u');

// ── Species stems used by qualifiers ─────────────────────────────────────────

const KOSHER_LAND = stems([
  'manzo', 'bovin', 'vitell', 'vacc', 'poll', 'gallin', 'tacchin', 'agnell', 'ovin', 'pecor', 'capr', 'anatr', 'oca(?!\\p{L})',
  'beef', 'veal', 'cow', 'chicken', 'poultry', 'hen(?!\\p{L})', 'turkey', 'lamb', 'mutton', 'sheep', 'goat', 'duck', 'goose',
  'rind', 'kalb', 'huhn', 'hahnchen', 'hendl', 'pute', 'truthahn', 'geflugel', 'lamm', 'schaf', 'ziege', 'ente', 'gans',
  'boeuf', 'veau', 'vache', 'poulet', 'volaille', 'dinde', 'agneau', 'mouton', 'chevre', 'canard', 'oie(?!\\p{L})',
  'vacun', 'ternera', 'vaca', 'pavo', 'corder', 'oveja', 'cabra', 'pato', 'ganso',
  'בקר', 'עוף', 'הודו', 'כבש', 'עגל', 'ברווז', 'אווז',
]);

const KOSHER_FISH = stems([
  'salmon', 'salm(?!\\p{L})', 'tonn', 'tuna', 'thun', 'atun', 'thon', 'merluzz', 'nasell', 'sardin', 'sardell', 'acciug', 'alic',
  'anchov', 'anchois', 'anchoa', 'boqueron', 'sgombr', 'mackerel', 'makrel', 'maquereau', 'caball', 'trot', 'trout', 'forell',
  'truite', 'truch', 'aring', 'herring', 'hering', 'hareng', 'arenque', 'cod(?!\\p{L})', 'kabeljau', 'cabillaud', 'bacalao',
  'baccala', 'stoccafiss', 'haddock', 'pollock', 'pollack', 'seelachs', 'colin', 'merlu', 'hake', 'tilapia', 'carp', 'karpf',
  'orat', 'branzin', 'spigol', 'bass(?!\\p{L})', 'sogliol', 'platess', 'plaice', 'scholl', 'dentic', 'cerni', 'halibut',
  'heilbutt', 'fletan', 'sprat', 'sprott', 'whiting', 'dorsch', 'hoki', 'lachs',
  'סלמון', 'טונה', 'בקלה', 'אמנון', 'לברק', 'דניס', 'מקרל', 'הרינג', 'סרדין', 'אנשובי', 'פורל',
]);

const PORK = stems([
  'maial', 'suin', 'porc(?:o|a|s|ine)?(?!\\p{L})', 'pork', 'pig(?!\\p{L})', 'swine', 'schwein', 'cerdo', 'porcin[oa](?!\\p{L})', 'חזיר',
]);

const NONKOSHER_ROE = stems(['storion', 'sturgeon', 'stor(?!\\p{L})', 'esturgeon', 'esturion', 'lomp', 'lumpfish', 'seehase', 'חדקן']);

const VEGETABLE = stems(['vegetal', 'vegetable', 'plant', 'pflanz', 'veget', 'soia', 'soy', 'soja', 'girasol', 'palm', 'colza', 'rapeseed', 'raps', 'צמח']);

const NOT_A_FINDING = null;

// ── Entries ──────────────────────────────────────────────────────────────────

export const DICT: Entry[] = [
  // ── Pork (4) ──
  {
    id: 'pork',
    level: 4,
    group: 'pork',
    reason: 'חזיר',
    terms: {
      it: ['maiale', 'maiali', 'suino', 'suina', 'suini', 'suine', 'porchetta', 'guanciale', 'cotenna', 'cotenne', 'ciccioli', 'zampone', 'cotechino', 'nduja', 'capocollo', 'culatello', 'lonza di maiale'],
      en: ['pork', 'pig', 'pigs', 'swine', 'porcine', 'bacon', 'gammon', 'pork rind*', 'crackling'],
      de: ['schwein*', '*schwein', 'eisbein', 'schweinespeck'],
      fr: ['porc', 'porcs', 'porcine', 'lardon*', 'saindoux', 'couenne'],
      es: ['cerdo', 'cerdos', 'porcino', 'porcina', 'tocino', 'panceta', 'chicharron*', 'manteca de cerdo'],
      he: ['חזיר', 'חזירים', 'בייקון'],
    },
    qualifiers: [{ re: /porcini|steinpilz|cepe|boletus/u, level: NOT_A_FINDING }],
  },
  {
    id: 'lard',
    level: 4,
    group: 'pork',
    reason: 'שומן חזיר',
    terms: {
      it: ['strutto', 'lardo'],
      en: ['lard'],
      de: ['schweineschmalz', 'schweinefett'],
      fr: ['lard', 'graisse de porc'],
      es: ['manteca de cerdo', 'grasa de cerdo', 'lardo'],
      he: ['שומן חזיר'],
    },
  },
  {
    id: 'bacon-cuts',
    level: 4,
    group: 'pork',
    reason: 'בשר חזיר מעובד (בייקון/פנצ׳טה)',
    terms: { it: ['pancetta', 'speck', 'bacon'], de: ['speck', 'bauchspeck', 'frühstücksspeck'], fr: ['poitrine fumee'] },
    qualifiers: [{ re: KOSHER_LAND, level: 1, reason: 'מוצר בשר מחיה כשרה' }],
  },
  {
    id: 'ham',
    level: 4,
    group: 'pork',
    reason: 'חזיר (פרושוטו / האם)',
    terms: {
      it: ['prosciutto', 'prosciutti'],
      en: ['ham', 'hams', 'prosciutto'],
      de: ['schinken', '*schinken'],
      fr: ['jambon', 'jambons'],
      es: ['jamon', 'jamones'],
    },
    qualifiers: [{ re: KOSHER_LAND, level: NOT_A_FINDING, reason: 'נקניק מחיה כשרה' }],
  },
  {
    id: 'chorizo',
    level: 4,
    group: 'pork',
    reason: 'נקניק חזיר',
    terms: { es: ['chorizo', 'chorizos', 'sobrasada', 'salchichon'], it: ['chorizo'], en: ['chorizo'] },
    qualifiers: [{ re: KOSHER_LAND, level: 1, reason: 'נקניק מחיה כשרה' }],
  },

  // ── Crustaceans & molluscs (4) ──
  {
    id: 'crustaceans',
    level: 4,
    group: 'seafood',
    reason: 'סרטנאים (שרימפס/סרטן/לובסטר)',
    terms: {
      it: ['gamber*', 'scampi', 'scampo', 'mazzancoll*', 'aragost*', 'astice', 'astici', 'granchi*', 'crostace*', 'canocchi*', 'krill'],
      en: ['shrimp*', 'prawn*', 'lobster*', 'crab', 'crabs', 'crabmeat', 'crayfish', 'crawfish', 'langoustine*', 'crustacean*', 'krill'],
      de: ['garnele*', '*garnele', '*garnelen', 'krabbe*', '*krabben', 'hummer', 'languste*', 'krebs', 'krebse', 'flusskrebs*', 'krustentier*', 'krebstier*', 'shrimps', 'scampi'],
      fr: ['crevette*', 'homard*', 'langouste*', 'crabe*', 'ecrevisse*', 'crustace*'],
      es: ['gamba', 'gambas', 'camaron*', 'langostino*', 'langosta*', 'bogavante*', 'cangrejo*', 'crustaceo*', 'cigala*'],
      he: ['שרימפס', 'סרטן', 'סרטנים', 'לובסטר', 'סרטנאים', 'חסילונים'],
    },
  },
  {
    id: 'molluscs',
    level: 4,
    group: 'seafood',
    reason: 'רכיכות (צדפות/דיונון/תמנון)',
    terms: {
      it: ['cozz*', 'vongol*', 'ostric*', 'capesant*', 'cappesant*', 'calamar*', 'seppi*', 'polpo', 'polpi', 'polipo', 'polipi', 'moscardin*', 'totan*', 'mollusch*', 'mitili', 'telline', 'fasolari', 'canestrelli', 'frutti di mare'],
      en: ['mussel*', 'clam', 'clams', 'oyster*', 'scallop*', 'squid', 'calamari', 'octopus*', 'cuttlefish', 'mollusc*', 'mollusk*', 'shellfish', 'seafood', 'abalone', 'cockle*', 'whelk*'],
      de: ['muschel*', '*muscheln', 'auster*', 'tintenfisch*', 'kalmar*', 'oktopus', 'krake', 'kraken', 'sepia', 'weichtier*', 'meeresfruchte', 'schalentier*'],
      fr: ['moules', 'palourde*', 'huitre*', 'coquille* saint-jacques', 'saint-jacques', 'calmar*', 'encornet*', 'poulpe*', 'seiche*', 'mollusque*', 'fruits de mer', 'coques', 'bulots'],
      es: ['mejillon*', 'almeja*', 'ostra', 'ostras', 'vieira*', 'calamar*', 'pulpo*', 'sepia', 'jibia*', 'molusco*', 'marisco*', 'berberecho*', 'chipiron*'],
      he: ['צדפות', 'צדפה', 'קלמרי', 'קלמרים', 'דיונון', 'תמנון', 'פירות ים', 'רכיכות', 'מולים'],
    },
  },

  // ── Fish without fins & scales (4) ──
  {
    id: 'eel',
    level: 4,
    group: 'fish',
    reason: 'צלופח — דג בלי קשקשים',
    terms: { it: ['anguill*', 'capitone'], en: ['eel', 'eels'], de: ['aal', 'aale', 'räucheraal'], fr: ['anguille*'], es: ['anguila*', 'angula*'], he: ['צלופח'] },
  },
  {
    id: 'catfish',
    level: 4,
    group: 'fish',
    reason: 'שפמנון (כולל פנגסיוס) — דג בלי קשקשים',
    terms: {
      it: ['pangasio', 'pangasius', 'pesce gatto', 'pesci gatto', 'siluro'],
      en: ['catfish', 'pangasius', 'panga', 'basa', 'basa fish', 'river cobbler', 'swai'],
      de: ['wels', 'welse', 'pangasius', 'katzenwels'],
      fr: ['poisson-chat', 'poisson chat', 'silure', 'pangasius', 'panga'],
      es: ['pez gato', 'bagre', 'pangasius', 'panga'],
      he: ['שפמנון', 'פנגסיוס', 'פנגה', 'באסה'],
    },
  },
  {
    id: 'shark',
    level: 4,
    group: 'fish',
    reason: 'כריש — דג בלי קשקשים',
    terms: {
      it: ['squalo', 'squali', 'palombo', 'verdesca', 'spinarolo', 'smeriglio', 'gattuccio'],
      en: ['shark', 'sharks', 'dogfish', 'huss', 'rock salmon'],
      de: ['haifisch*', 'dornhai', 'schillerlocke*'],
      fr: ['requin*', 'roussette', 'aiguillat'],
      es: ['tiburon*', 'cazon', 'marrajo', 'tintorera'],
      he: ['כריש'],
    },
  },
  {
    id: 'swordfish',
    level: 4,
    group: 'fish',
    reason: 'דג חרב — ללא קשקשים בבגרותו',
    terms: { it: ['pesce spada'], en: ['swordfish'], de: ['schwertfisch*'], fr: ['espadon'], es: ['pez espada'], he: ['דג חרב'] },
  },
  {
    id: 'sturgeon',
    level: 4,
    group: 'fish',
    reason: 'חדקן / קוויאר — דג לא כשר',
    terms: {
      it: ['storione', 'storioni', 'caviale'],
      en: ['sturgeon', 'caviar', 'beluga', 'sevruga', 'osetra'],
      de: ['stör', 'kaviar'],
      fr: ['esturgeon', 'caviar'],
      es: ['esturion', 'caviar'],
      he: ['חדקן', 'קוויאר'],
    },
    qualifiers: [{ re: stems(['salmon', 'salm(?!\\p{L})', 'trot', 'trout', 'forell', 'lachs', 'saumon', 'truite', 'truch', 'סלמון']), level: 0, reason: 'ביצי סלמון/פורל' }],
  },
  {
    id: 'monkfish',
    level: 4,
    group: 'fish',
    reason: 'רנה פסקטריצ׳ה (דג נזיר) — דג בלי קשקשים',
    terms: { it: ['rana pescatrice', 'coda di rospo'], en: ['monkfish', 'anglerfish'], de: ['seeteufel', 'anglerfisch'], fr: ['lotte', 'baudroie'], es: ['rape'], he: ['דג נזיר'] },
    // English "rape seed oil" is rapeseed, not monkfish.
    qualifiers: [{ re: stems(['seed', 'oil', 'olio', 'aceite', 'huile']), level: NOT_A_FINDING }],
  },
  {
    id: 'scaleless-other',
    level: 4,
    group: 'fish',
    reason: 'דג בלי סנפיר וקשקשת',
    terms: {
      it: ['razza', 'razze', 'lampreda', 'lampredi', 'uova di lompo', 'lompo'],
      en: ['skate', 'stingray', 'lamprey', 'lumpfish'],
      de: ['rochen', 'neunauge*', 'seehase*'],
      fr: ['raie', 'lamproie*', 'lompe'],
      es: ['raya', 'lamprea*', 'lumpo'],
      he: ['בטאים', 'טריגון'],
    },
  },

  // ── Other non-kosher animals (4) ──
  {
    id: 'rabbit',
    level: 4,
    group: 'animal',
    reason: 'ארנב / ארנבת',
    terms: { it: ['conigli*', 'lepre', 'lepri'], en: ['rabbit*', 'hare'], de: ['kaninchen*', 'hase', 'hasen*'], fr: ['lapin*', 'lievre*'], es: ['conejo*', 'liebre*'], he: ['ארנב', 'ארנבת'] },
  },
  {
    id: 'horse',
    level: 4,
    group: 'animal',
    reason: 'סוס',
    terms: { it: ['cavallo', 'cavalli', 'equino', 'equina', 'equini', 'puledro'], en: ['horse', 'horsemeat', 'equine'], de: ['pferd*', '*pferdefleisch', 'rossfleisch'], fr: ['cheval', 'chevaux', 'chevaline', 'chevalin'], es: ['caballo*', 'equino', 'equina'], he: ['סוס', 'סוסים'] },
  },
  {
    id: 'donkey',
    level: 4,
    group: 'animal',
    reason: 'חמור (כולל חלב אתונות)',
    // Not "burro": that is butter in Italian.
    terms: { it: ['asino', 'asina', 'asini', 'somaro', 'latte d\'asina'], en: ['donkey*', 'ass milk'], de: ['esel*', '*eselsmilch'], fr: ['anesse', 'lait d\'anesse'], es: ['asno', 'burra', 'leche de burra'], he: ['חמור', 'אתונות'] },
  },
  {
    id: 'camel',
    level: 4,
    group: 'animal',
    reason: 'גמל (כולל חלב גמלים)',
    terms: { it: ['cammell*'], en: ['camel*'], de: ['kamel*'], fr: ['chameau*', 'chamelle'], es: ['camello*'], he: ['גמל', 'גמלים', 'גמלה'] },
    qualifiers: [{ re: /caramel|camelina|kamille/u, level: NOT_A_FINDING }],
  },
  {
    id: 'ostrich',
    level: 4,
    group: 'animal',
    reason: 'בת יענה',
    terms: { it: ['struzz*'], en: ['ostrich*'], de: ['strauss', 'straussen*', 'straussenfleisch'], fr: ['autruche*'], es: ['avestruz*'], he: ['יען', 'בת יענה'] },
  },
  {
    id: 'frog',
    level: 4,
    group: 'animal',
    reason: 'צפרדע',
    terms: { it: ['rana', 'rane', 'cosce di rana'], en: ['frog*'], de: ['frosch*', 'froschschenkel'], fr: ['grenouille*'], es: ['ancas de rana'], he: ['צפרדע', 'צפרדעים'] },
    qualifiers: [{ re: /pescatric/u, level: NOT_A_FINDING }],
  },
  {
    id: 'snail',
    level: 4,
    group: 'animal',
    reason: 'חלזונות',
    terms: { it: ['lumac*', 'chiocciol*'], en: ['snail*', 'escargot*'], de: ['schnecke*', 'weinbergschnecke*'], fr: ['escargot*'], es: ['caracol*'], he: ['חלזון', 'חלזונות', 'שבלול'] },
  },

  // ── Insects (4, shellac 1) ──
  {
    id: 'carmine',
    level: 4,
    group: 'insect',
    reason: 'קרמין — צבע מכנימות',
    terms: {
      it: ['e120', 'carminio', 'cocciniglia', 'acido carminico', 'rosso cocciniglia'],
      en: ['carmine*', 'cochineal', 'carminic acid', 'natural red 4', 'ci 75470'],
      de: ['karmin*', 'cochenille', 'echtes karmin'],
      fr: ['carmin*', 'cochenille', 'acide carminique'],
      es: ['carmin', 'cochinilla', 'acido carminico'],
      he: ['קרמין', 'כנימה', 'כנימות'],
    },
  },
  {
    id: 'insects',
    level: 4,
    group: 'insect',
    reason: 'חרקים',
    terms: {
      it: ['insett*', 'grilli', 'grillo', 'larve di', 'cavallett*', 'acheta', 'tenebrio'],
      en: ['insect*', 'cricket*', 'mealworm*', 'locust', 'locusts', 'grasshopper*', 'larvae', 'acheta', 'tenebrio'],
      de: ['insekt*', 'grillen', 'heuschreck*', 'mehlwurm*', 'larven'],
      fr: ['insecte*', 'grillon*', 'criquet*', 'sauterelle*', 'larves', 'ver de farine'],
      es: ['insecto*', 'grillo*', 'saltamonte*', 'langosta migratoria', 'gusano de la harina'],
      he: ['חרקים', 'חרק', 'צרצרים', 'ארבה', 'זחלים'],
    },
    // Locust bean gum = carob, grilled = grigliato… only the insect.
    qualifiers: [
      { re: /bean|carrub|johannisbrot|caroube|garrofin|algarrob/u, level: NOT_A_FINDING },
      { re: /grigliat|grille[dr]|gegrill/u, level: NOT_A_FINDING },
    ],
  },
  {
    id: 'shellac',
    level: 1,
    group: 'insect',
    reason: 'שלאק — הפרשת חרק, בשימוש לציפוי',
    terms: { it: ['e904', 'gommalacca', 'gomma lacca'], en: ['shellac', 'confectioner\'s glaze'], de: ['schellack'], fr: ['gomme-laque', 'gomme laque'], es: ['goma laca', 'goma-laca'], he: ['שלאק', 'שלק'] },
  },

  // ── Gelatin & collagen (3; bovine/fish 1; pork 4) ──
  {
    id: 'gelatin',
    level: 3,
    group: 'gelatin',
    reason: 'ג׳לטין בלי מקור — לרוב מחזיר',
    terms: {
      it: ['gelatina', 'gelatine', 'e441', 'gelatina alimentare', 'gelatina animale'],
      en: ['gelatin', 'gelatine'],
      de: ['gelatine', '*gelatine', 'speisegelatine'],
      fr: ['gelatine*'],
      es: ['gelatina*', 'grenetina'],
      he: ["ג'לטין", 'גלטין', "ג'לטינה"],
    },
    qualifiers: [
      { re: PORK, level: 4, reason: "ג'לטין חזיר" },
      { re: KOSHER_LAND, level: 1, reason: "ג'לטין בקר/עוף" },
      { re: stems(['pesce', 'ittic', 'fish', 'fisch', 'poisson', 'pescado', 'pez(?!\\p{L})', 'דג']), level: 1, reason: "ג'לטין דגים" },
      { re: VEGETABLE, level: NOT_A_FINDING },
      // "gelatina di frutta" / fruit jelly layers are not gelatin.
      { re: stems(['frutt', 'fruit', 'frucht', 'pectin', 'agar']), level: NOT_A_FINDING },
    ],
  },
  {
    id: 'fish-gelatin',
    level: 1,
    group: 'gelatin',
    reason: "ג'לטין/קולגן דגים — דג לא ידוע",
    terms: {
      it: ['gelatina di pesce', 'gelatina ittica', 'collagene di pesce', 'collagene marino'],
      en: ['fish gelatin', 'fish gelatine', 'fish collagen', 'marine collagen'],
      de: ['fischgelatine', 'fischkollagen'],
      fr: ['gelatine de poisson', 'collagene marin', 'collagene de poisson'],
      es: ['gelatina de pescado', 'colageno marino', 'colageno de pescado'],
      he: ["ג'לטין דגים", 'קולגן דגים'],
    },
  },
  {
    id: 'collagen',
    level: 3,
    group: 'gelatin',
    reason: 'קולגן בלי מקור',
    terms: { it: ['collagene', 'collagen*'], en: ['collagen*'], de: ['kollagen*', '*kollagen'], fr: ['collagene*'], es: ['colageno*'], he: ['קולגן'] },
    qualifiers: [
      { re: PORK, level: 4, reason: 'קולגן חזיר' },
      { re: KOSHER_LAND, level: 1, reason: 'קולגן בקר/עוף' },
      { re: stems(['pesce', 'ittic', 'marin', 'fish', 'fisch', 'poisson', 'pescado', 'דג']), level: 1, reason: 'קולגן דגים' },
    ],
  },

  // ── Animal fats (3; tallow 1) ──
  {
    id: 'animal-fat',
    level: 3,
    group: 'fat',
    reason: 'שומן מן החי בלי מקור',
    terms: {
      it: ['grasso animale', 'grassi animali', 'grasso di origine animale', 'grassi di origine animale', 'olio animale'],
      en: ['animal fat', 'animal fats', 'animal shortening', 'dripping'],
      de: ['tierisches fett', 'tierische fette', 'tierfett', 'schmalz'],
      fr: ['graisse animale', 'graisses animales', 'matiere grasse animale'],
      es: ['grasa animal', 'grasas animales', 'manteca animal'],
      he: ['שומן מן החי', 'שומן בעלי חיים'],
    },
    qualifiers: [
      { re: PORK, level: 4, reason: 'שומן חזיר' },
      { re: KOSHER_LAND, level: 1, reason: 'שומן מחיה כשרה' },
      { re: stems(['butter', 'burro', 'beurre', 'mantequilla', 'latte', 'milch', 'milk']), level: NOT_A_FINDING },
    ],
  },
  {
    // Level-0 "safe phrases": any hit that overlaps one of these is discarded.
    // Guards against look-alikes: porcini ≠ pork, polpa ≠ polpo, carob ≠ locust…
    id: 'safe-phrases',
    level: 0,
    group: 'fat',
    reason: 'מונח שנראה דומה אבל אינו מן החי',
    terms: {
      it: ['funghi porcini', 'porcini', 'polpa', 'polpa di pomodoro', 'burro di cacao', 'burro di arachidi', 'latte di cocco', 'carne di cocco', 'farina di carrube', 'carrube', 'gelatina di frutta', 'gelatina vegetale', 'brodo vegetale'],
      en: ['locust bean gum', 'locust bean', 'rapeseed', 'rape seed', 'crab apple*', 'vegetable stock', 'vegetable broth', 'hot dog bun*', 'cocoa butter', 'peanut butter', 'coconut milk', 'coconut meat', 'jackfruit meat'],
      de: ['butterschmalz', 'ganseschmalz', 'entenschmalz', 'pflanzenschmalz', 'gemusebruhe', 'steinpilz*', 'johannisbrotkernmehl', 'kakaobutter'],
      fr: ['cepes', 'bouillon de legumes', 'gomme de caroube', 'beurre de cacao'],
      es: ['boletus', 'caldo vegetal', 'caldo de verduras', 'goma garrofin', 'manteca de cacao', 'leche de coco'],
      he: ['חמאת קקאו', 'ציר ירקות'],
    },
  },
  {
    id: 'tallow',
    level: 1,
    group: 'fat',
    reason: 'חלב (שומן) בקר/כבש',
    terms: { it: ['sego'], en: ['tallow', 'suet', 'beef fat', 'beef dripping'], de: ['talg', 'rindertalg', 'rinderfett'], fr: ['suif'], es: ['sebo'] },
  },

  // ── Sausages & processed meat (3) ──
  {
    id: 'sausage',
    level: 3,
    group: 'processed',
    reason: 'נקניק/סלמי — בדרך כלל מחזיר',
    terms: {
      it: ['salame', 'salami', 'salamino', 'salamini', 'mortadella', 'wurstel', 'salsicc*', 'luganega', 'soppressata', 'finocchiona'],
      en: ['salami', 'sausage*', 'pepperoni', 'hot dog*', 'frankfurter*', 'bologna', 'luncheon meat'],
      de: ['*wurst', '*wurstchen', '*wurste', 'wurst*', 'salami', 'mortadella', 'wiener', 'frankfurter', 'leberkäse'],
      fr: ['saucisse*', 'saucisson*', 'salami', 'mortadelle', 'chipolata*', 'merguez', 'andouille*'],
      es: ['salchicha*', 'salami', 'embutido*', 'mortadela', 'longaniza*', 'morcilla*', 'fuet'],
      he: ['נקניק', 'נקניקים', 'נקניקיות', 'נקניקייה', 'סלמי', 'מורטדלה'],
    },
    qualifiers: [
      { re: PORK, level: 4, reason: 'נקניק חזיר' },
      { re: KOSHER_LAND, level: 1, reason: 'נקניק מחיה כשרה' },
      { re: VEGETABLE, level: NOT_A_FINDING },
    ],
  },
  {
    id: 'surimi',
    level: 3,
    group: 'processed',
    reason: 'סורימי — לרוב מכיל סרטנים או דגים לא ידועים',
    terms: { it: ['surimi', 'polpa di granchio'], en: ['surimi', 'crab stick*', 'imitation crab'], de: ['surimi', 'krebsfleischimitat'], fr: ['surimi'], es: ['surimi', 'palitos de cangrejo'], he: ['סורימי'] },
  },

  // ── Enzymes & bone-derived (3) ──
  {
    id: 'pepsin',
    level: 3,
    group: 'additive',
    reason: 'פפסין — אנזים מקיבת חזיר בדרך כלל',
    terms: { it: ['pepsina'], en: ['pepsin'], de: ['pepsin'], fr: ['pepsine'], es: ['pepsina'], he: ['פפסין'] },
  },
  {
    id: 'e542',
    level: 3,
    group: 'additive',
    reason: 'E542 — פוספט מעצמות',
    terms: { it: ['e542', 'fosfato osseo', 'fosfato d\'ossa'], en: ['bone phosphate', 'edible bone phosphate', 'bone meal'], de: ['knochenphosphat', 'knochenmehl'], fr: ['phosphate d\'os'], es: ['fosfato de hueso*'], he: ['פוספט עצמות'] },
  },

  // ── Medium (2) ──
  {
    id: 'meat-unspecified',
    level: 2,
    group: 'meat',
    reason: 'בשר בלי סוג החיה',
    terms: {
      it: ['carne', 'carni', 'estratto di carne', 'brodo', 'brodo di carne', 'frattaglie', 'insaccato'],
      en: ['meat', 'meats', 'meat extract', 'meat stock', 'broth', 'stock', 'mechanically separated meat', 'offal'],
      de: ['fleisch', '*fleisch', 'fleischextrakt', 'brühe', '*brühe', 'fleischbrühe', 'innereien'],
      fr: ['viande*', 'extrait de viande', 'bouillon', 'abats'],
      es: ['carne', 'carnes', 'extracto de carne', 'caldo', 'caldo de carne', 'visceras'],
      he: ['בשר', 'ציר בשר', 'תמצית בשר'],
    },
    qualifiers: [
      // "carne suina": the pork word is its own finding — don't double-report.
      { re: PORK, level: NOT_A_FINDING },
      { re: KOSHER_LAND, level: NOT_A_FINDING, reason: 'בשר מחיה כשרה' },
      { re: KOSHER_FISH, level: NOT_A_FINDING },
      { re: VEGETABLE, level: NOT_A_FINDING },
      { re: stems(['verdur', 'ortagg', 'gemuse', 'legum', 'verdura', 'funghi', 'mushroom', 'pilz', 'champignon', 'hongo', 'granchio', 'granchi', 'crab', 'cocco', 'coconut', 'kokos', 'noix', 'frutta', 'fruit', 'frucht', 'pomodor', 'tomat', 'ירק']), level: NOT_A_FINDING },
    ],
  },
  {
    id: 'fish-unspecified',
    level: 2,
    group: 'fish',
    reason: 'דג בלי סוג — ייתכן דג בלי קשקשים',
    terms: {
      it: ['pesce', 'pesci', 'olio di pesce', 'estratto di pesce', 'salsa di pesce', 'farina di pesce', 'ittico', 'ittici'],
      en: ['fish', 'fish oil', 'fish sauce', 'fish extract', 'fish stock', 'white fish', 'whitefish'],
      de: ['fisch', 'fische', 'fischol', 'fischsauce', 'fischextrakt', 'fischfond'],
      fr: ['poisson', 'poissons', 'huile de poisson', 'sauce de poisson'],
      es: ['pescado', 'pescados', 'pez', 'aceite de pescado', 'salsa de pescado'],
      he: ['דג', 'דגים', 'שמן דגים', 'רוטב דגים'],
    },
    qualifiers: [{ re: KOSHER_FISH, level: NOT_A_FINDING, reason: 'דג כשר' }],
  },
  {
    id: 'roe',
    level: 2,
    group: 'fish',
    reason: 'ביצי דגים בלי סוג',
    terms: {
      it: ['uova di pesce', 'bottarga', 'tarama'],
      en: ['fish roe', 'roe', 'tarama*'],
      de: ['rogen', 'fischrogen'],
      fr: ['oeufs de poisson', 'oeufs de lompe', 'tarama'],
      es: ['huevas', 'huevas de pescado'],
      he: ['ביצי דגים', 'איקרה', 'טרמה'],
    },
    qualifiers: [
      { re: NONKOSHER_ROE, level: 4, reason: 'ביצי דג לא כשר' },
      { re: KOSHER_FISH, level: NOT_A_FINDING, reason: 'ביצי דג כשר' },
    ],
  },
  {
    id: 'e920',
    level: 2,
    group: 'additive',
    reason: 'E920 (ציסטאין) — מנוצות או משיער',
    terms: { it: ['e920', 'l-cisteina', 'cisteina'], en: ['l-cysteine', 'cysteine'], de: ['l-cystein', 'cystein'], fr: ['l-cysteine', 'cysteine'], es: ['l-cisteina', 'cisteina'], he: ['ציסטאין'] },
  },

  // ── Low (1): emulsifiers & flavour enhancers that may be animal-derived ──
  {
    id: 'emulsifiers',
    level: 1,
    group: 'additive',
    reason: 'מתחלב שיכול להיות משומן מן החי',
    terms: {
      it: ['e470', 'e470a', 'e470b', 'e471', 'e472', 'e472a', 'e472b', 'e472c', 'e472d', 'e472e', 'e472f', 'e473', 'e474', 'e475', 'e476', 'e477', 'e478', 'e479b', 'e481', 'e482', 'e483', 'e491', 'e492', 'e493', 'e494', 'e495', 'e570', 'e572', 'e422', 'mono- e digliceridi', 'mono e digliceridi', 'monogliceridi', 'digliceridi', 'stearoil*', 'acido stearico', 'stearato*', 'glicerina', 'glicerolo'],
      en: ['mono- and diglycerides', 'mono and diglycerides', 'monoglycerides', 'diglycerides', 'stearoyl*', 'stearic acid', 'stearate*', 'glycerin', 'glycerine', 'glycerol', 'polysorbate*'],
      de: ['mono- und diglyceride', 'mono und diglyceride', 'monoglyceride', 'diglyceride', 'stearinsaure', 'stearoyl*', 'glycerin'],
      fr: ['mono- et diglycerides', 'mono et diglycerides', 'monoglycerides', 'diglycerides', 'acide stearique', 'stearoyl*', 'glycerine', 'glycerol'],
      es: ['mono- y digliceridos', 'mono y digliceridos', 'monogliceridos', 'digliceridos', 'acido estearico', 'estearoil*', 'glicerina', 'glicerol'],
      he: ['מונו ודיגליצרידים', 'מונוגליצרידים', 'גליצרין', 'גליצרול'],
    },
    qualifiers: [{ re: VEGETABLE, level: NOT_A_FINDING, reason: 'ממקור צמחי' }],
  },
  {
    id: 'ribonucleotides',
    level: 1,
    group: 'additive',
    reason: 'משפר טעם שלעיתים מופק מדגים או מבשר',
    terms: {
      it: ['e627', 'e631', 'e635', 'guanilato disodico', 'inosinato disodico', 'ribonucleotidi'],
      en: ['disodium guanylate', 'disodium inosinate', 'disodium ribonucleotides'],
      de: ['dinatriumguanylat', 'dinatriuminosinat', 'dinatrium-5\'-ribonukleotid'],
      fr: ['guanylate disodique', 'inosinate disodique', 'ribonucleotides disodiques'],
      es: ['guanilato disodico', 'inosinato disodico', 'ribonucleotidos disodicos'],
      he: ['אינוזינט', 'גואנילט'],
    },
  },
];

/** Words that mark dairy — for the meat + milk note only (never changes the level). */
export const DAIRY_TERMS = [
  'latte', 'formaggi*', 'burro', 'panna', 'siero di latte', 'lattosio', 'mozzarella', 'parmigiano', 'ricotta', 'yogurt', 'caseina*', 'caseinat*',
  'milk', 'cheese', 'butter', 'cream', 'whey', 'lactose', 'casein*',
  'milch*', 'kase', '*kase', 'sahne', 'molke*', 'laktose', 'buttermilch',
  'lait', 'fromage*', 'beurre', 'creme', 'lactoserum', 'lactose',
  'leche', 'queso*', 'mantequilla', 'nata', 'suero de leche', 'lactosa',
  'חלב', 'גבינה', 'חמאה', 'שמנת', 'מי גבינה', 'לקטוז',
];

/** Kosher-animal meat words — together with dairy they trigger the meat + milk note. */
export const KOSHER_MEAT_TERMS = [
  'manzo', 'vitello', 'pollo', 'tacchino', 'agnello', 'bresaola', 'carne bovina', 'carne di manzo', 'carne di pollo',
  'beef', 'veal', 'chicken', 'turkey', 'lamb',
  'rindfleisch', 'kalbfleisch', 'hahnchen*', 'huhn*', 'pute*', 'lammfleisch',
  'boeuf', 'veau', 'poulet', 'dinde', 'agneau',
  'ternera', 'vacuno', 'pollo', 'pavo', 'cordero',
  'בקר', 'עוף', 'הודו', 'כבש',
];

/** Phrases that start a "may contain" / traces statement — hits after them don't count. */
export const TRACE_MARKERS = [
  'puo contenere', 'potrebbe contenere', 'tracce di', 'tracce eventuali', 'prodotto in uno stabilimento', 'in uno stabilimento che',
  'may contain', 'may also contain', 'traces of', 'made in a factory', 'produced in a facility', 'manufactured in a facility', 'made on equipment',
  'kann spuren', 'kann enthalten', 'spuren von', 'kann ebenfalls',
  'peut contenir', 'traces de', 'traces eventuelles', 'traces possibles',
  'puede contener', 'trazas de', 'puede contener trazas',
  'עלול להכיל', 'עשוי להכיל', 'עקבות של', 'מיוצר במפעל',
];

/** A negation right before a hit cancels it ("senza gelatina", "gelatin-free"). */
export const NEGATION_BEFORE = /(?:senza|privo di|without|free from|no|ohne|frei von|sans|sin|libre de|ללא|בלי|נטול)\s*$/u;
export const NEGATION_AFTER = /^[\s-]*(?:free|frei|libre)(?!\p{L})/u;

export const LEVEL_NAMES: Record<RiskLevel, string> = {
  0: 'נקי',
  1: 'סיכון נמוך',
  2: 'סיכון בינוני',
  3: 'סיכון גבוה',
  4: 'לא כשר',
};
