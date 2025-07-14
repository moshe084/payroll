# מעבד תלושי שכר - Claude AI

מערכת לעיבוד תלושי שכר ישראליים באמצעות בינה מלאכותית של Claude.

## תכונות

- 📄 עיבוד קבצי PDF ותמונות של תלושי שכר (PDF מומלץ לאיכות OCR מעולה!)
- 🤖 OCR מתקדם עם Claude AI
- 🏷️ חלוקה אוטומטית ל-4 קטגוריות:
  - **רגיל**: שכר בסיס, תוספות ותק, השכלה, משפחה
  - **שעות נוספות**: 125%, 150%, תוספת לילה, שבת
  - **נסיעות**: קילומטראז', דמי נסיעה, דלק
  - **אחר**: מענקים, פיצויים, תשלומים חד פעמיים
- 📊 תצוגה מפורטת של התוצאות
- 🔐 אבטחת API key מתקדמת

## התקנה

1. הורד את הפרויקט
2. התקן dependencies לפרונטאנד:
```bash
npm install
```

3. התקן dependencies לבקאנד:
```bash
cd server
npm install
cd ..
```

4. הפעל את המערכת:
```bash
# אוטומטי (מריץ שני שרתים):
./start.sh

# או ידנית:
# טרמינל 1 - Backend:
cd server && npm start

# טרמינל 2 - Frontend:  
npm start
```

## שימוש

1. פתח את הדפדפן ב-http://localhost:3000
2. העלה תלוש שכר (PDF עד 30MB או תמונה עד 5MB)
3. המתן לעיבוד Claude AI דרך השרת
4. צפה בתוצאות המחולקות לקטגוריות

**מומלץ**: השתמש בקבצי PDF לאיכות OCR מעולה! Claude API תומך בקבצי PDF ישירות.

## ארכיטקטורה

המערכת כוללת:
- **Frontend (React)**: ממשק משתמש על פורט 3000
- **Backend (Express)**: שרת API על פורט 3001 
- **Claude API**: עיבוד OCR דרך שרת (פותר בעיות CORS)

## API Key

### שיטות הגדרת API Key:

1. **קובץ סביבה** (מומלץ):
   ```bash
   # צור קובץ server/.env
   CLAUDE_API_KEY=your_api_key_here
   ```

2. **דרך הממשק**: הכנס API key ידנית בממשק האתר

3. **משתנה סביבה**:
   ```bash
   export CLAUDE_API_KEY=your_api_key_here
   ```

**הערה**: קובץ `.env` מוגן ב-`.gitignore` למניעת חשיפת המפתח.

## קבצים עיקריים

- `src/PayrollProcessor.js` - הרכיב הראשי
- `src/App.js` - אפליקציית React
- `api_ocr_instructions.txt` - הנחיות OCR מפורטות
- `salary.pdf` - קובץ דוגמה לבדיקות

## טכנולוגיות

- React 18
- Claude 3.5 Sonnet API (Anthropic) - תומך בקבצי PDF
- Tailwind CSS
- Lucide React Icons

## תמיכה

המערכת תומכת ב:
- עברית וערבית
- פורמטים שונים של מספרים
- זיהוי מבנה תלוש ישראלי סטנדרטי
- קבצי PDF עד 30MB (מומלץ!)
- תמונות JPG, PNG, GIF, WebP עד 5MB