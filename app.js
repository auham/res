// State Management
let currentWeek = 1;
let currentDay = 0; // 0 = Saturday, 1 = Sunday, ..., 6 = Friday
let trackerState = {}; // Format: { "W1_D0_time_pillId": true/false }
let completedDays = {}; // Format: { "W1_D0": true/false }

// Constant Data: Supplements
const supplements = {
    "01": {
        id: "01",
        name: "NAC 600mg",
        brand: "NOW Foods",
        dose: "600mg (كبسولة واحدة)",
        timing: "مرتين يومياً مع الوجبة الأولى والوجبة الثانية",
        target: "يكسر بيوفيلم الكانديدا + يحمي الكبد من سموم die-off + يرفع الغلوتاثيون"
    },
    "02": {
        id: "02",
        name: "Milk Thistle 300mg",
        brand: "NOW Foods",
        dose: "300mg (كبسولة واحدة)",
        timing: "مرتين يومياً مع الوجبة الأولى والوجبة الثانية",
        target: "يحمي خلايا الكبد من سموم الكانديدا الميتة — ضروري لتجنب أعراض الـ die-off الشديدة"
    },
    "03": {
        id: "03",
        name: "Candida Support",
        brand: "NOW Foods",
        dose: "كبسولتان (إجمالي 4 كبسولات يومياً)",
        timing: "مرتين يومياً (2 مع الوجبة الأولى + 2 مع الوجبة الثانية)",
        target: "يجمع: الأوريغانو + حمض الكابريليك + الباو داركو + الجوز الأسود لضرب الفطريات"
    },
    "04": {
        id: "04",
        name: "Berberine 500mg",
        brand: "Thorne",
        dose: "500mg (كبسولة واحدة، إجمالي 3 كبسولات يومياً)",
        timing: "ثلاث مرات يومياً (الوجبة الأولى + منتصف اليقظة + الوجبة الثانية)",
        target: "يستهدف الكانديدا المقاومة + ينظم السكر (نصف حياته قصير لذا يقسم 3 مرات)"
    },
    "06": {
        id: "06",
        name: "S. Boulardii + MOS",
        brand: "Jarrow Formulas",
        dose: "5B CFU (كبسولة واحدة، إجمالي كبسولتين يومياً)",
        timing: "مرتين يومياً (بين الوجبات بعيداً عن المضادات بساعتين + قبل النوم)",
        target: "يزاحم الكانديدا مباشرة + يكسر بيوفيلم الفطريات + يرفع sIgA المنخفض (468 في التحليل)"
    },
    "07": {
        id: "07",
        name: "Probiotic Men's 50B",
        brand: "Garden of Life",
        dose: "50 Billion CFU (كبسولة واحدة)",
        timing: "مرة واحدة قبل النوم (بعيداً عن المضادات بـ 4+ ساعات)",
        target: "يعوض بكتيريا Lactobacillus و Bifidobacterium المنهارة تماماً في التقرير"
    },
    "08": {
        id: "08",
        name: "L-Glutamine Powder",
        brand: "NOW Foods",
        dose: "5g (ملعقة صغيرة، إجمالي 10g يومياً)",
        timing: "مرتين يومياً (عند الاستيقاظ وقبل النوم) على معدة فارغة في ماء بارد",
        target: "يرمم تسرب الأمعاء (Leaky Gut) — يستهدف Zonulin 210 ويغذي جدار الأمعاء"
    },
    "09": {
        id: "09",
        name: "PepZin GI (Zinc Carnosine)",
        brand: "Doctor's Best",
        dose: "كبسولتان",
        timing: "مرة واحدة يومياً (على معدة فارغة أو في منتصف اليقظة)",
        target: "يقلل تلف جدار الأمعاء بنسبة 75% — يستهدف Calprotectin 198 و Zonulin 210"
    },
    "10": {
        id: "10",
        name: "Colostrum Prime Life 400mg",
        brand: "Jarrow Formulas",
        dose: "كبسولتان (إجمالي 4 كبسولات يومياً)",
        timing: "مرتين يومياً (2 عند الاستيقاظ + 2 قبل النوم) على معدة فارغة",
        target: "يخفض Zonulin ويرفع sIgA (يدعم ترميم الأمعاء والمناعة معاً)"
    },
    "11": {
        id: "11",
        name: "Cranberry Caps",
        brand: "NOW Foods",
        dose: "كبسولتان (إجمالي 4 كبسولات يومياً)",
        timing: "مرتين يومياً مع وجبات الطعام (2 مع الوجبة الأولى + 2 مع الوجبة الثانية)",
        target: "يعيد بكتيريا Akkermansia المنهارة (6 فقط في التحليل!) ويزيدها من 2% لـ 30%+"
    }
};

