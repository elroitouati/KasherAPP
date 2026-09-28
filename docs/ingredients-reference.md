# מילון רכיבים — בודק כשרות

> קובץ זה נוצר אוטומטית מ-`src/kashrut/dict.ts` (`npm run docs:dict`). אל תערוך ידנית.

**40 קבוצות · 884 מונחים · 6 שפות**

## הסטנדרט

כשרות לפי מקור החי בלבד. מסמנים רק רכיבים מבעלי חיים לא כשרים. לא נבדקים: הכשר, שחיטה, כלים/מטבח משותף, "עלול להכיל", יין, קיבה בגבינה. בשר מחיה כשרה ודגים כשרים — בסדר. בשר + חלב — הערה בלבד.

## רמות

| רמה | שם |
|---|---|
| 0 | נקי |
| 1 | סיכון נמוך |
| 2 | סיכון בינוני |
| 3 | סיכון גבוה |
| 4 | לא כשר |

הרמה הסופית = הרמה הגבוהה ביותר של רכיב אמיתי. ממצאים בתוך הצהרת עקבות לא נספרים.

## תחביר מונחים

- `word` — מילה שלמה · `word*` — מתחיל ב… · `*word` — מסתיים ב… (מילים מורכבות בגרמנית) · מילים עם רווח — רצף מילים
- **מסייגים (qualifiers)**: המילים שמיד לפני/אחרי הממצא (באותו רכיב) יכולות לשנות את הרמה. למשל `gelatina bovina` → 1, `prosciutto di tacchino` → 0.
- **ביטויים בטוחים** (רמה 0): ממצא שנמצא כולו בתוך ביטוי בטוח נמחק. למשל `funghi porcini`, `burro di cacao`, `locust bean gum`.
- **הביטוי הספציפי מנצח**: `pesce spada` גובר על `pesce`.

## חזיר — רמה 4 `pork`

קבוצה: pork

| שפה | מונחים |
|---|---|
| איטלקית | `maiale` · `maiali` · `suino` · `suina` · `suini` · `suine` · `porchetta` · `guanciale` · `cotenna` · `cotenne` · `ciccioli` · `zampone` · `cotechino` · `nduja` · `capocollo` · `culatello` · `lonza di maiale` |
| אנגלית | `pork` · `pig` · `pigs` · `swine` · `porcine` · `bacon` · `gammon` · `pork rind*` · `crackling` |
| גרמנית | `schwein*` · `*schwein` · `eisbein` · `schweinespeck` |
| צרפתית | `porc` · `porcs` · `porcine` · `lardon*` · `saindoux` · `couenne` |
| ספרדית | `cerdo` · `cerdos` · `porcino` · `porcina` · `tocino` · `panceta` · `chicharron*` · `manteca de cerdo` |
| עברית | `חזיר` · `חזירים` · `בייקון` |

**מסייגים:**

-  → לא ממצא: `porcini|steinpilz|cepe|boletus`

## שומן חזיר — רמה 4 `lard`

קבוצה: pork

| שפה | מונחים |
|---|---|
| איטלקית | `strutto` · `lardo` |
| אנגלית | `lard` |
| גרמנית | `schweineschmalz` · `schweinefett` |
| צרפתית | `lard` · `graisse de porc` |
| ספרדית | `manteca de cerdo` · `grasa de cerdo` · `lardo` |
| עברית | `שומן חזיר` |

## בשר חזיר מעובד (בייקון/פנצ׳טה) — רמה 4 `bacon-cuts`

קבוצה: pork

| שפה | מונחים |
|---|---|
| איטלקית | `pancetta` · `speck` · `bacon` |
| גרמנית | `speck` · `bauchspeck` · `frühstücksspeck` |
| צרפתית | `poitrine fumee` |

**מסייגים:**

- מוצר בשר מחיה כשרה → רמה 1: `(?<![\p{L}])(?:manzo|bovin|vitell|vacc|poll|gallin|tacchin|agnell|ovin|pecor|capr|anatr|oca(?!\p{L})|beef|veal|cow|chicken|poultry|hen(?!\p{…`

## חזיר (פרושוטו / האם) — רמה 4 `ham`

קבוצה: pork

| שפה | מונחים |
|---|---|
| איטלקית | `prosciutto` · `prosciutti` |
| אנגלית | `ham` · `hams` · `prosciutto` |
| גרמנית | `schinken` · `*schinken` |
| צרפתית | `jambon` · `jambons` |
| ספרדית | `jamon` · `jamones` |

**מסייגים:**

