const state = {
  levels: [],
  levelIndex: 0,
  selected: false,
  tared: false,
  weighed: false,
  waterReady: false,
  immersed: false,
  bubblePresent: false,
  bubbleRemoved: false,
  eye: "level",
  score: 100,
  step: 1,
  settings: {
    showHints: true,
    autoFill: false,
    bubbleEnabled: true,
    challenge: false
  },
  attempts: 0
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const els = {
  home: $("#homeSection"),
  concept: $("#conceptSection"),
  lab: $("#labSection"),
  result: $("#resultSection"),
  startBtn: $("#startBtn"),
  learnBtn: $("#learnBtn"),
  conceptStartBtn: $("#conceptStartBtn"),
  missionTitle: $("#missionTitle"),
  missionText: $("#missionText"),
  levelChip: $("#levelChip"),
  categoryChip: $("#categoryChip"),
  difficultyChip: $("#difficultyChip"),
  instructionText: $("#instructionText"),
  hintText: $("#hintText"),
  objectTray: $("#objectTray"),
  toolActions: $("#toolActions"),
  stageMessage: $("#stageMessage"),
  scaleDisplay: $("#scaleDisplay"),
  scaleHolder: $("#scaleObjectHolder"),
  tareBtn: $("#tareBtn"),
  water: $("#water"),
  immersedObject: $("#immersedObject"),
  bubble: $("#bubble"),
  cylinderDisplay: $("#cylinderDisplay"),
  eyeLine: $("#eyeLine"),
  massReadout: $("#massReadout"),
  initialReadout: $("#initialReadout"),
  finalReadout: $("#finalReadout"),
  progressLabel: $("#progressLabel"),
  progressBar: $("#progressBar"),
  score: $("#score"),
  form: $("#recordForm"),
  massInput: $("#massInput"),
  initialInput: $("#initialInput"),
  finalInput: $("#finalInput"),
  volumeInput: $("#volumeInput"),
  densityInput: $("#densityInput"),
  materialSelect: $("#materialSelect"),
  resultIcon: $("#resultIcon"),
  resultTitle: $("#resultTitle"),
  resultMessage: $("#resultMessage"),
  resultMass: $("#resultMass"),
  resultVolume: $("#resultVolume"),
  resultDensity: $("#resultDensity"),
  resultScore: $("#resultScore"),
  reflectionQuestion: $("#reflectionQuestion"),
  reflectionOptions: $("#reflectionOptions"),
  reflectionFeedback: $("#reflectionFeedback"),
  nextLevelBtn: $("#nextLevelBtn"),
  downloadReportBtn: $("#downloadReportBtn"),
  restartBtn: $("#restartBtn"),
  teacherBtn: $("#teacherBtn"),
  teacherDialog: $("#teacherDialog"),
  saveSettingsBtn: $("#saveSettingsBtn"),
  showHintsSetting: $("#showHintsSetting"),
  autoFillSetting: $("#autoFillSetting"),
  bubbleSetting: $("#bubbleSetting"),
  challengeSetting: $("#challengeSetting"),
  soundBtn: $("#soundBtn"),
  toast: $("#toast")
};

let soundEnabled = true;

async function init() {
  try {
    const response = await fetch("data/levels.json");
    if (!response.ok) throw new Error("無法讀取關卡資料");
    state.levels = await response.json();
  } catch (error) {
    console.error(error);
    els.startBtn.disabled = true;
    showToast("關卡資料載入失敗，請用網站伺服器開啟");
    return;
  }

  bindEvents();
  loadSettings();
  renderLevel();
}

function bindEvents() {
  els.startBtn.addEventListener("click", () => showSection("lab"));
  els.learnBtn.addEventListener("click", () => showSection("concept"));
  els.conceptStartBtn.addEventListener("click", () => showSection("lab"));
  els.tareBtn.addEventListener("click", tareScale);
  els.toolActions.addEventListener("click", (e) => {
    const action = e.target.closest("button")?.dataset.action;
    if (!action) return;
    ({tare:tareScale,weigh:weighObject,water:prepareWater,immerse:immerseObject,"remove-bubble":removeBubble}[action])();
  });
  $$("[data-eye]").forEach(btn => btn.addEventListener("click", () => setEye(btn.dataset.eye)));
  els.form.addEventListener("submit", submitResult);
  els.nextLevelBtn.addEventListener("click", nextLevel);
  els.restartBtn.addEventListener("click", restartAll);
  els.downloadReportBtn.addEventListener("click", downloadReport);
  els.teacherBtn.addEventListener("click", () => els.teacherDialog.showModal());
  els.saveSettingsBtn.addEventListener("click", saveSettings);
  els.soundBtn.addEventListener("click", toggleSound);
}

function showSection(name) {
  [els.home, els.concept, els.lab, els.result].forEach(s => s.classList.add("hidden"));
  ({home:els.home,concept:els.concept,lab:els.lab,result:els.result}[name]).classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}

function currentLevel() {
  return state.levels[state.levelIndex];
}

function resetLabState() {
  state.selected = false;
  state.tared = false;
  state.weighed = false;
  state.waterReady = false;
  state.immersed = false;
  state.bubblePresent = false;
  state.bubbleRemoved = false;
  state.eye = "level";
  state.score = 100;
  state.step = 1;
  state.attempts = 0;
}

function renderLevel() {
  if (!state.levels.length) return;
  resetLabState();
  const level = currentLevel();

  els.missionTitle.textContent = level.title;
  els.missionText.textContent = level.description;
  els.levelChip.textContent = `第 ${state.levelIndex + 1} / ${state.levels.length} 關`;
  els.categoryChip.textContent = level.category || "材料鑑定";
  els.difficultyChip.textContent = level.difficulty || "基礎";
  els.objectTray.innerHTML = "";

  const distractors = [
    {name:"木塊",symbol:"▰",color:"#b98a58"},
    {name:"塑膠球",symbol:"●",color:"#f0b63b"}
  ];
  [level, ...distractors].forEach((obj, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "object-card";
    button.innerHTML = `<span class="shape" style="color:${obj.color || level.color}">${obj.symbol}</span><b>${obj.objectName || obj.name}</b><small>${index === 0 ? "待測物" : "備用物"}</small>`;
    button.addEventListener("click", () => selectObject(index, button));
    els.objectTray.appendChild(button);
  });

  els.scaleDisplay.textContent = "0.8 g";
  els.scaleHolder.textContent = "";
  els.water.style.height = `${level.initialWater}%`;
  els.immersedObject.textContent = "";
  els.bubble.style.display = "none";
  els.cylinderDisplay.textContent = "—";
  [els.massReadout,els.initialReadout,els.finalReadout].forEach(x => x.textContent = "—");
  [els.massInput,els.initialInput,els.finalInput,els.volumeInput,els.densityInput].forEach(x => x.value = "");
  els.materialSelect.value = "";
  els.score.textContent = state.score;
  setEye("level");
  setInstruction("從物體托盤選擇標示「待測物」的物體。","先確認任務指定的物體，再開始測量。");
  setStep(1);
  updateActionButtons();
  applySettingsClasses();
}

function selectObject(index, button) {
  if (index !== 0) {
    penalty(3);
    shake(button);
    showToast("這不是任務指定的待測物");
    playTone(180);
    return;
  }
  state.selected = true;
  $$(".object-card").forEach(x => x.classList.remove("selected"));
  button.classList.add("selected");
  const level = currentLevel();
  els.stageMessage.textContent = `已選擇：${level.objectName}。下一步先將天平歸零。`;
  setInstruction("點擊「天平歸零」，讓空秤讀數回到 0.0 g。","天平沒有放置物體時，讀數應為 0.0 g。");
  setStep(1);
  updateActionButtons();
  playTone(540);
}

function tareScale() {
  if (!state.selected) return need("請先選擇待測物");
  state.tared = true;
  els.scaleDisplay.textContent = "0.0 g";
  flash(els.scaleDisplay);
  els.stageMessage.textContent = "天平已歸零，現在可以測量物體質量。";
  setInstruction("把待測物放到電子天平上。","歸零可扣除天平本身的初始偏差。");
  setStep(2);
  updateActionButtons();
  playTone(620);
}

function weighObject() {
  if (!state.selected) return need("請先選擇待測物");
  if (!state.tared) {
    penalty(5);
    return need("天平尚未歸零，讀值會不準確");
  }
  const level = currentLevel();
  state.weighed = true;
  els.scaleHolder.innerHTML = `<span style="color:${level.color}">${level.symbol}</span>`;
  els.scaleDisplay.textContent = `${level.mass.toFixed(2).replace(/0$/,"")} g`;
  els.massReadout.textContent = formatNumber(level.mass);
  if (state.settings.autoFill) els.massInput.value = formatNumber(level.mass);
  els.stageMessage.textContent = `質量測得 ${formatNumber(level.mass)} g。接著準備量筒。`;
  setInstruction("在量筒中準備適量的水，並讀取原始水量。","讀取水面時，視線要和凹液面的最低點同高。");
  setStep(3);
  updateActionButtons();
  playTone(700);
}

function prepareWater() {
  if (!state.weighed) return need("請先完成質量測量");
  const level = currentLevel();
  state.waterReady = true;
  updateCylinderReadout(level.initialWater);
  els.initialReadout.textContent = formatNumber(level.initialWater);
  if (state.settings.autoFill) els.initialInput.value = formatNumber(level.initialWater);
  els.stageMessage.textContent = "原始水量已可讀取。確認視線同高後，再將物體完全浸入。";
  setInstruction("確認視線與液面同高，再將物體完全浸入水中。","從上方或下方看量筒，會產生視差。");
  setStep(4);
  updateActionButtons();
  playTone(760);
}

function immerseObject() {
  if (!state.waterReady) return need("請先準備量筒並讀取原始水量");
  const level = currentLevel();
  state.immersed = true;
  state.bubblePresent = Boolean(state.settings.bubbleEnabled && level.bubble);
  state.bubbleRemoved = !state.bubblePresent;

  els.scaleHolder.textContent = "";
  els.immersedObject.textContent = level.symbol;
  els.immersedObject.style.color = level.color;
  const measuredFinal = getMeasuredFinal();
  els.water.style.height = `${Math.min(measuredFinal,95)}%`;
  els.bubble.style.display = state.bubblePresent ? "block" : "none";
  updateCylinderReadout(measuredFinal);
  els.finalReadout.textContent = formatNumber(getDisplayedReading(measuredFinal));
  if (state.settings.autoFill) els.finalInput.value = formatNumber(getDisplayedReading(measuredFinal));

  if (state.bubblePresent) {
    els.stageMessage.textContent = "注意！物體表面附著氣泡，會讓測得體積偏大。";
    setInstruction("點擊「排除氣泡」，再記錄放入後水量。","氣泡也會排開水，使量筒讀值增加。");
  } else {
    els.stageMessage.textContent = "物體已完全浸入，現在可以讀取放入後水量。";
    setInstruction("記錄放入後水量，計算物體體積與密度。","1 mL 的體積等於 1 cm³。");
  }
  setStep(5);
  updateActionButtons();
  playTone(480);
}

function removeBubble() {
  if (!state.bubblePresent || state.bubbleRemoved) return need("目前沒有需要排除的氣泡");
  state.bubbleRemoved = true;
  els.bubble.style.display = "none";
  const trueFinal = currentLevel().initialWater + currentLevel().volume;
  els.water.style.height = `${Math.min(trueFinal,95)}%`;
  updateCylinderReadout(trueFinal);
  els.finalReadout.textContent = formatNumber(getDisplayedReading(trueFinal));
  if (state.settings.autoFill) els.finalInput.value = formatNumber(getDisplayedReading(trueFinal));
  els.stageMessage.textContent = "氣泡已排除。請記錄放入後水量並完成計算。";
  setInstruction("完成紀錄表，並選擇最可能的材料。","密度接近參考值即可，不必一模一樣。");
  setStep(6);
  updateActionButtons();
  playTone(820);
}

function setEye(position) {
  state.eye = position;
  $$("[data-eye]").forEach(btn => btn.classList.toggle("active", btn.dataset.eye === position));
  els.eyeLine.style.top = position === "high" ? "95px" : position === "low" ? "178px" : "135px";

  if (state.waterReady || state.immersed) {
    const base = state.immersed ? getMeasuredFinal() : currentLevel().initialWater;
    updateCylinderReadout(base);
    if (state.immersed) els.finalReadout.textContent = formatNumber(getDisplayedReading(base));
    else els.initialReadout.textContent = formatNumber(getDisplayedReading(base));
  }

  if (position !== "level" && (state.waterReady || state.immersed)) {
    penalty(2);
    showToast("視線未與液面同高，讀值會有視差");
  }
}

function getMeasuredFinal() {
  const level = currentLevel();
  return level.initialWater + level.volume + (state.bubblePresent && !state.bubbleRemoved ? 1.5 : 0);
}

function getDisplayedReading(value) {
  const offset = state.eye === "high" ? 1.0 : state.eye === "low" ? -1.0 : 0;
  return value + offset;
}

function updateCylinderReadout(value) {
  const shown = getDisplayedReading(value);
  els.cylinderDisplay.textContent = state.settings.challenge ? "請自行判讀" : formatNumber(shown);
}

function submitResult(event) {
  event.preventDefault();
  if (!state.immersed) return need("請先完成排水測量");

  const level = currentLevel();
  const entered = {
    mass: parseFloat(els.massInput.value),
    initial: parseFloat(els.initialInput.value),
    final: parseFloat(els.finalInput.value),
    volume: parseFloat(els.volumeInput.value),
    density: parseFloat(els.densityInput.value),
    material: els.materialSelect.value
  };

  if (Object.values(entered).some(v => v === "" || Number.isNaN(v))) {
    penalty(3);
    shake(els.form);
    return showToast("請完成所有實驗紀錄");
  }

  state.attempts += 1;
  const expectedFinal = level.initialWater + level.volume;
  const expectedDensity = level.mass / level.volume;

  const checks = {
    mass: near(entered.mass, level.mass, 0.11),
    initial: near(entered.initial, level.initialWater, 0.11),
    final: near(entered.final, expectedFinal, 0.11),
    volume: near(entered.volume, level.volume, 0.11),
    density: near(entered.density, expectedDensity, 0.03),
    material: entered.material === level.material
  };

  const wrongCount = Object.values(checks).filter(Boolean).length;
  if (wrongCount < 6) {
    penalty((6 - wrongCount) * 3);
    const messages = [];
    if (!checks.mass) messages.push("質量");
    if (!checks.initial || !checks.final) messages.push("水量讀值");
    if (!checks.volume) messages.push("體積");
    if (!checks.density) messages.push("密度");
    if (!checks.material) messages.push("材料");
    showToast(`請再檢查：${messages.join("、")}`);
    shake(els.form);
    return;
  }

  if (state.bubblePresent && !state.bubbleRemoved) {
    penalty(8);
    return showToast("表面仍有氣泡，請先排除再提交");
  }
  if (state.eye !== "level") {
    penalty(5);
    return showToast("請先把視線調整到與液面同高");
  }

  saveProgress();
  showResult(entered, expectedDensity);
  playTone(980, 0.2);
}

function showResult(entered, expectedDensity) {
  const level = currentLevel();
  els.resultIcon.textContent = state.score >= 90 ? "🏅" : state.score >= 75 ? "🔬" : "✅";
  els.resultTitle.textContent = `${level.material}，鑑定正確！`;
  els.resultMessage.textContent = `${level.objectName}的密度約為 ${expectedDensity.toFixed(2)} g/cm³，與${level.material}的參考密度相符。`;
  els.resultMass.textContent = formatNumber(entered.mass);
  els.resultVolume.textContent = formatNumber(entered.volume);
  els.resultDensity.textContent = entered.density.toFixed(2);
  els.resultScore.textContent = state.score;
  els.reflectionQuestion.textContent = level.reflection.question;
  els.reflectionFeedback.textContent = "";
  els.reflectionOptions.innerHTML = "";
  level.reflection.options.forEach((text,index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = text;
    btn.addEventListener("click", () => answerReflection(index, btn));
    els.reflectionOptions.appendChild(btn);
  });
  els.nextLevelBtn.textContent = state.levelIndex === state.levels.length - 1 ? "完成全部任務" : "下一關";
  showSection("result");
}

function answerReflection(index, button) {
  const reflection = currentLevel().reflection;
  $$("#reflectionOptions button").forEach(btn => btn.disabled = true);
  if (index === reflection.answer) {
    button.style.background = "#e5f6f2";
    button.style.borderColor = "#0f766e";
    els.reflectionFeedback.textContent = `答對了！${reflection.explain}`;
    els.reflectionFeedback.style.color = "#0f766e";
    playTone(900);
  } else {
    button.style.background = "#fff0f0";
    button.style.borderColor = "#d94d4d";
    els.reflectionFeedback.textContent = `再想一下。${reflection.explain}`;
    els.reflectionFeedback.style.color = "#b43d3d";
    playTone(190);
  }
}

function nextLevel() {
  if (state.levelIndex < state.levels.length - 1) {
    state.levelIndex += 1;
    renderLevel();
    showSection("lab");
  } else {
    els.resultIcon.textContent = "🏆";
    els.resultTitle.textContent = "全部任務完成！";
    els.resultMessage.textContent = "你已能正確使用天平、量筒與排水法測量不規則物體的密度。";
    els.nextLevelBtn.style.display = "none";
  }
}

function restartAll() {
  state.levelIndex = 0;
  els.nextLevelBtn.style.display = "";
  renderLevel();
  showSection("home");
}

function updateActionButtons() {
  const map = {
    tare: state.selected && !state.tared,
    weigh: state.tared && !state.weighed,
    water: state.weighed && !state.waterReady,
    immerse: state.waterReady && !state.immersed,
    "remove-bubble": state.bubblePresent && !state.bubbleRemoved
  };
  $$("#toolActions button").forEach(btn => btn.disabled = !map[btn.dataset.action]);
}

function setInstruction(instruction, hint) {
  els.instructionText.textContent = instruction;
  els.hintText.textContent = hint;
}

function setStep(step) {
  state.step = step;
  els.progressLabel.textContent = `步驟 ${step} / 6`;
  els.progressBar.style.width = `${step / 6 * 100}%`;
}

function penalty(points) {
  state.score = Math.max(0, state.score - points);
  els.score.textContent = state.score;
}

function need(message) {
  showToast(message);
  playTone(170);
}

function near(a,b,tolerance) {
  return Math.abs(a-b) <= tolerance;
}

function formatNumber(value) {
  return Number(value).toFixed(2).replace(/\.?0+$/,"");
}

function shake(element) {
  element.classList.remove("shake");
  void element.offsetWidth;
  element.classList.add("shake");
}

function flash(element) {
  element.classList.remove("correct-flash");
  void element.offsetWidth;
  element.classList.add("correct-flash");
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2400);
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("densityLabSettings") || "{}");
    state.settings = {...state.settings, ...saved};
  } catch {}
  els.showHintsSetting.checked = state.settings.showHints;
  els.autoFillSetting.checked = state.settings.autoFill;
  els.bubbleSetting.checked = state.settings.bubbleEnabled;
  els.challengeSetting.checked = state.settings.challenge;
  applySettingsClasses();
}

