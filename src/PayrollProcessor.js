import React, { useState } from 'react';
import { Upload, FileText, Brain, CheckCircle, Camera, Loader, AlertCircle } from 'lucide-react';

// Backend API service for processing payslips
const processPayslipWithClaude = async (file, apiKey) => {
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

  // Get file type - supports PDF and images directly via Claude API
  const getFileType = (file) => {
    const type = file.type.toLowerCase();
    if (type === 'application/pdf') return 'application/pdf';
    if (type.includes('jpeg') || type.includes('jpg')) return 'image/jpeg';
    if (type.includes('png')) return 'image/png';
    if (type.includes('gif')) return 'image/gif';
    if (type.includes('webp')) return 'image/webp';
    return 'image/jpeg'; // default fallback
  };

  try {
    const base64Data = await convertToBase64(file);
    const mediaType = getFileType(file);
    
    const response = await fetch('http://localhost:3001/api/process-payslip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Data,
        mediaType,
        apiKey
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('שגיאה בעיבוד:', error);
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('לא ניתן להתחבר לשרת. ודא שהשרת פועל על פורט 3001.');
    } else {
      throw new Error(error.message);
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
      // Validate file type - supports PDF and images
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(selectedFile.type.toLowerCase())) {
        setError('אנא בחר קובץ PDF או תמונה (JPG, PNG, GIF, WebP)');
        return;
      }
      
      // Validate file size - 30MB for PDF (as per Claude docs), 5MB for images
      const maxSize = selectedFile.type === 'application/pdf' ? 30 * 1024 * 1024 : 5 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        const maxSizeText = selectedFile.type === 'application/pdf' ? '30MB' : '5MB';
        setError(`קובץ גדול מדי. מקסימום ${maxSizeText}`);
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
            העלה תלוש שכר (PDF או תמונה) וקבל חלוקה אוטומטית ל-4 קטגוריות: רגיל, שעות נוספות, נסיעות ואחר
          </p>
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
                  גרור תלוש שכר לכאן או לחץ לבחירה
                </h3>
                <p className="text-gray-500 mb-6">
                  תומך בקבצי PDF (עד 30MB) ותמונות JPG, PNG, GIF, WebP (עד 5MB)
                </p>
                <p className="text-xs text-green-600 mb-4">
                  ✅ PDF מומלץ לאיכות OCR מעולה!
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
                  בחר קובץ
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
                <h2 className="text-2xl font-bold mb-4">Claude 3.5 Sonnet מנתח את התלוש...</h2>
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
              <h2 className="text-2xl font-bold text-center mb-8">תוצאות עיבוד Claude 3.5 Sonnet</h2>
              
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
            <span>מחובר ל-Claude 3.5 Sonnet עם תמיכת PDF ו-OCR מתקדם</span>
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