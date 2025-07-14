# מעבד תלושי שכר - Claude AI

מערכת לעיבוד תלושי שכר ישראליים באמצעות בינה מלאכותית של Claude.

## 🎥 הדגמה

![Demo Video](./Video_demo.mp4)

*הדגמת המערכת בפעולה - העלאת תלוש שכר וקבלת תוצאות מסווגות*

> 💡 **טיפ**: לחץ על הסרטון למעלה לצפייה בהדגמה מלאה של העלאת תלוש שכר וקבלת תוצאות מסווגות ב-4 קטגוריות

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

המערכת בנויה מארבעה רכיבים עיקריים:

### 🖥️ Frontend (React Client)
- **פורט**: 3000
- **טכנולוגיות**: React 18, Tailwind CSS, Lucide Icons
- **תפקיד**: ממשק משתמש אינטראקטיבי להעלאת תלושים וצפייה בתוצאות
- **קבצים עיקריים**:
  - `src/App.js` - רכיב האפליקציה הראשי
  - `src/PayrollProcessor.js` - הרכיב המרכזי לעיבוד תלושים
  - `src/App.css` - עיצוב הממשק
  - `public/index.html` - דף HTML הבסיסי

### 🔧 Backend (Express Server)
- **פורט**: 3001
- **טכנולוגיות**: Node.js, Express, Multer, CORS
- **תפקיד**: שרת API המתווך בין הלקוח ל-Claude AI
- **קבצים עיקריים**:
  - `server/server.js` - שרת Express הראשי
  - `server/package.json` - תלויות השרת
  - `server/.env` - הגדרות סביבה (API keys)

### 🤖 Claude AI (OCR Engine)
- **API**: Claude 3.5 Sonnet (Anthropic)
- **יכולות**: 
  - OCR מתקדם לטקסט עברי וערבי
  - עיבוד קבצי PDF ישירות (ללא המרה)
  - ניתוח מבנה תלושי שכר
  - סיווג פריטים לקטגוריות
- **תהליך עיבוד**:
  1. קבלת קובץ PDF/תמונה מהלקוח
  2. המרה ל-Base64
  3. שליחה ל-Claude API עם הוראות OCR מפורטות
  4. קבלת תוצאות JSON מסווגות
  5. החזרה ללקוח

### 📊 אין בסיס נתונים
- המערכת עובדת ללא בסיס נתונים
- כל העיבוד מתבצע בזמן אמת
- הקבצים אינם נשמרים בשרת
- התוצאות מוצגות ישירות ללקוח

## זרימת הנתונים

```
[Frontend] → [Backend] → [Claude API] → [Backend] → [Frontend]
```

1. **העלאת קובץ**: המשתמש בוחר קובץ PDF/תמונה
2. **המרה**: הקובץ מומר ל-Base64 ונשלח לשרת
3. **עיבוד**: השרת שולח ל-Claude API עם הוראות OCR מפורטות
4. **ניתוח**: Claude מנתח את התלוש ומחזיר JSON מסווג
5. **תצוגה**: התוצאות מוצגות למשתמש בממשק מסודר

## API Endpoints

### `POST /api/process-payslip`
עיבוד תלוש שכר באמצעות Claude AI

**בקשה**:
```json
{
  "base64Data": "base64_encoded_file_content",
  "mediaType": "application/pdf" | "image/jpeg" | "image/png",
  "apiKey": "optional_api_key"
}
```

**תגובה**:
```json
{
  "employeeInfo": {
    "name": "שם העובד",
    "idNumber": "מספר ת.ז",
    "month": "חודש שנה"
  },
  "categories": {
    "regular": { "total": 0, "items": [] },
    "overtime": { "total": 0, "items": [] },
    "travel": { "total": 0, "items": [] },
    "other": { "total": 0, "items": [] }
  },
  "summary": {
    "totalIncome": 0,
    "netSalary": 0,
    "grossSalary": 0
  }
}
```

### `GET /api/health`
בדיקת תקינות השרת

**תגובה**:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

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

## מבנה הפרויקט

```
payroll/
├── src/                          # Frontend React
│   ├── App.js                   # אפליקציה ראשית
│   ├── PayrollProcessor.js      # רכיב עיבוד תלושים
│   ├── App.css                  # עיצוב
│   └── index.js                 # נקודת כניסה
├── server/                       # Backend Express
│   ├── server.js                # שרת API
│   ├── package.json             # תלויות שרת
│   └── .env                     # הגדרות סביבה
├── public/                       # קבצים סטטיים
│   └── index.html              # HTML בסיסי
├── package.json                 # תלויות frontend
├── start.sh                     # סקריפט הפעלה
├── test_upload.js              # בדיקת API
├── salary.pdf                  # קובץ דוגמה
└── README.md                   # מסמך זה
```

## קבצים חשובים
- `server/server.js` - מכיל את כל לוגיקת השרת וההוראות ל-Claude
- `src/PayrollProcessor.js` - הרכיב הראשי של הממשק
- `api_ocr_instructions.txt` - הנחיות OCR מפורטות לפיתוח
- `salary.pdf` - קובץ דוגמה לבדיקות

## טכנולוגיות

### Frontend
- **React 18**: ספריית JavaScript לבניית ממשק משתמש
- **Tailwind CSS**: framework CSS למראה מודרני
- **Lucide React**: איקונים מודרניים
- **Create React App**: הגדרת סביבת פיתוח

### Backend
- **Node.js**: סביבת JavaScript לשרת
- **Express**: framework לשרת HTTP
- **Multer**: טיפול בהעלאת קבצים
- **CORS**: פתרון בעיות Cross-Origin
- **node-fetch**: ספרייה לבקשות HTTP
- **dotenv**: ניהול משתני סביבה

### AI & OCR
- **Claude 3.5 Sonnet API**: מנוע OCR מתקדם מ-Anthropic
- **PDF Support**: עיבוד ישיר של קבצי PDF
- **Hebrew/Arabic OCR**: תמיכה בטקסט דו-כיווני
- **JSON Parsing**: ניתוח מובנה של תוצאות

## פתרון בעיות

### בעיות נפוצות:

1. **שרת לא מגיב על פורט 3001**
   ```bash
   # בדוק שהשרת רץ
   curl http://localhost:3001/api/health
   
   # אם לא, הפעל את השרת
   cd server && npm start
   ```

2. **שגיאת API Key**
   - ודא שהמפתח נכון בקובץ `server/.env`
   - או הכנס מפתח דרך הממשק

3. **שגיאת CORS**
   - השרת כבר מוגדר עם CORS
   - ודא שהלקוח נמצא על פורט 3000

4. **קובץ גדול מדי**
   - PDF: מקסימום 30MB
   - תמונות: מקסימום 5MB

5. **איכות OCR נמוכה**
   - השתמש בקבצי PDF במקום תמונות
   - ודא שהטקסט ברור וקריא

## תמיכה ותכונות

המערכת תומכת ב:
- ✅ עברית וערבית
- ✅ פורמטים שונים של מספרים
- ✅ זיהוי מבנה תלוש ישראלי סטנדרטי
- ✅ קבצי PDF עד 30MB (מומלץ!)
- ✅ תמונות JPG, PNG, GIF, WebP עד 5MB
- ✅ סיווג אוטומטי ל-4 קטגוריות
- ✅ ממשק משתמש בעברית
- ✅ אבטחת API keys
- ✅ עיבוד בזמן אמת (ללא שמירה)

## אבטחה

- 🔒 API keys מוגנים בקובץ `.env`
- 🔒 GitHub push protection למניעת חשיפת secrets
- 🔒 אין שמירה של קבצים או נתונים בשרת
- 🔒 כל העיבוד מתבצע בזמן אמת
- 🔒 תמיכה בהעלאת API key דרך הממשק (לא נשמר)

## רישיון

הפרויקט הזה נוצר בעזרת [Claude Code](https://claude.ai/code) - כלי פיתוח AI של Anthropic.

## תרומה

רוצה לתרום לפרויקט? 
1. עשה Fork לפרויקט
2. צור branch חדש (`git checkout -b feature/amazing-feature`)
3. עשה commit לשינויים (`git commit -m 'Add amazing feature'`)
4. עשה push לbranch (`git push origin feature/amazing-feature`)
5. פתח Pull Request

## יצירת קשר

לשאלות או בעיות, פתח [Issue](https://github.com/moshe084/payroll/issues) בפרויקט.

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**