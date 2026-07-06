// =============================================================
// STATE
// =============================================================
let currentWeek = 1;
let currentDay = 0; // 0=Sat … 6=Fri
let trackerState = {}; // "W1_D0_groupIdx_pillId" : true/false

// =============================================================
// STATIC DATA
// =============================================================
const supplements = {
  "01": { name: "NAC 600mg", brand: "NOW Foods", dose: "600mg (كبسولة)", target: "يكسر بيوفيلم الكانديدا + يحمي الكبد من سموم die-off" },
  "02": { name: "Milk Thistle 300mg", brand: "NOW Foods", dose: "300mg (كبسولة)", target: "يحمي خلايا الكبد من سموم الكانديدا الميتة" },
  "03": { name: "Candida Support", brand: "NOW Foods", dose: "كبسولتان", target: "أوريغانو + كابريليك + باو داركو + جوز أسود" },
  "04": { name: "Berberine 500mg", brand: "Thorne", dose: "500mg (كبسولة)", target: "يستهدف الكانديدا المقاومة + ينظم السكر" },
  "06": { name: "S. Boulardii + MOS", brand: "Jarrow", dose: "5B CFU (كبسولة)", target: "يزاحم الكانديدا + يرفع sIgA المنخفض" },
  "07": { name: "Probiotic Men's 50B", brand: "Garden of Life", dose: "50B CFU (كبسولة)", target: "يعوض Lactobacillus و Bifidobacterium المنهارة" },
  "08": { name: "L-Glutamine Powder", brand: "NOW Foods", dose: "5g (ملعقة صغيرة)", target: "يرمم Leaky Gut — يستهدف Zonulin 210" },
  "09": { name: "PepZin GI — Zinc Carnosine", brand: "Doctor's Best", dose: "كبسولتان", target: "يقلل تلف جدار الأمعاء 75% — Calprotectin + Zonulin" },
  "10": { name: "Colostrum 30% IgG", brand: "Healths Harmony", dose: "كبسولتان", target: "يخفض Zonulin ويرفع sIgA — يرمم الأمعاء والمناعة" },
  "11": { name: "Cranberry Caps", brand: "NOW Foods", dose: "كبسولتان", target: "يعيد Akkermansia المنهارة (6 فقط!) من 2% إلى 30%+" }
};

const dietGuide = {
  allowed: [
    "اللحوم الحمراء والدواجن الطازجة والأسماك والبيض",
    "الخضروات غير النشوية: خيار، بروكلي، سبانخ، كوسا، خس",
    "الثوم الطازج يومياً (اسحق وانتظر 5 دقائق لتفعيل الأليسين)",
    "المكسرات: فستق ولوز بحرص",
    "زيت جوز الهند (مضاد فطري طبيعي) وزيت الزيتون البكر",
    "التوت البري والرمان (يحفزان Akkermansia)",
    "الأجبان الصفراء والزبادي اليوناني بدون سكر"
  ],
  forbidden: [
    "السكريات بكل أشكالها: عسل، تمر، فواكه حلوة، عصائر",
    "الدقيق الأبيض المكرر: خبز، معجنات، أرز أبيض",
    "المشروبات المحلاة والغازية والعصائر الجاهزة",
    "الخميرة: خبز تجاري وكل منتجات الخميرة النشطة",
    "البطاطس بكميات كبيرة والذرة والقمح المكرر",
    "الحليب البقري الكامل والآيس كريم والحلويات",
    "الأجبان المصنعة والأطعمة المعلبة ذات السكريات المخفية"
  ]
};

const daysNames = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];