- נקניק מחיה כשרה → לא ממצא: `(?<![\p{L}])(?:manzo|bovin|vitell|vacc|poll|gallin|tacchin|agnell|ovin|pecor|capr|anatr|oca(?!\p{L})|beef|veal|cow|chicken|poultry|hen(?!\p{…`

## נקניק חזיר — רמה 4 `chorizo`

קבוצה: pork

| שפה | מונחים |
|---|---|
| איטלקית | `chorizo` |
| אנגלית | `chorizo` |
| ספרדית | `chorizo` · `chorizos` · `sobrasada` · `salchichon` |

**מסייגים:**

- נקניק מחיה כשרה → רמה 1: `(?<![\p{L}])(?:manzo|bovin|vitell|vacc|poll|gallin|tacchin|agnell|ovin|pecor|capr|anatr|oca(?!\p{L})|beef|veal|cow|chicken|poultry|hen(?!\p{…`

## סרטנאים (שרימפס/סרטן/לובסטר) — רמה 4 `crustaceans`

קבוצה: seafood

| שפה | מונחים |
|---|---|
| איטלקית | `gamber*` · `scampi` · `scampo` · `mazzancoll*` · `aragost*` · `astice` · `astici` · `granchi*` · `crostace*` · `canocchi*` · `krill` |
| אנגלית | `shrimp*` · `prawn*` · `lobster*` · `crab` · `crabs` · `crabmeat` · `crayfish` · `crawfish` · `langoustine*` · `crustacean*` · `krill` |
| גרמנית | `garnele*` · `*garnele` · `*garnelen` · `krabbe*` · `*krabben` · `hummer` · `languste*` · `krebs` · `krebse` · `flusskrebs*` · `krustentier*` · `krebstier*` · `shrimps` · `scampi` |
| צרפתית | `crevette*` · `homard*` · `langouste*` · `crabe*` · `ecrevisse*` · `crustace*` |
| ספרדית | `gamba` · `gambas` · `camaron*` · `langostino*` · `langosta*` · `bogavante*` · `cangrejo*` · `crustaceo*` · `cigala*` |
| עברית | `שרימפס` · `סרטן` · `סרטנים` · `לובסטר` · `סרטנאים` · `חסילונים` |

## רכיכות (צדפות/דיונון/תמנון) — רמה 4 `molluscs`

קבוצה: seafood

| שפה | מונחים |
|---|---|
| איטלקית | `cozz*` · `vongol*` · `ostric*` · `capesant*` · `cappesant*` · `calamar*` · `seppi*` · `polpo` · `polpi` · `polipo` · `polipi` · `moscardin*` · `totan*` · `mollusch*` · `mitili` · `telline` · `fasolari` · `canestrelli` · `frutti di mare` |
| אנגלית | `mussel*` · `clam` · `clams` · `oyster*` · `scallop*` · `squid` · `calamari` · `octopus*` · `cuttlefish` · `mollusc*` · `mollusk*` · `shellfish` · `seafood` · `abalone` · `cockle*` · `whelk*` |
| גרמנית | `muschel*` · `*muscheln` · `auster*` · `tintenfisch*` · `kalmar*` · `oktopus` · `krake` · `kraken` · `sepia` · `weichtier*` · `meeresfruchte` · `schalentier*` |
| צרפתית | `moules` · `palourde*` · `huitre*` · `coquille* saint-jacques` · `saint-jacques` · `calmar*` · `encornet*` · `poulpe*` · `seiche*` · `mollusque*` · `fruits de mer` · `coques` · `bulots` |
| ספרדית | `mejillon*` · `almeja*` · `ostra` · `ostras` · `vieira*` · `calamar*` · `pulpo*` · `sepia` · `jibia*` · `molusco*` · `marisco*` · `berberecho*` · `chipiron*` |
| עברית | `צדפות` · `צדפה` · `קלמרי` · `קלמרים` · `דיונון` · `תמנון` · `פירות ים` · `רכיכות` · `מולים` |

## צלופח — דג בלי קשקשים — רמה 4 `eel`

קבוצה: fish

| שפה | מונחים |
|---|---|
| איטלקית | `anguill*` · `capitone` |
| אנגלית | `eel` · `eels` |
| גרמנית | `aal` · `aale` · `räucheraal` |
| צרפתית | `anguille*` |
| ספרדית | `anguila*` · `angula*` |
| עברית | `צלופח` |

## שפמנון (כולל פנגסיוס) — דג בלי קשקשים — רמה 4 `catfish`

קבוצה: fish