// Constant Data: Diet Guide
const dietGuide = {
    allowed: [
        "اللحوم الحمراء والدواجن الطازجة والأسماك والبيض",
        "الخضروات غير النشوية: الخيار، البروكلي، السبانخ، الكوسا، الخس",
        "الثوم الطازج يومياً (اسحقه والانتظار 5 دقائق قبل تناوله لتفعيل الأليسين)",
        "المكسرات الصحية: الفستق واللوز بحرص",
        "الدهون الصحية: زيت جوز الهند (مضاد فطري طبيعي)، زيت الزيتون البكر",
        "التوت البري والرمان (لتحفيز نمو بكتيريا Akkermansia المنهارة)",
        "الأجبان الصفراء المعتدلة والزبادي اليوناني الطبيعي بدون سكر مضاف"
    ],
    forbidden: [
        "السكريات بجميع أشكالها (العسل، التمر، الفواكه الحلوة، وعصائرها)",
        "الدقيق الأبيض المكرر: الخبز التجاري، المعجنات، والأرز الأبيض",
        "المشروبات المحلاة، المشروبات الغازية، والعصائر الجاهزة",
        "الخمائر: الخبز المخمر، والمنتجات التجارية المحتوية على خميرة نشطة",
        "النشويات بكميات كبيرة: البطاطس، الذرة، والقمح المكرر",
        "الحليب البقري الكامل والآيس كريم والحلويات بجميع أنواعها",
        "الأجبان المصنعة والأطعمة المعلبة التي تحتوي على سكريات مخفية"
    ]
};

// Days name helper
const daysNames = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

// Check active stage based on week number
function getStageInfo(week) {
    if (week >= 1 && week <= 2) {
        return {
            id: 1,
            title: "المرحلة 1 — تجهيز الجسم",
            duration: "الأسبوع 1 – 2",
            class: "stage-1",
            desc: "ابدأ هؤلاء فوراً. يستمر مكملا هذه المرحلة (NAC + Milk Thistle) طوال فترة العلاج الكاملة (16 أسبوعاً). الهدف هو تكسير بيوفيلم الكانديدا وتجهيز الكبد لتصريف السموم الناتجة عن موت الفطريات (die-off)."
        };
    } else if (week >= 3 && week <= 8) {
        return {
            id: 2,
            title: "المرحلة 2 — الضربة الفطرية",
            duration: "الأسبوع 3 – 8 (6 أسابيع متواصلة)",
            class: "stage-2",
            desc: "الضربة القاضية للفطريات. نستخدم مكملات قاتلة مباشرة للكانديدا مع الاستمرار بمكملات حماية الكبد. احرص على شرب كميات كافية من الماء لتقليل أعراض التخلص من السموم."
        };
    } else {
        return {
            id: 3,
            title: "المرحلة 3 — إعادة البناء",
            duration: "الأسبوع 9 – 16 (8 أسابيع متواصلة)",
            class: "stage-3",
            desc: "أوقف مكملات الضربة الفطرية. نركز الآن بالكامل على ترميم تسرب الأمعاء (Leaky Gut) وإعادة إعمار البكتيريا النافعة المنهارة (Lactobacillus, Bifidobacterium, Akkermansia) ورفع المناعة المعوية sIgA."
        };
    }
}

