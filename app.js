// =============================================================
// STATE
// =============================================================
let currentWeek = 1;
let currentDay = 0; // 0=Sat … 6=Fri
let trackerState = {}; // "W1_D0_groupIdx_pillId" : true/false
let activeTab = "tracker";
let groceryState = {}; // "g_item_id" : true/false

// =============================================================
// STATIC DATA
// =============================================================
const supplements = {
  "01": { name: "NAC 600mg", brand: "NOW Foods", dose: "600mg (كبسولة)", target: "يكسر بيوفيلم الكانديدا + يحمي الكبد من سموم die-off", timing: "مرتان يومياً مع الوجبتين (01:00 م و 08:30 م)" },
  "02": { name: "Milk Thistle 300mg", brand: "NOW Foods", dose: "300mg (كبسولة)", target: "يحمي خلايا الكبد من سموم الكانديدا الميتة", timing: "مرتان يومياً مع الوجبتين (01:00 م و 08:30 م)" },
  "03": { name: "Candida Support", brand: "NOW Foods", dose: "كبسولتان", target: "أوريغانو + كابريليك + باو داركو + جوز أسود", timing: "مع الوجبة الأولى (01:00 م) والوجبة الثانية (08:30 م) مع الطعام دائماً" },
  "04": { name: "Berberine 500mg", brand: "Thorne", dose: "500mg (كبسولة)", target: "يستهدف الكانديدا المقاومة + ينظم السكر", timing: "3 مرات: مع الوجبتين (01:00 م و 08:30 م) وجرعة منتصف اليوم (05:00 م)" },
  "06": { name: "S. Boulardii + MOS", brand: "Jarrow", dose: "5B CFU (كبسولة)", target: "يزاحم الكانديدا + يرفع sIgA المنخفض", timing: "منتصف اليوم (05:00 م) وقبل النوم (01:30 ص) — بعيداً عن المضادات الفطرية" },
  "07": { name: "Probiotic Men's 50B", brand: "Garden of Life", dose: "50B CFU (كبسولة)", target: "يعوض Lactobacillus و Bifidobacterium المنهارة", timing: "قبل النوم مباشرة (01:30 ص) على معدة فارغة — بعد المضادات بـ 5 ساعات لاستعمار مثالي" },
  "08": { name: "L-Glutamine Powder", brand: "NOW Foods", dose: "5g (ملعقة صغيرة)", target: "يرمم Leaky Gut — يستهدف Zonulin 210", timing: "عند الاستيقاظ (12:00 م) وقبل النوم (01:30 ص) على معدة فارغة مع ماء بارد" },
  "09": { name: "PepZin GI — Zinc Carnosine", brand: "Doctor's Best", dose: "كبسولتان", target: "يقلل تلف جدار الأمعاء 75% — Calprotectin + Zonulin", timing: "منتصف اليوم (05:00 م) مع سناك خفيف" },
  "10": { name: "Colostrum 30% IgG", brand: "Healths Harmony", dose: "كبسولتان", target: "يخفض Zonulin ويرفع sIgA — يرمم الأمعاء والمناعة", timing: "عند الاستيقاظ (12:00 م) وقبل النوم (01:30 ص) على معدة فارغة" },
  "11": { name: "Cranberry Caps", brand: "NOW Foods", dose: "كبسولتان", target: "يعيد Akkermansia المنهارة (6 فقط!) من 2% إلى 30%+", timing: "مع الوجبة الأولى (01:00 م) والوجبة الثانية (08:30 م)" }
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
// SCHEDULE DATA PER STAGE (معدّل وفق نظام النوم الجديد)
// =============================================================
function getSchedule(week) {
  if (week <= 2) {
    return [
      { time: "01:00 م — الوجبة الأولى (الغداء)", pills: [{ id:"01", note:"مع أول لقمة — تفكيك البيوفيلم" }, { id:"02", note:"مع أول لقمة — حماية الكبد" }] },
      { time: "08:30 م — الوجبة الثانية (العشاء)", pills: [{ id:"01", note:"مع الوجبة — حماية الكبد" }, { id:"02", note:"مع الوجبة — حماية الكبد" }] }
    ];
  } else if (week <= 8) {
    return [
      { time: "01:00 م — الوجبة الأولى (الغداء)",      pills: [{ id:"01", note:"كبسولة — تفكيك البيوفيلم وحماية الكبد" }, { id:"02", note:"كبسولة — حماية خلايا الكبد" }, { id:"03", note:"كبسولتان — مع الطعام دائماً" }, { id:"04", note:"كبسولة — مع الطعام" }] },
      { time: "05:00 م — منتصف اليقظة (سناك خفيف)",    pills: [{ id:"04", note:"كبسولة مع ماء" }, { id:"06", note:"كبسولة — بعيداً عن المضادات الفطرية بساعتين+" }] },
      { time: "08:30 م — الوجبة الثانية (العشاء)",      pills: [{ id:"03", note:"كبسولتان — مع الطعام" }, { id:"04", note:"كبسولة — مع الطعام" }, { id:"01", note:"كبسولة — حماية الكبد من Die-Off" }, { id:"02", note:"كبسولة — حماية خلايا الكبد" }] },
      { time: "01:30 ص — قبل النوم (معدة فارغة)",         pills: [{ id:"07", note:"كبسولة — بعد المضادات بـ 5 ساعات (استعمار ليلي هادئ)" }, { id:"06", note:"كبسولة — تدعيم مناعة الأمعاء sIgA" }] }
    ];
  } else {
    return [
      { time: "12:00 م — عند الاستيقاظ (معدة فارغة)",  pills: [{ id:"10", note:"كبسولتان — معدة فارغة قبل الأكل بساعة" }, { id:"08", note:"5g في ماء بارد — معدة فارغة قبل الأكل بساعة" }] },
      { time: "01:00 م — الوجبة الأولى (الغداء)",      pills: [{ id:"01", note:"كبسولة — صيانة الكبد" }, { id:"02", note:"كبسولة — صيانة الكبد" }, { id:"11", note:"كبسولتان — تغذية بكتيريا Akkermansia" }] },
      { time: "05:00 م — منتصف اليقظة (بين الوجبتين)",    pills: [{ id:"06", note:"كبسولة — حماية الأمعاء" }, { id:"09", note:"كبسولتان — التئام بطانة الأمعاء" }] },
      { time: "08:30 م — الوجبة الثانية (العشاء)",      pills: [{ id:"01", note:"كبسولة — صيانة الكبد" }, { id:"02", note:"كبسولة — صيانة الكبد" }, { id:"11", note:"كبسولتان — تغذية بكتيريا Akkermansia" }] },
      { time: "01:30 ص — قبل النوم (معدة فارغة)",         pills: [{ id:"07", note:"كبسولة — استعمار ليلي 50B CFU" }, { id:"08", note:"5g في ماء بارد — ترميم ليلي للأمعاء" }, { id:"10", note:"كبسولتان — كبح الزونولين وترميم الأغشية" }] }
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
  localStorage.setItem("ct_tab",    activeTab);
  localStorage.setItem("ct_grocery", JSON.stringify(groceryState));
}

function load() {
  try { trackerState = JSON.parse(localStorage.getItem("ct_state") || "{}"); } catch(e) { trackerState = {}; }
  currentWeek = parseInt(localStorage.getItem("ct_week") || "1", 10);
  currentDay  = parseInt(localStorage.getItem("ct_day")  || "0", 10);
  const theme = localStorage.getItem("ct_theme") || "light-theme";
  document.body.className = theme;
  activeTab = localStorage.getItem("ct_tab") || "tracker";
  try { groceryState = JSON.parse(localStorage.getItem("ct_grocery") || "{}"); } catch(e) { groceryState = {}; }
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
// LOW FODMAP DATABASE & LOGIC
// =============================================================
const fodmapCategories = [
  { id: "all", label: "الكل", icon: "🍽️" },
  { id: "meals", label: "أكلات شعبية ووجبات", icon: "🍲" },
  { id: "vegetables", label: "الخضروات", icon: "🥬" },
  { id: "fruits", label: "الفواكه", icon: "🍎" },
  { id: "grains", label: "الحبوب والنشويات", icon: "🌾" },
  { id: "protein", label: "البروتينات", icon: "🥩" },
  { id: "dairy", label: "الألبان والأجبان", icon: "🧀" },
  { id: "nuts", label: "المكسرات والبذور", icon: "🥜" },
  { id: "spices", label: "التوابل والصلصات", icon: "🧂" },
  { id: "drinks", label: "المشروبات", icon: "☕" },
  { id: "sweeteners", label: "المحليات", icon: "🍯" }
];

const fodmapDatabase = [
  // ──────────────── MEALS & POPULAR DISHES ────────────────
  { name: "شاورما دجاج منزلية (آمنة 100%)", nameEn: "Homemade Chicken Shawarma", category: "meals", level: "low", fodmapType: "—", note: "🟢 آمنة جداً؛ تُتبّل بـ (زيت زيتون، ليمون، خل، بهارات صحيحة مثل الهيل والكمون والملح والبابريكا) بدون بصل أو ثوم، وتُؤكل كصحن أو بخبز خالي غلوتين", keywords: "شاورما دجاج منزلية بيت بيتية بدون ثوم بصل" },
  { name: "برجر لحم منزلي (آمن 100%)", nameEn: "Homemade Beef Burger", category: "meals", level: "low", fodmapType: "—", note: "🟢 آمن ولذيذ؛ شريحة لحم بقري مفروم مع ملح وفلفل أسود فقط، تُشوى وتوضع في لفافة خس (Lettuce wrap) مع شريحة طماطم ومخلل خيار", keywords: "برجر همبرجر منزلي بيت بيتي خس بدون خبز" },
  { name: "ستيك لحم بقري مشوي", nameEn: "Grilled Beef Steak", category: "meals", level: "low", fodmapType: "—", note: "🟢 آمن بأي كمية؛ يُشوى بملح وفلفل أسود وزبدة (تجنب تتبيلات المطاعم الجاهزة التي تحتوي بودرة ثوم)", keywords: "ستيك لحم بقري مشوي لحمة" },
  { name: "شيش طاووق منزلي", nameEn: "Homemade Shish Tawook", category: "meals", level: "low", fodmapType: "—", note: "🟢 آمن; يُتبّل بـ (زيت زيتون، عصير ليمون، كركم، زنجبيل، بابريكا، أوريغانو، ملح) بدون زبادي وبدون بصل أو ثوم", keywords: "شيش طاووق منزلي بيت دجاج مشوي اسياخ" },
  { name: "أرز أبيض مطهو بالزبدة", nameEn: "Plain White Rice with Butter", category: "meals", level: "low", fodmapType: "—", note: "🟢 آمن وسهل الهضم؛ أرز (بسمتي أو مصري) مطهو بماء وملح وزبدة أو سمن بلدي طبيعي", keywords: "أرز رز ابيض زبدة سمن" },
  { name: "أومليت بيض بالخضار الآمنة", nameEn: "Vegetable Omelette", category: "meals", level: "low", fodmapType: "—", note: "🟢 وجبة فطور مثالية؛ بيض مخفوق مع سبانخ طازجة، طماطم مقطعة، وفلفل رومي ألوان مطهو بالزبدة أو زيت الزيتون", keywords: "بيض اومليت امليت خضار سبانخ طماطم فطور" },
  { name: "سمك مشوي بالليمون والكزبرة", nameEn: "Grilled Fish with Lemon & Cilantro", category: "meals", level: "low", fodmapType: "—", note: "🟢 آمن وممتاز للهضم؛ يُتبّل السمك بـ (زيت، ليمون، كزبرة طازجة، كمون، ملح) ويُشوى بالفرن", keywords: "سمك مشوي ليمون كزبرة بحري هامور دنيس" },
  { name: "سلطة يونانية معدلة (بدون بصل)", nameEn: "Modified Greek Salad", category: "meals", level: "low", fodmapType: "—", note: "🟢 منعشة وآمنة؛ خيار، طماطم، زيتون أسود، جبنة فيتا، زيت زيتون، وعصير ليمون مع رشة أوريغانو (احرص على عدم إضافة بصل أحمر)", keywords: "سلطة يونانية فيتا خيار طماطم جبن" },
  { name: "أرز مقلي بالبيض والخضار (منزلي)", nameEn: "Homemade Egg Fried Rice", category: "meals", level: "low", fodmapType: "—", note: "🟢 وجبة متكاملة؛ أرز مطهو مسبقاً يُقلى مع بيض، جزر مبشور، الجزء الأخضر فقط من البصل الأخضر، وقليل من صويا صوص", keywords: "رز مقلي بيض خضار صيني صويا" },
  { name: "بطاطس مهروسة (خالية من اللاكتوز)", nameEn: "Lactose-free Mashed Potatoes", category: "meals", level: "low", fodmapType: "—", note: "🟢 آمنة؛ بطاطس مسلوقة تُهرس مع زبدة طبيعية وحليب خالي من اللاكتوز أو حليب اللوز، وتُملح (بدون بودرة ثوم)", keywords: "بطاطس مهروسه ماش بوتيتو زبدة" },
  { name: "تونة بالخيار والزيتون", nameEn: "Tuna Salad (simple)", category: "meals", level: "low", fodmapType: "—", note: "🟢 خيار سريع وآمن؛ علبة تونة مصفاة تُخلط مع خيار مقطع، زيتون، زيت زيتون، وعصير ليمون (تجنب المايونيز التجاري والذرة)", keywords: "تونة سلطة خيار زيتون علب" },
  { name: "شوربة دجاج منزلية صافية", nameEn: "Clear Homemade Chicken Soup", category: "meals", level: "low", fodmapType: "—", note: "🟢 دافئة ومريحة؛ تُطهى قطع الدجاج مع جزر وكوسا وملح وفلفل أسود (تجنب وضع بصل أو ثوم أو مكعبات مرقة ماجي)", keywords: "شوربة دجاج مرقة مرق كوسا جزر" },
  { name: "كباب لحم منزلي (بدون بصل)", nameEn: "Homemade Beef Kebab (no onion)", category: "meals", level: "low", fodmapType: "—", note: "🟢 آمن؛ لحم مفروم يُعجن مع بقدونس مفروم، ملح، فلفل أسود، وكمون، ويُشوى بالفرن أو على الصاج", keywords: "كباب لحم مفروم منزلي بدون بصل" },
  { name: "شاورما دجاج (بالخبز والثومية)", nameEn: "Traditional Chicken Shawarma", category: "meals", level: "high", fodmapType: "فركتانز / غلوتين / لاكتوز", note: "⛔ عالية جداً بسبب الخبز الأبيض والصلصة بالثوم وتتبيلة الدجاج بالبصل والثوم", keywords: "شاورما عيش ثوم ثومية تومية خبز صاج" },
  { name: "شاورما دجاج (صحن بدون خبز وثومية)", nameEn: "Chicken Shawarma Plate (no bread/garlic)", category: "meals", level: "low", fodmapType: "—", note: "🟢 آمنة إذا تم طهي الدجاج بتتبيلة خالية من البصل والثوم، وتؤكل بالشوكة أو بخبز خالي من الغلوتين وبدون تومية", keywords: "شاورما صحن دجاج عربي بدون ثوم" },
  { name: "برجر لحم بالجبن والبصل (تقليدي)", nameEn: "Traditional Cheeseburger", category: "meals", level: "high", fodmapType: "فركتانز / غلوتين / لاكتوز", note: "⛔ عالي بسبب خبز البرجر الأبيض (غلوتين)، البصل النيء أو المقلي، وصلصة الكاتشب أو المايونيز بالثوم", keywords: "برجر همبرجر بصل جبن خبز صوص" },
  { name: "برجر لحم (بدون خبز وبصل)", nameEn: "Beef Burger (no bun/onion)", category: "meals", level: "low", fodmapType: "—", note: "🟢 آمن إذا كانت شريحة اللحم نقية (ملح وفلفل فقط) وتؤكل ملفوفة بالخس (Lettuce wrap) وبدون جبن عادي أو بصل", keywords: "برجر خس دايت رجيم بدون خبز" },
  { name: "كبسة تقليدية (بالبصل والثوم)", nameEn: "Traditional Kabsa", category: "meals", level: "high", fodmapType: "فركتانز", note: "⛔ عالية جداً بسبب كميات البصل والثوم الكبيرة المطهوة مع الأرز والدجاج/اللحم", keywords: "كبسة رز لحم دجاج كبسه" },
  { name: "كبسة (بزيت مصفى وبدون بصل)", nameEn: "Kabsa (onion-infused oil style)", category: "meals", level: "low", fodmapType: "—", note: "🟢 آمنة إذا طهيت بزيت مشبع بنكهة البصل (تصفية الزيت تماماً من قطع البصل قبل طبخ الرز) وبدون إضافة ثوم", keywords: "كبسة كبسه زيت مصفى رز" },
  { name: "بيتزا (تقليدية)", nameEn: "Traditional Pizza", category: "meals", level: "high", fodmapType: "فركتانز / غلوتين / لاكتوز", note: "⛔ عالية جداً بسبب عجينة القمح وصلصة الطماطم الغنية بالبصل والثوم وجبن الموزاريلا عالي الفودماب", keywords: "بيتزا بيزا معجنات صلصة" },
  { name: "بطاطس مقلية (فرنش فرايز)", nameEn: "French Fries", category: "meals", level: "low", fodmapType: "—", note: "🟢 آمنة إذا كانت مقلية بزيت نظيف ومتبلة بالملح فقط (تجنب بهارات البطاطس الجاهزة التي تحتوي بودرة بصل وثوم)", keywords: "بطاطس مقلية بطاطا فرايز شيبس" },
  { name: "فلافل / طعمية", nameEn: "Falafel", category: "meals", level: "high", fodmapType: "GOS / فركتانز", note: "⛔ عالية جداً بسبب عجينة الحمص/الفول المفرومة مع كميات كبيرة من الثوم والبصل والكرات", keywords: "فلافل طعمية حمص فول مقلي" },
  { name: "حمص بطحينة", nameEn: "Hummus", category: "meals", level: "high", fodmapType: "GOS / فركتانز / مانيتول", note: "⛔ عالي الفودماب بسبب الحمص والثوم (يمكن تحمل ملعقة طعام واحدة فقط كحد أقصى)", keywords: "حمص طحينة مقبلات" },
  { name: "متبل باذنجان / بابا غنوج", nameEn: "Mutabbal / Baba Ganoush", category: "meals", level: "moderate", fodmapType: "فركتانز", note: "⚠️ معتدل الفودماب؛ الباذنجان والطحينة آمنان لكن المتبل الجاهز يحتوي عادة على ثوم مفروم", keywords: "متبل بابا غنوج باذنجان مقبلات" },
  { name: "جريش شعبي", nameEn: "Saudi Jareesh", category: "meals", level: "high", fodmapType: "فركتانز / لاكتوز", note: "⛔ عالي جداً بسبب قمح الجريش (غلوتين وفركتانز)، اللبن البقري، والوقود بالبصل والسمن فوق الجريش", keywords: "جريش كشنة لبن قمح شعبي" },
  { name: "سليق بالدجاج", nameEn: "Saudi Saleeg", category: "meals", level: "high", fodmapType: "لاكتوز / فركتانز", note: "⛔ عالي جداً بسبب طبخ الأرز مع الحليب البقري الكامل، وسلق الدجاج بالبصل والثوم", keywords: "سليق حليب رز دجاج" },
  { name: "شوربة شوفان باللحم (بدون بصل)", nameEn: "Oat Soup (no onion/garlic)", category: "meals", level: "low", fodmapType: "—", note: "🟢 آمنة إذا طهيت بمرقة لحم صافية ومتبلة ببهارات صحيحة وبدون بصل أو ثوم أو بهارات جاهزة", keywords: "شوربة شوفان كويكر لحم" },
  { name: "مطبق باللحم والكرات", nameEn: "Mutabbaq", category: "meals", level: "high", fodmapType: "فركتانز / غلوتين", note: "⛔ عالي جداً بسبب عجينة الدقيق وحشوة الكراث والبصل الأخضر بكميات كبيرة", keywords: "مطبق لحم كرات كراث عجين مقلي" },
  { name: "سمبوسة لحم أو جبن (جاهزة)", nameEn: "Samosa", category: "meals", level: "high", fodmapType: "فركتانز / غلوتين", note: "⛔ عالية جداً بسبب عجينة الدقيق وحشوة اللحم المليئة بالبصل المفروم أو الأجبان عالية اللاكتوز", keywords: "سمبوسة سمبوسه لحم جبن مقلي" },
  { name: "سوشي", nameEn: "Sushi", category: "meals", level: "low", fodmapType: "—", note: "🟢 آمن إذا صنع من الأرز، الأعشاب البحرية، السمك النيء، والخيار (تجنب الصلصات الحارة أو المايونيز بالثوم)", keywords: "سوشي سمك رز ياباني" },
  { name: "شيش طاووق مطاعم", nameEn: "Shish Tawook (restaurant)", category: "meals", level: "high", fodmapType: "فركتانز / لاكتوز", note: "⛔ عالي لأن المطاعم تتبل الشيش طاووق بالزبادي ومفروم الثوم وبودرة البصل بشكل كثيف", keywords: "شيش طاووق دجاج مشوي مطعم" },
  { name: "مشويات مشكلة (مطعم)", nameEn: "Mixed Grills (restaurant)", category: "meals", level: "high", fodmapType: "فركتانز", note: "⛔ عالية لأن كباب اللحم وأوصال الدجاج تتبل بمفروم ومياه البصل والثوم لزيادة النكهة", keywords: "مشويات كباب اوصال لحم دجاج مشوي مطعم" },
  { name: "ورق عنب بالرز (يلنجي)", nameEn: "Stuffed Grape Leaves", category: "meals", level: "high", fodmapType: "فركتانز", note: "⛔ عالي الفودماب جداً لأن حشوة الأرز تطبخ بكميات كبيرة جداً من البصل المفروم والثوم والبهارات", keywords: "ورق عنب يبرق يلنجي محشي" },
  { name: "مكرونة بشاميل", nameEn: "Macaroni Bechamel", category: "meals", level: "high", fodmapType: "غلوتين / لاكتوز / فركتانز", note: "⛔ عالية جداً بسبب مكرونة القمح، الحليب في البشاميل، والبصل المفروم في اللحمة المفرومة", keywords: "مكرونة بشاميل معكرونة لحم" },
  { name: "سلطة سيزر", nameEn: "Caesar Salad", category: "meals", level: "high", fodmapType: "لاكتوز / فركتانز", note: "⛔ عالية بسبب صلصة السيزر الجاهزة (بها ثوم) وقطع الخبز المحمص العادي (كروتون)", keywords: "سلطة سيزر دجاج خبز محمص صوص" },
  { name: "مندي دجاج أو لحم", nameEn: "Mandi", category: "meals", level: "high", fodmapType: "فركتانز", note: "⛔ عالي الفودماب لأن الرز يطبخ بمرقة دسمة بالبصل المحروق والثوم الكامل وتتبيلة اللحم بالبصل", keywords: "مندي رز لحم دجاج شعبي" },
  { name: "شاورما لحم (بالخبز والصلصات)", nameEn: "Traditional Beef Shawarma", category: "meals", level: "high", fodmapType: "فركتانز / غلوتين / لاكتوز", note: "⛔ عالية بسبب خبز القمح، البصل المفروم مع البقدونس، وتتبيلة اللحم بالبصل والثوم", keywords: "شاورما لحم خبز طحينة صوص" },

  // ──────────────── VEGETABLES ────────────────
  { name: "خيار", nameEn: "Cucumber", category: "vegetables", level: "low", fodmapType: "—", note: "آمن بأي كمية", keywords: "خيار كوكمبر سلطة" },
  { name: "جزر", nameEn: "Carrot", category: "vegetables", level: "low", fodmapType: "—", note: "آمن بأي كمية", keywords: "جزر كاروت" },
  { name: "طماطم", nameEn: "Tomato", category: "vegetables", level: "low", fodmapType: "—", note: "آمن — حبة واحدة كاملة", keywords: "طماطم بندورة تماطم" },
  { name: "خس", nameEn: "Lettuce", category: "vegetables", level: "low", fodmapType: "—", note: "آمن بأي كمية", keywords: "خس سلطة" },
  { name: "سبانخ", nameEn: "Spinach", category: "vegetables", level: "low", fodmapType: "—", note: "آمن بأي كمية", keywords: "سبانخ ورقيات" },
  { name: "كوسا", nameEn: "Zucchini", category: "vegetables", level: "low", fodmapType: "—", note: "آمن بأي كمية", keywords: "كوسا كوسة قرع" },
  { name: "باذنجان", nameEn: "Eggplant", category: "vegetables", level: "low", fodmapType: "—", note: "آمن — كوب واحد", keywords: "باذنجان بتنجان" },
  { name: "فلفل أخضر / ألوان", nameEn: "Bell Pepper", category: "vegetables", level: "low", fodmapType: "—", note: "آمن بأي كمية", keywords: "فلفل حلو رومي بارد" },
  { name: "بطاطس", nameEn: "Potato", category: "vegetables", level: "low", fodmapType: "—", note: "آمن — حبة متوسطة", keywords: "بطاطس بطاطا" },
  { name: "بطاطا حلوة", nameEn: "Sweet Potato", category: "vegetables", level: "moderate", fodmapType: "مانيتول", note: "⚠️ نصف كوب فقط — كمية أكبر تصبح عالية", keywords: "بطاطا حلوة" },
  { name: "فاصوليا خضراء", nameEn: "Green Beans", category: "vegetables", level: "low", fodmapType: "—", note: "آمن — أقل من 12 حبة", keywords: "فاصوليا خضراء لوبيا" },
  { name: "جرجير", nameEn: "Arugula / Rocket", category: "vegetables", level: "low", fodmapType: "—", note: "آمن بأي كمية", keywords: "جرجير روكيت" },
  { name: "ملفوف أخضر", nameEn: "Green Cabbage", category: "vegetables", level: "moderate", fodmapType: "سوربيتول", note: "⚠️ ¾ كوب فقط", keywords: "ملفوف كرنب كابتش" },
  { name: "بروكلي (الرأس)", nameEn: "Broccoli (heads)", category: "vegetables", level: "low", fodmapType: "—", note: "آمن — ¾ كوب من الرؤوس فقط", keywords: "بروكلي بركلي قرنبيط أخضر" },
  { name: "بروكلي (السيقان)", nameEn: "Broccoli (stalks)", category: "vegetables", level: "moderate", fodmapType: "فركتانز / سوربيتول", note: "⚠️ السيقان أعلى — نصف كوب فقط", keywords: "بروكلي ساق" },
  { name: "قرنبيط", nameEn: "Cauliflower", category: "vegetables", level: "high", fodmapType: "مانيتول", note: "⛔ أكثر من نصف كوب يسبب أعراض", keywords: "قرنبيط زهرة" },
  { name: "بصل", nameEn: "Onion", category: "vegetables", level: "high", fodmapType: "فركتانز", note: "⛔ من أعلى الأطعمة بالفودماب — تجنبه تماماً", keywords: "بصل بصلة" },
  { name: "ثوم", nameEn: "Garlic", category: "vegetables", level: "high", fodmapType: "فركتانز", note: "⛔ من أعلى الأطعمة بالفودماب — استبدله بزيت الثوم (الزيت آمن)", keywords: "ثوم توم" },
  { name: "زيت الثوم (Garlic-infused oil)", nameEn: "Garlic-Infused Oil", category: "vegetables", level: "low", fodmapType: "—", note: "✅ الفركتانز لا تذوب بالزيت — بديل آمن للثوم", keywords: "زيت ثوم" },
  { name: "كراث (الجزء الأخضر)", nameEn: "Leek (green part)", category: "vegetables", level: "low", fodmapType: "—", note: "الجزء الأخضر فقط — آمن", keywords: "كراث" },
  { name: "كراث (الجزء الأبيض)", nameEn: "Leek (white part)", category: "vegetables", level: "high", fodmapType: "فركتانز", note: "⛔ الجزء الأبيض عالي الفركتانز", keywords: "كراث" },
  { name: "فطر / مشروم", nameEn: "Mushroom", category: "vegetables", level: "high", fodmapType: "مانيتول", note: "⛔ معظم الأنواع عالية جداً", keywords: "فطر مشروم عيش غراب شامبنيون" },
  { name: "هليون", nameEn: "Asparagus", category: "vegetables", level: "high", fodmapType: "فركتانز", note: "⛔ تجنبه في مرحلة الإقصاء", keywords: "هليون اسبراجوس" },
  { name: "خرشوف", nameEn: "Artichoke", category: "vegetables", level: "high", fodmapType: "فركتانز / إينولين", note: "⛔ من أعلى الأطعمة بالفودماب", keywords: "خرشوف ارضي شوكي" },
  { name: "بازيلاء / بسلة", nameEn: "Green Peas", category: "vegetables", level: "moderate", fodmapType: "GOS / فركتانز", note: "⚠️ ¼ كوب فقط", keywords: "بازيلاء بسلة بازلاء" },
  { name: "ذرة حلوة", nameEn: "Sweet Corn", category: "vegetables", level: "moderate", fodmapType: "سوربيتول / GOS", note: "⚠️ نصف كوز فقط", keywords: "ذرة ذره" },
  { name: "زنجبيل طازج", nameEn: "Ginger (fresh)", category: "vegetables", level: "low", fodmapType: "—", note: "آمن — ملعقة صغيرة", keywords: "زنجبيل جنزبيل" },
  { name: "بامية", nameEn: "Okra", category: "vegetables", level: "low", fodmapType: "—", note: "آمن — 6 حبات", keywords: "بامية باميا" },
  { name: "فجل", nameEn: "Radish", category: "vegetables", level: "low", fodmapType: "—", note: "آمن بأي كمية", keywords: "فجل" },
  { name: "كرفس", nameEn: "Celery", category: "vegetables", level: "moderate", fodmapType: "مانيتول", note: "⚠️ أقل من 5 سم من الساق", keywords: "كرفس سيلري" },
  { name: "أفوكادو", nameEn: "Avocado", category: "vegetables", level: "moderate", fodmapType: "سوربيتول", note: "⚠️ ⅛ حبة فقط — أكثر من ذلك يصبح عالي", keywords: "أفوكادو افوكادو" },

  // ──────────────── FRUITS ────────────────
  { name: "موز (غير ناضج تماماً)", nameEn: "Banana (firm/unripe)", category: "fruits", level: "low", fodmapType: "—", note: "آمن — حبة متوسطة. الموز الناضج جداً يصبح moderate", keywords: "موز بنانا" },
  { name: "موز ناضج جداً", nameEn: "Banana (ripe)", category: "fruits", level: "moderate", fodmapType: "فركتانز", note: "⚠️ ⅓ حبة فقط عند النضج الكامل", keywords: "موز ناضج" },
  { name: "فراولة", nameEn: "Strawberry", category: "fruits", level: "low", fodmapType: "—", note: "آمن — 5 حبات متوسطة", keywords: "فراولة فريز" },
  { name: "عنب", nameEn: "Grapes", category: "fruits", level: "low", fodmapType: "—", note: "آمن — 6 حبات", keywords: "عنب" },
  { name: "برتقال", nameEn: "Orange", category: "fruits", level: "low", fodmapType: "—", note: "آمن — حبة متوسطة", keywords: "برتقال ليمون حامض" },
  { name: "كيوي", nameEn: "Kiwi", category: "fruits", level: "low", fodmapType: "—", note: "آمن — حبتان صغيرتان", keywords: "كيوي" },
  { name: "أناناس", nameEn: "Pineapple", category: "fruits", level: "low", fodmapType: "—", note: "آمن — كوب واحد", keywords: "أناناس اناناس" },
  { name: "شمام / كنتالوب", nameEn: "Cantaloupe", category: "fruits", level: "low", fodmapType: "—", note: "آمن — ¾ كوب", keywords: "شمام كنتالوب" },
  { name: "توت أزرق", nameEn: "Blueberry", category: "fruits", level: "low", fodmapType: "—", note: "آمن — 20 حبة", keywords: "توت ازرق بلوبيري" },
  { name: "توت بري (كرانبيري)", nameEn: "Cranberry", category: "fruits", level: "low", fodmapType: "—", note: "آمن — ملعقة كبيرة مجففة", keywords: "توت بري كرانبيري" },
  { name: "رمان", nameEn: "Pomegranate", category: "fruits", level: "moderate", fodmapType: "فركتانز", note: "⚠️ ¼ كوب حبوب فقط", keywords: "رمان" },
  { name: "ليمون", nameEn: "Lemon", category: "fruits", level: "low", fodmapType: "—", note: "آمن — عصير ليمونة", keywords: "ليمون حامض" },
  { name: "لايم", nameEn: "Lime", category: "fruits", level: "low", fodmapType: "—", note: "آمن", keywords: "لايم" },
  { name: "بابايا", nameEn: "Papaya", category: "fruits", level: "low", fodmapType: "—", note: "آمن — كوب واحد", keywords: "بابايا" },
  { name: "تفاح", nameEn: "Apple", category: "fruits", level: "high", fodmapType: "فركتوز / سوربيتول", note: "⛔ من أعلى الفواكه بالفودماب", keywords: "تفاح تفاحة" },
  { name: "كمثرى / إجاص", nameEn: "Pear", category: "fruits", level: "high", fodmapType: "فركتوز / سوربيتول", note: "⛔ عالي جداً", keywords: "كمثرى اجاص إجاص" },
  { name: "مانجو", nameEn: "Mango", category: "fruits", level: "high", fodmapType: "فركتوز", note: "⛔ عالي جداً", keywords: "مانجو منقا" },
  { name: "بطيخ", nameEn: "Watermelon", category: "fruits", level: "high", fodmapType: "فركتوز / مانيتول / فركتانز", note: "⛔ يحتوي على 3 أنواع فودماب!", keywords: "بطيخ حبحب جح" },
  { name: "خوخ", nameEn: "Peach", category: "fruits", level: "high", fodmapType: "سوربيتول", note: "⛔ عالي", keywords: "خوخ دراق" },
  { name: "مشمش", nameEn: "Apricot", category: "fruits", level: "high", fodmapType: "سوربيتول / فركتانز", note: "⛔ طازج أو مجفف — عالي", keywords: "مشمش" },
  { name: "كرز", nameEn: "Cherry", category: "fruits", level: "high", fodmapType: "سوربيتول / فركتوز", note: "⛔ أكثر من 3 حبات يسبب أعراض", keywords: "كرز" },
  { name: "تمر", nameEn: "Dates", category: "fruits", level: "high", fodmapType: "فركتوز / فركتانز", note: "⛔ عالي جداً — تجنبه", keywords: "تمر تمرة رطب" },
  { name: "تين", nameEn: "Fig", category: "fruits", level: "high", fodmapType: "فركتوز / فركتانز", note: "⛔ طازج أو مجفف", keywords: "تين" },
  { name: "فواكه مجففة عموماً", nameEn: "Dried Fruits (general)", category: "fruits", level: "high", fodmapType: "فركتوز مركز", note: "⛔ التجفيف يركز الفودماب", keywords: "فواكه مجففة زبيب" },

  // ──────────────── GRAINS & STARCHES ────────────────
  { name: "أرز (أبيض وبني)", nameEn: "Rice (white & brown)", category: "grains", level: "low", fodmapType: "—", note: "آمن بأي كمية — من أفضل الخيارات", keywords: "أرز رز ارز" },
  { name: "شوفان", nameEn: "Oats", category: "grains", level: "low", fodmapType: "—", note: "آمن — نصف كوب مطبوخ", keywords: "شوفان اوتس" },
  { name: "كينوا", nameEn: "Quinoa", category: "grains", level: "low", fodmapType: "—", note: "آمن — كوب واحد مطبوخ", keywords: "كينوا" },
  { name: "ذرة (دقيق/نشا)", nameEn: "Corn flour / Cornstarch", category: "grains", level: "low", fodmapType: "—", note: "آمن", keywords: "ذرة نشا" },
  { name: "بطاطس (كنشويات)", nameEn: "Potato Starch", category: "grains", level: "low", fodmapType: "—", note: "آمن", keywords: "بطاطس نشا" },
  { name: "خبز خالي من الغلوتين", nameEn: "Gluten-free Bread", category: "grains", level: "low", fodmapType: "—", note: "آمن — تأكد من عدم وجود بصل/ثوم", keywords: "خبز جلوتين فري" },
  { name: "معكرونة خالية من الغلوتين", nameEn: "Gluten-free Pasta", category: "grains", level: "low", fodmapType: "—", note: "آمن", keywords: "معكرونة باستا مكرونة" },
  { name: "خبز العجينة المخمرة (Sourdough)", nameEn: "Sourdough Bread", category: "grains", level: "low", fodmapType: "—", note: "✅ التخمير يقلل الفركتانز — شريحتان", keywords: "خبز مخمر ساوردو" },
  { name: "خبز القمح العادي", nameEn: "Wheat Bread", category: "grains", level: "high", fodmapType: "فركتانز", note: "⛔ القمح غني بالفركتانز", keywords: "خبز قمح توست عيش" },
  { name: "معكرونة القمح", nameEn: "Wheat Pasta", category: "grains", level: "high", fodmapType: "فركتانز", note: "⛔ أكثر من كوب مطبوخ يصبح عالي", keywords: "معكرونة سباغيتي قمح" },
  { name: "كسكس", nameEn: "Couscous", category: "grains", level: "high", fodmapType: "فركتانز", note: "⛔ مصنوع من القمح", keywords: "كسكس كسكسي" },
  { name: "شعير", nameEn: "Barley", category: "grains", level: "high", fodmapType: "فركتانز", note: "⛔ عالي جداً", keywords: "شعير" },
  { name: "معجنات وفطائر القمح", nameEn: "Wheat Pastries", category: "grains", level: "high", fodmapType: "فركتانز", note: "⛔ الدقيق + السكر = مشكلة مضاعفة", keywords: "معجنات فطائر كيك كعك بسكويت" },
  { name: "دقيق الأرز", nameEn: "Rice Flour", category: "grains", level: "low", fodmapType: "—", note: "آمن — بديل ممتاز لدقيق القمح", keywords: "دقيق ارز طحين" },
  { name: "برغل", nameEn: "Bulgur", category: "grains", level: "high", fodmapType: "فركتانز", note: "⛔ مصنوع من القمح", keywords: "برغل" },
  { name: "فريكة", nameEn: "Freekeh", category: "grains", level: "high", fodmapType: "فركتانز", note: "⛔ مصنوعة من القمح الأخضر", keywords: "فريكة فريكه" },

  // ──────────────── PROTEIN ────────────────
  { name: "دجاج", nameEn: "Chicken", category: "protein", level: "low", fodmapType: "—", note: "آمن — بدون صلصات تحتوي بصل/ثوم", keywords: "دجاج فراخ دياي" },
  { name: "لحم بقر", nameEn: "Beef", category: "protein", level: "low", fodmapType: "—", note: "آمن — اللحم نفسه خالٍ من الفودماب", keywords: "لحم بقر ستيك لحمة" },
  { name: "لحم غنم / خروف", nameEn: "Lamb", category: "protein", level: "low", fodmapType: "—", note: "آمن", keywords: "لحم غنم خروف ضاني" },
  { name: "سمك / أسماك", nameEn: "Fish", category: "protein", level: "low", fodmapType: "—", note: "آمن — جميع الأنواع", keywords: "سمك سالمون تونة سردين" },
  { name: "ربيان / جمبري", nameEn: "Shrimp / Prawns", category: "protein", level: "low", fodmapType: "—", note: "آمن", keywords: "ربيان جمبري قريدس" },
  { name: "بيض", nameEn: "Eggs", category: "protein", level: "low", fodmapType: "—", note: "آمن بأي كمية", keywords: "بيض بيضة" },
  { name: "توفو صلب", nameEn: "Firm Tofu", category: "protein", level: "low", fodmapType: "—", note: "آمن — التوفو الطري قد يكون أعلى", keywords: "توفو" },
  { name: "لحوم مصنعة / مرتديلا", nameEn: "Processed Meats", category: "protein", level: "moderate", fodmapType: "فركتانز / GOS", note: "⚠️ غالباً تحتوي بصل وثوم — اقرأ المكونات", keywords: "مرتديلا هوت دوج نقانق سجق" },
  { name: "حمص", nameEn: "Chickpeas", category: "protein", level: "high", fodmapType: "GOS / فركتانز", note: "⛔ ¼ كوب فقط = moderate، أكثر = عالي. الحمص المعلب أقل", keywords: "حمص حمص بالطحينة فلافل" },
  { name: "عدس", nameEn: "Lentils", category: "protein", level: "high", fodmapType: "GOS / فركتانز", note: "⛔ نصف كوب يسبب أعراض — العدس المعلب المغسول أقل", keywords: "عدس شوربة عدس مجدرة" },
  { name: "فول", nameEn: "Fava Beans / Broad Beans", category: "protein", level: "high", fodmapType: "GOS / فركتانز", note: "⛔ عالي جداً", keywords: "فول فول مدمس" },
  { name: "فاصوليا بيضاء / حمراء", nameEn: "Kidney / White Beans", category: "protein", level: "high", fodmapType: "GOS", note: "⛔ البقوليات بشكل عام عالية", keywords: "فاصوليا لوبيا" },
  { name: "لحم ديك رومي", nameEn: "Turkey", category: "protein", level: "low", fodmapType: "—", note: "آمن", keywords: "ديك رومي تركي" },

  // ──────────────── DAIRY ────────────────
  { name: "حليب خالي من اللاكتوز", nameEn: "Lactose-free Milk", category: "dairy", level: "low", fodmapType: "—", note: "آمن — كوب واحد", keywords: "حليب لاكتوز فري" },
  { name: "حليب اللوز", nameEn: "Almond Milk", category: "dairy", level: "low", fodmapType: "—", note: "آمن — كوب واحد (بدون إينولين)", keywords: "حليب لوز" },
  { name: "حليب الأرز", nameEn: "Rice Milk", category: "dairy", level: "low", fodmapType: "—", note: "آمن — كوب واحد", keywords: "حليب أرز" },
  { name: "حليب جوز الهند", nameEn: "Coconut Milk", category: "dairy", level: "low", fodmapType: "—", note: "آمن — نصف كوب", keywords: "حليب جوز هند" },
  { name: "حليب البقر الكامل", nameEn: "Cow's Milk (regular)", category: "dairy", level: "high", fodmapType: "لاكتوز", note: "⛔ عالي اللاكتوز — استبدله بخالي اللاكتوز", keywords: "حليب بقر لبن" },
  { name: "حليب الصويا (من فول الصويا)", nameEn: "Soy Milk (whole bean)", category: "dairy", level: "high", fodmapType: "GOS / فركتانز", note: "⛔ المصنوع من الحبة الكاملة عالي — اختر المصنوع من بروتين الصويا", keywords: "حليب صويا" },
  { name: "جبن شيدر", nameEn: "Cheddar Cheese", category: "dairy", level: "low", fodmapType: "—", note: "✅ الأجبان المعتقة قليلة اللاكتوز طبيعياً", keywords: "شيدر جبن" },
  { name: "جبن بارميزان", nameEn: "Parmesan Cheese", category: "dairy", level: "low", fodmapType: "—", note: "✅ منخفض اللاكتوز طبيعياً", keywords: "بارميزان جبن" },
  { name: "جبن فيتا", nameEn: "Feta Cheese", category: "dairy", level: "low", fodmapType: "—", note: "آمن — نصف كوب مفتت", keywords: "فيتا جبن" },
  { name: "جبن موزاريلا", nameEn: "Mozzarella", category: "dairy", level: "low", fodmapType: "—", note: "آمن — 40 غرام", keywords: "موزاريلا جبن" },
  { name: "جبن قريش / كوتج", nameEn: "Cottage Cheese", category: "dairy", level: "moderate", fodmapType: "لاكتوز", note: "⚠️ ملعقتان كبيرتان فقط", keywords: "جبن قريش كوتج" },
  { name: "جبن كريمي (فيلادلفيا)", nameEn: "Cream Cheese", category: "dairy", level: "moderate", fodmapType: "لاكتوز", note: "⚠️ ملعقتان كبيرتان فقط", keywords: "جبن كريمي فيلادلفيا" },
  { name: "زبادي / يوغرت عادي", nameEn: "Regular Yogurt", category: "dairy", level: "high", fodmapType: "لاكتوز", note: "⛔ عالي — اختر خالي اللاكتوز", keywords: "زبادي يوغرت روب لبن" },
  { name: "زبادي خالي اللاكتوز", nameEn: "Lactose-free Yogurt", category: "dairy", level: "low", fodmapType: "—", note: "آمن", keywords: "زبادي يوغرت خالي لاكتوز" },
  { name: "آيس كريم عادي", nameEn: "Ice Cream (regular)", category: "dairy", level: "high", fodmapType: "لاكتوز", note: "⛔ عالي اللاكتوز + غالباً يحتوي على محليات عالية", keywords: "آيس كريم مثلجات بوظة" },
  { name: "زبدة", nameEn: "Butter", category: "dairy", level: "low", fodmapType: "—", note: "آمن — منخفض اللاكتوز طبيعياً", keywords: "زبدة زبده" },
  { name: "سمن", nameEn: "Ghee", category: "dairy", level: "low", fodmapType: "—", note: "آمن — خالٍ من اللاكتوز", keywords: "سمن سمنة" },

  // ──────────────── NUTS & SEEDS ────────────────
  { name: "لوز", nameEn: "Almonds", category: "nuts", level: "low", fodmapType: "—", note: "آمن — 10 حبات فقط (أكثر يصبح moderate)", keywords: "لوز" },
  { name: "جوز / عين جمل", nameEn: "Walnuts", category: "nuts", level: "low", fodmapType: "—", note: "آمن — 10 حبات (أنصاف)", keywords: "جوز عين جمل" },
  { name: "بذور دوار الشمس", nameEn: "Sunflower Seeds", category: "nuts", level: "low", fodmapType: "—", note: "آمن — ملعقتان كبيرتان", keywords: "بذور دوار شمس لب" },
  { name: "بذور اليقطين (قرع)", nameEn: "Pumpkin Seeds", category: "nuts", level: "low", fodmapType: "—", note: "آمن — ملعقتان كبيرتان", keywords: "بذور قرع يقطين لب أبيض" },
  { name: "بذور الشيا", nameEn: "Chia Seeds", category: "nuts", level: "low", fodmapType: "—", note: "آمن — ملعقتان كبيرتان", keywords: "شيا" },
  { name: "بذور الكتان", nameEn: "Flaxseed / Linseed", category: "nuts", level: "low", fodmapType: "—", note: "آمن — ملعقة كبيرة", keywords: "كتان بذر" },
  { name: "صنوبر", nameEn: "Pine Nuts", category: "nuts", level: "low", fodmapType: "—", note: "آمن — ملعقة كبيرة", keywords: "صنوبر" },
  { name: "فول سوداني", nameEn: "Peanuts", category: "nuts", level: "low", fodmapType: "—", note: "آمن — 32 حبة", keywords: "فول سوداني فستق عبيد" },
  { name: "زبدة الفول السوداني", nameEn: "Peanut Butter", category: "nuts", level: "low", fodmapType: "—", note: "آمن — ملعقتان كبيرتان", keywords: "زبدة فول سوداني" },
  { name: "كاجو", nameEn: "Cashews", category: "nuts", level: "high", fodmapType: "GOS / فركتانز", note: "⛔ من أعلى المكسرات بالفودماب!", keywords: "كاجو كاشو" },
  { name: "فستق حلبي", nameEn: "Pistachios", category: "nuts", level: "high", fodmapType: "فركتانز / GOS", note: "⛔ عالي — تجنبه", keywords: "فستق فستق حلبي" },
  { name: "مكاديميا", nameEn: "Macadamia Nuts", category: "nuts", level: "low", fodmapType: "—", note: "آمن — 20 حبة", keywords: "مكاديميا" },

  // ──────────────── SPICES & SAUCES ────────────────
  { name: "ملح", nameEn: "Salt", category: "spices", level: "low", fodmapType: "—", note: "آمن", keywords: "ملح" },
  { name: "فلفل أسود", nameEn: "Black Pepper", category: "spices", level: "low", fodmapType: "—", note: "آمن", keywords: "فلفل اسود" },
  { name: "كركم", nameEn: "Turmeric", category: "spices", level: "low", fodmapType: "—", note: "آمن — ملعقة صغيرة", keywords: "كركم" },
  { name: "كمون", nameEn: "Cumin", category: "spices", level: "low", fodmapType: "—", note: "آمن", keywords: "كمون" },
  { name: "بابريكا", nameEn: "Paprika", category: "spices", level: "low", fodmapType: "—", note: "آمن", keywords: "بابريكا فلفل أحمر" },
  { name: "قرفة", nameEn: "Cinnamon", category: "spices", level: "low", fodmapType: "—", note: "آمن", keywords: "قرفة دارسين" },
  { name: "نعناع", nameEn: "Mint", category: "spices", level: "low", fodmapType: "—", note: "آمن", keywords: "نعناع" },
  { name: "ريحان", nameEn: "Basil", category: "spices", level: "low", fodmapType: "—", note: "آمن", keywords: "ريحان" },
  { name: "زيت زيتون", nameEn: "Olive Oil", category: "spices", level: "low", fodmapType: "—", note: "آمن — الزيوت خالية من الفودماب", keywords: "زيت زيتون" },
  { name: "زيت جوز الهند", nameEn: "Coconut Oil", category: "spices", level: "low", fodmapType: "—", note: "آمن", keywords: "زيت جوز هند" },
  { name: "خل أبيض / خل تفاح", nameEn: "Vinegar (white/ACV)", category: "spices", level: "low", fodmapType: "—", note: "آمن — ملعقتان كبيرتان", keywords: "خل تفاح ابيض" },
  { name: "صويا صوص", nameEn: "Soy Sauce", category: "spices", level: "low", fodmapType: "—", note: "آمن — ملعقتان كبيرتان", keywords: "صويا صوص صلصة" },
  { name: "صلصة طماطم (بدون بصل/ثوم)", nameEn: "Tomato Sauce (no onion/garlic)", category: "spices", level: "low", fodmapType: "—", note: "آمن — تأكد من المكونات", keywords: "صلصة طماطم كاتشب" },
  { name: "مسحوق بصل", nameEn: "Onion Powder", category: "spices", level: "high", fodmapType: "فركتانز", note: "⛔ حتى بكميات صغيرة — مركز!", keywords: "مسحوق بصل بودرة" },
  { name: "مسحوق ثوم", nameEn: "Garlic Powder", category: "spices", level: "high", fodmapType: "فركتانز", note: "⛔ حتى بكميات صغيرة — مركز!", keywords: "مسحوق ثوم بودرة" },
  { name: "خلطات البهارات الجاهزة", nameEn: "Mixed Spice Blends", category: "spices", level: "moderate", fodmapType: "فركتانز", note: "⚠️ غالباً تحتوي بصل/ثوم — اقرأ المكونات!", keywords: "بهارات خلطة ماجي" },
  { name: "طحينة", nameEn: "Tahini", category: "spices", level: "low", fodmapType: "—", note: "آمن — ملعقتان كبيرتان", keywords: "طحينة سمسم" },

  // ──────────────── DRINKS ────────────────
  { name: "ماء", nameEn: "Water", category: "drinks", level: "low", fodmapType: "—", note: "آمن طبعاً!", keywords: "ماء مويه" },
  { name: "شاي أخضر / أسود", nameEn: "Green / Black Tea", category: "drinks", level: "low", fodmapType: "—", note: "آمن — بدون إضافات عالية", keywords: "شاي اخضر اسود" },
  { name: "قهوة (إسبريسو/فلتر)", nameEn: "Coffee (espresso/filter)", category: "drinks", level: "low", fodmapType: "—", note: "آمن — كوب واحد (بدون حليب عادي)", keywords: "قهوة كافي اسبريسو كابتشينو" },
  { name: "شاي نعناع", nameEn: "Peppermint Tea", category: "drinks", level: "low", fodmapType: "—", note: "آمن — ممتاز لتهدئة القولون", keywords: "شاي نعناع" },
  { name: "شاي زنجبيل", nameEn: "Ginger Tea", category: "drinks", level: "low", fodmapType: "—", note: "آمن", keywords: "شاي زنجبيل" },
  { name: "ماء جوز الهند", nameEn: "Coconut Water", category: "drinks", level: "moderate", fodmapType: "سوربيتول", note: "⚠️ 100 مل فقط — أكثر يصبح عالي", keywords: "ماء جوز هند" },
  { name: "عصير برتقال", nameEn: "Orange Juice", category: "drinks", level: "moderate", fodmapType: "فركتوز", note: "⚠️ نصف كوب فقط", keywords: "عصير برتقال" },
  { name: "عصير تفاح", nameEn: "Apple Juice", category: "drinks", level: "high", fodmapType: "فركتوز / سوربيتول", note: "⛔ عالي جداً", keywords: "عصير تفاح" },
  { name: "عصير مانجو", nameEn: "Mango Juice", category: "drinks", level: "high", fodmapType: "فركتوز", note: "⛔ عالي", keywords: "عصير مانجو" },
  { name: "شاي البابونج", nameEn: "Chamomile Tea", category: "drinks", level: "low", fodmapType: "—", note: "آمن — كوب واحد", keywords: "بابونج كاموميل" },
  { name: "مشروبات غازية", nameEn: "Soft Drinks", category: "drinks", level: "high", fodmapType: "فركتوز / HFCS", note: "⛔ تحتوي شراب ذرة عالي الفركتوز", keywords: "كولا بيبسي غازية" },
  { name: "شاي الشمر (يانسون)", nameEn: "Fennel Tea", category: "drinks", level: "high", fodmapType: "فركتانز", note: "⛔ عالي الفركتانز", keywords: "شمر يانسون" },

  // ──────────────── SWEETENERS ────────────────
  { name: "سكر أبيض (سكروز)", nameEn: "Table Sugar (Sucrose)", category: "sweeteners", level: "low", fodmapType: "—", note: "آمن بكميات معتدلة — ملعقة صغيرة", keywords: "سكر ابيض" },
  { name: "سكر بني", nameEn: "Brown Sugar", category: "sweeteners", level: "low", fodmapType: "—", note: "آمن — ملعقة صغيرة", keywords: "سكر بني" },
  { name: "شراب القيقب (Maple Syrup)", nameEn: "Maple Syrup", category: "sweeteners", level: "low", fodmapType: "—", note: "آمن — ملعقتان كبيرتان", keywords: "قيقب ميبل سيرب" },
  { name: "ستيفيا", nameEn: "Stevia", category: "sweeteners", level: "low", fodmapType: "—", note: "آمن", keywords: "ستيفيا" },
  { name: "عسل", nameEn: "Honey", category: "sweeteners", level: "high", fodmapType: "فركتوز", note: "⛔ فركتوز حر عالي جداً", keywords: "عسل" },
  { name: "شراب الذرة عالي الفركتوز (HFCS)", nameEn: "High Fructose Corn Syrup", category: "sweeteners", level: "high", fodmapType: "فركتوز", note: "⛔ موجود في كثير من المنتجات المصنعة", keywords: "شراب ذرة فركتوز" },
  { name: "سوربيتول (E420)", nameEn: "Sorbitol", category: "sweeteners", level: "high", fodmapType: "بوليول / سوربيتول", note: "⛔ محلي صناعي في العلكة والحلويات", keywords: "سوربيتول علكة" },
  { name: "مانيتول (E421)", nameEn: "Mannitol", category: "sweeteners", level: "high", fodmapType: "بوليول / مانيتول", note: "⛔ يوجد في الفطر والقرنبيط أيضاً", keywords: "مانيتول" },
  { name: "إكسيليتول (E967)", nameEn: "Xylitol", category: "sweeteners", level: "high", fodmapType: "بوليول", note: "⛔ موجود في العلكة الخالية من السكر", keywords: "إكسيليتول زايليتول" },
  { name: "أسبارتام", nameEn: "Aspartame", category: "sweeteners", level: "low", fodmapType: "—", note: "آمن من ناحية الفودماب", keywords: "أسبارتام" },
  { name: "سكرالوز (سبلندا)", nameEn: "Sucralose (Splenda)", category: "sweeteners", level: "low", fodmapType: "—", note: "آمن من ناحية الفودماب", keywords: "سكرالوز سبلندا" },
  { name: "دبس رمان", nameEn: "Pomegranate Molasses", category: "sweeteners", level: "moderate", fodmapType: "فركتوز", note: "⚠️ ملعقة صغيرة فقط", keywords: "دبس رمان" }
];

let activeFodmapCategory = "all";
let fodmapSearchQuery = "";

function renderFodmapSection() {
  renderFodmapCategoryChips();
  renderFodmapResults();
}

function renderFodmapCategoryChips() {
  const container = document.getElementById("fodmapCategoryChips");
  if (!container) return;
  container.innerHTML = "";
  fodmapCategories.forEach(cat => {
    const chip = document.createElement("button");
    chip.className = "fodmap-chip" + (cat.id === activeFodmapCategory ? " active" : "");
    chip.innerHTML = `<span class="chip-icon">${cat.icon}</span> ${cat.label}`;
    chip.onclick = () => {
      activeFodmapCategory = cat.id;
      renderFodmapCategoryChips();
      renderFodmapResults();
    };
    container.appendChild(chip);
  });
}

function renderFodmapResults() {
  const container = document.getElementById("fodmapResultsGrid");
  const statsEl = document.getElementById("fodmapStats");
  const emptyEl = document.getElementById("fodmapEmpty");
  if (!container) return;

  const q = fodmapSearchQuery.toLowerCase().trim();

  let filtered = fodmapDatabase.filter(item => {
    // Category filter
    if (activeFodmapCategory !== "all" && item.category !== activeFodmapCategory) return false;
    // Search filter
    if (q) {
      const searchable = `${item.name} ${item.nameEn} ${item.keywords} ${item.fodmapType} ${item.note}`.toLowerCase();
      return searchable.includes(q);
    }
    return true;
  });

  // Sort: low first, then moderate, then high
  const levelOrder = { low: 0, moderate: 1, high: 2 };
  filtered.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  // Stats
  const lowCount = filtered.filter(i => i.level === "low").length;
  const modCount = filtered.filter(i => i.level === "moderate").length;
  const highCount = filtered.filter(i => i.level === "high").length;

  if (statsEl) {
    statsEl.innerHTML = `
      <span class="stat-pill stat-low">🟢 منخفض: ${lowCount}</span>
      <span class="stat-pill stat-mod">🟡 معتدل: ${modCount}</span>
      <span class="stat-pill stat-high">🔴 عالي: ${highCount}</span>
      <span class="stat-pill stat-total">المجموع: ${filtered.length}</span>
    `;
  }

  if (filtered.length === 0) {
    container.innerHTML = "";
    if (emptyEl) {
      emptyEl.style.display = "flex";
      emptyEl.innerHTML = `
        <span class="empty-icon">🔍</span>
        <h3>لم يتم العثور على نتائج</h3>
        <p>جرّب البحث بكلمة مختلفة أو غيّر الفئة</p>
      `;
    }
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";

  container.innerHTML = "";
  filtered.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = `fodmap-result-card fodmap-${item.level}`;
    card.style.animationDelay = `${Math.min(idx * 0.03, 0.6)}s`;

    const catObj = fodmapCategories.find(c => c.id === item.category);
    const catIcon = catObj ? catObj.icon : "🍽️";

    const levelLabel = item.level === "low" ? "منخفض ✅" : item.level === "moderate" ? "معتدل ⚠️" : "عالي ⛔";
    const levelClass = `level-badge level-${item.level}`;

    // Highlight search match in name
    let displayName = item.name;
    let displayNameEn = item.nameEn;
    if (q) {
      const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      displayName = item.name.replace(regex, '<mark>$1</mark>');
      displayNameEn = item.nameEn.replace(regex, '<mark>$1</mark>');
    }

    card.innerHTML = `
      <div class="fodmap-card-top">
        <span class="fodmap-cat-icon">${catIcon}</span>
        <span class="${levelClass}">${levelLabel}</span>
      </div>
      <div class="fodmap-card-body">
        <h4 class="fodmap-food-name">${displayName}</h4>
        <p class="fodmap-food-name-en">${displayNameEn}</p>
        ${item.fodmapType !== "—" ? `<div class="fodmap-type-tag">نوع الفودماب: <strong>${item.fodmapType}</strong></div>` : ""}
        <p class="fodmap-note">${item.note}</p>
      </div>
    `;

    container.appendChild(card);
  });
}

function handleFodmapSearch(e) {
  fodmapSearchQuery = e.target.value;
  renderFodmapResults();
}

// =============================================================
// SUPERMARKET GROCERY LIST DATABASE & LOGIC
// =============================================================
const groceryDatabase = {
  proteins: {
    title: "🥩 البروتينات واللحوم",
    items: [
      { id: "g_chicken", name: "صدور دجاج طازجة" },
      { id: "g_beef", name: "لحم بقر مفروم صافي" },
      { id: "g_steak", name: "شرائح ستيك لحم بقري" },
      { id: "g_lamb", name: "قطع لحم غنم طازجة" },
      { id: "g_salmon", name: "فيلييه سلمون طازج" },
      { id: "g_fish", name: "أسماك طازجة (هامور، دنيس)" },
      { id: "g_eggs", name: "بيض طازج (أولوية قصوى)" },
      { id: "g_tuna", name: "علب تونة بالماء" }
    ]
  },
  veggies: {
    title: "🥬 الخضروات الطازجة الآمنة",
    items: [
      { id: "g_cucumber", name: "خيار" },
      { id: "g_carrot", name: "جزر" },
      { id: "g_spinach", name: "سبانخ طازجة" },
      { id: "g_zucchini", name: "كوسا" },
      { id: "g_pepper", name: "فلفل رومي ألوان" },
      { id: "g_arugula", name: "جرجير / ورقيات خضراء" },
      { id: "g_green_onion", name: "بصل أخضر (الجزء الأخضر فقط)" },
      { id: "g_ginger", name: "زنجبيل طازج" }
    ]
  },
  fruits: {
    title: "🍓 الفواكه الطازجة المسموحة",
    items: [
      { id: "g_lemon", name: "ليمون حامض" },
      { id: "g_unripe_banana", name: "موز غير ناضج تماماً (مخضر)" },
      { id: "g_strawberry", name: "فراولة طازجة" },
      { id: "g_grapes", name: "عنب" },
      { id: "g_pineapple", name: "أناناس طازج" },
      { id: "g_kiwi", name: "كيوي" }
    ]
  },
  grains: {
    title: "🌾 النشويات والحبوب الآمنة",
    items: [
      { id: "g_basmati_rice", name: "أرز بسمتي أبيض" },
      { id: "g_quinoa", name: "كينوا كاملة" },
      { id: "g_oats", name: "شوفان كامل (خالٍ من الغلوتين)" },
      { id: "g_gf_bread", name: "خبز خالٍ من الغلوتين والسكر" },
      { id: "g_gf_pasta", name: "معكرونة خالية من الغلوتين" }
    ]
  },
  dairy: {
    title: "🧀 الألبان والبدائل المعتمدة",
    items: [
      { id: "g_lf_milk", name: "حليب بقري خالي من اللاكتوز" },
      { id: "g_almond_milk", name: "حليب اللوز غير محلى" },
      { id: "g_coconut_milk", name: "حليب جوز الهند" },
      { id: "g_feta_cheese", name: "جبنة فيتا طبيعية" },
      { id: "g_cheddar", name: "جبنة شيدر معتقة صفراء" },
      { id: "g_lf_yogurt", name: "زبادي طبيعي خالي من اللاكتوز" }
    ]
  },
  pantry: {
    title: "🧂 الزيوت والتوابل الصحية",
    items: [
      { id: "g_olive_oil", name: "زيت زيتون بكر معصور على البارد" },
      { id: "g_coconut_oil", name: "زيت جوز هند عضوي (مضاد للفطريات)" },
      { id: "g_butter", name: "زبدة طبيعية حيوانية" },
      { id: "g_ghee", name: "سمن بلدي بقري أو غنم" },
      { id: "g_sea_salt", name: "ملح بحري أو ملح الهيمالايا الوردي" },
      { id: "g_cumin", name: "كمون مطحون" },
      { id: "g_turmeric", name: "كركم مطحون" },
      { id: "g_cinnamon", name: "قرفة مطحونة" },
      { id: "g_paprika", name: "بابريكا حلوة" },
      { id: "g_apple_vinegar", name: "خل تفاح عضوي غير مصفى" }
    ]
  },
  snacks: {
    title: "🍿 السناكات والمقرمشات الآمنة",
    items: [
      { id: "g_dark_chocolate", name: "شوكولاتة داكنة (85% كاكاو فما فوق)" },
      { id: "g_popcorn", name: "فشار (ذرة فرقعة بالملح فقط)" },
      { id: "g_potato_chips", name: "شيبس بطاطس كلاسيكي (ملح فقط - بدون بهارات)" },
      { id: "g_peanut_butter_jar", name: "زبدة فول سوداني طبيعية (بدون سكر مضاف)" },
      { id: "g_sunflower_seeds", name: "فستق سوداني أو بذور دوار الشمس مملحة" },
      { id: "g_rice_cakes", name: "رقائق الأرز (Rice Cakes) سادة" }
    ]
  }
};

function renderGroceryList() {
  const container = document.getElementById("groceryListContainer");
  if (!container) return;
  container.innerHTML = "";

  Object.entries(groceryDatabase).forEach(([catKey, category]) => {
    const catBox = document.createElement("div");
    catBox.className = "grocery-cat-box";

    const catTitle = document.createElement("h3");
    catTitle.className = "grocery-cat-title";
    catTitle.textContent = category.title;
    catBox.appendChild(catTitle);

    const itemsGrid = document.createElement("div");
    itemsGrid.className = "grocery-items-grid";

    category.items.forEach(item => {
      const checked = !!groceryState[item.id];
      const itemEl = document.createElement("div");
      itemEl.className = "grocery-item" + (checked ? " checked" : "");
      itemEl.setAttribute("role", "checkbox");
      itemEl.setAttribute("aria-checked", checked ? "true" : "false");
      itemEl.setAttribute("tabindex", "0");

      itemEl.innerHTML = `
        <div class="grocery-check-box">${checked ? "✓" : ""}</div>
        <span class="grocery-item-name">${item.name}</span>
      `;

      const toggle = () => {
        const nowChecked = !groceryState[item.id];
        groceryState[item.id] = nowChecked;
        save();
        
        itemEl.classList.toggle("checked", nowChecked);
        itemEl.setAttribute("aria-checked", nowChecked ? "true" : "false");
        itemEl.querySelector(".grocery-check-box").textContent = nowChecked ? "✓" : "";
      };

      itemEl.addEventListener("click", toggle);
      itemEl.addEventListener("keydown", e => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggle();
        }
      });

      itemsGrid.appendChild(itemEl);
    });

    catBox.appendChild(itemsGrid);
    container.appendChild(catBox);
  });
}

// =============================================================
// COOKING RECIPES DATABASE & LOGIC
// =============================================================
const recipesData = [
  {
    title: "شاورما دجاج منزلية آمنة",
    icon: "🥙",
    badge: "مضاد فطري طبيعي",
    time: "30 دقيقة",
    servings: "شخصين",
    ingredients: [
      "صدور دجاج طازجة مقطعة شرائح رفيعة",
      "ملعقتان كبيرتان من زيت الزيتون البكر",
      "ملعقة كبيرة عصير ليمون حامض + ملعقة صغيرة خل تفاح",
      "ملح هيمالايا وفلفل أسود حسب الرغبة",
      "بهارات صحيحة مطحونة: هيل، كمون، كزبرة جافة، وبابريكا",
      "أوراق خس كبيرة (لاستخدامها كلفائف بديلة للخبز)"
    ],
    steps: [
      "في وعاء، اخلط زيت الزيتون مع الليمون والخل والبهارات والملح.",
      "أضف شرائح الدجاج للتتبيلة واتركها في الثلاجة لمدة ساعة على الأقل لتمتص النكهة.",
      "سخّن مقلاة غير لاصقة جيداً على نار متوسطة، ثم أضف الدجاج بدون التتبيلة السائلة الزائدة.",
      "قلّب الدجاج باستمرار حتى ينضج تماماً ويتحمر قليلاً (حوالي 12-15 دقيقة).",
      "قدّم الشاورما داخل لفافات أوراق الخس الطازجة مع شرائح خيار مخلل (بدون ثوم)."
    ]
  },
  {
    title: "كبسة الدجاج بالزيت المصفى",
    icon: "🍛",
    badge: "صديق للقولون",
    time: "45 دقيقة",
    servings: "3-4 أشخاص",
    ingredients: [
      "كوبان من أرز البسمتي (مغسول ومنقوع 20 دقيقة)",
      "نصف دجاجة منزوعة الجلد ومقطعة",
      "حبة بصل كاملة (للنكهة فقط - سنقوم بإزالتها لاحقاً)",
      "ملعقتان كبيرتان زيت نباتي أو سمن بلدي",
      "ملعقة كبيرة معجون طماطم (خالٍ من البصل والثوم)",
      "بهارات كبسة صحيحة: عود قرفة، حبات هيل، كبش قرنفل، وورق غار",
      "ملح، وفلفل أسود، ورشة كمون مطحون"
    ],
    steps: [
      "في قدر الكبسة، سخّن الزيت أو السمن واقلي البصلة المقطعة أرباعاً حتى تذبل وتخرج نكهتها بالكامل بالزيت.",
      "⚠️ **خطوة هامة:** باستخدام ملعقة مخرمة، أزل كل قطع البصل من الزيت تماماً وتخلص منها (الفركتانز لا تذوب بالزيت، لذا فالزيت المصفى آمن).",
      "ضع قطع الدجاج في الزيت المصفى والبهارات الصحيحة وقلّبها حتى يتغير لونها.",
      "أضف معجون الطماطم، الملح، والبهارات المطحونة ثم صب الماء الساخن واترك الدجاج ينضج بالكامل.",
      "أخرج الدجاج وحمّره بالفرن، ثم أضف الأرز المنقوع إلى مرقة الدجاج المصفاة واطهه على نار هادئة حتى ينضج.",
      "قدّم الأرز وفوقه الدجاج المحمر مع رشة من الجزء الأخضر للبصل الأخضر الطازج."
    ]
  },
  {
    title: "شوربة الدجاج وعظام الغنم المرممة",
    icon: "🍲",
    badge: "ترميم جدار الأمعاء",
    time: "120 دقيقة",
    servings: "4 أشخاص",
    ingredients: [
      "قطع دجاج بالعظم + عظام غنم أو بقر طازجة",
      "حبتان من الجزر (مقطع دوائر)",
      "حبتان من الكوسا (مقطعة مكعبات كبيرة)",
      "ملعقة صغيرة زنجبيل طازج مبشور",
      "ملح بحري وفلفل أسود",
      "حزمة صغيرة كزبرة طازجة مفرومة",
      "أوراق غار وعود قرفة"
    ],
    steps: [
      "في قدر كبير، ضع العظام والدجاج واغمرها بالماء البارد.",
      "اترك الماء يغلي، ثم أزل الرغوة الزفرة المتكونة على السطح.",
      "أضف أوراق الغار، القرفة، الزنجبيل الطازج، والملح والفلفل الأسود.",
      "خفّف النار تماماً، غطّ القدر واتركه يطهى ببطء لمدة ساعة ونصف لاستخلاص الكولاجين المرمم للأمعاء.",
      "أضف الجزر والكوسا والكزبرة في آخر 20 دقيقة من الطهي حتى تنضج الخضروات.",
      "صَفِّ الشوربة وقدمها ساخنة مع الخضار المطهوة وقطع الدجاج المنزوع العظم."
    ]
  },
  {
    title: "أومليت السبانخ وجبنة الفيتا",
    icon: "🍳",
    badge: "فطور مغذٍ وسهل الهضم",
    time: "10 دقائق",
    servings: "شخص واحد",
    ingredients: [
      "بيضتان طازجتان",
      "كوب من أوراق السبانخ الطازجة المغسولة",
      "ملعقتان كبيرتان من جبنة الفيتا المفتتة (منخفضة اللاكتوز)",
      "ملعقة صغيرة زبدة طبيعية أو سمن بلدي",
      "ملح وفلفل أسود حسب الرغبة"
    ],
    steps: [
      "اخفق البيض في وعاء صغير مع رشة ملح وفلفل أسود.",
      "في مقلاة صغيرة غير لاصقة، سخّن الزبدة على نار متوسطة وأضف السبانخ وقلبها لدقيقة حتى تذبل.",
      "صب البيض المخفوق فوق السبانخ ووزعه بالتساوي.",
      "قبل أن ينضج البيض تماماً، وزّع جبنة الفيتا المفتتة على أحد نصفي القرص.",
      "اطوِ الأومليت إلى نصفين واتركه لمدة دقيقة إضافية حتى تنضج تماماً وتذوب الجبنة قليلاً، ثم قدمه دافئاً."
    ]
  },
  {
    title: "برجر اللحم الصافي بلفافة الخس",
    icon: "🍔",
    badge: "بروتين نقي 100%",
    time: "20 دقيقة",
    servings: "شخصين",
    ingredients: [
      "250 غرام من لحم البقر المفروم الصافي (بدون دهون مصنعة وبدون بصل)",
      "ملح بحري وفلفل أسود مطحون طازج",
      "أوراق خس آيسبرغ كبيرة ونظيفة",
      "شرائح طماطم طازجة وخيار مخلل (بدون ثوم)",
      "ملعقة صغيرة خردل (مستردة صفراء كلاسيكية - آمنة فودماب)",
      "ملعقة زيت زيتون للشوي"
    ],
    steps: [
      "قسّم اللحم المفروم إلى قطعتين وشكّلهما على شكل قرص برجر سميك.",
      "تبّل وجهي القرص بالملح البحري والفلفل الأسود بسخاء.",
      "دهن الشواية أو مقلاة الشوي بزيت الزيتون وسخنها جيداً.",
      "اشوِ قطع البرجر لمدة 4-5 دقائق لكل جانب حتى تنضج تماماً.",
      "ضع شريحة البرجر الساخنة داخل أوراق الخس الكبيرة، وزينها بشرائح الطماطم والمخلل وقليل من الخردل، ثم لفها وقدمها."
    ]
  },
  {
    title: "سوشي السلمون والخيار المنزلي",
    icon: "🍣",
    badge: "سهل الهضم ومقوٍ للمناعة",
    time: "35 دقيقة",
    servings: "شخصين",
    ingredients: [
      "كوب من أرز السوشي (مطهو ومتبل بقليل من خل الأرز والملح والستيفيا)",
      "شرائح سلمون طازج مطبوخ أو مدخن",
      "حبة خيار مقشرة ومقطعة أصابع رفيعة طويلاً",
      "شرائح أفوكادو رفيعة (بحدود ⅛ حبة للشخص)",
      "أوراق النوري (أعشاب بحرية مجففة)",
      "صويا صوص للتغميس"
    ],
    steps: [
      "ضع ورقة النوري على حصيرة السوشي (بحيث يكون الجانب الخشن للأعلى).",
      "افرد أرز السوشي المطهو بالتساوي فوق ورقة النوري ببلل خفيف ليديك، مع ترك سنتيمتر واحد من الأعلى فارغاً.",
      "رتب شرائح السلمون، الخيار، والأفوكادو في خط مستقيم في ثلث ورقة النوري السفلي.",
      "لف السوشي بإحكام باستخدام الحصيرة مع الضغط الخفيف لتتماسك المكونات.",
      "باستخدام سكين حاد ومبلل بالماء، قطّع الرول إلى دوائر متساوية وقدّمها بجانب صلصة الصويا."
    ]
  }
];

function renderRecipes() {
  const container = document.getElementById("recipesGrid");
  if (!container) return;
  container.innerHTML = "";

  recipesData.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    // Build ingredients list
    const ingList = recipe.ingredients.map(ing => `<li>🟢 ${ing}</li>`).join("");

    // Build steps list
    const stepList = recipe.steps.map((step, index) => `<li><span class="step-num">${index+1}</span> ${step}</li>`).join("");

    card.innerHTML = `
      <div class="recipe-card-header">
        <div class="recipe-title-group">
          <span class="recipe-icon-el">${recipe.icon}</span>
          <h3>${recipe.title}</h3>
        </div>
        <span class="recipe-badge">${recipe.badge}</span>
      </div>
      <div class="recipe-meta-row">
        <span>⏱️ مدة التحضير: <strong>${recipe.time}</strong></span>
        <span>👥 التكفير: <strong>${recipe.servings}</strong></span>
      </div>
      <div class="recipe-details-tabs">
        <div class="recipe-details-section">
          <h4>🛒 المكونات:</h4>
          <ul class="recipe-ingredients-list">
            ${ingList}
          </ul>
        </div>
        <div class="recipe-details-section">
          <h4>👩‍🍳 طريقة التحضير:</h4>
          <ol class="recipe-steps-list">
            ${stepList}
          </ol>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// =============================================================
// SUPERMARKET SAFE SNACKS DATABASE & LOGIC
// =============================================================
const snacksDatabase = [
  {
    title: "شوكولاتة داكنة (85% كاكاو فما فوق)",
    icon: "🍫",
    note: "تأكد من أن الكاكاو 85% أو أكثر لضمان عدم وجود سكريات تغذي الكانديدا. الحد المسموح: مربعان في اليوم (حوالي 20 غرام).",
    brand: "Lindt / Godiva / Ritter Sport"
  },
  {
    title: "رقائق الأرز (Rice Cakes) سادة",
    icon: "🍘",
    note: "مصنوعة من الأرز البني أو الأبيض السادة. خالية تماماً من الخميرة والغلوتين والفودماب. يمكنك دهنها بزبدة الفول السوداني الطبيعية.",
    brand: "Lundberg / Organic Rice Cakes"
  },
  {
    title: "شيبس بطاطس كلاسيكي بالملح",
    icon: "🥔",
    note: "اختر النوع الكلاسيكي المكون من 3 عناصر فقط: (بطاطس، زيت نباتي، ملح). تجنب تماماً النكهات المضافة لاحتوائها على بودرة بصل وثوم وخميرة.",
    brand: "Lays Salted / Kettle Brand Salted"
  },
  {
    title: "فشار مملح بالزيت",
    icon: "🍿",
    note: "الفشار من الحبوب الكاملة منخفضة الفودماب والمسموحة. اشترِ ذرة الفشار واصنعه في المنزل بالزيت والملح، أو اشترِ فشار سادة بالملح فقط بدون نكهات.",
    brand: "فشار سادة بالملح"
  },
  {
    title: "مكسرات نيئة مملحة",
    icon: "🥜",
    note: "اللوز (حتى 10 حبات)، الجوز (10 حبات)، الفول السوداني (حتى 32 حبة). تجنب المكسرات النيئة المتبلة ببهارات المطاعم أو الكاجو والفستق الحلبي.",
    brand: "باجا / المهباج / الرفاعي"
  },
  {
    title: "زبادي يوناني سادة خالي اللاكتوز",
    icon: "🥛",
    note: "مصدر بروتين رائع وصديق للأمعاء. تأكد أنه سادة بدون سكر أو فواكه مضافة. يمكنك إضافة 3 حبات فراولة طازجة معه.",
    brand: "ندى خالي اللاكتوز / المراعي"
  }
];

function renderSnacks() {
  const container = document.getElementById("snacksGrid");
  if (!container) return;
  container.innerHTML = "";

  snacksDatabase.forEach(snack => {
    const card = document.createElement("div");
    card.className = "snack-card";

    card.innerHTML = `
      <div class="snack-card-header">
        <span class="snack-icon-el">${snack.icon}</span>
        <h3>${snack.title}</h3>
      </div>
      <p class="snack-note">${snack.note}</p>
      <div class="snack-brand-tag">🔹 خيارات شائعة: <strong>${snack.brand}</strong></div>
    `;

    container.appendChild(card);
  });
}

// =============================================================
// TAB NAVIGATION LOGIC
// =============================================================
function initTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      switchTab(tab.getAttribute("data-tab"));
    });
  });

  // Switch to default tab
  switchTab(activeTab);
}

function switchTab(tabId) {
  activeTab = tabId;
  save();

  // Update nav buttons active state
  document.querySelectorAll(".nav-tab").forEach(tab => {
    if (tab.getAttribute("data-tab") === tabId) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // Update tab content visibility
  document.querySelectorAll(".tab-content").forEach(content => {
    if (content.id === `tab-${tabId}`) {
      content.classList.remove("hidden-tab");
      content.classList.add("active-tab");
    } else {
      content.classList.remove("active-tab");
      content.classList.add("hidden-tab");
    }
  });

  // Perform tab-specific triggers
  if (tabId === "nutrition") {
    // Re-render FODMAP elements if needed
    renderFodmapSection();
  } else if (tabId === "recipes") {
    // Re-render recipes, snacks and grocery list if needed
    renderRecipes();
    renderGroceryList();
    renderSnacks();
  }
}

// =============================================================
// INIT
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
  load();

  document.getElementById("themeToggleBtn").addEventListener("click", toggleTheme);
  document.getElementById("dietSearchInput").addEventListener("input",  filterDiet);

  const fodmapInput = document.getElementById("fodmapSearchInput");
  if (fodmapInput) fodmapInput.addEventListener("input", handleFodmapSearch);

  renderWeeksGrid();
  renderStageInfo();
  renderDaysRow();
  renderChecklist();
  renderDietGuide();
  renderSupplementsDirectory();
  renderGlobalProgress();
  renderFodmapSection();
  renderRecipes();
  renderGroceryList();
  renderSnacks();
  initTabs();
});