// =============================================================
// SCHEDULE DATA PER STAGE
// =============================================================
function getSchedule(week) {
  if (week <= 2) {
    return [
      { time: "14:30 — الوجبة الأولى", pills: [{ id:"01", note:"مع أول لقمة" }, { id:"02", note:"مع أول لقمة" }] },
      { time: "01:00 ص — بعد الوجبة الثانية", pills: [{ id:"01", note:"مع وجبة خفيفة" }, { id:"02", note:"مع وجبة خفيفة" }] }
    ];
  } else if (week <= 8) {
    return [
      { time: "14:30 — الوجبة الأولى",      pills: [{ id:"01", note:"كبسولة" }, { id:"02", note:"كبسولة" }, { id:"03", note:"كبسولتان" }] },
      { time: "18:00 — منتصف اليقظة",        pills: [{ id:"04", note:"كبسولة مع ماء" }] },
      { time: "20:00 — بين الوجبتين",        pills: [{ id:"06", note:"بعيداً عن المضادات بساعتين" }] },
      { time: "23:00 — الوجبة الثانية",      pills: [{ id:"03", note:"كبسولتان" }, { id:"04", note:"كبسولة" }] },
      { time: "01:00 ص — بعد الوجبة",        pills: [{ id:"01", note:"مع وجبة خفيفة" }, { id:"02", note:"مع وجبة خفيفة" }] },
      { time: "06:00 ص — قبل النوم",         pills: [{ id:"04", note:"كبسولة" }, { id:"07", note:"بعد المضادات بـ 4 ساعات" }, { id:"06", note:"كبسولة" }] }
    ];
  } else {
    return [
      { time: "14:00 — عند الاستيقاظ",      pills: [{ id:"10", note:"كبسولتان — معدة فارغة" }, { id:"08", note:"5g في ماء بارد — معدة فارغة" }] },
      { time: "14:30 — الوجبة الأولى",      pills: [{ id:"01", note:"كبسولة" }, { id:"02", note:"كبسولة" }, { id:"11", note:"كبسولتان" }] },
      { time: "18:00 — منتصف اليقظة",        pills: [{ id:"06", note:"بين الوجبات" }, { id:"09", note:"كبسولتان مع الطعام" }] },
      { time: "23:00 — الوجبة الثانية",      pills: [{ id:"01", note:"كبسولة" }, { id:"02", note:"كبسولة" }, { id:"11", note:"كبسولتان" }] },
      { time: "06:00 ص — قبل النوم",         pills: [{ id:"07", note:"معدة فارغة" }, { id:"08", note:"5g في ماء بارد" }, { id:"10", note:"كبسولتان — معدة فارغة" }] }
    ];
  }
}

function getStageInfo(week) {
  if (week <= 2) return { id:1, label:"المرحلة 1", title:"تجهيز الجسم", duration:"أسبوع 1–2", cls:"stage-1",
    desc:"ابدأ هؤلاء فوراً. مكملا هذه المرحلة (NAC + Milk Thistle) يستمران طوال 16 أسبوعاً لحماية الكبد وكسر بيوفيلم الكانديدا." };
  if (week <= 8) return { id:2, label:"المرحلة 2", title:"الضربة الفطرية", duration:"أسبوع 3–8", cls:"stage-2",
    desc:"الضربة القاضية للفطريات. استمر بمكملات حماية الكبد. اشرب كميات كافية من الماء لتقليل أعراض التخلص من السموم." };
  return { id:3, label:"المرحلة 3", title:"إعادة البناء", duration:"أسبوع 9–16", cls:"stage-3",
    desc:"أوقف مكملات الضربة الفطرية. ركز على ترميم Leaky Gut وإعادة بناء البكتيريا النافعة (Lactobacillus, Bifidobacterium, Akkermansia)." };
}

// =============================================================
// STORAGE
// =============================================================
function save() {
  localStorage.setItem("ct_state",  JSON.stringify(trackerState));
  localStorage.setItem("ct_week",   String(currentWeek));
  localStorage.setItem("ct_day",    String(currentDay));
  localStorage.setItem("ct_theme",  document.body.className);
}

function load() {
  try { trackerState = JSON.parse(localStorage.getItem("ct_state") || "{}"); } catch(e) { trackerState = {}; }
  currentWeek = parseInt(localStorage.getItem("ct_week") || "1", 10);
  currentDay  = parseInt(localStorage.getItem("ct_day")  || "0", 10);
  const theme = localStorage.getItem("ct_theme") || "light-theme";
  document.body.className = theme;
}

// =============================================================
// PROGRESS HELPERS
// =============================================================
function getDayProgress(week, day) {
  const schedule = getSchedule(week);
  let total = 0, done = 0;
  schedule.forEach((g, gi) => {
    g.pills.forEach(p => {
      total++;
      if (trackerState[`W${week}_D${day}_${gi}_${p.id}`]) done++;
    });
  });
  return { total, done };
}

function isDayComplete(week, day) {
  const { total, done } = getDayProgress(week, day);
  return total > 0 && done === total;
}