| שפה | מונחים |
|---|---|
| איטלקית | `pangasio` · `pangasius` · `pesce gatto` · `pesci gatto` · `siluro` |
| אנגלית | `catfish` · `pangasius` · `panga` · `basa` · `basa fish` · `river cobbler` · `swai` |
| גרמנית | `wels` · `welse` · `pangasius` · `katzenwels` |
| צרפתית | `poisson-chat` · `poisson chat` · `silure` · `pangasius` · `panga` |
| ספרדית | `pez gato` · `bagre` · `pangasius` · `panga` |
| עברית | `שפמנון` · `פנגסיוס` · `פנגה` · `באסה` |

## כריש — דג בלי קשקשים — רמה 4 `shark`

קבוצה: fish

| שפה | מונחים |
|---|---|
| איטלקית | `squalo` · `squali` · `palombo` · `verdesca` · `spinarolo` · `smeriglio` · `gattuccio` |
| אנגלית | `shark` · `sharks` · `dogfish` · `huss` · `rock salmon` |
| גרמנית | `haifisch*` · `dornhai` · `schillerlocke*` |
| צרפתית | `requin*` · `roussette` · `aiguillat` |
| ספרדית | `tiburon*` · `cazon` · `marrajo` · `tintorera` |
| עברית | `כריש` |

## דג חרב — ללא קשקשים בבגרותו — רמה 4 `swordfish`

קבוצה: fish

| שפה | מונחים |
|---|---|
| איטלקית | `pesce spada` |
| אנגלית | `swordfish` |
| גרמנית | `schwertfisch*` |
| צרפתית | `espadon` |
| ספרדית | `pez espada` |
| עברית | `דג חרב` |

## חדקן / קוויאר — דג לא כשר — רמה 4 `sturgeon`

קבוצה: fish

| שפה | מונחים |
|---|---|
| איטלקית | `storione` · `storioni` · `caviale` |
| אנגלית | `sturgeon` · `caviar` · `beluga` · `sevruga` · `osetra` |
| גרמנית | `stör` · `kaviar` |
| צרפתית | `esturgeon` · `caviar` |
| ספרדית | `esturion` · `caviar` |
| עברית | `חדקן` · `קוויאר` |

**מסייגים:**

- ביצי סלמון/פורל → רמה 0: `(?<![\p{L}])(?:salmon|salm(?!\p{L})|trot|trout|forell|lachs|saumon|truite|truch|סלמון)`

## רנה פסקטריצ׳ה (דג נזיר) — דג בלי קשקשים — רמה 4 `monkfish`

קבוצה: fish

| שפה | מונחים |
|---|---|
| איטלקית | `rana pescatrice` · `coda di rospo` |
| אנגלית | `monkfish` · `anglerfish` |
| גרמנית | `seeteufel` · `anglerfisch` |
| צרפתית | `lotte` · `baudroie` |
| ספרדית | `rape` |
| עברית | `דג נזיר` |

**מסייגים:**

-  → לא ממצא: `(?<![\p{L}])(?:seed|oil|olio|aceite|huile)`

## דג בלי סנפיר וקשקשת — רמה 4 `scaleless-other`

קבוצה: fish

| שפה | מונחים |
|---|---|
| איטלקית | `razza` · `razze` · `lampreda` · `lampredi` · `uova di lompo` · `lompo` |
| אנגלית | `skate` · `stingray` · `lamprey` · `lumpfish` |
| גרמנית | `rochen` · `neunauge*` · `seehase*` |
| צרפתית | `raie` · `lamproie*` · `lompe` |
| ספרדית | `raya` · `lamprea*` · `lumpo` |
| עברית | `בטאים` · `טריגון` |

## ארנב / ארנבת — רמה 4 `rabbit`

קבוצה: animal

| שפה | מונחים |
|---|---|
| איטלקית | `conigli*` · `lepre` · `lepri` |
| אנגלית | `rabbit*` · `hare` |
| גרמנית | `kaninchen*` · `hase` · `hasen*` |
| צרפתית | `lapin*` · `lievre*` |
| ספרדית | `conejo*` · `liebre*` |
| עברית | `ארנב` · `ארנבת` |

## סוס — רמה 4 `horse`

קבוצה: animal

| שפה | מונחים |
|---|---|
| איטלקית | `cavallo` · `cavalli` · `equino` · `equina` · `equini` · `puledro` |
| אנגלית | `horse` · `horsemeat` · `equine` |
| גרמנית | `pferd*` · `*pferdefleisch` · `rossfleisch` |
| צרפתית | `cheval` · `chevaux` · `chevaline` · `chevalin` |
| ספרדית | `caballo*` · `equino` · `equina` |
| עברית | `סוס` · `סוסים` |

