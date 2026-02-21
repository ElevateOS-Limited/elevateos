/* ============================================================
   EDUTECH — Frontend JavaScript
   Handles: page routing, form state, API calls, dashboard rendering
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────
let state = {
  currentPage:    'landing',
  currentStep:    1,
  uniTags:        [],
  selectedPlan:   'pro',
  pricingPeriod:  'monthly',
  profileData:    null,
  editMode:       false,
  returnPage:     'landing',
};

const PRICES = {
  monthly: { starter: 9,  pro: 19,  elite: 49 },
  annual:  { starter: 6,  pro: 13,  elite: 34 },
};

// ─────────────────────────────────────────────────────────────
// PAGE ROUTING
// ─────────────────────────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + id) || document.getElementById(id);
  if (page) {
    page.classList.add('active');
    state.currentPage = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}


function startEditProfile() {
  state.editMode = true;
  state.returnPage = 'dashboard';
  prefillIntakeFromProfile();
  showPage('intake');
}

function goHomeFromIntake() {
  if (state.editMode) {
    state.editMode = false;
    showPage(state.returnPage || 'dashboard');
    return;
  }
  showPage('landing');
}

function prefillIntakeFromProfile() {
  const form = document.getElementById('intake-form');
  if (!form || !state.profileData) return;
  const data = state.profileData;
  const setVal = (name, val) => { const el = form.querySelector(`[name="${name}"]`); if (el && val !== undefined && val !== null) el.value = val; };
  setVal('grade', data.grade);
  setVal('curriculum', data.curriculum);
  setVal('gpa', data.gpa);
  setVal('intendedMajor', data.intendedMajor);
  setVal('country', data.country);
  setVal('city', data.city);
  setVal('personalInsight', data.personalInsight);
  setVal('hoursPerWeek', data.hoursPerWeek || 6);
  const slider=document.getElementById('hrs-slider'); if(slider && data.hoursPerWeek){ slider.value=data.hoursPerWeek; updateSlider(data.hoursPerWeek); }
  state.uniTags = Array.isArray(data.targetUniversities) ? data.targetUniversities : [];
  if (typeof renderTags === 'function') renderTags();

  ['availableDays','availableTimes','travelWillingness'].forEach((name)=>{
    const vals = Array.isArray(data[name]) ? data[name] : (data[name] ? [data[name]] : []);
    form.querySelectorAll(`[name="${name}"]`).forEach((cb)=>{ cb.checked = vals.includes(cb.value); });
  });
}

// ─────────────────────────────────────────────────────────────
// NAVIGATION UTILS
// ─────────────────────────────────────────────────────────────
function smoothScroll(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // If we're not on the landing page, switch first
  if (state.currentPage !== 'landing') showPage('landing');
}

function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('open');
}

// Sticky nav scroll effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('main-nav');
  if (nav) nav.style.boxShadow = window.scrollY > 30 ? '0 4px 30px rgba(0,0,0,0.4)' : '';
});

// ─────────────────────────────────────────────────────────────
// PRICING TOGGLE
// ─────────────────────────────────────────────────────────────
function setPricingPeriod(period) {
  state.pricingPeriod = period;
  document.getElementById('toggle-monthly').classList.toggle('active', period === 'monthly');
  document.getElementById('toggle-annual').classList.toggle('active', period === 'annual');

  const prices = PRICES[period];
  document.getElementById('price-starter').textContent = prices.starter;
  document.getElementById('price-pro').textContent     = prices.pro;
  document.getElementById('price-elite').textContent   = prices.elite;
}

// ─────────────────────────────────────────────────────────────
// TRIAL / PLAN SELECTION
// ─────────────────────────────────────────────────────────────
function startTrial(plan) {
  state.selectedPlan = plan;
  // Update the auth page plan display
  const names = { starter: 'Starter — $9/mo', pro: 'Pro — $19/mo', elite: 'Elite — $49/mo' };
  const el = document.getElementById('apd-plan-name');
  if (el) el.textContent = names[plan] || 'Pro — $19/mo';
  showPage('signup');
}

// ─────────────────────────────────────────────────────────────
// SIGNUP FORM
// ─────────────────────────────────────────────────────────────
async function handleSignup(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    name:  form.fullName.value.trim(),
    email: form.email.value.trim(),
    plan:  state.selectedPlan,
  };

  const btn      = document.getElementById('signup-submit');
  const textEl   = document.getElementById('signup-text');
  const loadEl   = document.getElementById('signup-loading');

  btn.disabled   = true;
  textEl.style.display = 'none';
  loadEl.style.display = 'inline';

  try {
    const res  = await fetch('/api/subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      showToast('🎉 Trial started! Let\'s build your profile.');
      setTimeout(() => showPage('intake'), 1200);
    } else {
      showToast('Something went wrong. Please try again.', true);
    }
  } catch (err) {
    // If server is not running, go straight to intake (demo mode)
    showToast('Welcome! Continuing in demo mode.');
    setTimeout(() => showPage('intake'), 1000);
  } finally {
    btn.disabled = false;
    textEl.style.display = 'inline';
    loadEl.style.display = 'none';
  }
}

// ─────────────────────────────────────────────────────────────
// INTAKE FORM — STEP LOGIC
// ─────────────────────────────────────────────────────────────
function nextStep(current) {
  const step = document.getElementById(`istep-${current}`);
  const next = document.getElementById(`istep-${current + 1}`);
  if (!next) return;

  // Basic validation for step 1
  if (current === 1) {
    const grade = document.querySelector('[name="grade"]')?.value;
    if (!grade) { showToast('Please select your grade.', true); return; }
  }

  step.classList.remove('active');
  next.classList.add('active');
  state.currentStep = current + 1;
  updateStepNav(current + 1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(current) {
  const step = document.getElementById(`istep-${current}`);
  const prev = document.getElementById(`istep-${current - 1}`);
  if (!prev) return;
  step.classList.remove('active');
  prev.classList.add('active');
  state.currentStep = current - 1;
  updateStepNav(current - 1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepNav(active) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`isnav-${i}`);
    if (!el) continue;
    el.classList.remove('active', 'done');
    if (i < active) el.classList.add('done');
    if (i === active) el.classList.add('active');
  }
}

// ─────────────────────────────────────────────────────────────
// TAG INPUT (Universities)
// ─────────────────────────────────────────────────────────────
function initTagInput() {
  const input = document.getElementById('uni-input');
  if (!input) return;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = input.value.trim();
      if (val && !state.uniTags.includes(val)) {
        state.uniTags.push(val);
        renderTags();
        input.value = '';
      }
    }
    if (e.key === 'Backspace' && input.value === '' && state.uniTags.length) {
      state.uniTags.pop();
      renderTags();
    }
  });
}

function renderTags() {
  const box   = document.getElementById('uni-tag-box');
  const input = document.getElementById('uni-input');
  const data  = document.getElementById('uni-data');
  if (!box || !input) return;

  // Remove existing pills
  box.querySelectorAll('.tag-pill').forEach(p => p.remove());

  state.uniTags.forEach((tag, i) => {
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.innerHTML = `${tag}<span class="tag-pill-x" onclick="removeTag(${i})">×</span>`;
    box.insertBefore(pill, input);
  });

  if (data) data.value = JSON.stringify(state.uniTags);
}

function removeTag(i) {
  state.uniTags.splice(i, 1);
  renderTags();
}

// ─────────────────────────────────────────────────────────────
// WORD COUNT
// ─────────────────────────────────────────────────────────────
function initWordCount() {
  const ta   = document.getElementById('insight-ta');
  const disp = document.getElementById('wcount-display');
  if (!ta || !disp) return;

  ta.addEventListener('input', () => {
    const words = ta.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    const goal  = 100;
    disp.textContent = `${words} words${words < goal ? ` — aim for ${goal}+` : ' ✓ Great!'}`;
    disp.className = `ig-wcount${words >= goal ? ' good' : ''}`;
  });
}

// ─────────────────────────────────────────────────────────────
// SLIDER
// ─────────────────────────────────────────────────────────────
function updateSlider(val) {
  const badge = document.getElementById('hrs-badge');
  if (badge) badge.textContent = `${val} hrs/week`;
}

// ─────────────────────────────────────────────────────────────
// FORM SUBMISSION
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('intake-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData  = new FormData(form);
      const data      = Object.fromEntries(formData.entries());

      // Collect multi-value checkboxes
      data.availableDays  = [...form.querySelectorAll('[name="availableDays"]:checked')].map(c => c.value);
      data.availableTimes = [...form.querySelectorAll('[name="availableTimes"]:checked')].map(c => c.value);
      data.travelWillingness = [...form.querySelectorAll('[name="travelWillingness"]:checked')].map(c => c.value);
      data.targetUniversities = state.uniTags;
      data.unsure         = document.getElementById('unsure-cb')?.checked || false;

      state.profileData = data;
      localStorage.setItem('edutech_profile', JSON.stringify(data));
      await generateProfile(data);
    });
  }

  // Initialize interactive components
  initTagInput();
  initWordCount();

  try {
    const saved = localStorage.getItem('edutech_profile');
    if (saved) state.profileData = JSON.parse(saved);
  } catch {}
});

// ─────────────────────────────────────────────────────────────
// AI GENERATION
// ─────────────────────────────────────────────────────────────
async function generateProfile(data) {
  showLoadingOverlay();

  // Step animation
  setTimeout(() => animateLoadingStep(2), 900);
  setTimeout(() => animateLoadingStep(3), 1600);

  try {
    const res  = await fetch('/api/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Server error');
    const result = await res.json();
    hideLoadingOverlay();
    localStorage.setItem('edutech_profile', JSON.stringify(data));
    state.profileData = data;
    state.editMode = false;
    renderDashboard(result, data);
    showPage('dashboard');
  } catch (err) {
    // DEMO FALLBACK: generate locally if server isn't running
    console.warn('Server not available, using demo data.');
    const demo = localDemoGenerate(data);
    setTimeout(() => {
      hideLoadingOverlay();
      localStorage.setItem('edutech_profile', JSON.stringify(data));
      state.profileData = data;
      state.editMode = false;
      renderDashboard(demo, data);
      showPage('dashboard');
    }, 2500);
  }
}

function showLoadingOverlay() {
  const ov = document.getElementById('loading-overlay');
  if (ov) { ov.style.display = 'flex'; }
  // Reset steps
  ['lst-1','lst-2','lst-3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'lstep';
  });
  const l1 = document.getElementById('lst-1');
  if (l1) l1.className = 'lstep done';
}

function hideLoadingOverlay() {
  const ov = document.getElementById('loading-overlay');
  if (ov) ov.style.display = 'none';
}

function animateLoadingStep(step) {
  const prev = document.getElementById(`lst-${step - 1}`);
  const curr = document.getElementById(`lst-${step}`);
  if (prev && !prev.classList.contains('done')) prev.className = 'lstep done';
  if (curr) curr.className = 'lstep active';
}

// ─────────────────────────────────────────────────────────────
// DEMO/FALLBACK LOCAL GENERATOR
// (mirrors server logic for offline/demo use)
// ─────────────────────────────────────────────────────────────
function localDemoGenerate(data) {
  const major   = (data.intendedMajor || '').toLowerCase();
  const insight = (data.personalInsight || '').toLowerCase();
  const unsure  = data.unsure;
  const name    = data.firstName || 'Student';

  let focusAreas, activities, actionPlan, profileSummary;

  if (unsure) {
    focusAreas = [
      { id:'exploration', label:'Broad Exploration',      icon:'🔭', description:'Discover diverse fields through structured experiences' },
      { id:'leadership',  label:'Leadership Development', icon:'🌟', description:'Build skills that transfer to any career path' },
      { id:'community',   label:'Community Impact',       icon:'🤝', description:'Create change while discovering your passions' },
    ];
  } else {
    const stemMatch = /engineer|tech|cs|computer|code|software|ai|data/.test(major + insight);
    const medMatch  = /medicine|bio|health|doctor|clinic/.test(major + insight);
    const bizMatch  = /business|econ|entrepreneur|startup|finance/.test(major + insight);

    if (stemMatch) {
      focusAreas = [
        { id:'stem',     label:'STEM & Engineering',  icon:'⚙️', description:'Technical skills, innovation and real-world projects' },
        { id:'research', label:'Research & Innovation',icon:'🔬', description:'Original research to differentiate your application' },
        { id:'leadership',label:'Leadership',          icon:'🌟', description:'Lead teams and initiatives in your field' },
      ];
    } else if (medMatch) {
      focusAreas = [
        { id:'medicine', label:'Medicine & Health',   icon:'🏥', description:'Clinical exposure and pre-med research' },
        { id:'science',  label:'Life Sciences',       icon:'🧬', description:'Biology, chemistry and research fundamentals' },
        { id:'community',label:'Community Impact',    icon:'🤝', description:'Health advocacy and volunteer leadership' },
      ];
    } else if (bizMatch) {
      focusAreas = [
        { id:'business',  label:'Business & Entrepreneurship', icon:'📈', description:'Build ventures and develop financial acumen' },
        { id:'leadership',label:'Leadership Development',      icon:'🌟', description:'Executive presence and organizational skills' },
        { id:'community', label:'Social Impact',              icon:'🤝', description:'Purpose-driven business and social change' },
      ];
    } else {
      focusAreas = [
        { id:'leadership', label:'Leadership Development', icon:'🌟', description:'Transferable skills for any career' },
        { id:'research',   label:'Research & Writing',     icon:'📝', description:'Academic depth admissions officers notice' },
        { id:'community',  label:'Community Impact',       icon:'🤝', description:'Commitment to something larger than yourself' },
      ];
    }
  }

  activities = [
    { title:'Cold-Email a University Professor', type:'Research Internship', why:'Landing a research role as a high-schooler is rare and extremely impressive to admissions teams.', difficulty:'Medium', time:'6–10 hrs/week', how:'Find faculty doing relevant work online, send a short specific email describing your interest and background.', impact:'🔥 Extremely High', location:'Online & Local' },
    { title:`${focusAreas[0].label.split(' ')[0]} Competition or Olympiad`, type:'Competition', why:`Competitions in ${focusAreas[0].label} demonstrate initiative and mastery beyond the classroom.`, difficulty:'High', time:'5–10 hrs/week', how:'Search for national and international competitions in your focus area on competition databases.', impact:'🔥 Extremely High', location:'Online & National' },
    { title:'Start or Lead a School Club', type:'Leadership', why:'Founding something shows vision. Sustaining it shows follow-through — both are rare traits at your age.', difficulty:'Low', time:'2–4 hrs/week', how:'Identify a gap at your school, pitch to administration, recruit members, and run real programs.', impact:'⚡ High', location:'School-based' },
    { title:'Community Service Initiative', type:'Community Impact', why:'Creating structured programs (not just volunteering) demonstrates social intelligence and leadership maturity.', difficulty:'Medium', time:'3–5 hrs/week', how:'Partner with a local organization or school. Measure your impact with data.', impact:'⚡ High', location:'Local & Online' },
    { title:'Publish Original Writing or Research', type:'Academic Achievement', why:'Publications at the high school level are extremely rare and instantly distinguish applicants.', difficulty:'High', time:'5–8 hrs/week', how:'Submit essays or research to student journals like Curieux Academic Journal or Dialectical Anthropology.', impact:'🔥 Extremely High', location:'Online' },
    { title:'Attend a Summer Academic Program', type:'Academic Program', why:'Selective summer programs expose you to rigorous academic environments and build elite peer networks.', difficulty:'Medium', time:'2–6 weeks', how:'Apply to CTY (Johns Hopkins), Stanford OHS, or virtual programs on Coursera for free.', impact:'⚡ High', location:'Online & Residential' },
  ];

  actionPlan = [
    { phase:'Week 1–2', title:'Foundation', icon:'🏗️', actions:['Create professional accounts: LinkedIn, GitHub (or Behance), and a dedicated email.','Research your 3 focus areas in depth — articles, talks, and real career paths.','Identify 2–3 adults who can connect you to professionals in your target field.'] },
    { phase:'Month 1', title:'First Commitments', icon:'🚀', actions:['Apply to your top recommended activity — start with the most achievable one.','Start a portfolio tracker in Notion or Google Docs to log everything.','Reach out to 5 professionals for 20-minute informational interviews.'] },
    { phase:'Month 2–3', title:'Build Depth', icon:'📚', actions:['Log your activities weekly with what you learned and your contributions.','Identify one competition or program as a 3–6 month milestone target.','Draft your "why" story — the problem that drives you and what you plan to do about it.'] },
    { phase:'Month 4–6', title:'Create Impact', icon:'⚡', actions:['Take a leadership role in at least one activity.','Track measurable outcomes: people helped, projects built, papers submitted.','Practice 200-word stories about each experience for your personal statement.'] },
    { phase:'Ongoing', title:'Sustain & Amplify', icon:'🌟', actions:['Return to Edutech every 6–8 weeks to refresh your recommendations.','Cultivate 2–3 teachers who can write specific recommendation letters.','Prepare a 60-second personal pitch — who you are and what you stand for.'] },
  ];

  const unis   = (data.targetUniversities || []).join(', ') || 'top universities';
  const majStr = data.intendedMajor || 'an undecided field';

  profileSummary = unsure
    ? `You're a Grade ${data.grade || '9–12'} student currently exploring your direction — which is completely valid. Many of the most compelling applicants found their passion through structured exploration, not sudden clarity. Your plan prioritizes helping you discover what truly excites you through ${focusAreas.map(f=>f.label).join(', ')}.`
    : `You're a Grade ${data.grade || '9–12'} student targeting ${unis} with a genuine interest in ${majStr}. Your personal insight reveals intellectual curiosity and a drive for real-world impact. Your focus pillars — ${focusAreas.map(f=>f.label).join(', ')} — will shape a portfolio that tells a coherent, compelling story.`;

  return { profileSummary, focusAreas, activities, actionPlan, studentName: name };
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD RENDERING
// ─────────────────────────────────────────────────────────────
function renderDashboard(result, formData) {
  const { profileSummary, focusAreas, activities, actionPlan, studentName } = result;

  // Greeting
  const greeting = document.getElementById('dash-greeting');
  const subtitle = document.getElementById('dash-subtitle');
  if (greeting) greeting.textContent = `Welcome, ${studentName || 'Student'}.`;
  if (subtitle) subtitle.textContent = 'Here\'s your personalized university portfolio roadmap.';

  // Profile summary
  const summaryEl = document.getElementById('profile-summary-text');
  if (summaryEl) summaryEl.textContent = profileSummary;

  // Focus areas
  const focusEl = document.getElementById('focus-areas-container');
  if (focusEl) {
    focusEl.innerHTML = `<div class="focus-pill-group">${focusAreas.map(f => `
      <div class="focus-area-item">
        <span class="fa-icon">${f.icon}</span>
        <div>
          <div class="fa-label">${f.label}</div>
          <div class="fa-desc">${f.description}</div>
        </div>
      </div>`).join('')}</div>`;
  }

  // Snapshot
  const snapshotEl = document.getElementById('snapshot-grid');
  if (snapshotEl) {
    const gpa    = formData.gpa || '—';
    const grade  = formData.grade ? `Grade ${formData.grade}` : '—';
    const unis   = (formData.targetUniversities || []).length || '—';
    const acts   = activities.length;
    snapshotEl.innerHTML = `
      <div class="snap-item"><span class="snap-val">${grade}</span><span class="snap-label">Current Grade</span></div>
      <div class="snap-item"><span class="snap-val">${gpa}</span><span class="snap-label">GPA</span></div>
      <div class="snap-item"><span class="snap-val">${unis}</span><span class="snap-label">Target Universities</span></div>
      <div class="snap-item"><span class="snap-val">${acts}</span><span class="snap-label">Matched Activities</span></div>`;
  }

  // Activities
  const actEl = document.getElementById('activities-container');
  if (actEl) {
    actEl.innerHTML = activities.map(act => `
      <div class="act-card">
        <div class="act-card-top">
          <span class="act-type-badge">${act.type}</span>
          <span class="act-impact">${act.impact}</span>
        </div>
        <div class="act-title">${act.title}</div>
        <div class="act-why">${act.why}</div>
        <div class="act-meta">
          <span class="act-meta-item">⏱ ${act.time}</span>
          <span class="act-meta-item">📊 ${act.difficulty}</span>
          <span class="act-meta-item">📍 ${act.location}</span>
        </div>
        <div class="act-how-box">
          <div class="act-how-label">How to get involved</div>
          <div class="act-how-text">${act.how}</div>
        </div>
      </div>`).join('');
  }

  // Action plan
  const planEl = document.getElementById('plan-container');
  if (planEl) {
    planEl.innerHTML = actionPlan.map((phase, i) => `
      <div class="plan-phase">
        <div class="plan-phase-dot">${phase.icon}</div>
        <div class="plan-phase-body">
          <div class="plan-phase-meta">
            <span class="plan-phase-period">${phase.phase}</span>
            <span class="plan-phase-title">${phase.title}</span>
          </div>
          <div class="plan-phase-actions">
            ${phase.actions.map(a => `
              <div class="plan-action-item">
                <div class="pai-bullet"></div>
                <div class="pai-text">${a}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>`).join('');
  }
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD TAB SWITCHING
// ─────────────────────────────────────────────────────────────
function showDashTab(id, btn) {
  document.querySelectorAll('.dashtab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.dtab').forEach(b => b.classList.remove('active'));
  const tab = document.getElementById('dashtab-' + id);
  if (tab) tab.classList.add('active');
  if (btn) btn.classList.add('active');
}

// ─────────────────────────────────────────────────────────────
// REGEN PROFILE
// ─────────────────────────────────────────────────────────────
function regenProfile() {
  if (!state.profileData) {
    showPage('intake');
    return;
  }
  showToast('🔄 Regenerating your recommendations...');
  generateProfile(state.profileData);
}

// ─────────────────────────────────────────────────────────────
// FAQ ACCORDION
// ─────────────────────────────────────────────────────────────
function toggleFaq(el) {
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

// ─────────────────────────────────────────────────────────────
// TOAST NOTIFICATION
// ─────────────────────────────────────────────────────────────
let toastTimeout;
function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'block';
  toast.style.background = isError ? '#dc2626' : '#0c0e12';
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

// ─────────────────────────────────────────────────────────────
// SCROLL REVEAL ANIMATION
// ─────────────────────────────────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feat-card, .tcard, .plan-card, .step-block').forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();

  // Set default plan display
  const apd = document.getElementById('apd-plan-name');
  if (apd) apd.textContent = 'Pro — $19/mo';
});
