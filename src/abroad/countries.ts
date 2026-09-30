/**
 * Travel mode: per country, the label words that matter most, restaurant
 * dishes that usually hide a non-kosher animal ingredient, and a few tips.
 * Levels follow the app's standard (animal origin only).
 */
import type { RiskLevel } from '../kashrut/engine';

export type Word = { term: string; he: string; level: RiskLevel };
export type Dish = { name: string; he: string; level: RiskLevel };

export type Country = {
  id: string;
  name: string;
  language: string;
  /** Open Food Facts country tag, for the offline pack. */
  offTag: string;
  words: Word[];
  dishes: Dish[];
  tips: string[];
};

export const COUNTRIES: Country[] = [
  {
    id: 'it',
    name: 'איטליה',
    language: 'איטלקית',
    offTag: 'en:italy',
    words: [
      { term: 'strutto', he: 'שומן חזיר — נפוץ במאפים ובפיאדינה', level: 4 },
      { term: 'lardo', he: 'שומן גב חזיר', level: 4 },
      { term: 'guanciale', he: 'לחי חזיר', level: 4 },
      { term: 'pancetta', he: 'בטן חזיר', level: 4 },
      { term: 'prosciutto', he: 'נקניק חזיר (אלא אם כתוב di tacchino — הודו)', level: 4 },
      { term: 'suino / maiale', he: 'חזיר', level: 4 },
      { term: 'frutti di mare', he: 'פירות ים', level: 4 },
      { term: 'gamberi, cozze, vongole', he: 'שרימפס, מולים, צדפות', level: 4 },
      { term: 'calamari, seppia, polpo', he: 'דיונון, דיונונית, תמנון', level: 4 },
      { term: 'pesce spada', he: 'דג חרב', level: 4 },
      { term: 'cocciniglia / E120', he: 'קרמין — צבע מחרקים', level: 4 },
      { term: 'gelatina', he: "ג'לטין בלי מקור — לרוב חזיר", level: 3 },
      { term: 'salame, mortadella', he: 'נקניקים — לרוב חזיר', level: 3 },
    ],
    dishes: [
      { name: 'Carbonara / Amatriciana', he: 'עם guanciale או pancetta', level: 4 },
      { name: 'Spaghetti alle vongole', he: 'צדפות', level: 4 },
      { name: 'Risotto al nero di seppia', he: 'דיו דיונונית', level: 4 },
      { name: 'Frittura mista', he: 'קלמרי ושרימפס', level: 4 },
      { name: "'Nduja", he: 'ממרח חזיר חריף', level: 4 },
      { name: 'Panna cotta', he: "כמעט תמיד עם ג'לטין", level: 3 },
      { name: 'Cannoli, sfogliatella', he: 'הבצק לפעמים עם strutto', level: 3 },
      { name: 'Piadina', he: 'המסורתית עם strutto — שאל על olio', level: 3 },
    ],
    tips: [
      'במאפייה שאל: "è fatto con lo strutto?" (זה עשוי עם שומן חזיר?)',
      'גלידה איטלקית (gelato) בדרך כלל בלי ג׳לטין — semifreddo ו-panna cotta כן.',
      '"Senza strutto" או "con olio d\'oliva" על מאפה — סימן טוב.',
    ],
  },
  {
    id: 'fr',
    name: 'צרפת',
    language: 'צרפתית',
    offTag: 'en:france',
    words: [
      { term: 'porc', he: 'חזיר', level: 4 },
      { term: 'lardons', he: 'קוביות בייקון', level: 4 },
      { term: 'jambon', he: 'נקניק חזיר (jambon de dinde — הודו)', level: 4 },
      { term: 'saindoux', he: 'שומן חזיר', level: 4 },
      { term: 'fruits de mer', he: 'פירות ים', level: 4 },
      { term: 'crevettes, moules, huîtres', he: 'שרימפס, מולים, צדפות', level: 4 },
      { term: 'escargots', he: 'חלזונות', level: 4 },
      { term: 'cuisses de grenouille', he: 'רגלי צפרדע', level: 4 },
      { term: 'carmin / E120', he: 'קרמין — צבע מחרקים', level: 4 },
      { term: 'gélatine', he: "ג'לטין בלי מקור", level: 3 },
      { term: 'saucisse, saucisson', he: 'נקניקים — לרוב חזיר', level: 3 },
    ],
    dishes: [
      { name: 'Quiche lorraine', he: 'עם lardons', level: 4 },
      { name: 'Croque-monsieur', he: 'עם jambon', level: 4 },
      { name: 'Crêpe complète', he: 'עם jambon', level: 4 },
      { name: 'Moules-frites', he: 'מולים', level: 4 },
      { name: 'Bouillabaisse', he: 'מרק דגים עם פירות ים', level: 4 },
      { name: 'Cassoulet, choucroute', he: 'נקניק ובשר חזיר', level: 4 },
      { name: 'Rillettes, andouillette', he: 'לרוב חזיר', level: 4 },
    ],
    tips: ['"Sans porc" (בלי חזיר) מופיע בהרבה מוצרים בסופר — שים לב שזה לא אומר בלי ג׳לטין.', 'בפטיסרי — מוסים ועוגות גבינה לפעמים עם gélatine.'],
  },
  {
    id: 'de',
    name: 'גרמניה',
    language: 'גרמנית',
    offTag: 'en:germany',
    words: [
      { term: 'Schwein-', he: 'חזיר (גם בתוך מילים מורכבות)', level: 4 },
      { term: 'Schinken', he: 'נקניק חזיר (Putenschinken — הודו)', level: 4 },
      { term: 'Speck', he: 'בייקון', level: 4 },
      { term: 'Garnelen, Krabben', he: 'שרימפס', level: 4 },
      { term: 'Muscheln', he: 'צדפות ומולים', level: 4 },
      { term: 'Aal', he: 'צלופח', level: 4 },
      { term: 'Karmin / E120', he: 'קרמין', level: 4 },
      { term: 'Gelatine', he: "ג'לטין — לרוב חזיר", level: 3 },
      { term: 'Schmalz', he: 'שומן (Butterschmalz = חמאה, בסדר)', level: 3 },
      { term: '-wurst', he: 'נקניק — לרוב חזיר', level: 3 },
    ],
    dishes: [
      { name: 'Schweinshaxe, Eisbein', he: 'שוק חזיר', level: 4 },
      { name: 'Mettbrötchen', he: 'חזיר טחון נא', level: 4 },
      { name: 'Leberkäse', he: 'קציץ חזיר ובקר', level: 4 },
      { name: 'Bratwurst, Currywurst', he: 'נקניקיה — לרוב חזיר', level: 3 },
      { name: 'Maultaschen', he: 'כיסונים — לרוב עם חזיר', level: 3 },
      { name: 'Gummibärchen', he: "סוכריות גומי עם ג'לטין", level: 3 },
    ],
    tips: ['בגרמנית מילים מתחברות: Schweinefleisch, Schweineschmalz — חפש "Schwein" בתוך המילה.', 'סוכריות גומי "vegan" או "ohne Gelatine" — בסדר.'],
  },
  {
    id: 'es',
    name: 'ספרד',
    language: 'ספרדית',
    offTag: 'en:spain',
    words: [
      { term: 'cerdo', he: 'חזיר', level: 4 },
      { term: 'jamón', he: 'נקניק חזיר (jamón de pavo — הודו)', level: 4 },
      { term: 'chorizo', he: 'נקניק חזיר מפולפל', level: 4 },
      { term: 'manteca de cerdo', he: 'שומן חזיר', level: 4 },
      { term: 'panceta, tocino', he: 'בייקון', level: 4 },
      { term: 'marisco, gambas', he: 'פירות ים, שרימפס', level: 4 },
      { term: 'calamares, pulpo', he: 'קלמרי, תמנון', level: 4 },
      { term: 'mejillones, almejas', he: 'מולים, צדפות', level: 4 },
      { term: 'gelatina', he: "ג'לטין בלי מקור", level: 3 },
      { term: 'embutido', he: 'נקניקים — לרוב חזיר', level: 3 },
    ],
    dishes: [
      { name: 'Paella de marisco / mixta', he: 'פירות ים, לפעמים chorizo', level: 4 },
      { name: 'Croquetas de jamón', he: 'עם jamón', level: 4 },
      { name: 'Pulpo a la gallega', he: 'תמנון', level: 4 },
      { name: 'Calamares a la romana', he: 'קלמרי מטוגן', level: 4 },
      { name: 'Gambas al ajillo', he: 'שרימפס', level: 4 },
      { name: 'Fabada', he: 'נזיד שעועית עם חזיר', level: 4 },
    ],
    tips: ['"Manteca" לבד יכול להיות גם חמאה — "manteca de cerdo" זה שומן חזיר.', 'Paella valenciana מסורתית עם עוף וארנב — גם ארנב לא כשר.'],
  },
  {
    id: 'gb',
    name: 'בריטניה',
    language: 'אנגלית',
    offTag: 'en:united-kingdom',
    words: [
      { term: 'pork, bacon, ham', he: 'חזיר', level: 4 },
      { term: 'lard', he: 'שומן חזיר', level: 4 },
      { term: 'prawns, shellfish', he: 'שרימפס, פירות ים', level: 4 },
      { term: 'cochineal / E120', he: 'קרמין', level: 4 },
      { term: 'gelatine', he: "ג'לטין בלי מקור", level: 3 },
      { term: 'sausage', he: 'נקניק — לרוב חזיר', level: 3 },
      { term: 'suet', he: 'שומן בקר', level: 1 },
    ],
    dishes: [
      { name: 'Full English breakfast', he: 'בייקון, נקניקיה, black pudding', level: 4 },
      { name: 'Black pudding', he: 'נקניק דם חזיר', level: 4 },
      { name: 'Pork pie, sausage roll', he: 'חזיר במאפה', level: 4 },
      { name: 'Wine gums, jelly babies', he: "סוכריות עם ג'לטין", level: 3 },
      { name: 'Fish & chips', he: 'בדרך כלל בקלה — בסדר. לפעמים מטוגן בשומן בקר', level: 1 },
    ],
    tips: ['"Suitable for vegetarians" על ממתקים — בלי ג׳לטין.', 'Worcestershire sauce מכיל אנשובי — דג כשר, בסדר.'],
  },
  {
    id: 'us',
    name: 'ארה"ב',
    language: 'אנגלית',
    offTag: 'en:united-states',
    words: [
      { term: 'pork, bacon, ham', he: 'חזיר', level: 4 },
      { term: 'lard', he: 'שומן חזיר', level: 4 },
      { term: 'shrimp, crab, clam', he: 'שרימפס, סרטן, צדפות', level: 4 },
      { term: 'carmine / cochineal', he: 'קרמין', level: 4 },
      { term: 'gelatin', he: "ג'לטין בלי מקור", level: 3 },
      { term: 'pepperoni, sausage', he: 'נקניק — לרוב חזיר', level: 3 },
    ],
    dishes: [
      { name: 'BLT, pulled pork', he: 'בייקון / חזיר', level: 4 },
      { name: 'Clam chowder', he: 'מרק צדפות', level: 4 },
      { name: 'Gumbo, jambalaya', he: 'שרימפס ונקניק', level: 4 },
      { name: 'Pepperoni pizza', he: 'פפרוני — לרוב חזיר ובקר', level: 3 },
      { name: 'Marshmallows, Jell-O', he: "ג'לטין", level: 3 },
      { name: 'Refried beans', he: 'לפעמים מבושל ב-lard', level: 3 },
    ],
    tips: ['בארה"ב יש הרבה מוצרים עם הכשר (OU, OK, Kof-K) — זה עוזר, אבל האפליקציה לא בודקת הכשר.', 'Tortillas ועוגיות ביתיות לפעמים עם lard.'],
  },
];

export function getCountry(id: string | null | undefined): Country | null {
  return COUNTRIES.find((c) => c.id === id) ?? null;
}