## חמור (כולל חלב אתונות) — רמה 4 `donkey`

קבוצה: animal

| שפה | מונחים |
|---|---|
| איטלקית | `asino` · `asina` · `asini` · `somaro` · `latte d'asina` |
| אנגלית | `donkey*` · `ass milk` |
| גרמנית | `esel*` · `*eselsmilch` |
| צרפתית | `anesse` · `lait d'anesse` |
| ספרדית | `asno` · `burra` · `leche de burra` |
| עברית | `חמור` · `אתונות` |

## גמל (כולל חלב גמלים) — רמה 4 `camel`

קבוצה: animal

| שפה | מונחים |
|---|---|
| איטלקית | `cammell*` |
| אנגלית | `camel*` |
| גרמנית | `kamel*` |
| צרפתית | `chameau*` · `chamelle` |
| ספרדית | `camello*` |
| עברית | `גמל` · `גמלים` · `גמלה` |

**מסייגים:**

-  → לא ממצא: `caramel|camelina|kamille`

## בת יענה — רמה 4 `ostrich`

קבוצה: animal

| שפה | מונחים |
|---|---|
| איטלקית | `struzz*` |
| אנגלית | `ostrich*` |
| גרמנית | `strauss` · `straussen*` · `straussenfleisch` |
| צרפתית | `autruche*` |
| ספרדית | `avestruz*` |
| עברית | `יען` · `בת יענה` |

## צפרדע — רמה 4 `frog`

קבוצה: animal

| שפה | מונחים |
|---|---|
| איטלקית | `rana` · `rane` · `cosce di rana` |
| אנגלית | `frog*` |
| גרמנית | `frosch*` · `froschschenkel` |
| צרפתית | `grenouille*` |
| ספרדית | `ancas de rana` |
| עברית | `צפרדע` · `צפרדעים` |

**מסייגים:**

-  → לא ממצא: `pescatric`

## חלזונות — רמה 4 `snail`

קבוצה: animal

| שפה | מונחים |
|---|---|
| איטלקית | `lumac*` · `chiocciol*` |
| אנגלית | `snail*` · `escargot*` |
| גרמנית | `schnecke*` · `weinbergschnecke*` |
| צרפתית | `escargot*` |
| ספרדית | `caracol*` |
| עברית | `חלזון` · `חלזונות` · `שבלול` |

## קרמין — צבע מכנימות — רמה 4 `carmine`

קבוצה: insect

| שפה | מונחים |
|---|---|
| איטלקית | `e120` · `carminio` · `cocciniglia` · `acido carminico` · `rosso cocciniglia` |
| אנגלית | `carmine*` · `cochineal` · `carminic acid` · `natural red 4` · `ci 75470` |
| גרמנית | `karmin*` · `cochenille` · `echtes karmin` |
| צרפתית | `carmin*` · `cochenille` · `acide carminique` |
| ספרדית | `carmin` · `cochinilla` · `acido carminico` |
| עברית | `קרמין` · `כנימה` · `כנימות` |

## חרקים — רמה 4 `insects`

קבוצה: insect

| שפה | מונחים |
|---|---|
| איטלקית | `insett*` · `grilli` · `grillo` · `larve di` · `cavallett*` · `acheta` · `tenebrio` |
| אנגלית | `insect*` · `cricket*` · `mealworm*` · `locust` · `locusts` · `grasshopper*` · `larvae` · `acheta` · `tenebrio` |
| גרמנית | `insekt*` · `grillen` · `heuschreck*` · `mehlwurm*` · `larven` |
| צרפתית | `insecte*` · `grillon*` · `criquet*` · `sauterelle*` · `larves` · `ver de farine` |
| ספרדית | `insecto*` · `grillo*` · `saltamonte*` · `langosta migratoria` · `gusano de la harina` |
| עברית | `חרקים` · `חרק` · `צרצרים` · `ארבה` · `זחלים` |

**מסייגים:**

-  → לא ממצא: `bean|carrub|johannisbrot|caroube|garrofin|algarrob`
-  → לא ממצא: `grigliat|grille[dr]|gegrill`

## שלאק — הפרשת חרק, בשימוש לציפוי — רמה 1 `shellac`

קבוצה: insect

| שפה | מונחים |
|---|---|
| איטלקית | `e904` · `gommalacca` · `gomma lacca` |
| אנגלית | `shellac` · `confectioner's glaze` |
| גרמנית | `schellack` |
| צרפתית | `gomme-laque` · `gomme laque` |
| ספרדית | `goma laca` · `goma-laca` |
| עברית | `שלאק` · `שלק` |