function getGlobalProgress() {
  let total = 0, done = 0;
  for (let w = 1; w <= 16; w++) {
    for (let d = 0; d < 7; d++) {
      const p = getDayProgress(w, d);
      total += p.total;
      done  += p.done;
    }
  }
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

// =============================================================
// RENDER: GLOBAL PROGRESS BAR
// =============================================================
function renderGlobalProgress() {
  const pct = getGlobalProgress();
  document.getElementById("globalProgressPercent").textContent = pct + "%";
  document.getElementById("globalProgressBar").style.width = pct + "%";
}

// =============================================================
// RENDER: WEEKS GRID
// =============================================================
function renderWeeksGrid() {
  const grid = document.getElementById("weeksGrid");
  grid.innerHTML = "";
  for (let w = 1; w <= 16; w++) {
    const btn = document.createElement("button");
    btn.className = "week-btn" + (w === currentWeek ? " active" : "");
    // Check if all 7 days done
    const allDone = Array.from({length:7}, (_,d) => isDayComplete(w,d)).every(Boolean);
    if (allDone) btn.classList.add("completed");
    btn.textContent = w;
    btn.onclick = () => selectWeek(w);
    grid.appendChild(btn);
  }
}

// =============================================================
// RENDER: STAGE INFO
// =============================================================
function renderStageInfo() {
  const s = getStageInfo(currentWeek);
  const card = document.querySelector(".stage-info-card");
  card.className = `card stage-info-card ${s.cls}`;
  document.getElementById("stageBadge").textContent    = s.label;
  document.getElementById("stageTitle").textContent    = s.title;
  document.getElementById("stageDuration").textContent = s.duration;
  document.getElementById("stageDescription").textContent = s.desc;
}

// =============================================================
// RENDER: DAYS ROW
// =============================================================
function renderDaysRow() {
  const row = document.getElementById("daysRow");
  // Clear existing listeners by replacing innerHTML
  row.innerHTML = "";
  daysNames.forEach((name, idx) => {
    const btn = document.createElement("button");
    btn.className = "day-btn" + (idx === currentDay ? " active" : "");
    if (isDayComplete(currentWeek, idx)) btn.classList.add("day-done");
    btn.textContent = name + (isDayComplete(currentWeek, idx) ? " ✓" : "");
    btn.onclick = () => selectDay(idx);
    row.appendChild(btn);
  });
  document.getElementById("currentDayIndicator").textContent =
    `اليوم الحالي: ${daysNames[currentDay]}`;
}

// =============================================================
// RENDER: CHECKLIST
// =============================================================
function renderChecklist() {
  const container = document.getElementById("scheduleGroups");
  container.innerHTML = "";

  const schedule = getSchedule(currentWeek);
  let totalAll = 0, doneAll = 0;

  schedule.forEach((group, gi) => {
    // Group wrapper
    const groupEl = document.createElement("div");
    groupEl.className = "schedule-group";

    // Time header
    const timeEl = document.createElement("div");
    timeEl.className = "schedule-time";
    timeEl.textContent = group.time;
    groupEl.appendChild(timeEl);

    const itemsEl = document.createElement("div");
    itemsEl.className = "schedule-items";

    group.pills.forEach(pill => {
      totalAll++;
      const key = `W${currentWeek}_D${currentDay}_${gi}_${pill.id}`;
      const checked = !!trackerState[key];
      if (checked) doneAll++;

      const supp = supplements[pill.id];

      // Build item
      const item = document.createElement("div");
      item.className = "checklist-item" + (checked ? " checked" : "");
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");

      item.innerHTML = `
        <div class="check-icon">${checked ? "✓" : ""}</div>
        <div class="checklist-details">
          <div class="pill-name">${supp.name}
            <span class="pill-brand">${supp.brand}</span>
          </div>
          <div class="pill-meta">
            <span class="pill-dose">💊 ${supp.dose}</span>
            <span class="pill-note">⏰ ${pill.note}</span>
          </div>
          <div class="pill-target-text">${supp.target}</div>
        </div>
      `;

      // Toggle on click/tap anywhere on the item
      const toggle = () => {
        const nowChecked = !trackerState[key];
        trackerState[key] = nowChecked;

        item.classList.toggle("checked", nowChecked);
        item.querySelector(".check-icon").textContent = nowChecked ? "✓" : "";

        save();
        refreshProgressBars();
        renderDaysRow();
        renderWeeksGrid();
        renderGlobalProgress();

        // Check if day is now complete → auto advance
        if (isDayComplete(currentWeek, currentDay)) {
          showDayCompleteToast();
          // Auto advance after 1.5s
          setTimeout(() => {
            const nextDay = currentDay + 1;
            if (nextDay < 7) {
              selectDay(nextDay);
            } else {
              // End of week — optionally move to next week
              const nextWeek = currentWeek + 1;
              if (nextWeek <= 16) {
                selectWeek(nextWeek);
                selectDay(0);
              }
            }
          }, 1500);
        }
      };

      item.addEventListener("click",   toggle);
      item.addEventListener("keydown", e => { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggle(); }});

      itemsEl.appendChild(item);
    });

    groupEl.appendChild(itemsEl);
    container.appendChild(groupEl);
  });

  updateDayProgressBar(doneAll, totalAll);
}

// =============================================================
// PROGRESS BARS
// =============================================================
function refreshProgressBars() {
  const { done, total } = getDayProgress(currentWeek, currentDay);
  updateDayProgressBar(done, total);
}

function updateDayProgressBar(done, total) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById("dayProgressBar").style.width    = pct + "%";
  document.getElementById("dayProgressPercent").textContent = pct + "%";
}

// =============================================================
// TOAST NOTIFICATION
// =============================================================
function showDayCompleteToast() {
  // Avoid duplicates
  if (document.getElementById("dayCompleteToast")) return;

  const toast = document.createElement("div");
  toast.id = "dayCompleteToast";
  toast.className = "toast-complete";
  toast.innerHTML = `<span>🎉 أحسنت! يوم مكتمل — الانتقال لليوم التالي...</span>`;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2000);
}

// =============================================================
// SELECT WEEK / DAY
// =============================================================
function selectWeek(w) {
  currentWeek = w;
  save();
  renderWeeksGrid();
  renderStageInfo();
  renderDaysRow();
  renderChecklist();
  renderGlobalProgress();
}

function selectDay(d) {
  currentDay = d;
  save();
  renderDaysRow();
  renderChecklist();
}

// =============================================================
// DIET GUIDE
// =============================================================
function renderDietGuide() {
  const al = document.getElementById("allowedDietList");
  const fb = document.getElementById("forbiddenDietList");
  al.innerHTML = "";
  fb.innerHTML = "";

  dietGuide.allowed.forEach(item => {
    const li = document.createElement("li");
    li.className = "diet-item";
    li.textContent = item;
    al.appendChild(li);
  });
  dietGuide.forbidden.forEach(item => {
    const li = document.createElement("li");
    li.className = "diet-item";
    li.textContent = item;
    fb.appendChild(li);
  });
}

function filterDiet(e) {
  const q = e.target.value.toLowerCase().trim();
  document.querySelectorAll(".diet-item").forEach(el => {
    if (!q) {
      el.classList.remove("hidden","highlight");
    } else if (el.textContent.toLowerCase().includes(q)) {
      el.classList.remove("hidden");
      el.classList.add("highlight");
    } else {
      el.classList.add("hidden");
      el.classList.remove("highlight");
    }
  });
}

// =============================================================
// SUPPLEMENT DIRECTORY
// =============================================================
function renderSupplementsDirectory() {
  const grid = document.getElementById("supplementsGrid");
  grid.innerHTML = "";
  Object.values(supplements).forEach((s, i) => {
    const card = document.createElement("div");
    card.className = "supplement-card";
    card.innerHTML = `
      <div class="supp-card-header">
        <h3>${s.name}</h3>
        <span class="supp-num">#${String(i+1).padStart(2,"0")}</span>
      </div>
      <ul class="supp-details-list">
        <li><span class="label">الشركة</span><span class="value">${s.brand}</span></li>
        <li><span class="label">الجرعة</span><span class="value">${s.dose}</span></li>
        <li><span class="label">طريقة التناول</span><span class="value">${s.timing || "—"}</span></li>
      </ul>
      <div class="supp-card-target"><strong>الهدف العلاجي:</strong><br>${s.target}</div>
    `;
    grid.appendChild(card);
  });
}

// =============================================================
// THEME
// =============================================================
function toggleTheme() {
  document.body.className = document.body.classList.contains("light-theme") ? "dark-theme" : "light-theme";
  save();
}

// =============================================================
// INIT
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
  load();

  document.getElementById("themeToggleBtn").addEventListener("click", toggleTheme);
  document.getElementById("dietSearchInput").addEventListener("input",  filterDiet);

  renderWeeksGrid();
  renderStageInfo();
  renderDaysRow();
  renderChecklist();
  renderDietGuide();
  renderSupplementsDirectory();
  renderGlobalProgress();
});
