const startBtn = document.getElementById('startBtn');
const backBtn = document.getElementById('backBtn');
const homePage = document.getElementById('homePage');
const appPage = document.getElementById('appPage');

startBtn.addEventListener('click', () => {
  homePage.style.transform = 'translateX(-100vw)';
  appPage.style.transform = 'translateX(0)';
});

backBtn.addEventListener('click', () => {
  homePage.style.transform = 'translateX(0)';
  appPage.style.transform = 'translateX(100vw)';
});

let mediaRecorder;
let recordedChunks = [];
const uploadBtn = document.getElementById('uploadBtn');
const recordBtn = document.getElementById('recordBtn');
const analyzeRecordBtn = document.getElementById('analyzeRecordBtn');
const audioPreview = document.getElementById('audioPreview');
const resultBox = document.getElementById('result');

uploadBtn.addEventListener('click', async () => {
  const fileInput = document.getElementById('audioFile');
  const file = fileInput.files[0];
  if (!file) return alert('เลือกไฟล์เสียงก่อนdiwa!');
  await analyzeAudio(file);
});

recordBtn.addEventListener('click', async () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    recordBtn.textContent = "Start Record";
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  recordedChunks = [];

  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    audioPreview.src = url;
    audioPreview.style.display = "block";
    analyzeRecordBtn.style.display = "block";
  };

  mediaRecorder.start();
  recordBtn.textContent = "Stop Record";
});

analyzeRecordBtn.addEventListener('click', async () => {
  const blob = new Blob(recordedChunks, { type: 'audio/wav' });
  await analyzeAudio(blob);
});

async function analyzeAudio(audioFile) {
  resultBox.style.display = "block";
  resultBox.innerHTML = "Uploading & Analyzing";

  const formData = new FormData();
  formData.append('audio', audioFile);

  try {
    const response = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    resultBox.innerHTML = `Result: ${data.result}<br>
                           Accuracy: ${(data.confidence * 100).toFixed(2)}%`;
  } catch (err) {
    console.error(err);
    resultBox.innerHTML = "Error";
  }
}