## ג׳לטין בלי מקור — לרוב מחזיר — רמה 3 `gelatin`

קבוצה: gelatin

| שפה | מונחים |
|---|---|
| איטלקית | `gelatina` · `gelatine` · `e441` · `gelatina alimentare` · `gelatina animale` |
| אנגלית | `gelatin` · `gelatine` |
| גרמנית | `gelatine` · `*gelatine` · `speisegelatine` |
| צרפתית | `gelatine*` |
| ספרדית | `gelatina*` · `grenetina` |
| עברית | `ג'לטין` · `גלטין` · `ג'לטינה` |

**מסייגים:**

- ג'לטין חזיר → רמה 4: `(?<![\p{L}])(?:maial|suin|porc(?:o|a|s|ine)?(?!\p{L})|pork|pig(?!\p{L})|swine|schwein|cerdo|porcin[oa](?!\p{L})|חזיר)`
- ג'לטין בקר/עוף → רמה 1: `(?<![\p{L}])(?:manzo|bovin|vitell|vacc|poll|gallin|tacchin|agnell|ovin|pecor|capr|anatr|oca(?!\p{L})|beef|veal|cow|chicken|poultry|hen(?!\p{…`
- ג'לטין דגים → רמה 1: `(?<![\p{L}])(?:pesce|ittic|fish|fisch|poisson|pescado|pez(?!\p{L})|דג)`
-  → לא ממצא: `(?<![\p{L}])(?:vegetal|vegetable|plant|pflanz|veget|soia|soy|soja|girasol|palm|colza|rapeseed|raps|צמח)`
-  → לא ממצא: `(?<![\p{L}])(?:frutt|fruit|frucht|pectin|agar)`

## ג'לטין/קולגן דגים — דג לא ידוע — רמה 1 `fish-gelatin`

קבוצה: gelatin

| שפה | מונחים |
|---|---|
| איטלקית | `gelatina di pesce` · `gelatina ittica` · `collagene di pesce` · `collagene marino` |
| אנגלית | `fish gelatin` · `fish gelatine` · `fish collagen` · `marine collagen` |
| גרמנית | `fischgelatine` · `fischkollagen` |
| צרפתית | `gelatine de poisson` · `collagene marin` · `collagene de poisson` |
| ספרדית | `gelatina de pescado` · `colageno marino` · `colageno de pescado` |
| עברית | `ג'לטין דגים` · `קולגן דגים` |

## קולגן בלי מקור — רמה 3 `collagen`

קבוצה: gelatin

| שפה | מונחים |
|---|---|
| איטלקית | `collagene` · `collagen*` |
| אנגלית | `collagen*` |
| גרמנית | `kollagen*` · `*kollagen` |
| צרפתית | `collagene*` |
| ספרדית | `colageno*` |
| עברית | `קולגן` |

**מסייגים:**

- קולגן חזיר → רמה 4: `(?<![\p{L}])(?:maial|suin|porc(?:o|a|s|ine)?(?!\p{L})|pork|pig(?!\p{L})|swine|schwein|cerdo|porcin[oa](?!\p{L})|חזיר)`
- קולגן בקר/עוף → רמה 1: `(?<![\p{L}])(?:manzo|bovin|vitell|vacc|poll|gallin|tacchin|agnell|ovin|pecor|capr|anatr|oca(?!\p{L})|beef|veal|cow|chicken|poultry|hen(?!\p{…`
- קולגן דגים → רמה 1: `(?<![\p{L}])(?:pesce|ittic|marin|fish|fisch|poisson|pescado|דג)`

## שומן מן החי בלי מקור — רמה 3 `animal-fat`

קבוצה: fat

| שפה | מונחים |
|---|---|
| איטלקית | `grasso animale` · `grassi animali` · `grasso di origine animale` · `grassi di origine animale` · `olio animale` |
| אנגלית | `animal fat` · `animal fats` · `animal shortening` · `dripping` |
| גרמנית | `tierisches fett` · `tierische fette` · `tierfett` · `schmalz` |
| צרפתית | `graisse animale` · `graisses animales` · `matiere grasse animale` |
| ספרדית | `grasa animal` · `grasas animales` · `manteca animal` |
| עברית | `שומן מן החי` · `שומן בעלי חיים` |

**מסייגים:**

