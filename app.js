// Initialize Lucide icons
lucide.createIcons();

// State management
let habits = JSON.parse(localStorage.getItem('habits') || '[]');
let isDarkMode = document.documentElement.classList.contains('dark');

// DOM Elements
const dateHeader = document.getElementById('dateHeader');
const monthInfo = document.getElementById('monthInfo');
const yearPercentage = document.getElementById('yearPercentage');
const yearProgressBar = document.getElementById('yearProgressBar');
const daysLeftYear = document.getElementById('daysLeftYear');
const newHabitInput = document.getElementById('newHabitInput');
const addHabitBtn = document.getElementById('addHabitBtn');
const habitsContainer = document.getElementById('habitsContainer');
const themeToggle = document.getElementById('themeToggle');
const monthlyModal = document.getElementById('monthlyModal');
const closeModal = document.getElementById('closeModal');
const monthlyContent = document.getElementById('monthlyContent');

// Utility functions
const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const getDaysLeftInMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return lastDay.getDate() - now.getDate();
};

const getDaysLeftInYear = () => {
  const now = new Date();
  const endOfYear = new Date(now.getFullYear(), 11, 31);
  const diffTime = Math.abs(endOfYear.getTime() - now.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getYearDaysLeftPercentage = () => {
  const daysLeft = getDaysLeftInYear();
  return (daysLeft / 365) * 100;
};

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// UI update functions
const updateDateInfo = () => {
  const now = new Date();
  dateHeader.textContent = formatDate(now);
  monthInfo.textContent = `${getDaysLeftInMonth()} days left in ${now.toLocaleString('default', { month: 'long' })}`;
  
  const daysLeftPercentage = getYearDaysLeftPercentage();
  const daysLeft = getDaysLeftInYear();
  yearPercentage.textContent = `${daysLeftPercentage.toFixed(1)}%`;
  yearProgressBar.style.width = `${daysLeftPercentage}%`;
  daysLeftYear.textContent = daysLeft;
};

const showMonthlyView = (habit) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  
  let calendarHTML = `
    <h3 class="text-xl font-bold mb-4">${habit.name}</h3>
    <div class="mb-4">
      <span class="text-3xl font-bold">${habit.streak}</span>
      <span class="text-sm opacity-70"> days streak</span>
    </div>
    <div class="grid grid-cols-7 gap-1 mb-4">
      ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        .map(day => `<div class="text-center text-sm font-medium opacity-70">${day}</div>`)
        .join('')}
    </div>
    <div class="grid grid-cols-7 gap-1">
  `;

  const firstDay = new Date(year, month, 1).getDay();
  
  // Add empty cells for days before the first of the month
  for (let i = 0; i < firstDay; i++) {
    calendarHTML += '<div></div>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isCompleted = habit.history[date];
    const hasNote = habit.notes[date];
    const classes = [
      'calendar-day',
      isCompleted ? 'completed' : '',
      hasNote ? 'has-note' : ''
    ].filter(Boolean).join(' ');
    
    calendarHTML += `
      <div class="${classes}" title="${hasNote || ''}">${day}</div>
    `;
  }

  calendarHTML += '</div>';
  
  if (Object.keys(habit.notes).length > 0) {
    calendarHTML += `
      <div class="mt-6">
        <h4 class="font-semibold mb-2">Notes</h4>
        <div class="space-y-2">
          ${Object.entries(habit.notes)
            .map(([date, note]) => `
              <div class="text-sm">
                <span class="font-medium">${new Date(date).toLocaleDateString()}</span>: ${note}
              </div>
            `)
            .join('')}
        </div>
      </div>
    `;
  }

  monthlyContent.innerHTML = calendarHTML;
  monthlyModal.classList.remove('hidden');
  monthlyModal.classList.add('flex');
};

const createHabitCard = (habit) => {
  const today = new Date().toISOString().split('T')[0];
  const isCompleted = habit.history[today];
  const achievements = [
    { days: 7, message: '🎉 One week streak!' },
    { days: 30, message: '🌟 One month strong!' },
    { days: 50, message: '🔥 Halfway to 100!' },
    { days: 100, message: '💪 Century milestone!' }
  ];
  const currentAchievement = achievements.findLast(a => habit.streak >= a.days);

  const card = document.createElement('div');
  card.className = 'habit-card rounded-xl p-6';
  card.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-bold">${habit.name}</h3>
      <div class="flex gap-2">
        <button class="monthly-view-btn p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
          <i data-lucide="calendar" class="w-5 h-5"></i>
        </button>
        <button class="note-btn p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
          <i data-lucide="edit" class="w-5 h-5"></i>
        </button>
        <button class="toggle-btn p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${isCompleted ? 'bg-green-500/20' : ''}">
          ${isCompleted 
            ? '<i data-lucide="check" class="w-5 h-5 text-green-500"></i>' 
            : '<i data-lucide="chevron-up" class="w-5 h-5"></i>'}
        </button>
      </div>
    </div>
    <div class="mt-4">
      <div class="flex items-center gap-2">
        <span class="text-3xl font-bold ${isCompleted ? 'text-green-500' : ''}">${habit.streak}</span>
        <span class="text-sm opacity-70">days streak</span>
      </div>
      ${currentAchievement ? `
        <div class="mt-2 text-sm text-green-400 achievement">
          ${currentAchievement.message}
        </div>
      ` : ''}
    </div>
    <div class="note-container hidden mt-4">
      <div class="flex gap-2">
        <input type="text" class="flex-1 px-3 py-2 rounded bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" placeholder="Add a note for today...">
        <button class="save-note p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10">
          <i data-lucide="check" class="w-5 h-5"></i>
        </button>
        <button class="cancel-note p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
    </div>
    ${habit.notes[today] ? `
      <div class="mt-4 text-sm">
        <span class="font-medium">Today's note:</span> ${habit.notes[today]}
      </div>
    ` : ''}
  `;

  // Event listeners
  const toggleBtn = card.querySelector('.toggle-btn');
  toggleBtn.addEventListener('click', () => toggleHabit(habit.id));

  const noteBtn = card.querySelector('.note-btn');
  const noteContainer = card.querySelector('.note-container');
  const noteInput = card.querySelector('input');
  const saveNoteBtn = card.querySelector('.save-note');
  const cancelNoteBtn = card.querySelector('.cancel-note');

  const monthlyViewBtn = card.querySelector('.monthly-view-btn');
  monthlyViewBtn.addEventListener('click', () => showMonthlyView(habit));

  noteBtn.addEventListener('click', () => {
    noteContainer.classList.toggle('hidden');
    noteInput.value = habit.notes[today] || '';
    if (!noteContainer.classList.contains('hidden')) {
      noteInput.focus();
    }
  });

  saveNoteBtn.addEventListener('click', () => {
    addNote(habit.id, noteInput.value);
    noteContainer.classList.add('hidden');
    renderHabits(); // Re-render to show the new note
  });

  cancelNoteBtn.addEventListener('click', () => {
    noteContainer.classList.add('hidden');
  });

  return card;
};

const renderHabits = () => {
  habitsContainer.innerHTML = '';
  habits.forEach(habit => {
    habitsContainer.appendChild(createHabitCard(habit));
  });
  lucide.createIcons();
};

// Event handlers
const addHabit = () => {
  const name = newHabitInput.value.trim();
  if (!name) return;

  const habit = {
    id: Date.now().toString(),
    name,
    streak: 0,
    notes: {},
    history: {},
    createdAt: new Date().toISOString()
  };

  habits.push(habit);
  saveHabits();
  newHabitInput.value = '';
  renderHabits();
};

const toggleHabit = (id) => {
  const today = new Date().toISOString().split('T')[0];
  
  habits = habits.map(habit => {
    if (habit.id !== id) return habit;

    const wasCompleted = habit.history[today];
    const newHistory = { ...habit.history };

    if (wasCompleted) {
      delete newHistory[today];
      return {
        ...habit,
        streak: Math.max(0, habit.streak - 1),
        history: newHistory
      };
    } else {
      newHistory[today] = true;
      return {
        ...habit,
        streak: habit.streak + 1,
        history: newHistory
      };
    }
  });

  saveHabits();
  renderHabits();
};

const addNote = (id, note) => {
  const today = new Date().toISOString().split('T')[0];
  
  habits = habits.map(habit => {
    if (habit.id !== id) return habit;
    return {
      ...habit,
      notes: { ...habit.notes, [today]: note }
    };
  });

  saveHabits();
};

const toggleTheme = () => {
  isDarkMode = !isDarkMode;
  document.documentElement.classList.toggle('dark');
  document.body.classList.toggle('dark:bg-gradient-to-br');
  document.body.classList.toggle('dark:from-slate-900');
  document.body.classList.toggle('dark:to-slate-800');
  document.body.classList.toggle('dark:text-white');
  
  // Update theme toggle button
  themeToggle.innerHTML = isDarkMode 
    ? '<i data-lucide="sun" class="w-6 h-6"></i>'
    : '<i data-lucide="moon" class="w-6 h-6"></i>';
  
  // Store theme preference
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  
  lucide.createIcons();
  
  // Re-render habits to update their styling
  renderHabits();
};

const saveHabits = () => {
  localStorage.setItem('habits', JSON.stringify(habits));
};

// Initialize theme from localStorage
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDarkMode = savedTheme === 'dark';
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.body.classList.toggle('dark:bg-gradient-to-br', isDarkMode);
    document.body.classList.toggle('dark:from-slate-900', isDarkMode);
    document.body.classList.toggle('dark:to-slate-800', isDarkMode);
    document.body.classList.toggle('dark:text-white', isDarkMode);
    themeToggle.innerHTML = isDarkMode 
      ? '<i data-lucide="sun" class="w-6 h-6"></i>'
      : '<i data-lucide="moon" class="w-6 h-6"></i>';
    lucide.createIcons();
  }
};

// Event listeners
addHabitBtn.addEventListener('click', addHabit);
newHabitInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addHabit();
});
themeToggle.addEventListener('click', toggleTheme);
closeModal.addEventListener('click', () => {
  monthlyModal.classList.add('hidden');
  monthlyModal.classList.remove('flex');
});
monthlyModal.addEventListener('click', (e) => {
  if (e.target === monthlyModal) {
    monthlyModal.classList.add('hidden');
    monthlyModal.classList.remove('flex');
  }
});

// Initialize
initializeTheme();
updateDateInfo();
renderHabits();
setInterval(updateDateInfo, 60000); // Update date info every minute
