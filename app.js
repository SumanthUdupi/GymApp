document.addEventListener('DOMContentLoaded', () => {

    // --- STATE ---
    let currentPlan = localStorage.getItem('workoutPlan') || 'A';
    let activeDay = parseInt(localStorage.getItem('activeDay')) || 1;
    let showGifs = localStorage.getItem('showGifs') === 'false' ? false : true;

    // --- DOM Elements ---
    const workoutContent = document.getElementById('workout-content');
    const navContainer = document.querySelector('nav');
    const guidelinesBtn = document.getElementById('guidelines-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modal = document.getElementById('guidelines-modal');
    const planSwitchSlider = document.querySelector('.plan-switch-slider');
    const planABtn = document.getElementById('plan-a-btn');
    const planBBtn = document.getElementById('plan-b-btn');
    const gifToggle = document.getElementById('gif-toggle');
    const libraryBtn = document.getElementById('library-btn');
    const libraryModal = document.getElementById('library-modal');
    const closeLibraryBtn = document.getElementById('close-library-btn');
    const libraryContent = document.getElementById('library-content');

    // --- FUNCTIONS ---
    const populateExerciseLibrary = () => {
        const allExercises = new Map();

        // Collect all unique exercises
        Object.values(allWorkoutPlans).forEach(plan => {
            Object.values(plan).forEach(day => {
                if (day.exercises) {
                    day.exercises.forEach(exercise => {
                        if (!allExercises.has(exercise.name)) {
                            allExercises.set(exercise.name, exercise);
                        }
                    });
                }
            });
        });

        // Sort exercises alphabetically
        const sortedExercises = Array.from(allExercises.values()).sort((a, b) => a.name.localeCompare(b.name));

        // Create and append exercise cards
        libraryContent.innerHTML = sortedExercises.map(exercise => `
            <div class="bg-gray-700 p-4 rounded-lg shadow-lg flex flex-col items-center text-center">
                <h4 class="text-md font-bold text-white mb-2">${exercise.name}</h4>
                <div class="w-full h-40 bg-gray-800 rounded-md overflow-hidden">
                    <img src="${exercise.gif}" alt="${exercise.name} form" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML = \`<div class='w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-sm'>GIF not available</div>\`;">
                </div>
            </div>
        `).join('');
    };
    const renderDay = (dayNumber, planId) => {
        const dayData = allWorkoutPlans[planId][dayNumber];
        if (!dayData) return;
        activeDay = dayNumber;
                localStorage.setItem('activeDay', activeDay);

        workoutContent.innerHTML = '';

        const titleEl = document.createElement('h2');
        titleEl.className = 'text-2xl md:text-3xl font-bold text-center text-blue-400 mb-6';
        titleEl.textContent = `Day ${dayNumber}: ${dayData.title}`;
        workoutContent.appendChild(titleEl);

        if (dayNumber === 7) {
            const restEl = document.createElement('div');
            restEl.className = 'text-center p-8';
            restEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-green-400 mb-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg><p class="text-lg text-gray-300">${dayData.cooldown}</p>`;
            workoutContent.appendChild(restEl);
            return;
        }

        const warmupEl = createSection('Warm-up', dayData.warmup);
        workoutContent.appendChild(warmupEl);

        const trainingTitle = document.createElement('h3');
        trainingTitle.className = 'text-xl font-semibold text-white mt-8 mb-4 border-b-2 border-gray-700 pb-2';
        trainingTitle.textContent = 'Main Training';
        workoutContent.appendChild(trainingTitle);

        const exercisesContainer = document.createElement('div');
        exercisesContainer.className = 'space-y-4';
        dayData.exercises.forEach(ex => {
            exercisesContainer.appendChild(createExerciseCard(ex));
        });
        workoutContent.appendChild(exercisesContainer);

        const cooldownEl = createSection('Cool-down', dayData.cooldown, 'mt-8');
        workoutContent.appendChild(cooldownEl);
    };

    const createSection = (title, content, margin = '') => {
        const sectionEl = document.createElement('div');
        sectionEl.className = margin;
        sectionEl.innerHTML = `<h3 class="text-xl font-semibold text-white mb-2 border-b-2 border-gray-700 pb-2">${title}</h3><p class="text-gray-300 leading-relaxed">${content}</p>`;
        return sectionEl;
    };

    const createExerciseCard = (exercise) => {
        const card = document.createElement('div');
        card.className = 'bg-gray-700/50 p-4 rounded-lg shadow-lg flex flex-col md:flex-row gap-4 items-center';

        const textClasses = ['flex-1', 'w-full'];
        if (!showGifs) {
            textClasses.push('text-center');
        }

        const textContent = `
            <div class="${textClasses.join(' ')}">
                <h4 class="text-lg font-bold text-white">${exercise.name}</h4>
                <p class="text-blue-300 font-medium">${exercise.sets} sets of ${exercise.reps} reps</p>
                <p class="text-gray-400 text-sm mt-2">${exercise.cues}</p>
            </div>
        `;

        const gifContent = `
            <div class="flex-shrink-0 w-48 h-48 md:w-40 md:h-40 bg-gray-800 rounded-md overflow-hidden">
                <img src="${exercise.gif}" alt="${exercise.name} form" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML = \`<div class='w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-sm'>GIF not available</div>\`;">
            </div>
        `;

        card.innerHTML = showGifs ? textContent + gifContent : textContent;
        return card;
    };

    const updateActiveButton = (day) => {
        document.querySelectorAll('nav button').forEach(button => {
            button.classList.remove('active-day');
            if (parseInt(button.dataset.day) === day) {
                button.classList.add('active-day');
            }
        });
    };

    const setPlan = (planId) => {
        currentPlan = planId;
        localStorage.setItem('workoutPlan', currentPlan);
        if (planId === 'A') {
            planSwitchSlider.classList.remove('plan-b');
            planABtn.classList.add('text-white');
            planBBtn.classList.remove('text-white');
        } else {
            planSwitchSlider.classList.add('plan-b');
            planBBtn.classList.add('text-white');
            planABtn.classList.remove('text-white');
        }
        renderDay(activeDay, currentPlan);
        updateActiveButton(activeDay);
    }

    // --- INITIALIZATION & EVENT LISTENERS ---
    navContainer.innerHTML = '';
    for (let i = 1; i <= 7; i++) {
        const button = document.createElement('button');
        button.textContent = `Day ${i}`;
        button.dataset.day = i;
        button.className = 'px-4 py-2 bg-gray-700 rounded-md hover:bg-blue-600 transition-colors duration-200 font-medium';
        button.addEventListener('click', () => {
            renderDay(i, currentPlan);
            updateActiveButton(i);
        });
        navContainer.appendChild(button);
    }

    // Load state and initialize UI
    // If no active day is saved, set it to the current day of the week
    if (localStorage.getItem('activeDay') === null) {
        const dayOfWeek = new Date().getDay();
        const dayMap = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
        activeDay = dayMap[dayOfWeek];
        localStorage.setItem('activeDay', activeDay);
    }

    gifToggle.checked = showGifs;
    setPlan(currentPlan); // This will set the plan and render the day

    // Plan Switch listeners
    planABtn.addEventListener('click', () => setPlan('A'));
    planBBtn.addEventListener('click', () => setPlan('B'));

    // GIF Toggle listener
    gifToggle.addEventListener('change', () => {
        showGifs = gifToggle.checked;
        localStorage.setItem('showGifs', showGifs);
        renderDay(activeDay, currentPlan);
    });

    // Modal event listeners
    guidelinesBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    // Library modal event listeners
    libraryBtn.addEventListener('click', () => libraryModal.classList.remove('hidden'));
    closeLibraryBtn.addEventListener('click', () => libraryModal.classList.add('hidden'));
    libraryModal.addEventListener('click', (e) => {
        if (e.target === libraryModal) libraryModal.classList.add('hidden');
    });

    populateExerciseLibrary();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
});