- שומן חזיר → רמה 4: `(?<![\p{L}])(?:maial|suin|porc(?:o|a|s|ine)?(?!\p{L})|pork|pig(?!\p{L})|swine|schwein|cerdo|porcin[oa](?!\p{L})|חזיר)`
- שומן מחיה כשרה → רמה 1: `(?<![\p{L}])(?:manzo|bovin|vitell|vacc|poll|gallin|tacchin|agnell|ovin|pecor|capr|anatr|oca(?!\p{L})|beef|veal|cow|chicken|poultry|hen(?!\p{…`
-  → לא ממצא: `(?<![\p{L}])(?:butter|burro|beurre|mantequilla|latte|milch|milk)`

## ביטויים בטוחים — רמה 0 `safe-phrases`

| שפה | מונחים |
|---|---|
| איטלקית | `funghi porcini` · `porcini` · `polpa` · `polpa di pomodoro` · `burro di cacao` · `burro di arachidi` · `latte di cocco` · `carne di cocco` · `farina di carrube` · `carrube` · `gelatina di frutta` · `gelatina vegetale` · `brodo vegetale` |
| אנגלית | `locust bean gum` · `locust bean` · `rapeseed` · `rape seed` · `crab apple*` · `vegetable stock` · `vegetable broth` · `hot dog bun*` · `cocoa butter` · `peanut butter` · `coconut milk` · `coconut meat` · `jackfruit meat` |
| גרמנית | `butterschmalz` · `ganseschmalz` · `entenschmalz` · `pflanzenschmalz` · `gemusebruhe` · `steinpilz*` · `johannisbrotkernmehl` · `kakaobutter` |
| צרפתית | `cepes` · `bouillon de legumes` · `gomme de caroube` · `beurre de cacao` |
| ספרדית | `boletus` · `caldo vegetal` · `caldo de verduras` · `goma garrofin` · `manteca de cacao` · `leche de coco` |
| עברית | `חמאת קקאו` · `ציר ירקות` |

## חלב (שומן) בקר/כבש — רמה 1 `tallow`

קבוצה: fat

| שפה | מונחים |
|---|---|
| איטלקית | `sego` |
| אנגלית | `tallow` · `suet` · `beef fat` · `beef dripping` |
| גרמנית | `talg` · `rindertalg` · `rinderfett` |
| צרפתית | `suif` |
| ספרדית | `sebo` |

## נקניק/סלמי — בדרך כלל מחזיר — רמה 3 `sausage`

קבוצה: processed

| שפה | מונחים |
|---|---|
| איטלקית | `salame` · `salami` · `salamino` · `salamini` · `mortadella` · `wurstel` · `salsicc*` · `luganega` · `soppressata` · `finocchiona` |
| אנגלית | `salami` · `sausage*` · `pepperoni` · `hot dog*` · `frankfurter*` · `bologna` · `luncheon meat` |
| גרמנית | `*wurst` · `*wurstchen` · `*wurste` · `wurst*` · `salami` · `mortadella` · `wiener` · `frankfurter` · `leberkäse` |
| צרפתית | `saucisse*` · `saucisson*` · `salami` · `mortadelle` · `chipolata*` · `merguez` · `andouille*` |
| ספרדית | `salchicha*` · `salami` · `embutido*` · `mortadela` · `longaniza*` · `morcilla*` · `fuet` |
| עברית | `נקניק` · `נקניקים` · `נקניקיות` · `נקניקייה` · `סלמי` · `מורטדלה` |

**מסייגים:**

- נקניק חזיר → רמה 4: `(?<![\p{L}])(?:maial|suin|porc(?:o|a|s|ine)?(?!\p{L})|pork|pig(?!\p{L})|swine|schwein|cerdo|porcin[oa](?!\p{L})|חזיר)`
- נקניק מחיה כשרה → רמה 1: `(?<![\p{L}])(?:manzo|bovin|vitell|vacc|poll|gallin|tacchin|agnell|ovin|pecor|capr|anatr|oca(?!\p{L})|beef|veal|cow|chicken|poultry|hen(?!\p{…`
-  → לא ממצא: `(?<![\p{L}])(?:vegetal|vegetable|plant|pflanz|veget|soia|soy|soja|girasol|palm|colza|rapeseed|raps|צמח)`

## סורימי — לרוב מכיל סרטנים או דגים לא ידועים — רמה 3 `surimi`

קבוצה: processed

| שפה | מונחים |
|---|---|
| איטלקית | `surimi` · `polpa di granchio` |
| אנגלית | `surimi` · `crab stick*` · `imitation crab` |
| גרמנית | `surimi` · `krebsfleischimitat` |
| צרפתית | `surimi` |
| ספרדית | `surimi` · `palitos de cangrejo` |
| עברית | `סורימי` |

## פפסין — אנזים מקיבת חזיר בדרך כלל — רמה 3 `pepsin`

