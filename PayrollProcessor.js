import React, { useState } from 'react';
import { Upload, FileText, Brain, CheckCircle, Camera, Loader, AlertCircle } from 'lucide-react';

// Claude API service for processing payslips
const processPayslipWithClaude = async (file, apiKey) => {
  const claudeApiKey = apiKey || 'your_claude_api_key_here';
  
  if (!claudeApiKey) {
    throw new Error('נדרש API Key של Claude. הכנס מפתח או הגדר משתנה סביבה.');
  }

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Get file type
  const getFileType = (file) => {
    const type = file.type;
    if (type.includes('pdf')) return 'application/pdf';
    if (type.includes('jpeg') || type.includes('jpg')) return 'image/jpeg';
    if (type.includes('png')) return 'image/png';
    return 'image/jpeg'; // default
  };

  try {
    const base64Data = await convertToBase64(file);
    const mediaType = getFileType(file);
    
    const payload = {
      model: "claude-3-sonnet-20240229",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `אתה מומחה OCR מתקדם המתמחה בתלושי שכר ישראליים. תפקידך לחלץ מידע מדויק מתמונות תלושי שכר ולסווג את ההכנסות.

🎯 MISSION: קרא את התלוש בזהירות קיצונית וחלץ כל מידע רלוונטי

📋 מבנה תלוש שכר ישראלי טיפוסי:
- פרטי עובד: שם, ת.ז, מספר עובד, חודש/שנה
- הכנסות: טבלה עם תיאור, כמות, תעריף, סכום
- ניכויים: מס הכנסה, ביטוח לאומי, פנסיה
- סיכום: ברוטו, ניכויים, נטו

🔍 שלבי חילוץ OCR:

שלב 1: זיהוי מבנה התלוש
- מצא את החלק העליון (פרטי עובד)
- זהה את טבלת ההכנסות העיקרית
- מצא את אזור הניכויים
- זהה את הסיכום הכספי

שלב 2: חילוץ פרטי עובד
- שם העובד (בדרך כלל באזור עליון)
- מספר ת.ז (9 ספרות)
- מספר עובד
- חודש ושנת השכר
- שם המעסיק/חברה

שלב 3: חילוץ הכנסות - קרא כל שורה!
זהה בכל שורה:
- תיאור הפריט (עברית/ערבית)
- כמות (שעות/יחידות)
- תעריף (₪ לשעה/יחידה)
- סכום כולל

🏷️ סיווג לקטגוריות:

קטגוריה 1: רגיל
- "שכר בסיס" / "משכורת" / "בסיס"
- "תוספת ותק" / "ותק"
- "תוספת השכלה" / "השכלה" / "תואר"
- "תוספת משפחה" / "משפחה" / "ילדים"
- כל תוספת קבועה

קטגוריה 2: שעות נוספות
- "שעות נוספות" / "נוספות"
- "125%" / "150%" / "175%" / "200%"
- "תוספת לילה" / "לילה"
- "תוספת שבת" / "שבת" / "חג"
- כל תשלום עם אחוז מעל 100%

קטגוריה 3: נסיעות
- "קילומטראז'" / "ק"מ" / "נסיעה"
- "דמי נסיעה" / "נסיעות"
- "דלק" / "בנזין"
- "תחבורה" / "מוניות"

קטגוריה 4: אחר
- "מענק" / "ברמה" / "פרמיה"
- "חד פעמי" / "מיוחד"
- "פיצוי" / "פיצויים"
- "החזר" (לא נסיעות)
- כל דבר שלא מתאים לקטגוריות אחרות

השב בפורמט JSON מובנה:
{
  "employeeInfo": {
    "name": "שם מלא כפי שמופיע",
    "idNumber": "מספר ת.ז",
    "employeeNumber": "מספר עובד",
    "month": "חודש שנה",
    "company": "שם מעסיק"
  },
  "categories": {
    "regular": {
      "total": סכום_מספרי,
      "items": [{"description": "תיאור", "amount": סכום, "hours": שעות_אם_יש, "rate": תעריף_אם_יש}]
    },
    "overtime": {
      "total": סכום_מספרי,
      "items": [{"description": "תיאור", "amount": סכום, "hours": שעות, "rate": "125%"}]
    },
    "travel": {
      "total": סכום_מספרי,
      "items": [{"description": "תיאור", "amount": סכום, "units": יחידות_אם_יש}]
    },
    "other": {
      "total": סכום_מספרי,
      "items": [{"description": "תיאור", "amount": סכום}]
    }
  },
  "summary": {
    "totalIncome": סכום_כל_הקטגוריות,
    "netSalary": שכר_נטו_מהתלוש,
    "grossSalary": שכר_ברוטו_מהתלוש
  },
  "metadata": {
    "processingNotes": "הערות על איכות הזיהוי",
    "confidence": "גבוהה/בינונית/נמוכה",
    "warnings": ["אזהרות אם יש בעיות"]
  }
}

עבד עכשיו על התמונה שלפניך.`
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data
              }
            }
          ]
        }
      ]
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Claude API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const responseText = data.content[0].text;
    
    // Clean response if there's extra text
    const cleanedResponse = responseText.replace(/```json|```/g, '').trim();
    
    // Extract JSON from response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('לא נמצא JSON תקין בתגובה');
    }
  } catch (error) {
    console.error('שגיאה בעיבוד:', error);
    
    if (error.message.includes('rate_limit_exceeded')) {
      throw new Error('חרגת ממגבלת הבקשות. נסה שוב בעוד כמה דקות.');
    } else if (error.message.includes('invalid_api_key')) {
      throw new Error('מפתח API לא תקין. בדוק את ההגדרות.');
    } else if (error.message.includes('insufficient_quota')) {
      throw new Error('אין מספיק יתרה בחשבון Claude.');
    } else if (error instanceof SyntaxError) {
      throw new Error('Claude החזיר תגובה לא תקינה. נסה שוב.');
    } else {
      throw new Error(`שגיאה בעיבוד התמונה: ${error.message}`);
    }
  }
};

