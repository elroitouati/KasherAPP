# בודק כשרות

סורק חי של תוויות מזון שמחזיר רמת סכנה (0–4) לרכיב מן החי שאינו כשר.
Expo (SDK 57) + React Native, בעברית ומימין לשמאל.

## הרצה

| איפה | מה עובד | איך |
|---|---|---|
| **Development build** (מומלץ) | מצלמה + OCR חי על המכשיר (ML Kit), צילום אוטומטי, פנס | `npx eas-cli build --profile development --platform android` → מתקינים את ה-APK פעם אחת, ואז `npx expo start` וסורקים את ה-QR |
| **Expo Go** | מצלמה, פנס, צילום ידני — **בלי OCR חי** | `npm run start:go` וסורקים את ה-QR באפליקציית Expo Go |
| דפדפן (תצוגת עיצוב) | UI בלבד; `?demo=1` מזרים תווית לדוגמה דרך הצינור החי | `npx expo start --web` |

> Expo Go כולל רק את המודולים הנייטיביים של Expo. VisionCamera ו-ML Kit הם מודולים נייטיביים, ולכן סריקה חיה
> אמיתית דורשת development build. זה אותו ניסיון כמו Expo Go (QR, רענון חי), רק שהאפליקציה מותקנת פעם אחת מ-EAS.

## בדיקות

```sh
npm test          # vitest
npm run typecheck
npx expo lint
```

## מבנה

```
src/app/               מסכים (expo-router)
src/kashrut/           הסטנדרט: מילון, נרמול ומנוע סריקה
  dict.ts              ~900 מונחים ב-6 שפות, מסייגים וביטויים בטוחים
  engine.ts            scanIngredients / analyzeLabel — רמה, ממצאים, עקבות, בשר+חלב
  normalize.ts         נרמול טקסט עם מיפוי חזרה למילה המקורית בתווית
src/kashrut/explain.ts הסבר לכל ממצא (מה זה, למה הרמה, מה עושים)
src/kashrut/product.ts בדיקת מוצר מהמאגר (כל השפות, או תגיות במצב אופליין)
src/data/              Open Food Facts, מטמון מוצרים, חבילות אופליין לפי מדינה, הגדרות
src/abroad/            מצב חו"ל: מילים, מנות וטיפים ל-6 מדינות
src/scanner/           מצלמה, OCR חי, ברקוד, זיהוי יציבות ורשימת רכיבים
  analysis.ts          לוגיקה טהורה: יציבות, הכוונה, בחירת הסיבוב הטוב ביותר
  LiveCamera.tsx       VisionCamera v5 + ML Kit (development build)
  ExpoGoCamera.tsx     expo-camera (Expo Go)
src/components/        מסגרת סריקה, כפתור צילום עם טבעת התקדמות, טקסט RTL
src/theme/tokens.ts    טוקנים של עיצוב — כל צבע, מידה ומשך מגיעים מכאן
tests/                 vitest (כולל כל בדיקות החובה)
docs/ingredients-reference.md   תיעוד המילון — נוצר אוטומטית: npm run docs:dict
```