קבוצה: additive

| שפה | מונחים |
|---|---|
| איטלקית | `pepsina` |
| אנגלית | `pepsin` |
| גרמנית | `pepsin` |
| צרפתית | `pepsine` |
| ספרדית | `pepsina` |
| עברית | `פפסין` |

## E542 — פוספט מעצמות — רמה 3 `e542`

קבוצה: additive

| שפה | מונחים |
|---|---|
| איטלקית | `e542` · `fosfato osseo` · `fosfato d'ossa` |
| אנגלית | `bone phosphate` · `edible bone phosphate` · `bone meal` |
| גרמנית | `knochenphosphat` · `knochenmehl` |
| צרפתית | `phosphate d'os` |
| ספרדית | `fosfato de hueso*` |
| עברית | `פוספט עצמות` |

## בשר בלי סוג החיה — רמה 2 `meat-unspecified`

קבוצה: meat

| שפה | מונחים |
|---|---|
| איטלקית | `carne` · `carni` · `estratto di carne` · `brodo` · `brodo di carne` · `frattaglie` · `insaccato` |
| אנגלית | `meat` · `meats` · `meat extract` · `meat stock` · `broth` · `stock` · `mechanically separated meat` · `offal` |
| גרמנית | `fleisch` · `*fleisch` · `fleischextrakt` · `brühe` · `*brühe` · `fleischbrühe` · `innereien` |
| צרפתית | `viande*` · `extrait de viande` · `bouillon` · `abats` |
| ספרדית | `carne` · `carnes` · `extracto de carne` · `caldo` · `caldo de carne` · `visceras` |
| עברית | `בשר` · `ציר בשר` · `תמצית בשר` |

**מסייגים:**

-  → לא ממצא: `(?<![\p{L}])(?:maial|suin|porc(?:o|a|s|ine)?(?!\p{L})|pork|pig(?!\p{L})|swine|schwein|cerdo|porcin[oa](?!\p{L})|חזיר)`
- בשר מחיה כשרה → לא ממצא: `(?<![\p{L}])(?:manzo|bovin|vitell|vacc|poll|gallin|tacchin|agnell|ovin|pecor|capr|anatr|oca(?!\p{L})|beef|veal|cow|chicken|poultry|hen(?!\p{…`
-  → לא ממצא: `(?<![\p{L}])(?:salmon|salm(?!\p{L})|tonn|tuna|thun|atun|thon|merluzz|nasell|sardin|sardell|acciug|alic|anchov|anchois|anchoa|boqueron|sgombr…`
-  → לא ממצא: `(?<![\p{L}])(?:vegetal|vegetable|plant|pflanz|veget|soia|soy|soja|girasol|palm|colza|rapeseed|raps|צמח)`
-  → לא ממצא: `(?<![\p{L}])(?:verdur|ortagg|gemuse|legum|verdura|funghi|mushroom|pilz|champignon|hongo|granchio|granchi|crab|cocco|coconut|kokos|noix|frutt…`

## דג בלי סוג — ייתכן דג בלי קשקשים — רמה 2 `fish-unspecified`

קבוצה: fish

| שפה | מונחים |
|---|---|
| איטלקית | `pesce` · `pesci` · `olio di pesce` · `estratto di pesce` · `salsa di pesce` · `farina di pesce` · `ittico` · `ittici` |
| אנגלית | `fish` · `fish oil` · `fish sauce` · `fish extract` · `fish stock` · `white fish` · `whitefish` |
| גרמנית | `fisch` · `fische` · `fischol` · `fischsauce` · `fischextrakt` · `fischfond` |
| צרפתית | `poisson` · `poissons` · `huile de poisson` · `sauce de poisson` |
| ספרדית | `pescado` · `pescados` · `pez` · `aceite de pescado` · `salsa de pescado` |
| עברית | `דג` · `דגים` · `שמן דגים` · `רוטב דגים` |

**מסייגים:**

- דג כשר → לא ממצא: `(?<![\p{L}])(?:salmon|salm(?!\p{L})|tonn|tuna|thun|atun|thon|merluzz|nasell|sardin|sardell|acciug|alic|anchov|anchois|anchoa|boqueron|sgombr…`

## ביצי דגים בלי סוג — רמה 2 `roe`

קבוצה: fish

| שפה | מונחים |
|---|---|
| איטלקית | `uova di pesce` · `bottarga` · `tarama` |
| אנגלית | `fish roe` · `roe` · `tarama*` |
| גרמנית | `rogen` · `fischrogen` |
| צרפתית | `oeufs de poisson` · `oeufs de lompe` · `tarama` |
| ספרדית | `huevas` · `huevas de pescado` |
| עברית | `ביצי דגים` · `איקרה` · `טרמה` |

**מסייגים:**

- ביצי דג לא כשר → רמה 4: `(?<![\p{L}])(?:storion|sturgeon|stor(?!\p{L})|esturgeon|esturion|lomp|lumpfish|seehase|חדקן)`
- ביצי דג כשר → לא ממצא: `(?<![\p{L}])(?:salmon|salm(?!\p{L})|tonn|tuna|thun|atun|thon|merluzz|nasell|sardin|sardell|acciug|alic|anchov|anchois|anchoa|boqueron|sgombr…`

## E920 (ציסטאין) — מנוצות או משיער — רמה 2 `e920`

קבוצה: additive

| שפה | מונחים |
|---|---|
| איטלקית | `e920` · `l-cisteina` · `cisteina` |
| אנגלית | `l-cysteine` · `cysteine` |
| גרמנית | `l-cystein` · `cystein` |
| צרפתית | `l-cysteine` · `cysteine` |
| ספרדית | `l-cisteina` · `cisteina` |
| עברית | `ציסטאין` |

## מתחלב שיכול להיות משומן מן החי — רמה 1 `emulsifiers`

קבוצה: additive

| שפה | מונחים |
|---|---|
| איטלקית | `e470` · `e470a` · `e470b` · `e471` · `e472` · `e472a` · `e472b` · `e472c` · `e472d` · `e472e` · `e472f` · `e473` · `e474` · `e475` · `e476` · `e477` · `e478` · `e479b` · `e481` · `e482` · `e483` · `e491` · `e492` · `e493` · `e494` · `e495` · `e570` · `e572` · `e422` · `mono- e digliceridi` · `mono e digliceridi` · `monogliceridi` · `digliceridi` · `stearoil*` · `acido stearico` · `stearato*` · `glicerina` · `glicerolo` |
| אנגלית | `mono- and diglycerides` · `mono and diglycerides` · `monoglycerides` · `diglycerides` · `stearoyl*` · `stearic acid` · `stearate*` · `glycerin` · `glycerine` · `glycerol` · `polysorbate*` |
| גרמנית | `mono- und diglyceride` · `mono und diglyceride` · `monoglyceride` · `diglyceride` · `stearinsaure` · `stearoyl*` · `glycerin` |
| צרפתית | `mono- et diglycerides` · `mono et diglycerides` · `monoglycerides` · `diglycerides` · `acide stearique` · `stearoyl*` · `glycerine` · `glycerol` |
| ספרדית | `mono- y digliceridos` · `mono y digliceridos` · `monogliceridos` · `digliceridos` · `acido estearico` · `estearoil*` · `glicerina` · `glicerol` |
| עברית | `מונו ודיגליצרידים` · `מונוגליצרידים` · `גליצרין` · `גליצרול` |

**מסייגים:**

- ממקור צמחי → לא ממצא: `(?<![\p{L}])(?:vegetal|vegetable|plant|pflanz|veget|soia|soy|soja|girasol|palm|colza|rapeseed|raps|צמח)`

## משפר טעם שלעיתים מופק מדגים או מבשר — רמה 1 `ribonucleotides`

קבוצה: additive

| שפה | מונחים |
|---|---|
| איטלקית | `e627` · `e631` · `e635` · `guanilato disodico` · `inosinato disodico` · `ribonucleotidi` |
| אנגלית | `disodium guanylate` · `disodium inosinate` · `disodium ribonucleotides` |
| גרמנית | `dinatriumguanylat` · `dinatriuminosinat` · `dinatrium-5'-ribonukleotid` |
| צרפתית | `guanylate disodique` · `inosinate disodique` · `ribonucleotides disodiques` |
| ספרדית | `guanilato disodico` · `inosinato disodico` · `ribonucleotidos disodicos` |
| עברית | `אינוזינט` · `גואנילט` |

## סמני עקבות

`puo contenere` · `potrebbe contenere` · `tracce di` · `tracce eventuali` · `prodotto in uno stabilimento` · `in uno stabilimento che` · `may contain` · `may also contain` · `traces of` · `made in a factory` · `produced in a facility` · `manufactured in a facility` · `made on equipment` · `kann spuren` · `kann enthalten` · `spuren von` · `kann ebenfalls` · `peut contenir` · `traces de` · `traces eventuelles` · `traces possibles` · `puede contener` · `trazas de` · `puede contener trazas` · `עלול להכיל` · `עשוי להכיל` · `עקבות של` · `מיוצר במפעל`