const PayrollProcessor = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);

  const steps = [
    { number: 1, title: "העלאת תלוש", icon: Upload, active: currentStep >= 1 },
    { number: 2, title: "זיהוי PDF", icon: FileText, active: currentStep >= 2 },
    { number: 3, title: "עיבוד Claude", icon: Brain, active: currentStep >= 3 },
    { number: 4, title: "תוצאות", icon: CheckCircle, active: currentStep >= 4 }
  ];

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('image')) {
        setError('אנא בחר קובץ PDF או תמונה');
        return;
      }
      
      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('קובץ גדול מדי. מקסימום 5MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setCurrentStep(2);
    }
  };

  const validateResults = (results) => {
    if (!results.categories) {
      throw new Error('Claude לא החזיר קטגוריות. נסה שוב.');
    }

    const requiredCategories = ['regular', 'overtime', 'travel', 'other'];
    for (const category of requiredCategories) {
      if (!results.categories[category]) {
        results.categories[category] = { total: 0, items: [] };
      }
    }

    // Validate and clean numeric values
    for (const categoryName in results.categories) {
      const category = results.categories[categoryName];
      if (typeof category.total !== 'number') {
        category.total = parseFloat(category.total) || 0;
      }
      
      if (!Array.isArray(category.items)) {
        category.items = [];
      }
    }

    const calculatedTotal = 
      results.categories.regular.total +
      results.categories.overtime.total +
      results.categories.travel.total +
      results.categories.other.total;

    if (!results.summary) {
      results.summary = {};
    }
    results.summary.totalIncome = calculatedTotal;

    return results;
  };

  const processWithClaude = async () => {
    setIsProcessing(true);
    setCurrentStep(3);
    setError(null);
    
    try {
      const claudeResults = await processPayslipWithClaude(file, apiKey);
      const validatedResults = validateResults(claudeResults);
      setResults(validatedResults);
      setCurrentStep(4);
    } catch (err) {
      setError(err.message);
      setCurrentStep(2);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDemo = () => {
    setCurrentStep(1);
    setFile(null);
    setResults(null);
    setError(null);
    setIsProcessing(false);
  };

  const getBorderClass = (color) => {
    switch(color) {
      case 'blue': return 'border-blue-500 bg-blue-50';
      case 'green': return 'border-green-500 bg-green-50';
      case 'yellow': return 'border-yellow-500 bg-yellow-50';
      case 'purple': return 'border-purple-500 bg-purple-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getTextColor = (color) => {
    switch(color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'yellow': return 'text-yellow-600';
      case 'purple': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🤖 מעבד תלושי שכר - Claude AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            העלה תלוש שכר PDF וקבל חלוקה אוטומטית ל-4 קטגוריות: רגיל, שעות נוספות, נסיעות ואחר
          </p>
        </div>

        {/* API Key Configuration */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">🔑 הגדרת Claude API</h3>
              <button
                onClick={() => setShowApiInput(!showApiInput)}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showApiInput ? 'הסתר' : (apiKey ? 'ערוך מפתח' : 'הכנס מפתח')}
              </button>
            </div>
            
            {showApiInput ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Claude API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    dir="ltr"
                  />
                </div>
                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={() => {
                      setShowApiInput(false);
                      setError(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    שמור
                  </button>
                  <button
                    onClick={() => {
                      setApiKey('');
                      setShowApiInput(false);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    נקה
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">
                    מפתח API מוגדר מראש
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-8 space-x-reverse">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                    step.active 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div className="mr-3">
                    <div className={`text-sm font-medium ${
                      step.active ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      שלב {step.number}
                    </div>
                    <div className={`text-xs ${
                      step.active ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-center mb-6">העלאת תלוש שכר</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
                <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  גרור קובץ PDF לכאן או לחץ לבחירה
                </h3>
                <p className="text-gray-500 mb-6">
                  תומך בקבצי PDF ותמונות עד 5MB
                </p>
                
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  בחר קובץ PDF
                </label>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <div className="mb-6">
                  <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">קובץ הועלה בהצלחה!</h2>
                  <p className="text-gray-600">
                    <strong>{file?.name}</strong> ({file ? (file.size / 1024).toFixed(1) : '0'} KB)
                  </p>
                </div>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={processWithClaude}
                  disabled={isProcessing}
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Brain className="mr-3 h-6 w-6" />
                  {isProcessing ? 'מעבד...' : 'עבד עם Claude AI'}
                  <span className="mr-2 w-2 h-2 bg-green-400 rounded-full"></span>
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold mb-4">Claude AI מנתח את התלוש...</h2>
                <div className="text-gray-600 space-y-2">
                  <p>🔍 קורא טקסט בעברית וערבית</p>
                  <p>📊 מזהה סכומים ותעריפים</p>
                  <p>🏷️ מסווג לקטגוריות</p>
                  <p>✅ מוודא דיוק התוצאות</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && results && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-center mb-8">תוצאות עיבוד Claude AI</h2>
              
              {results.metadata?.warnings && results.metadata.warnings.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-yellow-800 text-sm">
                      {results.metadata.warnings.map((warning, index) => (
                        <div key={index}>{warning}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-4 gap-4">
                {[
                  { 
                    title: "רגיל", 
                    amount: results.categories?.regular?.total || 0, 
                    color: "blue", 
                    items: results.categories?.regular?.items || []
                  },
                  { 
                    title: "שעות נוספות", 
                    amount: results.categories?.overtime?.total || 0, 
                    color: "green", 
                    items: results.categories?.overtime?.items || []
                  },
                  { 
                    title: "נסיעות", 
                    amount: results.categories?.travel?.total || 0, 
                    color: "yellow", 
                    items: results.categories?.travel?.items || []
                  },
                  { 
                    title: "אחר", 
                    amount: results.categories?.other?.total || 0, 
                    color: "purple", 
                    items: results.categories?.other?.items || []
                  }
                ].map((category) => (
                  <div key={category.title} className={`border-r-4 ${getBorderClass(category.color)} p-4 rounded-lg text-right`}>
                    <h3 className="text-base font-bold mb-2 text-gray-800">{category.title}</h3>
                    <div className={`text-lg font-bold mb-3 ${getTextColor(category.color)}`}>
                      ₪{typeof category.amount === 'number' ? category.amount.toLocaleString() : category.amount}
                    </div>
                    <div className="space-y-1">
                      {category.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          • {item.description || item}
                        </div>
                      ))}
                      {category.items.length > 3 && (
                        <div className="text-xs text-gray-500">
                          ועוד {category.items.length - 3} פריטים...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {results.summary && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-bold text-center mb-4">סיכום כללי</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-600">סה"כ הכנסות</div>
                      <div className="text-xl font-bold text-blue-600">
                        ₪{typeof results.summary.totalIncome === 'number' ? results.summary.totalIncome.toLocaleString() : (results.summary.totalIncome || '0')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">שכר נטו</div>
                      <div className="text-xl font-bold text-green-600">
                        ₪{typeof results.summary.netSalary === 'number' ? results.summary.netSalary.toLocaleString() : (results.summary.netSalary || '0')}
                      </div>
                    </div>
                  </div>
                  
                  {results.employeeInfo && (results.employeeInfo.name || results.employeeInfo.month) && (
                    <div className="mt-4 pt-4 border-t border-blue-200 text-center text-sm text-gray-600">
                      {results.employeeInfo.name && <div>עובד: {results.employeeInfo.name}</div>}
                      {results.employeeInfo.month && <div>תקופה: {results.employeeInfo.month}</div>}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 text-center space-x-4 space-x-reverse">
                <button
                  onClick={resetDemo}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  תלוש חדש
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  עבד שוב
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="mt-12 text-center space-y-4">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
            <Brain className="h-4 w-4 mr-2" />
            <span>מחובר ל-Claude AI עם OCR מתקדם לתלושי שכר</span>
          </div>
          
          <div className="text-xs text-gray-500 max-w-2xl mx-auto">
            <div className="font-medium mb-2">המערכת מנתחת:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>✓ שכר בסיס ותוספות</div>
              <div>✓ שעות נוספות 125%-200%</div>
              <div>✓ נסיעות וקילומטראז'</div>
              <div>✓ מענקים ותשלומים נוספים</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollProcessor;