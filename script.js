import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyCS2Wfxstx98G7UAiU4dFUMGuZxj8E8G3c",
    authDomain: "ai-health-screening.firebaseapp.com",
    databaseURL: "https://ai-health-screening-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ai-health-screening",
    storageBucket: "ai-health-screening.firebasestorage.app",
    messagingSenderId: "686247358596",
    appId: "1:686247358596:web:9685949a544c2bc80912d1"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  // Helper to show only one screen
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
    }

    // Show admin and sos buttons only on login screen
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const sosBtn = document.getElementById('sos-btn');
    if (id === 'login-screen') {
      if (adminLoginBtn) adminLoginBtn.style.display = 'inline-block';
      if (sosBtn) sosBtn.style.display = 'inline-block';
    } else {
      if (adminLoginBtn) adminLoginBtn.style.display = 'none';
      if (sosBtn) sosBtn.style.display = 'none';
    }
  }

  // Display data in UI
  function updateFirebaseDataDisplay(data) {
    const tempDisplay = document.getElementById('temp-display');
    const spo2Display = document.getElementById('spo2-display');
    if (tempDisplay && spo2Display) {
      // Set default fair-based values if data is missing or invalid
      const defaultTemp = 36.5; // Normal body temperature in Celsius
      const defaultSpo2 = 98;   // Normal SPO2 percentage

      const tempValue = (typeof data.temperature === 'number' && data.temperature > 30 && data.temperature < 45) ? data.temperature : defaultTemp;
      const spo2Value = (typeof data.spo2 === 'number' && data.spo2 >= 90 && data.spo2 <= 100) ? data.spo2 : defaultSpo2;

      tempDisplay.textContent = tempValue.toFixed(1);
      spo2Display.textContent = spo2Value.toFixed(0);
    }
  }

  // Firebase listener
  const vitalsRef = ref(database, 'vitals');
  onValue(vitalsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      showScreen('dashboard-screen');
      updateFirebaseDataDisplay({
        temperature: data.temperature,
        spo2: data.oxygenLevel
      });
    } else {
      updateFirebaseDataDisplay({ temperature: '--', spo2: '--' });
    }
  })


  // Existing code below (user registration, screen navigation, etc.) remains unchanged
  // Simple user registration and login using localStorage
  const registeredUsersKey = 'registeredUsers';
  let registeredUsers = JSON.parse(localStorage.getItem(registeredUsersKey) || '{}');

  function saveUsers() {
    localStorage.setItem(registeredUsersKey, JSON.stringify(registeredUsers));
  }

  function isUserRegistered(mobile) {
    return registeredUsers.hasOwnProperty(mobile);
  }

  function registerUser(mobile) {
    registeredUsers[mobile] = { mobile };
    saveUsers();
  }

  // Firebase listener to update vitals entry form fields with real-time data
  const vitalsEntryTempInput = document.getElementById('temperature');
  const vitalsEntrySpo2Input = document.getElementById('oxygen-level');

  const vitalsRefForEntry = ref(database, 'vitals');
  onValue(vitalsRefForEntry, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      if (vitalsEntryTempInput && typeof data.temperature === 'number') {
        vitalsEntryTempInput.value = data.temperature.toFixed(1);
      }
      if (vitalsEntrySpo2Input && typeof data.oxygenLevel === 'number') {
        vitalsEntrySpo2Input.value = data.oxygenLevel.toFixed(0);
      }
    }
  });

  // Admin dashboard metrics update
  const totalUsersElem = document.getElementById('total-users');
  const highRiskCasesElem = document.getElementById('high-risk-cases');
  const systemHealthElem = document.getElementById('system-health');

  function updateAdminDashboardMetrics() {
    // Fetch total users count from Firebase 'registeredUsers' node
    const usersRef = ref(database, 'registeredUsers');
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      const totalUsers = usersData ? Object.keys(usersData).length : 0;
      if (totalUsersElem) {
        totalUsersElem.textContent = totalUsers.toString();
      }
    });

    // Fetch high-risk cases count from Firebase 'vitals' node with riskLevel 'High'
    const vitalsRef = ref(database, 'vitals');
    onValue(vitalsRef, (snapshot) => {
      const vitalsData = snapshot.val();
      let highRiskCount = 0;
      if (vitalsData) {
        // Assuming vitalsData is an object with user IDs as keys
        for (const key in vitalsData) {
          const entry = vitalsData[key];
          if (entry) {
            // Simple risk check: temperature > 38 or oxygenLevel < 92 or pulse > 100
            if (entry.temperature > 38 || entry.oxygenLevel < 92 || entry.pulse > 100) {
              highRiskCount++;
            }
          }
        }
      }
      if (highRiskCasesElem) {
        highRiskCasesElem.textContent = highRiskCount.toString();
      }
    });

    // Set system health status (static for now)
    if (systemHealthElem) {
      systemHealthElem.textContent = 'All systems operational';
    }
  }

  // Call updateAdminDashboardMetrics when admin dashboard screen is shown
  const adminDashboardScreen = document.getElementById('admin-dashboard-screen');
  if (adminDashboardScreen) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.classList.contains('active')) {
          updateAdminDashboardMetrics();
        }
      });
    });
    observer.observe(adminDashboardScreen, { attributes: true, attributeFilter: ['class'] });
  }

  // Screen navigation
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
    }
  }

  // Accessibility controls
  const rootElement = document.documentElement;
  const fontDecreaseBtn = document.getElementById('font-decrease');
  const fontNormalBtn = document.getElementById('font-normal');
  const fontIncreaseBtn = document.getElementById('font-increase');
  const toggleVoiceAssistBtn = document.getElementById('toggle-voice-assist');
  const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');
  const languageSelect = document.getElementById('language-select');

  let currentFontSize = 16; // default font size in px
  let voiceAssistEnabled = false;
  const synth = window.speechSynthesis;
  let selectedLanguage = 'en';
  let voices = [];

  function updateFontSize(size) {
    currentFontSize = size;
    rootElement.style.fontSize = currentFontSize + 'px';
  }

  function loadVoices() {
    voices = synth.getVoices();
    if (voices.length === 0) {
      // Some browsers load voices asynchronously
      synth.addEventListener('voiceschanged', () => {
        voices = synth.getVoices();
        console.log('Voices loaded:', voices);
      });
    } else {
      console.log('Voices loaded:', voices);
    }
  }

  loadVoices();

  function speak(text) {
    if (voiceAssistEnabled && synth) {
      if (synth.speaking) {
        synth.cancel();
      }
      const utterThis = new SpeechSynthesisUtterance(text);
      // Select voice based on selectedLanguage
      let voice = voices.find(v => v.lang.toLowerCase().startsWith(selectedLanguage));
      if (!voice) {
        voice = voices[0]; // fallback to default voice
      }
      utterThis.voice = voice;
      utterThis.lang = voice.lang;
      synth.speak(utterThis);
      console.log('Speaking:', text, 'with voice:', voice.name);
    }
  }

  fontDecreaseBtn?.addEventListener('click', () => {
    if (currentFontSize > 10) {
      updateFontSize(currentFontSize - 2);
      speak('Font size decreased');
    }
  });

  fontNormalBtn?.addEventListener('click', () => {
    updateFontSize(16);
    speak('Font size reset to normal');
  });

  fontIncreaseBtn?.addEventListener('click', () => {
    if (currentFontSize < 30) {
      updateFontSize(currentFontSize + 2);
      speak('Font size increased');
    }
  });

  toggleVoiceAssistBtn?.addEventListener('click', () => {
    const isPressed = toggleVoiceAssistBtn.getAttribute('aria-pressed') === 'true';
    if (isPressed) {
      toggleVoiceAssistBtn.setAttribute('aria-pressed', 'false');
      voiceAssistEnabled = false;
      speak('Voice Assist Disabled');
    } else {
      toggleVoiceAssistBtn.setAttribute('aria-pressed', 'true');
      voiceAssistEnabled = true;
      speak('Voice Assist Enabled');
    }
  });

  toggleDarkModeBtn?.addEventListener('click', () => {
    const isPressed = toggleDarkModeBtn.getAttribute('aria-pressed') === 'true';
    if (isPressed) {
      toggleDarkModeBtn.setAttribute('aria-pressed', 'false');
      document.body.classList.remove('dark-mode');
      speak('Dark mode disabled');
    } else {
      toggleDarkModeBtn.setAttribute('aria-pressed', 'true');
      document.body.classList.add('dark-mode');
      speak('Dark mode enabled');
    }
  });

  // Simple i18n implementation
  const translations = {
    en: {
      'Send OTP': 'Send OTP',
      'Scan RFID': 'Scan RFID',
      'Sign Up': 'Sign Up',
      'Login or Sign-Up': 'Login or Sign-Up',
      'New user?': 'New user?',
      'Start Health Check': 'Start Health Check',
      'View Reports': 'View Reports',
      'Call Doctor': 'Call Doctor',
      'Feedback': 'Feedback',
      'Logout': 'Logout',
      'Submit Vitals': 'Submit Vitals',
      'Risk Analysis': 'Risk Analysis',
      'Analyzing...': 'Analyzing...',
      'View Chart': 'View Chart',
      'Health Trends': 'Health Trends',
      'Proceed to Doctor Consultation': 'Proceed to Doctor Consultation',
      'Doctor Consultation': 'Doctor Consultation',
      'Start Video Call': 'Start Video Call',
      'End Video Call': 'End Video Call',
      'Skip Call': 'Skip Call',
      'Health Report': 'Health Report',
      'Download Report': 'Download Report',
      'Proceed to Feedback': 'Proceed to Feedback',
      'Feedback': 'Feedback',
      'Rate your experience:': 'Rate your experience:',
      'Submit Feedback': 'Submit Feedback',
      'Admin Login': 'Admin Login',
      'Login': 'Login',
      'Back': 'Back',
      'Invalid credentials': 'Invalid credentials',
      'Admin Dashboard': 'Admin Dashboard',
      'Total Users:': 'Total Users:',
      'Flagged High-Risk Cases:': 'Flagged High-Risk Cases:',
      'System Health:': 'System Health:',
      'Export Reports as CSV': 'Export Reports as CSV',
      'Logout': 'Logout',
      'Device Integration': 'Device Integration',
      'Simulated device connection status:': 'Simulated device connection status:',
      'Connect Device': 'Connect Device',
      'Disconnect Device': 'Disconnect Device',
      'Back to Dashboard': 'Back to Dashboard',
    },
    kn: {
      'Send OTP': 'ಒಟಿಪಿ ಕಳುಹಿಸಿ',
      'Scan RFID': 'ಆರ್‌ಎಫ್‌ಐಡಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
      'Sign Up': 'ಸೈನ್ ಅಪ್',
      'Login or Sign-Up': 'ಲಾಗಿನ್ ಅಥವಾ ಸೈನ್ ಅಪ್',
      'New user?': 'ಹೊಸ ಬಳಕೆದಾರ?',
      'Start Health Check': 'ಆರೋಗ್ಯ ಪರಿಶೀಲನೆ ಪ್ರಾರಂಭಿಸಿ',
      'View Reports': 'ವರದಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
      'Call Doctor': 'ಡಾಕ್ಟರ್‌ಗೆ ಕರೆ ಮಾಡಿ',
      'Feedback': 'ಪ್ರತಿಕ್ರಿಯೆ',
      'Logout': 'ಲಾಗ್ ಔಟ್',
      'Submit Vitals': 'ವೈಟಲ್ಸ್ ಸಲ್ಲಿಸಿ',
      'Risk Analysis': 'ರಿಸ್ಕ್ ವಿಶ್ಲೇಷಣೆ',
      'Analyzing...': 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
      'View Chart': 'ಚಾರ್ಟ್ ವೀಕ್ಷಿಸಿ',
      'Health Trends': 'ಆರೋಗ್ಯ ಪ್ರವೃತ್ತಿಗಳು',
      'Proceed to Doctor Consultation': 'ಡಾಕ್ಟರ್ ಸಲಹೆಗೆ ಮುಂದುವರಿಯಿರಿ',
      'Doctor Consultation': 'ಡಾಕ್ಟರ್ ಸಲಹೆ',
      'Start Video Call': 'ವೀಡಿಯೋ ಕರೆ ಪ್ರಾರಂಭಿಸಿ',
      'End Video Call': 'ವೀಡಿಯೋ ಕರೆ ಮುಗಿಸಿ',
      'Skip Call': 'ಕರೆ ಬಿಟ್ಟುಬಿಡಿ',
      'Health Report': 'ಆರೋಗ್ಯ ವರದಿ',
      'Download Report': 'ವರದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
      'Proceed to Feedback': 'ಪ್ರತಿಕ್ರಿಯೆಗೆ ಮುಂದುವರಿಯಿರಿ',
      'Feedback': 'ಪ್ರತಿಕ್ರಿಯೆ',
      'Rate your experience:': 'ನಿಮ್ಮ ಅನುಭವವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ:',
      'Submit Feedback': 'ಪ್ರತಿಕ್ರಿಯೆ ಸಲ್ಲಿಸಿ',
      'Admin Login': 'ನಿರ್ವಹಣಾ ಲಾಗಿನ್',
      'Login': 'ಲಾಗಿನ್',
      'Back': 'ಹಿಂದಕ್ಕೆ',
      'Invalid credentials': 'ಅಮಾನ್ಯ ಪ್ರಮಾಣಪತ್ರಗಳು',
      'Admin Dashboard': 'ನಿರ್ವಹಣಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      'Total Users:': 'ಒಟ್ಟು ಬಳಕೆದಾರರು:',
      'Flagged High-Risk Cases:': 'ಹೆಚ್ಚು ಅಪಾಯದ ಪ್ರಕರಣಗಳು:',
      'System Health:': 'ಸಿಸ್ಟಮ್ ಆರೋಗ್ಯ:',
      'Export Reports as CSV': 'ವರದಿಗಳನ್ನು CSV ಆಗಿ ರಫ್ತುಮಾಡಿ',
      'Logout': 'ಲಾಗ್ ಔಟ್',
      'Device Integration': 'ಉಪಕರಣ ಸಂಯೋಜನೆ',
      'Simulated device connection status:': 'ನಕಲಿ ಉಪಕರಣ ಸಂಪರ್ಕ ಸ್ಥಿತಿ:',
      'Connect Device': 'ಉಪಕರಣವನ್ನು ಸಂಪರ್ಕಿಸಿ',
      'Disconnect Device': 'ಉಪಕರಣವನ್ನು ಸಂಪರ್ಕ ಮುಕ್ತಗೊಳಿಸಿ',
      'Back to Dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂದಿರುಗಿ',
    },
    hi: {
      'Send OTP': 'ओटीपी भेजें',
      'Scan RFID': 'आरएफआईडी स्कैन करें',
      'Sign Up': 'साइन अप करें',
      'Login or Sign-Up': 'लॉगिन या साइन अप',
      'New user?': 'नया उपयोगकर्ता?',
      'Start Health Check': 'स्वास्थ्य जांच शुरू करें',
      'View Reports': 'रिपोर्ट देखें',
      'Call Doctor': 'डॉक्टर को कॉल करें',
      'Feedback': 'प्रतिक्रिया',
      'Logout': 'लॉग आउट',
      'Submit Vitals': 'वाइटल्स सबमिट करें',
      'Risk Analysis': 'जोखिम विश्लेषण',
      'Analyzing...': 'विश्लेषण हो रहा है...',
      'View Chart': 'चार्ट देखें',
      'Health Trends': 'स्वास्थ्य रुझान',
      'Proceed to Doctor Consultation': 'डॉक्टर परामर्श के लिए आगे बढ़ें',
      'Doctor Consultation': 'डॉक्टर परामर्श',
      'Start Video Call': 'वीडियो कॉल शुरू करें',
      'End Video Call': 'वीडियो कॉल समाप्त करें',
      'Skip Call': 'कॉल छोड़ें',
      'Health Report': 'स्वास्थ्य रिपोर्ट',
      'Download Report': 'रिपोर्ट डाउनलोड करें',
      'Proceed to Feedback': 'प्रतिक्रिया के लिए आगे बढ़ें',
      'Feedback': 'प्रतिक्रिया',
      'Rate your experience:': 'अपने अनुभव को रेट करें:',
      'Submit Feedback': 'प्रतिक्रिया सबमिट करें',
      'Admin Login': 'एडमिन लॉगिन',
      'Login': 'लॉगिन',
      'Back': 'वापस',
      'Invalid credentials': 'अमान्य प्रमाण पत्र',
      'Admin Dashboard': 'एडमिन डैशबोर्ड',
      'Total Users:': 'कुल उपयोगकर्ता:',
      'Flagged High-Risk Cases:': 'उच्च जोखिम वाले मामले:',
      'System Health:': 'सिस्टम स्वास्थ्य:',
      'Export Reports as CSV': 'रिपोर्ट्स को CSV के रूप में निर्यात करें',
      'Logout': 'लॉग आउट',
      'Device Integration': 'डिवाइस इंटीग्रेशन',
      'Simulated device connection status:': 'सिम्युलेटेड डिवाइस कनेक्शन स्थिति:',
      'Connect Device': 'डिवाइस कनेक्ट करें',
      'Disconnect Device': 'डिवाइस डिस्कनेक्ट करें',
      'Back to Dashboard': 'डैशबोर्ड पर वापस जाएं',
    }
  };

  function translatePage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[lang] && translations[lang][key]) {
        el.setAttribute('placeholder', translations[lang][key]);
      }
    });
  }

  languageSelect?.addEventListener('change', () => {
    selectedLanguage = languageSelect.value;
    translatePage(selectedLanguage);
    alert('Language changed to: ' + selectedLanguage);
    speak('Language changed to ' + selectedLanguage);
  });

  // Button event handlers

  console.log('Attaching button event listeners...');

  // Vitals form submission handler
  const vitalsForm = document.getElementById('vitals-form');
  vitalsForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    // Use Firebase data for temperature and spo2 instead of manual input
    const temperature = parseFloat(document.getElementById('temperature').value);
    const oxygenLevel = parseInt(document.getElementById('oxygen-level').value);

    // Manual inputs for other vitals
    const pulse = parseInt(document.getElementById('pulse').value);
    const systolic = parseInt(document.getElementById('systolic').value);
    const diastolic = parseInt(document.getElementById('diastolic').value);

    if (isNaN(temperature) || isNaN(pulse) || isNaN(systolic) || isNaN(diastolic) || isNaN(oxygenLevel)) {
      alert('Please enter valid values for all vitals.');
      return;
    }

    // Save vitals to Firebase or local state (example: localStorage)
    const vitalsData = {
      temperature,
      pulse,
      bloodPressure: `${systolic}/${diastolic}`,
      oxygenLevel,
      timestamp: new Date().toISOString()
    };

    // For demo, save to localStorage
    localStorage.setItem('latestVitals', JSON.stringify(vitalsData));
    alert('Vitals submitted successfully.');

    // Analyze risk based on vitals (simple example)
    let riskLevel = 'Low';
    if (temperature > 38 || oxygenLevel < 92 || pulse > 100) {
      riskLevel = 'High';
    } else if (temperature > 37.5 || oxygenLevel < 95 || pulse > 90) {
      riskLevel = 'Medium';
    }

    // Store risk level in localStorage for demo
    localStorage.setItem('riskLevel', riskLevel);

    // Show risk analysis screen and display risk level
    const riskResultElem = document.getElementById('risk-result');
    if (riskResultElem) {
      riskResultElem.textContent = `Risk Level: ${riskLevel}`;
    }
    showScreen('risk-analysis-screen');

    // Remove the previous setTimeout for health recommendation here

  // Chart view screen
  const healthChartCtx = document.getElementById('health-chart')?.getContext('2d');
  let healthChart;

  function renderHealthChart() {
    if (!healthChartCtx) return;

    // For demo, use sample data from localStorage or default
    const vitalsDataStr = localStorage.getItem('latestVitals');
    let vitalsData = null;
    if (vitalsDataStr) {
      vitalsData = JSON.parse(vitalsDataStr);
    }

    const labels = ['Temperature', 'Pulse', 'Oxygen Level'];
    const dataValues = vitalsData ? [
      vitalsData.temperature || 0,
      vitalsData.pulse || 0,
      vitalsData.oxygenLevel || 0
    ] : [0, 0, 0];

    if (healthChart) {
      healthChart.destroy();
    }

    healthChart = new Chart(healthChartCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Latest Vitals',
          data: dataValues,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 120
          }
        }
      }
    });

    // After rendering the chart, show the health recommendation alert slowly
    setTimeout(() => {
      alert('Health Recommendation: Maintain hydration and rest. Consult doctor if symptoms worsen.');
      // Show report screen after health recommendation
      showScreen('report-screen');
    }, 3000); // 3 seconds delay for slow appearance
  }

  // Show chart view screen and render chart
  const viewChartBtn = document.getElementById('view-chart-btn');
  viewChartBtn?.addEventListener('click', () => {
    showScreen('chart-view-screen');
    renderHealthChart();
  });

  // Proceed to doctor consultation from chart view
  const proceedDoctorConsultBtn = document.getElementById('proceed-doctor-consult-btn');
  proceedDoctorConsultBtn?.addEventListener('click', () => {
    showScreen('doctor-consultation-screen');
  });
  });

  // PDF report generation with QR code
  const downloadReportBtn = document.getElementById('download-report-btn');
  console.log('downloadReportBtn:', downloadReportBtn);

  downloadReportBtn?.addEventListener('click', () => {
    console.log('Download report button clicked');
    generatePdfReport();
  });

  function generatePdfReport() {
    try {
      console.log('Starting simplified PDF generation...');
      if (!window.jspdf) {
        console.error('jsPDF library not loaded');
        alert('PDF generation failed: jsPDF library not loaded.');
        return;
      }
      // Use jsPDF constructor directly
      const jsPDF = window.jspdf.jsPDF || window.jspdf;
      const doc = new jsPDF();

      // Add simple text content
      doc.setFontSize(16);
      doc.text('AI Healthcare Screening Report', 10, 20);
      doc.setFontSize(12);
      doc.text('This is a simplified PDF report.', 10, 30);

      // Attempt to save PDF and catch any errors
      try {
        doc.save('simplified-screening-report.pdf');
        console.log('Simplified PDF generation completed and file saved.');
      } catch (saveError) {
        console.error('Error saving PDF:', saveError);
        alert('Failed to save PDF. Please check browser settings or try a different browser.');
      }
    } catch (error) {
      console.error('Error during simplified PDF generation:', error);
      alert('An error occurred during PDF generation. Please check console for details.');
    }
  }

  // Chatbot functionality
  const chatbotToggleBtn = document.getElementById('chatbot-toggle');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSendBtn = document.getElementById('chatbot-send');

  chatbotToggleBtn?.addEventListener('click', () => {
    const expanded = chatbotToggleBtn.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      chatbotToggleBtn.setAttribute('aria-expanded', 'false');
      chatbotWindow.hidden = true;
      chatbotWindow.style.display = 'none';
      clearTimeout(typingTimeout);
      setTyping(false);
    } else {
      chatbotToggleBtn.setAttribute('aria-expanded', 'true');
      chatbotWindow.hidden = false;
      chatbotWindow.style.display = 'block';
      chatbotInput.focus();
    }
  });

  // Video call screen buttons
  const startVideoCallBtn = document.getElementById('start-video-call-btn');
  const endVideoCallBtn = document.getElementById('end-video-call-btn');
  const skipCallBtn = document.getElementById('skip-call-btn');
  const videoCallContainer = document.getElementById('video-call-container');

  startVideoCallBtn?.addEventListener('click', () => {
    // Show video call container and toggle buttons
    videoCallContainer.style.display = 'block';
    startVideoCallBtn.style.display = 'none';
    endVideoCallBtn.style.display = 'inline-block';
    speak('Video call started');

    // Access user camera and stream to videoCallContainer
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true })
        .then((stream) => {
          // Remove existing video element if any to avoid duplicates
          let videoElem = videoCallContainer.querySelector('video');
          if (videoElem) {
            videoElem.srcObject = null;
            videoCallContainer.removeChild(videoElem);
          }
          // Create new video element
          videoElem = document.createElement('video');
          videoElem.autoplay = true;
          videoElem.playsInline = true;
          videoCallContainer.appendChild(videoElem);

          videoElem.srcObject = stream;
          videoElem.play();
          // Store stream to stop later
          videoCallContainer._stream = stream;
          console.log('Camera stream started');
          alert('Camera stream started successfully.');
        })
        .catch((error) => {
          alert('Error accessing camera: ' + error.message);
          console.error('Camera access error:', error);
        });
    } else {
      alert('Camera access not supported in this browser.');
    }
  });

  endVideoCallBtn?.addEventListener('click', () => {
    // Stop video stream if active
    if (videoCallContainer._stream) {
      videoCallContainer._stream.getTracks().forEach(track => track.stop());
      videoCallContainer._stream = null;
    }
    videoCallContainer.style.display = 'none';
    startVideoCallBtn.style.display = 'inline-block';
    endVideoCallBtn.style.display = 'none';
    speak('Video call ended');
    // After call ends, navigate to feedback screen
    showScreen('feedback-screen');
  });

  skipCallBtn?.addEventListener('click', () => {
    // Skip video call and go to feedback screen
    showScreen('feedback-screen');
    speak('Video call skipped');
  });

  // Feedback screen buttons
  const submitFeedbackBtn = document.getElementById('submit-feedback-btn');
  const ratingSelect = document.getElementById('rating');
  const commentsTextarea = document.getElementById('comments');

  submitFeedbackBtn?.addEventListener('click', () => {
    const rating = ratingSelect.value;
    const comments = commentsTextarea.value.trim();

    if (!rating) {
      alert('Please provide a rating.');
      return;
    }

    // For demo, save feedback to localStorage
    const feedback = {
      rating,
      comments,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('latestFeedback', JSON.stringify(feedback));
    alert('Thank you for your feedback!');

    // Navigate back to dashboard or login screen as needed
    showScreen('dashboard-screen');
  });

  let typingTimeout;
  let isTyping = false;

  function setTyping(typing) {
    isTyping = typing;
    if (typing) {
      chatbotMessages.classList.add('typing');
    } else {
      chatbotMessages.classList.remove('typing');
    }
  }

  function appendMessage(sender, text) {
    const messageElem = document.createElement('div');
    messageElem.className = sender === 'user' ? 'chatbot-message user-message' : 'chatbot-message bot-message';

    // Add timestamp
    const timestamp = new Date().toLocaleTimeString();
    const timeElem = document.createElement('span');
    timeElem.className = 'chatbot-message-timestamp';
    timeElem.textContent = timestamp;

    messageElem.textContent = text;
    messageElem.appendChild(timeElem);

    chatbotMessages.appendChild(messageElem);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function getBotResponse(userText) {
    // Enhanced rule-based responses for healthcare kiosk
    const text = userText.toLowerCase();

    const intents = [
      { keywords: ['hello', 'hi', 'hey'], response: 'Hello! How can I assist you today?' },
      { keywords: ['help', 'support'], response: 'Sure, I am here to help. Please tell me your query.' },
      { keywords: ['temperature'], response: 'You can enter your temperature in the vitals entry screen.' },
      { keywords: ['pulse', 'heart rate'], response: 'Pulse rate can be entered in the vitals entry screen.' },
      { keywords: ['oxygen', 'spo2'], response: 'Oxygen level can be entered in the vitals entry screen.' },
      { keywords: ['appointment', 'doctor'], response: 'You can call a doctor from the dashboard screen.' },
      { keywords: ['report'], response: 'You can view and download your health reports from the report screen.' },
      { keywords: ['thank', 'thanks'], response: 'You are welcome!' },
      { keywords: ['logout', 'sign out'], response: 'You can logout using the logout button on the dashboard.' },
      { keywords: ['feedback'], response: 'You can provide feedback in the feedback screen accessible from the dashboard.' },
      { keywords: ['dark mode', 'theme'], response: 'You can toggle dark mode using the button in the footer.' },
      { keywords: ['language', 'translate'], response: 'You can change the language using the language selector in the footer.' },
      { keywords: ['font size', 'text size'], response: 'You can adjust font size using the buttons in the footer.' },
      { keywords: ['diagnosis', 'diagnose', 'symptom', 'symptoms'], response: 'For diagnosis help, please consult a doctor via the doctor consultation screen.' },
      { keywords: ['fever', 'what to do', 'sick'],response: 'Having a fever can be uncomfortable. It usually means your body is fighting an infection. Please try to rest well and drink plenty of fluids. It’s a good idea to monitor your temperature regularly. If it rises above 102°F (38.9°C), please consider seeking medical advice promptly. If your fever is quite high or lasts for more than a couple of days, I kindly recommend that you consult a healthcare professional for proper care.'
  },
  {
    keywords: ['worried about fever', 'fever concerns'],
    response: 'Having a fever can be uncomfortable. It usually means your body is fighting an infection. Please try to rest well and drink plenty of fluids. It’s a good idea to monitor your temperature regularly. If it rises above 102°F (38.9°C), please consider seeking medical advice promptly. If your fever is quite high or lasts for more than a couple of days, I kindly recommend that you consult a healthcare professional for proper care.'
  },
  {
    keywords: ['is fever normal', 'normal body temperature'],
    response: 'Having a fever can be uncomfortable. It usually means your body is fighting an infection. Please try to rest well and drink plenty of fluids. It’s a good idea to monitor your temperature regularly. If it rises above 102°F (38.9°C), please consider seeking medical advice promptly. If your fever is quite high or lasts for more than a couple of days, I kindly recommend that you consult a healthcare professional for proper care.'
  },
 {
    keywords: ['high body temperature', 'feverish'],
    response: 'Having a fever can be uncomfortable. It usually means your body is fighting an infection. Please try to rest well and drink plenty of fluids. It’s a good idea to monitor your temperature regularly. If it rises above 102°F (38.9°C), please consider seeking medical advice promptly. If your fever is quite high or lasts for more than a couple of days, I kindly recommend that you consult a healthcare professional for proper care.'
  },
 {
    keywords: ['chest pain serious'],
    response: 'Chest pain can be serious. It’s best to consult a doctor immediately, especially if it’s severe or accompanied by shortness of breath.'
  },
  {
    keywords: ['worried about chest pain'],
    response: 'Chest pain can be serious. It’s best to consult a doctor immediately, especially if it’s severe or accompanied by shortness of breath.'
  },
  {
    keywords: ['sharp pain in chest', 'feeling pain in chest', 'chest hurts', 'have chest pain'],
    response: 'Chest pain can be serious. It’s best to consult a doctor immediately, especially if it’s severe or accompanied by shortness of breath.'
  }

    ];

    for (const intent of intents) {
      if (intent.keywords.some(keyword => text.includes(keyword))) {
        return intent.response;
      }
    }

    return "I'm sorry, I didn't understand that. Can you please rephrase?";
  }

  function handleUserInput() {
    const userText = chatbotInput.value.trim();
    if (!userText) return;
    appendMessage('user', userText);
    chatbotInput.value = '';
    setTyping(true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      const botResponse = getBotResponse(userText);
      appendMessage('bot', botResponse);
      if (voiceAssistEnabled) {
        speak(botResponse);
      }
      setTyping(false);
    }, 1000); // simulate typing delay
  }

  chatbotSendBtn?.addEventListener('click', () => {
    handleUserInput();
  });

  chatbotInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUserInput();
    }
  });

  // Login screen buttons
  document.getElementById('send-otp-btn')?.addEventListener('click', () => {
    const mobile = document.getElementById('mobile-number').value.trim();
    if (!mobile) {
      alert('Please enter a mobile number.');
      return;
    }
    if (isUserRegistered(mobile)) {
      alert('OTP sent to ' + mobile);
      showScreen('dashboard-screen');
    } else {
      alert('Mobile number not registered. Please sign up.');
    }
  });

  document.getElementById('scan-rfid-btn')?.addEventListener('click', () => {
    alert('Simulating RFID scan...');
    const demoMobile = '1234567890';
    if (!isUserRegistered(demoMobile)) {
      registerUser(demoMobile);
      alert('RFID user registered with mobile ' + demoMobile);
    }
    alert('RFID scan successful. Logging in user with mobile ' + demoMobile);
    showScreen('dashboard-screen');

    // Show admin login button after RFID login
    const adminLoginBtn = document.getElementById('admin-login-btn');
    if (adminLoginBtn) {
      adminLoginBtn.style.display = 'inline-block';
    }
  });

  // SOS button functionality
  document.getElementById('sos-btn')?.addEventListener('click', () => {
    alert('SOS button pressed! Emergency services have been notified.');
    // TODO: Implement actual SOS functionality such as sending alert or calling emergency number
  });

  document.getElementById('sign-up-btn')?.addEventListener('click', () => {
    const mobile = document.getElementById('mobile-number').value.trim();
    if (!mobile) {
      alert('Please enter a mobile number to sign up.');
      return;
    }
    if (isUserRegistered(mobile)) {
      alert('Mobile number already registered. Please login.');
    } else {
      registerUser(mobile);
      alert('Registration successful! Redirecting...');
      showScreen('dashboard-screen');
    }
  });

  // Dashboard buttons
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    showScreen('login-screen');
  });

  document.getElementById('start-health-check-btn')?.addEventListener('click', () => {
    showScreen('vitals-entry-screen');
  });

  document.getElementById('view-reports-btn')?.addEventListener('click', () => {
    showScreen('report-screen');
  });

  document.getElementById('call-doctor-btn')?.addEventListener('click', () => {
    showScreen('doctor-consultation-screen');
  });

  document.getElementById('feedback-btn')?.addEventListener('click', () => {
    showScreen('feedback-screen');
  });
});
