import { describe, expect, it } from 'vitest';

import { analyzeLabel, MEAT_AND_MILK_NOTE, scanIngredients } from '../src/kashrut/engine';

const level = (t: string) => scanIngredients(t).level;

describe('required cases', () => {
  it.each([
    ['6 nigiri misti (salmone, tonno e gambero)', 4],
    ['formaggio (latte), maltodestrina, E471. Può contenere crostacei', 1],
    ['zucchero, gelatina, E120', 4],
    ['gelatina bovina', 1],
    ['funghi porcini', 0],
    ['polpa di pomodoro', 0],
    ['prosciutto cotto di tacchino', 0],
    ['filetti di pangasio', 4],
    ['Schweineschmalz', 4],
    ['surimi', 3],
    ['carne, sale', 2],
  ])('%s → %i', (text, expected) => expect(level(text)).toBe(expected));
});

describe('findings quote the label', () => {
  it('keeps the original spelling and position', () => {
    const text = 'Zucchero, GELATINA, E 120';
    const r = scanIngredients(text);
    expect(r.findings.map((f) => f.term)).toEqual(['E 120', 'GELATINA']);
    const f = r.findings[0];
    expect(text.slice(f.start, f.end)).toBe('E 120');
  });

  it('lists traces separately and never counts them', () => {
    const r = scanIngredients('formaggio (latte), maltodestrina, E471. Può contenere crostacei');
    expect(r.traces.map((t) => t.term)).toEqual(['crostacei']);
    expect(r.findings.map((f) => f.term)).toEqual(['E471']);
  });
});

describe('look-alikes and qualifiers', () => {
  it.each([
    ['burro di cacao, zucchero', 0],
    ['gomma di semi di carrube (locust bean gum)', 0],
    ['polpo, olio', 4],
    ['gelatina di pesce', 1],
    ['gelatina suina', 4],
    ['beef gelatin', 1],
    ['Rindergelatine', 1],
    ['Putenschinken', 0],
    ['jambon de dinde', 0],
    ['tacchino e prosciutto crudo', 4],
    ['gelatina bovina e suina', 4],
    ['carne di manzo', 0],
    ['carne (manzo, maiale)', 4],
    ['pesce spada', 4],
    ['pesce (merluzzo)', 0],
    ['pesce', 2],
    ['uova di salmone', 0],
    ['uova di pesce', 2],
    ['caviale di storione', 4],
    ['senza gelatina', 0],
    ['gelatin-free', 0],
    ['E471 (di origine vegetale)', 0],
    ['emulsionante: mono- e digliceridi degli acidi grassi', 1],
    ['brodo vegetale', 0],
    ['brodo di pollo', 0],
    ['Gemüsebrühe', 0],
    ['caramello', 0],
    ['rapeseed oil', 0],
    ['caramel color, camel milk powder', 4],
    ['Coppa del Nonno gelato al caffè', 0],
    ['pepsina', 3],
    ['E542', 3],
    ['E920', 2],
    ['E631, E627', 1],
    ['gommalacca', 1],
    ['salame', 3],
    ['salame di tacchino', 1],
    ['Bratwurst', 3],
    ['latte d\'asina', 4],
    ['lumache', 4],
    ['farina di grilli', 4],
    ['cosce di rana', 4],
    ['coniglio', 4],
    ['anguilla affumicata', 4],
    ['squalo', 4],
    ['rana pescatrice', 4],
    ['strutto', 4],
    ['grassi animali', 3],
    ["ג'לטין, סוכר", 3],
    ['שומן חזיר', 4],
    ['וחזיר', 4],
  ])('%s → %i', (text, expected) => expect(level(text)).toBe(expected));
});

describe('meat + milk', () => {
  it('adds a note but does not change the level', () => {
    const r = scanIngredients('carne di manzo, formaggio (latte), sale');
    expect(r.level).toBe(0);
    expect(r.notes).toContain(MEAT_AND_MILK_NOTE);
  });
  it('no note for dairy alone', () => {
    expect(scanIngredients('latte, zucchero').notes).toEqual([]);
  });
});

describe('analyzeLabel accuracy rules', () => {
  it('no ingredient list → cannot determine', () => {
    const r = analyzeLabel('Biscotti al burro 350 g');
    expect(r.status).toBe('no-ingredients');
    expect(r.level).toBeNull();
  });

  it('never says clean on text without a list, but reports flagged words', () => {
    const r = analyzeLabel('Prosciutto crudo di Parma');
    expect(r.level).toBe(4);
  });

  it('complete list → ok', () => {
    const r = analyzeLabel(
      'Frollini. INGREDIENTI: farina di grano tenero, zucchero, burro (latte), uova. Può contenere tracce di soia. Valori nutrizionali per 100 g',
    );
    expect(r.status).toBe('ok');
    expect(r.level).toBe(0);
    expect(r.traces).toEqual([]);
  });

  it('cut-off list → at least 2, marked incomplete', () => {
    const r = analyzeLabel('INGREDIENTI: farina di grano tenero, zucchero, sciroppo di glu');
    expect(r.status).toBe('incomplete');
    expect(r.level).toBe(2);
  });

  it('cut-off list keeps a higher level', () => {
    const r = analyzeLabel('INGREDIENTI: farina, strutto, zucchero (');
    expect(r.level).toBe(4);
    expect(r.status).toBe('incomplete');
  });

  it('finding offsets point into the full label text', () => {
    const text = 'Wafer. Ingredients: sugar, gelatine, salt. Nutrition facts';
    const r = analyzeLabel(text);
    expect(r.level).toBe(3);
    const f = r.findings[0];
    expect(text.slice(f.start, f.end)).toBe('gelatine');
  });
});

describe('realistic labels', () => {
  it.each([
    ['INGREDIENTI: zucchero, olio di palma, nocciole 13%, cacao magro 7,4%, latte scremato in polvere 6,6%, siero di latte in polvere, emulsionanti: lecitine (soia), vanillina.', 0],
    ['INGREDIENTI: semola di grano duro, acqua. Può contenere tracce di soia e senape.', 0],
    ['Zutaten: Weizenmehl, Zucker, pflanzliche Fette (Palm, Raps), Glukosesirup, Speisesalz, Emulgator Lecithine (Soja). Kann Spuren von Ei und Milch enthalten.', 0],
    ['Ingrédients : lait entier, sucre, crème, amidon modifié, gélifiant : carraghénanes, colorant : carmins.', 4],
    ['Ingredientes: harina de trigo, azúcar, grasa vegetal (palma), cacao, sal, emulsionante (lecitina de soja).', 0],
    ['INGREDIENTI: pomodoro 70%, carne bovina 18%, carne suina 6%, cipolla, sale.', 4],
    ['INGREDIENTI: patate, olio di semi di girasole, sale, esaltatori di sapidità: guanilato disodico, inosinato disodico.', 1],
    ['Ingredienti: carne di pollo 60%, pangrattato, olio di girasole, sale, spezie.', 0],
  ])('%#', (text, expected) => expect(analyzeLabel(text).level).toBe(expected));

  it('does not double-report "carne suina"', () => {
    const r = analyzeLabel('INGREDIENTI: carne suina, sale.');
    expect(r.findings.map((f) => f.term)).toEqual(['suina']);
  });
});