// Get schedule list based on stage
function getScheduleForStage(stageId) {
    if (stageId === 1) {
        return [
            {
                time: "14:30 — الوجبة الأولى",
                pills: [
                    { id: "01", note: "كبسولة واحدة مع أول لقمة" },
                    { id: "02", note: "كبسولة واحدة مع أول لقمة" }
                ]
            },
            {
                time: "01:00 ص — بعد الوجبة الثانية",
                pills: [
                    { id: "01", note: "كبسولة واحدة مع وجبة خفيفة" },
                    { id: "02", note: "كبسولة واحدة مع وجبة خفيفة" }
                ]
            }
        ];
    } else if (stageId === 2) {
        return [
            {
                time: "14:30 — الوجبة الأولى",
                pills: [
                    { id: "01", note: "كبسولة واحدة مع أول لقمة" },
                    { id: "02", note: "كبسولة واحدة مع أول لقمة" },
                    { id: "03", note: "كبسولتان مع أول لقمة" }
                ]
            },
            {
                time: "18:00 — منتصف اليقظة",
                pills: [
                    { id: "04", note: "كبسولة واحدة (500mg) مع كوب ماء" }
                ]
            },
            {
                time: "20:00 — بين الوجبتين",
                pills: [
                    { id: "06", note: "كبسولة واحدة (بعيداً عن المضادات بساعتين)" }
                ]
            },
            {
                time: "23:00 — الوجبة الثانية",
                pills: [
                    { id: "03", note: "كبسولتان مع الطعام" },
                    { id: "04", note: "كبسولة واحدة (500mg)" }
                ]
            },
            {
                time: "01:00 ص — بعد الوجبة الثانية",
                pills: [
                    { id: "01", note: "كبسولة واحدة مع وجبة خفيفة" },
                    { id: "02", note: "كبسولة واحدة مع وجبة خفيفة" }
                ]
            },
            {
                time: "06:00 ص — قبل النوم",
                pills: [
                    { id: "04", note: "كبسولة واحدة (500mg)" },
                    { id: "07", note: "كبسولة واحدة (بعيداً عن مضادات الفطريات بـ 4+ ساعات)" },
                    { id: "06", note: "كبسولة واحدة (تؤخذ مع البروبيوتك)" }
                ]
            }
        ];
    } else { // Stage 3
        return [
            {
                time: "14:00 — عند الاستيقاظ",
                pills: [
                    { id: "10", note: "كبسولتان على معدة فارغة" },
                    { id: "08", note: "ملعقة صغيرة (5g) تذاب في ماء بارد على معدة فارغة" }
                ]
            },
            {
                time: "14:30 — الوجبة الأولى",
                pills: [
                    { id: "01", note: "كبسولة واحدة مع الطعام" },
                    { id: "02", note: "كبسولة واحدة مع الطعام" },
                    { id: "11", note: "كبسولتان مع الطعام" }
                ]
            },
            {
                time: "18:00 — منتصف اليقظة",
                pills: [
                    { id: "06", note: "كبسولة واحدة (بين الوجبات)" },
                    { id: "09", note: "كبسولتان مع الطعام أو بعده بقليل" }
                ]
            },
            {
                time: "23:00 — الوجبة الثانية",
                pills: [
                    { id: "01", note: "كبسولة واحدة مع الطعام" },
                    { id: "02", note: "كبسولة واحدة مع الطعام" },
                    { id: "11", note: "كبسولتان مع الطعام" }
                ]
            },
            {
                time: "06:00 ص — قبل النوم",
                pills: [
                    { id: "07", note: "كبسولة واحدة على معدة فارغة" },
                    { id: "08", note: "ملعقة صغيرة (5g) تذاب في ماء بارد" },
                    { id: "10", note: "كبسولتان على معدة فارغة" }
                ]
            }
        ];
    }
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    loadStateFromStorage();
    initTheme();
    renderWeeksGrid();
    renderSupplementsDirectory();
    renderDietGuide();
    selectWeek(currentWeek);
    selectDay(currentDay);
    
    // Theme toggle listener
    document.getElementById("themeToggleBtn").addEventListener("click", toggleTheme);
    
    // Diet search listener
    document.getElementById("dietSearchInput").addEventListener("input", filterDiet);
});

