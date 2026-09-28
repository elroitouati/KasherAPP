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
src/scanner/           מצלמה, OCR חי, זיהוי יציבות ורשימת רכיבים
  analysis.ts          לוגיקה טהורה: יציבות, הכוונה, בחירת הסיבוב הטוב ביותר
  LiveCamera.tsx       VisionCamera v5 + ML Kit (development build)
  ExpoGoCamera.tsx     expo-camera (Expo Go)
src/components/        מסגרת סריקה, כפתור צילום עם טבעת התקדמות, טקסט RTL
src/theme/tokens.ts    טוקנים של עיצוב — כל צבע, מידה ומשך מגיעים מכאן
tests/                 vitest
```
