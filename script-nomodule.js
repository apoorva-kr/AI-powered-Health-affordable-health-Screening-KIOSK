console.log('script-nomodule.js loaded');

// Minimal script to test button event listeners without ES modules or Firebase

document.addEventListener('DOMContentLoaded', () => {
  // Font size buttons
  const fontDecreaseBtn = document.getElementById('font-decrease');
  const fontNormalBtn = document.getElementById('font-normal');
  const fontIncreaseBtn = document.getElementById('font-increase');
  const toggleVoiceAssist = document.getElementById('toggle-voice-assist');
  let voiceAssistEnabled = false;

  fontDecreaseBtn && fontDecreaseBtn.addEventListener('click', () => {
    document.body.classList.remove('large-font');
    document.body.classList.add('small-font');
    alert('Font size decreased');
  });

  fontNormalBtn && fontNormalBtn.addEventListener('click', () => {
    document.body.classList.remove('small-font');
    document.body.classList.remove('large-font');
    alert('Font size reset to normal');
  });

  fontIncreaseBtn && fontIncreaseBtn.addEventListener('click', () => {
    document.body.classList.remove('small-font');
    document.body.classList.add('large-font');
    alert('Font size increased');
  });

  toggleVoiceAssist && toggleVoiceAssist.addEventListener('click', () => {
    voiceAssistEnabled = !voiceAssistEnabled;
    toggleVoiceAssist.setAttribute('aria-pressed', voiceAssistEnabled.toString());
    toggleVoiceAssist.textContent = voiceAssistEnabled ? 'Disable Voice Assist' : 'Enable Voice Assist';
    alert(voiceAssistEnabled ? 'Voice assistance enabled' : 'Voice assistance disabled');
  });

  // Sign up and login buttons
  document.getElementById('send-otp-btn')?.addEventListener('click', () => {
    const mobile = document.getElementById('mobile-number').value.trim();
    if (!mobile) {
      alert('Please enter a mobile number.');
      return;
    }
    alert('OTP sent to ' + mobile);
  });

  document.getElementById('sign-up-btn')?.addEventListener('click', () => {
    const mobile = document.getElementById('mobile-number').value.trim();
    if (!mobile) {
      alert('Please enter a mobile number to sign up.');
      return;
    }
    alert('Registration successful for ' + mobile);
  });

  document.getElementById('scan-rfid-btn')?.addEventListener('click', () => {
    alert('Simulating RFID scan...');
  });
});