// Load progress state from localStorage
function loadStateFromStorage() {
    const savedState = localStorage.getItem("candida_tracker_state");
    const savedWeek = localStorage.getItem("candida_tracker_week");
    const savedDay = localStorage.getItem("candida_tracker_day");
    
    if (savedState) {
        trackerState = JSON.parse(savedState);
    }
    if (savedWeek) {
        currentWeek = parseInt(savedWeek, 10);
    }
    if (savedDay) {
        currentDay = parseInt(savedDay, 10);
    }
    
    // Recalculate completed days
    rebuildCompletedDays();
}

function saveStateToStorage() {
    localStorage.setItem("candida_tracker_state", JSON.stringify(trackerState));
    localStorage.setItem("candida_tracker_week", currentWeek.toString());
    localStorage.setItem("candida_tracker_day", currentDay.toString());
}

// Rebuild completed days cache based on checklist status
function rebuildCompletedDays() {
    completedDays = {};
    for (let w = 1; w <= 16; w++) {
        const stage = getStageInfo(w);
        const schedule = getScheduleForStage(stage.id);
        
        for (let d = 0; d < 7; d++) {
            const keyPrefix = `W${w}_D${d}_`;
            let totalPills = 0;
            let checkedPills = 0;
            
            schedule.forEach(group => {
                group.pills.forEach(pill => {
                    totalPills++;
                    const itemKey = `${keyPrefix}${group.time}_${pill.id}`;
                    if (trackerState[itemKey] === true) {
                        checkedPills++;
                    }
                });
            });
            
            if (totalPills > 0 && checkedPills === totalPills) {
                completedDays[`W${w}_D${d}`] = true;
            }
        }
    }
}

// Handle theme toggling
function initTheme() {
    const savedTheme = localStorage.getItem("candida_tracker_theme") || "light-theme";
    document.body.className = savedTheme;
}

function toggleTheme() {
    if (document.body.classList.contains("light-theme")) {
        document.body.className = "dark-theme";
        localStorage.setItem("candida_tracker_theme", "dark-theme");
    } else {
        document.body.className = "light-theme";
        localStorage.setItem("candida_tracker_theme", "light-theme");
    }
}

// Render the 16 Weeks buttons grid
function renderWeeksGrid() {
    const weeksGrid = document.getElementById("weeksGrid");
    weeksGrid.innerHTML = "";
    
    for (let w = 1; w <= 16; w++) {
        const btn = document.createElement("button");
        btn.className = "week-btn";
        btn.id = `weekBtn_${w}`;
        btn.textContent = w;
        btn.addEventListener("click", () => selectWeek(w));
        weeksGrid.appendChild(btn);
    }
    updateWeeksStatus();
}

// Refresh completed classes for weeks grid
function updateWeeksStatus() {
    for (let w = 1; w <= 16; w++) {
        const btn = document.getElementById(`weekBtn_${w}`);
        if (!btn) continue;
        
        // A week is completed if all 7 days in it are completed
        let weekCompleted = true;
        for (let d = 0; d < 7; d++) {
            if (!completedDays[`W${w}_D${d}`]) {
                weekCompleted = false;
                break;
            }
        }
        
        if (weekCompleted) {
            btn.classList.add("completed");
        } else {
            btn.classList.remove("completed");
        }
    }
    
    // Update global progress bar
    calculateGlobalProgress();
}

