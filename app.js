document.addEventListener('DOMContentLoaded', () => {

    // --- STATE ---
    let currentPlan = localStorage.getItem('workoutPlan') || 'A';
    let activeDay = parseInt(localStorage.getItem('activeDay')) || 1;

    // --- DOM Elements ---
    const workoutContent = document.getElementById('workout-content');
    const navContainer = document.querySelector('nav');
    const guidelinesBtn = document.getElementById('guidelines-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modal = document.getElementById('guidelines-modal');
    const planSwitchSlider = document.querySelector('.plan-switch-slider');
    const planABtn = document.getElementById('plan-a-btn');
    const planBBtn = document.getElementById('plan-b-btn');

    // --- FUNCTIONS ---
    const renderDay = (dayNumber, planId) => {
        const dayData = allWorkoutPlans[planId][dayNumber];
        if (!dayData) return;
        activeDay = dayNumber;
        localStorage.setItem('activeDay', activeDay);

        workoutContent.style.opacity = 0;

        setTimeout(() => {
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
            } else {
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
            }

            workoutContent.style.opacity = 1;
        }, 150);
    };

    const createSection = (title, content, margin = '') => {
        const sectionEl = document.createElement('div');
        sectionEl.className = margin;
        sectionEl.innerHTML = `<h3 class="text-xl font-semibold text-white mb-2 border-b-2 border-gray-700 pb-2">${title}</h3><p class="text-gray-300 leading-relaxed">${content}</p>`;
        return sectionEl;
    };

    const createExerciseCard = (exercise) => {
        const card = document.createElement('div');
        card.className = 'bg-gray-700/50 p-4 rounded-lg shadow-lg';

        card.innerHTML = `
            <h4 class="text-lg font-bold text-white">${exercise.name}</h4>
            <p class="text-blue-300 font-medium">${exercise.sets} sets of ${exercise.reps} reps</p>
            <div class="text-gray-400 text-sm mt-2 space-y-2">${exercise.cues}</div>
        `;
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

    setPlan(currentPlan); // This will set the plan and render the day

    // Plan Switch listeners
    planABtn.addEventListener('click', () => setPlan('A'));
    planBBtn.addEventListener('click', () => setPlan('B'));

    // Modal event listeners
    guidelinesBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });

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