function saveSettings(event) {
  event.preventDefault();
  state.settings = {
    showHints: els.showHintsSetting.checked,
    autoFill: els.autoFillSetting.checked,
    bubbleEnabled: els.bubbleSetting.checked,
    challenge: els.challengeSetting.checked
  };
  localStorage.setItem("densityLabSettings", JSON.stringify(state.settings));
  applySettingsClasses();
  els.teacherDialog.close();
  showToast("教師設定已套用");
  renderLevel();
}

function applySettingsClasses() {
  document.body.classList.toggle("no-hints", !state.settings.showHints);
  document.body.classList.toggle("challenge", state.settings.challenge);
}

function saveProgress() {
  const level = currentLevel();
  const record = {
    date: new Date().toISOString(),
    level: state.levelIndex + 1,
    object: level.objectName,
    material: level.material,
    mass: level.mass,
    volume: level.volume,
    density: Number((level.mass / level.volume).toFixed(2)),
    score: state.score
  };
  const history = JSON.parse(localStorage.getItem("densityLabHistory") || "[]");
  history.push(record);
  localStorage.setItem("densityLabHistory", JSON.stringify(history.slice(-50)));
}

function downloadReport() {
  const level = currentLevel();
  const report = {
    教材: "密度偵探社：不規則物體密度測量",
    日期: new Date().toLocaleString("zh-TW"),
    關卡: level.title,
    待測物: level.objectName,
    物體質量_g: level.mass,
    原始水量_mL: level.initialWater,
    放入後水量_mL: level.initialWater + level.volume,
    物體體積_cm3: level.volume,
    密度_g_cm3: Number((level.mass / level.volume).toFixed(2)),
    推測材料: level.material,
    得分: state.score
  };
  const blob = new Blob([JSON.stringify(report,null,2)],{type:"application/json;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `密度實驗紀錄-${level.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  els.soundBtn.setAttribute("aria-pressed", String(soundEnabled));
  els.soundBtn.textContent = soundEnabled ? "🔊 音效" : "🔇 靜音";
  if (soundEnabled) playTone(700);
}

function playTone(freq, duration = 0.08) {
  if (!soundEnabled) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

init();