// Calculate total compliance percentage
function calculateGlobalProgress() {
    const totalDays = 16 * 7;
    let completedCount = 0;
    
    for (let w = 1; w <= 16; w++) {
        for (let d = 0; d < 7; d++) {
            if (completedDays[`W${w}_D${d}`] === true) {
                completedCount++;
            }
        }
    }
    
    const percentage = Math.round((completedCount / totalDays) * 100);
    document.getElementById("globalProgressPercent").textContent = `${percentage}%`;
    document.getElementById("globalProgressBar").style.width = `${percentage}%`;
}

// Select a specific week
function selectWeek(weekNum) {
    // Remove active class from previous
    const prevActive = document.querySelector(".week-btn.active");
    if (prevActive) prevActive.classList.remove("active");
    
    currentWeek = weekNum;
    const currentBtn = document.getElementById(`weekBtn_${weekNum}`);
    if (currentBtn) currentBtn.classList.add("active");
    
    // Update Stage Info Card
    const stage = getStageInfo(weekNum);
    const stageCard = document.querySelector(".stage-info-card");
    stageCard.className = `card stage-info-card ${stage.class}`;
    
    document.getElementById("stageBadge").textContent = `المرحلة ${stage.id}`;
    document.getElementById("stageTitle").textContent = stage.title.split(" — ")[1];
    document.getElementById("stageDuration").textContent = stage.duration;
    document.getElementById("stageDescription").textContent = stage.desc;
    
    // Save week select
    saveStateToStorage();
    
    // Re-render checklist
    renderChecklist();
    updateDaysRowStatus();
}

// Select day of the week (0 to 6)
function selectDay(dayIdx) {
    currentDay = dayIdx;
    
    // Update active class on day button
    const dayButtons = document.querySelectorAll(".day-btn");
    dayButtons.forEach((btn, idx) => {
        if (idx === dayIdx) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
    
    document.getElementById("currentDayIndicator").textContent = `جدول اليوم الحالي: ${daysNames[dayIdx]}`;
    
    saveStateToStorage();
    renderChecklist();
}

// Update the checkbox markers on day buttons
function updateDaysRowStatus() {
    const dayButtons = document.querySelectorAll(".day-btn");
    dayButtons.forEach((btn, idx) => {
        btn.addEventListener("click", () => selectDay(idx));
        
        const dayKey = `W${currentWeek}_D${idx}`;
        if (completedDays[dayKey] === true) {
            btn.classList.add("completed");
        } else {
            btn.classList.remove("completed");
        }
    });
}

// Render dynamic checklist
function renderChecklist() {
    const scheduleGroups = document.getElementById("scheduleGroups");
    scheduleGroups.innerHTML = "";
    
    const stage = getStageInfo(currentWeek);
    const schedule = getScheduleForStage(stage.id);
    
    let totalPills = 0;
    let checkedPills = 0;
    
    schedule.forEach(group => {
        const groupEl = document.createElement("div");
        groupEl.className = "schedule-group";
        
        const groupTime = document.createElement("div");
        groupTime.className = "schedule-time";
        groupTime.textContent = group.time;
        groupEl.appendChild(groupTime);
        
        const itemsEl = document.createElement("div");
        itemsEl.className = "schedule-items";
        
        group.pills.forEach(pill => {
            totalPills++;
            const pillData = supplements[pill.id];
            const itemKey = `W${currentWeek}_D${currentDay}_${group.time}_${pill.id}`;
            const isChecked = trackerState[itemKey] === true;
            
            if (isChecked) {
                checkedPills++;
            }
            
            const itemEl = document.createElement("div");
            itemEl.className = `checklist-item ${isChecked ? 'checked' : ''}`;
            
            itemEl.innerHTML = `
                <div class="checklist-checkbox-wrapper">
                    <input type="checkbox" id="${itemKey}" ${isChecked ? 'checked' : ''}>
                    <div class="checkbox-custom"></div>
                </div>
                <div class="checklist-details">
                    <div class="pill-name">${pillData.name} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-secondary)">(${pillData.brand})</span></div>
                    <div class="pill-meta">
                        <span><strong>الجرعة:</strong> ${pillData.dose}</span>
                        <span>${pill.note}</span>
                        <span class="pill-target">${pillData.target}</span>
                    </div>
                </div>
            `;
            
            // Toggle check status event
            itemEl.querySelector('input[type="checkbox"]').addEventListener("change", (e) => {
                const checked = e.target.checked;
                trackerState[itemKey] = checked;
                
                if (checked) {
                    itemEl.classList.add("checked");
                } else {
                    itemEl.classList.remove("checked");
                }
                
                // Recalculate and update
                rebuildCompletedDays();
                updateDaysRowStatus();
                updateWeeksStatus();
                saveStateToStorage();
                updateTodayProgress();
            });
            
            itemsEl.appendChild(itemEl);
        });
        
        groupEl.appendChild(itemsEl);
        scheduleGroups.appendChild(groupEl);
    });
    
    // Update daily progress numbers
    updateTodayProgressValues(checkedPills, totalPills);
}

// Helper to refresh today's progress bar values
function updateTodayProgress() {
    const stage = getStageInfo(currentWeek);
    const schedule = getScheduleForStage(stage.id);
    let totalPills = 0;
    let checkedPills = 0;
    
    schedule.forEach(group => {
        group.pills.forEach(pill => {
            totalPills++;
            const itemKey = `W${currentWeek}_D${currentDay}_${group.time}_${pill.id}`;
            if (trackerState[itemKey] === true) {
                checkedPills++;
            }
        });
    });
    
    updateTodayProgressValues(checkedPills, totalPills);
}

function updateTodayProgressValues(checked, total) {
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
    document.getElementById("dayProgressPercent").textContent = `${percentage}%`;
    document.getElementById("dayProgressBar").style.width = `${percentage}%`;
}

// Render Supplements Catalog Directory
function renderSupplementsDirectory() {
    const supplementsGrid = document.getElementById("supplementsGrid");
    supplementsGrid.innerHTML = "";
    
    Object.values(supplements).forEach(supp => {
        const card = document.createElement("div");
        card.className = "supplement-card";
        
        card.innerHTML = `
            <div class="supp-card-header">
                <h3>${supp.name}</h3>
                <span class="supp-num">#${supp.id}</span>
            </div>
            <ul class="supp-details-list">
                <li>
                    <span class="label">الشركة المصنعة</span>
                    <span class="value">${supp.brand}</span>
                </li>
                <li>
                    <span class="label">الجرعة المعتمدة</span>
                    <span class="value">${supp.dose}</span>
                </li>
                <li>
                    <span class="label">طريقة التناول والجدول</span>
                    <span class="value">${supp.timing}</span>
                </li>
            </ul>
            <div class="supp-card-target">
                <strong>الهدف العلاجي:</strong><br>
                ${supp.target}
            </div>
        `;
        
        supplementsGrid.appendChild(card);
    });
}

// Render Diet List Data
function renderDietGuide() {
    const allowedList = document.getElementById("allowedDietList");
    const forbiddenList = document.getElementById("forbiddenDietList");
    
    allowedList.innerHTML = "";
    forbiddenList.innerHTML = "";
    
    dietGuide.allowed.forEach(item => {
        const li = document.createElement("li");
        li.className = "diet-item";
        li.textContent = item;
        allowedList.appendChild(li);
    });
    
    dietGuide.forbidden.forEach(item => {
        const li = document.createElement("li");
        li.className = "diet-item";
        li.textContent = item;
        forbiddenList.appendChild(li);
    });
}

// Real-time diet guide filtering based on search input
function filterDiet(e) {
    const query = e.target.value.toLowerCase().trim();
    const items = document.querySelectorAll(".diet-item");
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (query === "") {
            item.classList.remove("hidden");
            item.classList.remove("highlight");
        } else if (text.includes(query)) {
            item.classList.remove("hidden");
            item.classList.add("highlight");
        } else {
            item.classList.add("hidden");
            item.classList.remove("highlight");
        }
    });
}
