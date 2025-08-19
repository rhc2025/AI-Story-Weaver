document.addEventListener('DOMContentLoaded', () => {
    let jsPDF;
    try {
        jsPDF = window.jspdf.jsPDF;
    } catch (e) {
        console.warn("jsPDF library not found. The 'Save as PDF' feature will be unavailable.");
    }

    // --- Element Selectors ---
    const generateBtn = document.querySelector('.button-container .generate-button');
    const storyContentEl = document.getElementById('story-content');
    const storyTitleEl = document.getElementById('story-title');
    const storyTitleTextEl = document.getElementById('story-title-text');
    const headerIllustrationEl = document.getElementById('header-illustration');
    const adminToggleBtn = document.querySelector('.admin-toggle');
    const fictionTypeEl = document.getElementById('fiction-type');
    const genreEl = document.getElementById('genre');
    const summaryBtn = document.querySelector('.summary-button');
    const topicInput = document.getElementById('topic');
    const devModeToggle = document.getElementById('dev-mode-toggle');
    const continueBtn = document.querySelector('.continue-button');
    const clearStoryBtn = document.querySelector('.clear-story-button');
    const saveStoryBtn = document.querySelector('.save-story-button');
    const suggestNameBtn = document.getElementById('suggest-name-btn');
    const llmModelSelect = document.getElementById('llm-model');
    const reviseBtn = document.getElementById('revise-btn');
    const notebookEl = document.getElementById('notebook');
    const rightPage = document.getElementById('right-page');
    const buttonContainer = document.querySelector('.button-container');
    const curatedPromptsBtn = document.getElementById('curated-prompts-btn');
    const openLoomBtn = document.getElementById('open-loom-btn');
    
    // Control Panels
    const storyControls = document.getElementById('story-controls');
    const researchControls = document.getElementById('research-controls');
    const novelistControls = document.getElementById('novelist-controls');
    const chatControls = document.getElementById('chat-controls');
    const cafeControls = document.getElementById('cafe-controls');
    const mapControls = document.getElementById('map-controls');
    const agentControls = document.getElementById('agent-controls');
    const sharedControlsContainer = document.getElementById('shared-controls-container');

    // Chat Elements
    const chatContentEl = document.getElementById('chat-content');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatLoomBtn = document.getElementById('chat-loom-btn');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const saveChatBtn = document.getElementById('save-chat-btn');
    const chatTheaterBtn = document.getElementById('chat-theater-btn');

    // Chat Theater Elements
    const chatTheaterContentEl = document.getElementById('chat-theater-content');
    const chatTheaterInput = document.getElementById('chat-theater-input');
    const chatTheaterSendBtn = document.getElementById('chat-theater-send-btn');
    const chatTheaterClearBtn = document.getElementById('chat-theater-clear-btn');
    const chatTheaterSaveBtn = document.getElementById('chat-theater-save-btn');

    // Map Elements
    const mapContentEl = document.getElementById('map-content');
    const findLocationBtn = document.getElementById('find-location-btn');
    const generateMapStoryBtn = document.getElementById('generate-map-story-btn');
    const locationInput = document.getElementById('location-input');

    // Agent Elements
    const agentContentEl = document.getElementById('agent-content');
    const agentGoalInput = document.getElementById('agent-goal');
    const clearAgentBtn = document.getElementById('clear-agent-btn');


    // Map Variables
    let map;
    let geocoder;
    let currentMarker;
    let isMapScriptLoading = false;


    // --- Modal Elements & Buttons ---
    const modals = {
        disclaimer: { modal: document.getElementById('disclaimer-modal'), link: document.querySelector('.disclaimer-link'), close: document.getElementById('disclaimer-modal-close-btn') },
        loom: { modal: document.getElementById('loom-modal'), link: document.getElementById('open-loom-btn'), close: document.getElementById('loom-modal-close-btn') },
        revisionLoom: { modal: document.getElementById('revision-loom-modal'), link: document.getElementById('open-revision-loom-btn'), close: document.getElementById('revision-loom-close-btn') },
        loomHelp: { modal: document.getElementById('loom-help-modal'), link: document.getElementById('loom-info-btn'), close: document.getElementById('loom-help-close-btn') },
        revisionGuide: { modal: document.getElementById('revision-guide-modal'), link: document.getElementById('revision-guide-btn'), close: document.getElementById('revision-guide-close-btn') },
        faq: { modal: document.getElementById('faq-modal'), link: document.querySelector('.faq-link'), close: document.getElementById('faq-modal-close-btn') },
        summary: { modal: document.getElementById('summary-modal'), link: summaryBtn, close: document.getElementById('summary-modal-close-btn') },
        actions: { modal: document.getElementById('actions-modal'), link: document.querySelector('.actions-link'), close: document.getElementById('actions-modal-close-btn') },
        prompts: { modal: document.getElementById('prompts-modal'), link: document.querySelector('.prompts-button'), close: document.getElementById('prompts-modal-close-btn') },
        history: { modal: document.getElementById('history-modal'), link: document.querySelector('.history-link'), close: document.getElementById('history-modal-close-btn') },
        display: { modal: document.getElementById('display-settings-modal'), link: document.querySelector('.display-button'), close: document.getElementById('display-settings-close-btn') },
        guide: { modal: document.getElementById('guide-modal'), link: document.querySelector('.guide-link'), close: document.getElementById('guide-modal-close-btn') },
        settings: { modal: document.getElementById('settings-modal'), link: adminToggleBtn, close: document.getElementById('settings-modal-close-btn') },
        warning: { modal: document.getElementById('warning-modal'), close: document.getElementById('warning-modal-close-btn') },
        theater: { modal: document.getElementById('theater-modal'), link: document.querySelector('.theater-button'), close: document.getElementById('theater-modal-close-btn') },
        archive: { modal: document.getElementById('archive-modal'), link: document.getElementById('archive-link'), close: document.getElementById('archive-modal-close-btn') },
        musicMenu: { modal: document.getElementById('music-menu-modal'), link: document.getElementById('open-music-menu-btn'), close: document.getElementById('music-menu-close-btn') },
        personaMenu: { modal: document.getElementById('persona-menu-modal'), link: document.getElementById('open-persona-menu-btn'), close: document.getElementById('persona-menu-close-btn') },
        personaInfo: { modal: document.getElementById('persona-info-modal'), link: document.getElementById('persona-info-btn'), close: document.getElementById('persona-info-close-btn') },
        saveChat: { modal: document.getElementById('save-chat-modal'), link: saveChatBtn, close: document.getElementById('save-chat-modal-close-btn') },
        chatTheater: { modal: document.getElementById('chat-theater-modal'), link: chatTheaterBtn, close: document.getElementById('chat-theater-modal-close-btn') },
        apiKeyManager: { modal: document.getElementById('api-key-manager-modal'), link: document.getElementById('api-key-manager-btn'), close: document.getElementById('api-key-manager-close-btn') }
    };
    
    // --- Functions Called by Modal Event Listeners ---
    
    function renderHistoryModal() {
        const history = getStoryHistory();
        const historyListEl = document.getElementById('history-list');
        const counterEl = document.getElementById('bookshelf-counter');
        historyListEl.innerHTML = '';
        counterEl.textContent = `${history.length}/${BOOKSHELF_LIMIT} Used`;

        if (history.length === 0) {
            historyListEl.innerHTML = '<p>Your bookshelf is empty. Generate a story or save a chat to add an item!</p>';
            return;
        }
        
        const chats = history.filter(item => item.settings.mode === 'chat');
        const novels = history.filter(item => item.settings.mode === 'novelist');
        const agentCreations = history.filter(item => item.settings.mode === 'agent');
        const nonFiction = history.filter(item => item.settings.mode === 'research' || (item.settings.fictionType === 'non-fiction' && !['novelist', 'chat', 'agent'].includes(item.settings.mode)));
        const fiction = history.filter(item => item.settings.fictionType === 'fiction' && !['novelist', 'chat', 'agent'].includes(item.settings.mode));

        const createShelf = (title, items, colorOffset) => {
            if (items.length === 0) return '';

            const shelf = document.createElement('div');
            shelf.className = 'bookshelf-shelf';

            const heading = document.createElement('h3');
            heading.textContent = title;
            shelf.appendChild(heading);

            const row = document.createElement('div');
            row.className = 'bookshelf-row';
            
            const bookColors = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#f39c12', '#d35400', '#16a085', '#34495e'];
            
            items.forEach(item => {
                const originalIndex = history.indexOf(item);
                const book = document.createElement('div');
                book.className = 'book-cover';
                book.dataset.index = originalIndex;
                book.style.backgroundColor = bookColors[(originalIndex + colorOffset) % bookColors.length];
                
                const titleEl = document.createElement('div');
                titleEl.className = 'book-cover-title';
                titleEl.textContent = item.title;

                const footerEl = document.createElement('div');
                footerEl.className = 'book-cover-footer';

                const date = document.createElement('div');
                date.className = 'book-cover-date';
                date.textContent = new Date(item.date).toLocaleDateString();
                
                const label = document.createElement('div');
                label.className = 'book-cover-label';
                if (item.settings.mode === 'chat') {
                    label.textContent = `Chat Log (${item.persona || 'Default'})`;
                    book.style.backgroundColor = '#4a4a4a';
                } else if (item.settings.mode === 'novelist') {
                    label.textContent = 'Novel Draft';
                } else if (item.settings.mode === 'agent') {
                    label.textContent = 'Agent Creation';
                     book.style.backgroundColor = '#6a0dad'; // Distinct color for Agent
                } else if (item.settings.mode === 'research') {
                    label.textContent = `Research - ${item.settings.format}`;
                } else {
                    label.textContent = `Story Weaver (${item.settings.fictionType})`;
                }

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'book-delete-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.dataset.index = originalIndex;

                const archiveBtn = document.createElement('button');
                archiveBtn.className = 'book-archive-btn';
                archiveBtn.innerHTML = '🗃';
                archiveBtn.title = 'Archive Story';
                archiveBtn.dataset.index = originalIndex;
                
                footerEl.appendChild(date);
                footerEl.appendChild(label);

                book.appendChild(titleEl);
                book.appendChild(footerEl);
                book.appendChild(deleteBtn);
                book.appendChild(archiveBtn);

                book.addEventListener('click', () => loadStoryFromHistory(originalIndex));
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to permanently delete this item?')) {
                        deleteStoryFromHistory(originalIndex);
                    }
                });
                archiveBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    archiveStory(originalIndex);
                });
                row.appendChild(book);
            });
            shelf.appendChild(row);
            return shelf;
        };

        const agentShelf = createShelf('Agent Creations', agentCreations, 8);
        const chatsShelf = createShelf('Chat Logs', chats, 6);
        const novelsShelf = createShelf('Novelist Drafts', novels, 0);
        const fictionShelf = createShelf('Fiction Stories', fiction, 2);
        const nonFictionShelf = createShelf('Non-Fiction & Research', nonFiction, 4);
        
        if (agentShelf) historyListEl.appendChild(agentShelf);
        if (chatsShelf) historyListEl.appendChild(chatsShelf);
        if (novelsShelf) historyListEl.appendChild(novelsShelf);
        if (fictionShelf) historyListEl.appendChild(fictionShelf);
        if (nonFictionShelf) historyListEl.appendChild(nonFictionShelf);
    }
    
    function renderArchiveModal() {
        const archive = getStoryArchive();
        const archiveListEl = document.getElementById('archive-list');
        const counterEl = document.getElementById('archive-counter');
        archiveListEl.innerHTML = '';
        counterEl.textContent = `${archive.length}/${ARCHIVE_LIMIT} Used`;

        if (archive.length === 0) {
            archiveListEl.innerHTML = '<p>Your archive is empty.</p>';
            return;
        }
        
        const shelf = document.createElement('div');
        shelf.className = 'bookshelf-shelf';
        const row = document.createElement('div');
        row.className = 'bookshelf-row';
        const bookColors = ['#556b2f', '#4682b4', '#800080', '#b8860b'];

        archive.forEach((item, index) => {
            const book = document.createElement('div');
            book.className = 'book-cover';
            book.style.backgroundColor = bookColors[index % bookColors.length];
            
            const titleEl = document.createElement('div');
            titleEl.className = 'book-cover-title';
            titleEl.textContent = item.title;

            const footerEl = document.createElement('div');
            footerEl.className = 'book-cover-footer';

            const date = document.createElement('div');
            date.className = 'book-cover-date';
            date.textContent = `Archived: ${new Date(item.date).toLocaleDateString()}`;
            
            const unarchiveBtn = document.createElement('button');
            unarchiveBtn.className = 'book-unarchive-btn';
            unarchiveBtn.innerHTML = '⮃'; // Return arrow
            unarchiveBtn.title = 'Return to Bookshelf';
            unarchiveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                unarchiveStory(index);
            });
            
            footerEl.appendChild(date);

            book.appendChild(titleEl);
            book.appendChild(footerEl);
            book.appendChild(unarchiveBtn);
            row.appendChild(book);
        });
        shelf.appendChild(row);
        archiveListEl.appendChild(shelf);
    }

    function toggleLoomFictionControls() {
        const fictionControls = document.querySelectorAll('.fiction-only');
        const displayValue = fictionTypeEl.value === 'fiction' ? 'block' : 'none';
        fictionControls.forEach(el => {
            if (el.parentElement.classList.contains('control-grid')) {
                 el.style.display = displayValue;
            } else {
                 el.style.display = displayValue;
            }
        });
    }

    function updateLoomHelpText() {
        const helpContentEl = document.getElementById('loom-help-content');
        helpContentEl.innerHTML = `
            <h2>About The Loom's Controls</h2>
            <h3>Tone</h3><p>The author's attitude toward the subject. 'Humorous' is funny, 'Serious' is impactful, 'Satirical' is mocking, and 'Ominous' creates a sense of dread.</p>
            <h3>Mood</h3><p>The atmosphere of the story and the feeling it evokes in the reader. 'Joyful' is happy, 'Tense' is stressful, 'Peaceful' is calm, and 'Melancholy' is sad.</p>
            <h3>Point of View</h3><p><b>Third-Person Limited:</b> The narrator only knows the thoughts and feelings of one character. <br><b>Third-Person Omniscient:</b> The narrator knows the thoughts and feelings of all characters.</p>
            <h3>Pacing</h3><p>The speed of the narrative. 'Fast-Paced' focuses on action, while 'Slow and Descriptive' focuses on building atmosphere.</p>
            <hr class="separator">
            <h3>Character Archetype</h3><p>Choose a classic role for your character, like 'The Hero' or 'The Mentor', to guide their actions and personality.</p>
            <h3>Key Plot Points</h3><p>Outline major events you want to happen in the story. Separate ideas with a comma (e.g., a secret is revealed, a chase through the city).</p>
            <h3>Literary Devices</h3><p>Ask the AI to intentionally include specific literary techniques like foreshadowing or irony to add depth to the narrative.</p>
        `;
    }

    function populateRevisionGuide() {
        const contentEl = document.getElementById('revision-guide-content');
        contentEl.innerHTML = `
            <h3>Revision Goals</h3>
            <h4>Continue Writing</h4><p>The AI will add a new paragraph that continues the story from the selected text.</p>
            <h4>Expand on Selection</h4><p>The AI will rewrite the selected text to be more detailed and descriptive.</p>
            <h4>Shorten Selection</h4><p>The AI will rewrite the selected text to be more concise and to the point.</p>
            <h4>Improve Dialogue</h4><p>The AI will rewrite the selected dialogue to be more natural and engaging.</p>
            <h4>Increase Suspense</h4><p>The AI will rewrite the selected text to be more suspenseful and thrilling.</p>
            <h4>Rewrite as Screenplay</h4><p>The AI will convert the selected text into a screenplay format.</p>

            <h3>Revision Styles</h3>
            <h4>More Descriptive</h4><p>The AI will add more sensory details and imagery to the selected text.</p>
            <h4>Show, Don't Tell</h4><p>The AI will rewrite the selected text to show the reader what is happening, rather than telling them.</p>
            <h4>More Formal Tone</h4><p>The AI will rewrite the selected text in a more formal and academic tone.</p>
            <h4>More Concise</h4><p>The AI will rewrite the selected text to be more direct and to the point.</p>
        `;
    }

    function highlightApiKey() {
        document.querySelectorAll('.api-key-group').forEach(el => el.classList.remove('highlight'));
        const selectedModel = llmModelSelect.value;
        let keyGroup;
        if (currentMode === 'cafe') {
            keyGroup = document.getElementById('freesound-key-group');
        } else if (currentMode === 'maps') {
            keyGroup = document.getElementById('google-maps-key-group');
        } else if (selectedModel.startsWith('gemini')) {
            keyGroup = document.getElementById('gemini-key-group');
        } else if (selectedModel.startsWith('huggingface')) {
            keyGroup = document.getElementById('huggingface-key-group');
        } else if (selectedModel.startsWith('openai')) {
            keyGroup = document.getElementById('openai-key-group');
        } else if (selectedModel.startsWith('deepseek')) {
            keyGroup = document.getElementById('deepseek-key-group');
        } else if (selectedModel.startsWith('grok')) {
            keyGroup = document.getElementById('grok-key-group');
        }
        if (keyGroup) {
            keyGroup.classList.add('highlight');
        }
    }

    function populateTheaterModal() {
        document.getElementById('theater-title').textContent = storyTitleTextEl.textContent;
        document.getElementById('theater-illustration').innerHTML = headerIllustrationEl.innerHTML;
        const theaterContent = document.getElementById('theater-story-content');
        theaterContent.innerHTML = storyContentEl.innerHTML;
    }

    function populateChatTheater() {
        chatTheaterContentEl.innerHTML = chatContentEl.innerHTML;
        chatTheaterContentEl.scrollTop = chatTheaterContentEl.scrollHeight;
    }

    function populateMusicMenu() {
        const menuListEl = document.getElementById('music-menu-list');
        menuListEl.innerHTML = ''; // Clear existing
        
        const favorites = musicFavorites.map(key => ({ key, ...musicStations[key] }));
        const nonFavorites = Object.entries(musicStations)
            .filter(([key]) => !musicFavorites.includes(key))
            .map(([key, value]) => ({ key, ...value }));

        const createSection = (title, items) => {
            if (items.length === 0) return;
            const section = document.createElement('div');
            section.innerHTML = `<h3>${title}</h3>`;
            items.forEach(item => {
                const isFavorited = musicFavorites.includes(item.key);
                const isPlaying = item.key === currentStationKey;
                const itemEl = document.createElement('div');
                itemEl.className = 'music-menu-item';
                if (isPlaying) itemEl.classList.add('playing');
                itemEl.innerHTML = `
                    <div class="music-item-icon">${item.icon}</div>
                    <div class="music-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.description}</p>
                    </div>
                    <button class="music-item-fav-btn ${isFavorited ? 'favorited' : ''}" data-station-key="${item.key}">★</button>
                `;
                itemEl.addEventListener('click', () => fetchAndPlayMusic(item.key));
                section.appendChild(itemEl);
            });
            menuListEl.appendChild(section);
        };

        createSection('Favorites', favorites);
        createSection('All Stations', nonFavorites);
        
        document.querySelectorAll('.music-item-fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(e.target.dataset.stationKey);
            });
        });
    }

    let selectedPersona = null;
    const personas = {
        assistant: { name: 'Assistant', icon: '🤖', description: 'A helpful and friendly AI assistant.' },
        expert: { name: 'Expert', icon: '🧑‍🏫', description: 'An AI expert in a specific domain.' },
        companion: { name: 'Companion', icon: '🧑‍🤝‍🧑', description: 'An empathetic and supportive AI companion.' },
        entertainer: { name: 'Entertainer', icon: '🎭', description: 'A fun and creative AI entertainer.' },
        socrates: { name: 'Socrates', icon: '🏛️', description: 'Engage in a dialogue with the ancient philosopher.' },
        shakespeare: { name: 'Shakespeare', icon: '📜', description: 'Converse with the Bard himself.' },
    };

    function populatePersonaMenu() {
        const menuListEl = document.getElementById('persona-menu-list');
        menuListEl.innerHTML = '';
        Object.entries(personas).forEach(([key, persona]) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'persona-menu-item';
            if (key === selectedPersona) itemEl.classList.add('selected');
            itemEl.innerHTML = `
                <div class="persona-item-icon">${persona.icon}</div>
                <div class="persona-item-info">
                    <h4>${persona.name}</h4>
                    <p>${persona.description}</p>
                </div>
            `;
            itemEl.addEventListener('click', () => {
                selectedPersona = key;
                populatePersonaMenu();
                modals.personaMenu.modal.style.display = 'none';
            });
            menuListEl.appendChild(itemEl);
        });
    }

    function populatePersonaInfo() {
        const contentEl = document.getElementById('persona-info-content');
        contentEl.innerHTML = `
            <h3>About AI Personas</h3>
            <p>AI systems are increasingly capable of imitating various human personas, which can be tailored for different applications and contexts. Here are some types of personas AI can imitate:</p>
            <h4>The Assistant</h4><p>Designed to be helpful, friendly, and provide support and guidance.</p>
            <h4>The Expert</h4><p>Focused on providing accurate and detailed information in a specific domain.</p>
            <h4>The Companion</h4><p>Designed to be empathetic, supportive, and understanding.</p>
            <h4>The Entertainer</h4><p>Fun, creative, and engaging, used in chatbots and gaming AI.</p>
            <h4>Fictional Characters/Historical Figures</h4><p>AI can be trained to represent various characters from books, movies, or historical figures.</p>
            <hr>
            <h4>Limitations and Ethical Considerations</h4>
            <p>AI personas may inadvertently reinforce existing societal biases present in the training data. The ability to create AI models that replicate people's personalities could be misused to impersonate individuals without consent. As AI technology continues to evolve, these issues need to be carefully considered.</p>
        `;
    }

    function populateFaq() {
        const faqContentEl = document.getElementById('faq-content');
        faqContentEl.innerHTML = `
            <div class="faq-item">
                <h4>What is The Loom?</h4>
                <p>The Loom is your creative control center for shaping the narrative voice. Go beyond simple prompts and fine-tune the Tone, Mood, Point of View, and Pacing of your story. Want a tense, fast-paced thriller from a first-person perspective? Or a whimsical, slow-paced fantasy? The Loom gives you the power to direct the AI like a master author.</p>
            </div>
            <div class="faq-item">
                <h4>How does "Common Core" work?</h4>
                <p>When you select the "Common Core" content type, you're telling the AI to act as an educational tool. It will craft stories that align with the <a href="http://www.thecorestandards.org/" target="_blank">Common Core State Standards (CCSS)</a> for the chosen grade level, focusing on age-appropriate themes, vocabulary, and sentence structures. It's perfect for creating engaging reading material for students or learners of any age.</p>
            </div>
            <div class="faq-item">
                <h4>What if I'm offline or don't have API keys?</h4>
                <p>The app is designed to be flexible. If you're offline, it will automatically use "Simulated Mode" to provide placeholder content so you can still explore the features. If you are online but don't have an API key for a specific service (like Gemini), only the features that rely on that key will be unavailable. The parts of the app that use free, key-less APIs (like the Biology and History research modes) will still work!</p>
            </div>
            <div class="faq-item">
                <h4>What is Karaoke Mode?</h4>
                <p>Karaoke Mode brings stories to life! When you activate the "Read Aloud" feature, Karaoke Mode highlights each word as it's spoken by the synthesized voice. It's a fantastic tool for young readers learning to follow along, for language learners, or for anyone who enjoys a more immersive, multi-sensory reading experience. You can even customize the highlight color!</p>
            </div>
        `;
    }

    // --- Modal Setup Loop ---
    Object.values(modals).forEach(item => {
        if (item.link) {
            item.link.addEventListener('click', (e) => {
                if ((item.modal.id === 'save-chat-modal' || item.modal.id === 'chat-theater-modal') && chatHistory.length === 0) {
                    e.stopPropagation();
                    alert("There is no conversation to save or view in theater yet.");
                    return;
                }
                if (item.modal.id === 'history-modal') renderHistoryModal();
                if (item.modal.id === 'archive-modal') renderArchiveModal();
                if (item.modal.id === 'loom-modal') toggleLoomFictionControls();
                if (item.modal.id === 'loom-help-modal') updateLoomHelpText();
                if (item.modal.id === 'revision-guide-modal') populateRevisionGuide();
                if (item.modal.id === 'settings-modal') highlightApiKey();
                if (item.modal.id === 'theater-modal') populateTheaterModal();
                if (item.modal.id === 'chat-theater-modal') populateChatTheater();
                if (item.modal.id === 'music-menu-modal') populateMusicMenu();
                if (item.modal.id === 'persona-menu-modal') populatePersonaMenu();
                if (item.modal.id === 'persona-info-modal') populatePersonaInfo();
                if (item.modal.id === 'faq-modal') populateFaq();
                if (item.modal.id === 'api-key-manager-modal') populateApiKeyManager();
                item.modal.style.display = 'flex';
            });
        }

        if(item.close) item.close.addEventListener('click', () => {
            if (item.modal.id === 'theater-modal') {
                synth.cancel();
                cleanupHighlights(document.getElementById('theater-story-content'));
            }
            if (item.modal.id === 'settings-modal') {
                saveApiKeys();
            }
            item.modal.style.display = 'none';
        });
    });
    document.getElementById('loom-close-button').addEventListener('click', () => { modals.loom.modal.style.display = 'none'; });

    window.addEventListener('click', (event) => {
        Object.values(modals).forEach(item => {
            if (event.target === item.modal) {
                 if (item.modal.id === 'theater-modal') {
                    synth.cancel();
                    cleanupHighlights(document.getElementById('theater-story-content'));
                }
                item.modal.style.display = 'none';
            }
        });
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            Object.values(modals).forEach(item => {
                if (item.modal.style.display === 'flex') {
                    if (item.modal.id === 'theater-modal') {
                        synth.cancel();
                        cleanupHighlights(document.getElementById('theater-story-content'));
                    }
                    item.modal.style.display = 'none';
                }
            });
        }
    });

    const clearKeysBtn = document.querySelector('.clear-keys-link');
    const geminiApiKeyInput = document.getElementById('gemini-api-key');
    const googleMapsApiKeyInput = document.getElementById('google-maps-api-key');
    const googleMapsMapIdInput = document.getElementById('google-maps-map-id');
    const unsplashApiKeyInput = document.getElementById('unsplash-api-key');
    const huggingfaceApiKeyInput = document.getElementById('huggingface-api-key');
    const nasaApiKeyInput = document.getElementById('nasa-api-key');
    const openaiApiKeyInput = document.getElementById('openai-api-key');
    const deepseekApiKeyInput = document.getElementById('deepseek-api-key');
    const grokApiKeyInput = document.getElementById('grok-api-key');
    const spotifyClientIdInput = document.getElementById('spotify-client-id');
    const spotifyClientSecretInput = document.getElementById('spotify-client-secret');
    const freesoundApiKeyInput = document.getElementById('freesound-api-key');

    let lastStorySettings = null; 
    let currentStoryIndex = null;
    let cleanStoryHtml = '';
    let currentMode = 'story';
    const BOOKSHELF_LIMIT = 50;
    const ARCHIVE_LIMIT = 50;

    const genres = {
        fiction: [
            { value: 'adventure', text: 'Adventure' }, { value: 'comedy', text: 'Comedy' },
            { value: 'crime', text: 'Crime' }, { value: 'dystopian', text: 'Dystopian' },
            { value: 'fantasy', text: 'Fantasy' }, { value: 'historical-fiction', text: 'Historical Fiction' },
            { value: 'horror', text: 'Horror' }, { value: 'mystery', text: 'Mystery' },
            { value: 'romance', text: 'Romance' }, { value: 'sci-fi', text: 'Science Fiction' },
            { value: 'thriller', text: 'Thriller' }, { value: 'western', text: 'Western' }
        ],
        'non-fiction': [
            { value: 'biography', text: 'Biography' }, { value: 'history', text: 'History' },
            { value: 'memoir', text: 'Memoir' }, { value: 'philosophy', text: 'Philosophy' },
            { value: 'science', text: 'Science' }, { value: 'self-help', text: 'Self-Help' },
            { value: 'travel', text: 'Travel' }
        ]
    };

    const illustrationStyles = [
        { value: 'photograph', text: 'Photograph' }, { value: 'cinematic', text: 'Cinematic' },
        { value: 'drama', text: 'Dramatic' }, { value: 'portrait', text: 'Portrait' },
        { value: 'fantasy art', text: 'Fantasy Art' }, { value: 'watercolor', text: 'Watercolor' },
        { value: 'cartoon', text: 'Cartoon' }, { value: 'pencil drawing', text: 'Pencil Drawing' },
        { value: 'anime', text: 'Anime / Manga' }, { value: 'sci-fi art', text: 'Sci-Fi Art' },
        { value: 'concept art', text: 'Concept Art' }, { value: 'pixel art', text: 'Pixel Art' },
        { value: 'vector art', text: 'Vector Art' }, { value: 'abstract', text: 'Abstract' },
        { value: 'minimalist', text: 'Minimalist' }, { value: 'vintage', text: 'Vintage' }
    ];

    const curatedPrompts = {
        fiction: [
            "A detective who can talk to ghosts solves a murder.", "The last library on Earth and its lonely librarian.",
            "A space pirate crew discovers a map to a mythical treasure.", "Two rival magicians are forced to team up to save their city.",
            "A teenager develops superpowers on their 16th birthday.", "A group of friends find a mysterious board game that affects reality.",
            "An AI companion starts to develop its own secret agenda.", "A knight must escort a princess through a forest full of enchanted creatures.",
            "A story about a talking animal who becomes a world-famous chef.", "A time traveler gets stuck in the Wild West.",
            "A modern-day family inherits a haunted castle in Scotland.", "The world has ended, but a small group of survivors finds hope in a greenhouse."
        ],
        'non-fiction': [
            "Explain the science of a solar eclipse.", "The history of the Silk Road.",
            "What are black holes and how are they formed?", "The life and work of Marie Curie.",
            "Describe the process of photosynthesis for a 5th grader.", "The story of the construction of the Great Wall of China.",
            "How does the internet work?", "The causes and effects of the Industrial Revolution.",
            "A brief history of video games.", "Explain the theory of relativity in simple terms.",
            "The importance of bees in our ecosystem.", "The rise and fall of the Roman Empire."
        ]
    };

    function populateCuratedPrompts() {
        const promptsListEl = document.getElementById('prompts-list');
        promptsListEl.innerHTML = ''; 
        
        let fictionHtml = '<div class="prompts-modal-section"><h3>Fiction</h3>';
        curatedPrompts.fiction.forEach(prompt => {
            fictionHtml += `<button type="button" class="modal-button prompt-select" data-topic="${prompt}">${prompt}</button>`;
        });
        fictionHtml += '</div>';

        let nonFictionHtml = '<div class="prompts-modal-section"><h3>Non-Fiction</h3>';
        curatedPrompts['non-fiction'].forEach(prompt => {
            nonFictionHtml += `<button type="button" class="modal-button prompt-select" data-topic="${prompt}">${prompt}</button>`;
        });
        nonFictionHtml += '</div>';

        promptsListEl.innerHTML = fictionHtml + nonFictionHtml;

        document.querySelectorAll('.prompt-select').forEach(button => {
            button.addEventListener('click', (e) => {
                topicInput.value = e.target.dataset.topic;
                modals.prompts.modal.style.display = 'none';
            });
        });
    }


    function populateIllustrationStyles() {
        const styleSelect = document.getElementById('illustration-style');
        styleSelect.innerHTML = '';
        illustrationStyles.forEach(style => {
            const option = document.createElement('option');
            option.value = style.value;
            option.textContent = style.text;
            styleSelect.appendChild(option);
        });
    }

    function updateGenreOptions() {
        const selectedType = fictionTypeEl.value;
        const availableGenres = genres[selectedType];
        genreEl.innerHTML = '';
        availableGenres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.value;
            option.textContent = genre.text;
            genreEl.appendChild(option);
        });
    }

    fictionTypeEl.addEventListener('change', () => {
        updateGenreOptions();
        toggleLoomFictionControls();
    });

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    function loadApiKeys() {
        geminiApiKeyInput.value = localStorage.getItem('geminiApiKey') || '';
        googleMapsApiKeyInput.value = localStorage.getItem('googleMapsApiKey') || '';
        googleMapsMapIdInput.value = localStorage.getItem('googleMapsMapId') || '';
        unsplashApiKeyInput.value = localStorage.getItem('unsplashApiKey') || '';
        huggingfaceApiKeyInput.value = localStorage.getItem('huggingfaceApiKey') || '';
        nasaApiKeyInput.value = localStorage.getItem('nasaApiKey') || '';
        openaiApiKeyInput.value = localStorage.getItem('openaiApiKey') || '';
        deepseekApiKeyInput.value = localStorage.getItem('deepseekApiKey') || '';
        grokApiKeyInput.value = localStorage.getItem('grokApiKey') || '';
        spotifyClientIdInput.value = localStorage.getItem('spotifyClientId') || '';
        spotifyClientSecretInput.value = localStorage.getItem('spotifyClientSecret') || '';
        freesoundApiKeyInput.value = localStorage.getItem('freesoundApiKey') || '';
    }

    function saveApiKeys() {
        localStorage.setItem('geminiApiKey', geminiApiKeyInput.value.trim());
        localStorage.setItem('googleMapsApiKey', googleMapsApiKeyInput.value.trim());
        localStorage.setItem('googleMapsMapId', googleMapsMapIdInput.value.trim());
        localStorage.setItem('unsplashApiKey', unsplashApiKeyInput.value.trim());
        localStorage.setItem('huggingfaceApiKey', huggingfaceApiKeyInput.value.trim());
        localStorage.setItem('nasaApiKey', nasaApiKeyInput.value.trim());
        localStorage.setItem('openaiApiKey', openaiApiKeyInput.value.trim());
        localStorage.setItem('deepseekApiKey', deepseekApiKeyInput.value.trim());
        localStorage.setItem('grokApiKey', grokApiKeyInput.value.trim());
        localStorage.setItem('spotifyClientId', spotifyClientIdInput.value.trim());
        localStorage.setItem('spotifyClientSecret', spotifyClientSecretInput.value.trim());
        localStorage.setItem('freesoundApiKey', freesoundApiKeyInput.value.trim());
    }

    clearKeysBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear ALL of your saved API keys?')) {
            localStorage.removeItem('geminiApiKey');
            localStorage.removeItem('googleMapsApiKey');
            localStorage.removeItem('googleMapsMapId');
            localStorage.removeItem('unsplashApiKey');
            localStorage.removeItem('huggingfaceApiKey');
            localStorage.removeItem('nasaApiKey');
            localStorage.removeItem('openaiApiKey');
            localStorage.removeItem('deepseekApiKey');
            localStorage.removeItem('grokApiKey');
            localStorage.removeItem('spotifyClientId');
            localStorage.removeItem('spotifyClientSecret');
            localStorage.removeItem('freesoundApiKey');
            loadApiKeys(); // Reloads empty values into inputs
        }
    });

    // --- AI Story Generation ---
    async function generateStory(settings, revisionText = '', revisionGoal = '', revisionStyle = '', directorNotes = '', revisionTone = '', revisionMood = '', continuationText = '') {
        const model = settings.llmModel;
        let apiKey, apiUrl, body;

        if (model.startsWith('gemini')) {
            apiKey = geminiApiKeyInput.value.trim();
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            
            let prompt;
            if (revisionText) {
                prompt = `You are an expert editor. Revise the following text based on these instructions:\n\n**Goal:** ${revisionGoal}\n**Style:** ${revisionStyle}\n**Tone:** ${revisionTone}\n**Mood:** ${revisionMood}\n**Director's Notes:** ${directorNotes || 'None'}\n\n**Text to Revise:**\n"${revisionText}"\n\n**Revised Text:**`;
            } else if (continuationText) {
                prompt = `You are a master storyteller. Continue the following story, adding one or two new paragraphs that logically follow the narrative. Do not repeat the provided text.\n\n**Story So Far:**\n"${continuationText}"\n\n**Next Paragraph(s):**`;
            } else {
                prompt = buildPrompt(settings);
            }
            
            body = JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                },
            });

        } else {
            throw new Error(`Model ${model} not supported yet.`);
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || `API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    function buildPrompt(settings) {
        if (settings.mode === 'research') {
            return `Generate a ${settings.format} about "${settings.topic}" for a ${settings.gradeLevel} level audience. Focus on the subject of ${settings.subject}.`;
        }

        let prompt = `Write a ${settings.storyLength}, ${settings.fictionType} ${settings.genre} story for a ${settings.gradeLevel} audience. The topic is "${settings.topic}".`;
        
        if (settings.tone) prompt += ` The tone should be ${settings.tone}.`;
        if (settings.mood) prompt += ` The mood should be ${settings.mood}.`;
        if (settings.pov) prompt += ` Use a ${settings.pov} point of view.`;
        if (settings.pacing) prompt += ` The pacing should be ${settings.pacing}.`;

        if (settings.charName || settings.charTraits || settings.charGoal || settings.charArchetype) {
            prompt += ` The main character, ${settings.charName || 'the protagonist'}, is ${settings.charTraits || 'a person'} who is a classic ${settings.charArchetype || 'character'}. Their main goal is to ${settings.charGoal || 'succeed'}.`;
        }
        if (settings.plotPoints) prompt += ` Include these key plot points: ${settings.plotPoints}.`;
        if (settings.literaryDevices.length > 0) prompt += ` Intentionally use these literary devices: ${settings.literaryDevices.join(', ')}.`;
        if (settings.aiTitle) prompt += ` The story should start with a creative title on the very first line, followed by the story content.`;

        return prompt;
    }

    async function getIllustrationUrl(topic, settings) {
        if (settings.illustrationSource === 'unsplash') {
            const apiKey = unsplashApiKeyInput.value.trim();
            if (!apiKey) return null;
            const response = await fetch(`https://api.unsplash.com/search/photos?query=${topic}&client_id=${apiKey}&per_page=1`);
            const data = await response.json();
            return data.results[0]?.urls?.regular;
        } else { // AI Generated
            const apiKey = geminiApiKeyInput.value.trim();
            if (!apiKey) return null;
            const prompt = `A ${settings.illustrationStyle} of ${topic}.`;
            // This is a placeholder for a real Imagen API call
            // In a real scenario, you would call the Imagen API endpoint here.
            // For now, we'll return a placeholder.
            console.warn("Simulating AI Image generation. Replace with actual API call.");
            return `https://placehold.co/600x400/8e44ad/FFF?text=AI+Image+of+${encodeURIComponent(topic)}`;
        }
    }

    async function embedImagesInStory(storyHtml, settings) {
        // This is a simplified version. A more robust solution would parse the HTML
        // and insert images at logical breaks.
        const paragraphs = storyHtml.split('</p>');
        if (paragraphs.length < 3) return storyHtml;

        const midPoint1 = Math.floor(paragraphs.length / 3);
        const midPoint2 = Math.floor(paragraphs.length * 2 / 3);

        const img1Keyword = settings.topic + " " + settings.genre;
        const img2Keyword = settings.charName || settings.topic;

        const img1Url = await getIllustrationUrl(img1Keyword, settings);
        const img2Url = await getIllustrationUrl(img2Keyword, settings);

        if (img1Url) {
            paragraphs[midPoint1] += `<img src="${img1Url}" class="embedded-illustration left" alt="Illustration for the story">`;
        }
        if (img2Url) {
            paragraphs[midPoint2] += `<img src="${img2Url}" class="embedded-illustration right" alt="Illustration for the story">`;
        }

        return paragraphs.join('</p>');
    }
    
    async function processResearchContent(storyText, settings) {
        // This is a placeholder for a more robust research processor.
        return storyText.split('\n').map(p => `<p>${p}</p>`).join('');
    }

    // --- Agent Functions ---

    function updateAgentWorkspace(htmlContent) {
        const entry = document.createElement('div');
        entry.innerHTML = htmlContent;
        agentContentEl.appendChild(entry);
        agentContentEl.scrollTop = agentContentEl.scrollHeight;
    }

    async function agentFindLocation(query) {
        return new Promise((resolve, reject) => {
            if (!geocoder) {
                reject(new Error('Map is not ready. Ensure Google Maps API key is set.'));
                return;
            }
            geocoder.geocode({ 'address': query }, (results, status) => {
                if (status === 'OK') {
                    const locationName = results[0].formatted_address;
                    resolve(locationName);
                } else {
                    reject(new Error('Geocode was not successful: ' + status));
                }
            });
        });
    }

    async function agentMarkLocationOnMap(locationName) {
        return new Promise((resolve, reject) => {
            if (!map || !geocoder) {
                reject(new Error('Map is not ready.'));
                return;
            }
            // Switch to the map tab
            document.querySelector('.mode-tab[data-mode="maps"]').click();
            
            geocoder.geocode({ 'address': locationName }, (results, status) => {
                if (status === 'OK') {
                    map.setCenter(results[0].geometry.location);
                    map.setZoom(12);
                    if (currentMarker) {
                        currentMarker.map = null;
                    }
                    currentMarker = new google.maps.marker.AdvancedMarkerElement({
                        map: map,
                        position: results[0].geometry.location,
                        title: locationName
                    });
                    // Pause and then return to the agent tab
                    setTimeout(() => {
                        document.querySelector('.mode-tab[data-mode="agent"]').click();
                        resolve(`Successfully marked ${locationName} on the map.`);
                    }, 5000); // 5-second delay
                } else {
                    document.querySelector('.mode-tab[data-mode="agent"]').click();
                    reject(new Error(`Could not find location: ${locationName}`));
                }
            });
        });
    }

    async function agentSaveToBookshelf(title, content) {
        const story = {
            title: title,
            content: `<p>${content.replace(/\n/g, '</p><p>')}</p>`,
            header: '',
            settings: { mode: 'agent' },
            notebook: '',
            date: new Date().toISOString()
        };
        // Set currentStoryIndex to null to indicate a new story
        currentStoryIndex = null;
        saveStoryToHistory(story);
        return `Story "${title}" saved to Bookshelf.`;
    }

    async function agentResearch(topic, subject) {
        const settings = {
            mode: 'research',
            subject: subject,
            format: 'key-facts',
            topic: topic,
            llmModel: llmModelSelect.value
        };
        return await generateStory(settings);
    }

    async function agentWriteStory(topic, genre, tone, mood, research) {
        let prompt = `Write a short story about "${topic}". The genre is ${genre}. The tone should be ${tone} and the mood should be ${mood}.`;
        if (research) {
            prompt += `\n\nIncorporate the following research and facts into the narrative:\n${research}`;
        }
        const settings = { llmModel: llmModelSelect.value };
        // The last parameter (continuationText) is used to pass the full prompt.
        return await generateStory(settings, '', '', '', '', '', '', prompt);
    }
    
    async function executeAgentPlan(plan, originalGoal) {
        let context = {};
        let finalOutputKey = null;
        let lastStepTool = null;

        // Find the last step that is NOT saveToBookshelf to determine the final creative output
        for (let i = plan.length - 1; i >= 0; i--) {
            if (plan[i].tool !== 'saveToBookshelf' && plan[i].tool !== 'informUser') {
                finalOutputKey = plan[i].outputVariable;
                break;
            }
        }

        for (const step of plan) {
            updateAgentWorkspace(`<h4>Executing Step ${step.step}: ${step.description}</h4>`);
            try {
                let result;
                // Resolve parameters that reference context variables
                const resolvedParams = {};
                for (const key in step.parameters) {
                    const value = step.parameters[key];
                    if (typeof value === 'string' && value.startsWith('$')) {
                        // If the context variable doesn't exist (due to a previous step failing), pass null
                        resolvedParams[key] = context[value.substring(1)] || null;
                    } else {
                        resolvedParams[key] = value;
                    }
                }

                switch (step.tool) {
                    case 'findLocation':
                        result = await agentFindLocation(resolvedParams.query);
                        break;
                    case 'markLocationOnMap':
                         // Fallback if locationName is null
                        if (!resolvedParams.locationName) {
                            throw new Error("Cannot mark location because the previous step failed to find one.");
                        }
                        result = await agentMarkLocationOnMap(resolvedParams.locationName);
                        break;
                    case 'research':
                         // Fallback if topic is null
                        result = await agentResearch(resolvedParams.topic || originalGoal, resolvedParams.subject);
                        break;
                    case 'writeStory':
                        // Fallback if topic is null
                        result = await agentWriteStory(resolvedParams.topic || originalGoal, resolvedParams.genre, resolvedParams.tone, resolvedParams.mood, resolvedParams.research);
                        break;
                    case 'saveToBookshelf':
                         // Fallback if content is null
                        if (!resolvedParams.content) {
                             throw new Error("Cannot save to bookshelf because the story generation step failed.");
                        }
                        result = await agentSaveToBookshelf(resolvedParams.title, resolvedParams.content);
                        break;
                    case 'informUser':
                        result = resolvedParams.message;
                        break;
                    default:
                        throw new Error(`Unknown tool: ${step.tool}`);
                }
                context[step.outputVariable] = result;
                lastStepTool = step.tool;
                updateAgentWorkspace(`<p>✅ ${result || `Step ${step.step} completed successfully.`}</p>`);

            } catch (error) {
                updateAgentWorkspace(`<p class="error-message">⚠️ Step ${step.step} failed: ${error.message}. Continuing to next step.</p>`);
                context[step.outputVariable] = null; // Ensure failed step output is null
                continue; // Continue to the next step instead of stopping
            }
        }
        
        if (finalOutputKey && context[finalOutputKey]) {
             const finalResult = context[finalOutputKey];
            if (typeof finalResult === 'string' && lastStepTool !== 'saveToBookshelf') {
                updateAgentWorkspace(`<h3>Final Result:</h3><p>${finalResult.replace(/\n/g, '<br>')}</p>`);
            } else {
                 updateAgentWorkspace(`<h3>✅ Plan executed successfully.</h3>`);
            }
        } else {
            updateAgentWorkspace(`<h3>✅ Plan executed, but some steps may have failed.</h3>`);
        }
    }

    async function handleAgentGoal() {
        const goal = agentGoalInput.value.trim();
        if (!goal) {
            alert("Please provide a goal for the Agent.");
            return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = 'Agent is Working...';
        agentContentEl.innerHTML = '';
        updateAgentWorkspace(`<h3>Goal: ${goal}</h3>`);

        const tools = `
            - findLocation(query): Finds a specific location. Returns the name of the location.
            - markLocationOnMap(locationName): Switches to the map, places a marker, waits, and returns to the agent view.
            - research(topic, subject): Gathers factual information on a topic.
            - writeStory(topic, genre, tone, mood, research): Generates a fictional story. The 'research' parameter is optional text from the research tool.
            - saveToBookshelf(title, content): Saves the final generated content to the user's bookshelf.
            - informUser(message): Informs the user about limitations or missing capabilities.`;

        const masterPrompt = `You are an expert task planner and a helpful AI assistant. Your job is to analyze a user's goal and convert it into a structured JSON plan that can be executed by the application. You must also identify any parts of the user's request that cannot be fulfilled by the available tools.

        **Available Tools:**
        ${tools}

        **User's Goal:**
        "${goal}"

        **Your Task:**
        1.  **Analyze the Goal:** Read the user's goal carefully.
        2.  **Identify Limitations:** Compare the goal to the available tools. If the user asks for something you cannot do (e.g., "find videos," "get pictures," "create an image"), make a note of this limitation.
        3.  **Create a JSON Plan:** Create a JSON array of steps to achieve the parts of the goal that ARE possible.
        4.  **Add a Limitation Note (If Necessary):** If you identified any limitations, add a final step to your plan with the tool "informUser" and a "message" parameter explaining what you cannot do (e.g., "I cannot search for videos as I do not have that capability yet.").
        
        **JSON Plan Rules:**
        - Each step is an object with "step", "description", "tool", "parameters", and "outputVariable".
        - To use a previous step's output, use a dollar sign prefix (e.g., "$location_name").
        - The final creative step should be followed by a 'saveToBookshelf' step.

        **Output only the JSON plan inside a markdown code block.**`;

        try {
            updateAgentWorkspace('<p>🤖 Agent is creating a plan...</p>');
            const planResponse = await generateStory({ llmModel: llmModelSelect.value }, '', '', '', '', '', '', masterPrompt);
            
            // More robust JSON parsing
            const jsonString = planResponse.substring(planResponse.indexOf('```json') + 7, planResponse.lastIndexOf('```')).trim();
            if (!jsonString) {
                throw new Error("Could not find a valid JSON plan in the AI's response.");
            }
            const plan = JSON.parse(jsonString);

            // Proactively load map script if needed
            const needsMap = plan.some(step => step.tool === 'findLocation' || step.tool === 'markLocationOnMap');
            if (needsMap) {
                updateAgentWorkspace('<p>🗺️ Pre-loading map module...</p>');
                await loadGoogleMapsScript();
                updateAgentWorkspace('<p>✅ Map module ready.</p>');
            }

            updateAgentWorkspace('<p>✅ Plan created. Now executing...</p>');
            await executeAgentPlan(plan, goal);

        } catch (error) {
            console.error("Error during Agent execution:", error);
            updateAgentWorkspace(`<p class="error-message">An error occurred: ${error.message}</p>`);
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Execute Agent Plan';
        }
    }


    generateBtn.addEventListener('click', async () => {
        if (currentMode === 'agent') {
            handleAgentGoal();
            return;
        }

        currentStoryIndex = null;
        saveApiKeys(); 
        
        const literaryDevices = Array.from(document.querySelectorAll('input[name="literary-device"]:checked')).map(el => el.value);

        let settings = {};

        if (currentMode === 'story') {
            settings = {
                mode: 'story',
                gradeLevel: document.getElementById('grade-level').selectedOptions[0].text,
                gradeValue: document.getElementById('grade-level').value,
                storyLength: document.getElementById('story-length').value,
                fictionType: document.getElementById('fiction-type').value,
                genre: document.getElementById('genre').value,
                topic: document.getElementById('topic').value.trim(),
                aiTitle: document.getElementById('ai-title-toggle').checked,
                charName: document.getElementById('char-name').value.trim(),
                charTraits: document.getElementById('char-traits').value.trim(),
                charGoal: document.getElementById('char-goal').value.trim(),
                charArchetype: document.getElementById('char-archetype').value,
                plotPoints: document.getElementById('plot-points').value.trim(),
                literaryDevices: literaryDevices
            };
        } else if (currentMode === 'research') {
             settings = {
                mode: 'research',
                subject: document.getElementById('research-subject').value,
                format: document.getElementById('research-format').value,
                topic: document.getElementById('research-topic').value.trim(),
             };
        } else {
            console.warn(`Generate button clicked in unsupported mode: ${currentMode}`);
            return;
        }

        // Add shared settings
        Object.assign(settings, {
            contentType: document.getElementById('content-type').value,
            llmModel: document.getElementById('llm-model').value,
            showIllustration: document.getElementById('show-illustration').checked,
            illustrationSource: document.getElementById('illustration-source').value,
            illustrationStyle: document.getElementById('illustration-style').value,
            tone: document.getElementById('tone').value,
            mood: document.getElementById('mood').value,
            pov: document.getElementById('pov').value,
            pacing: document.getElementById('pacing').value
        });
        
        const isDevMode = devModeToggle.checked;
        let errorMessages = '';
        if (!isDevMode) {
            if (settings.llmModel.startsWith('gemini') && !geminiApiKeyInput.value.trim()) {
                errorMessages += `<p class="error-message">Please enter your Gemini API key in Settings.</p>`;
            } else if (settings.llmModel.startsWith('huggingface') && !huggingfaceApiKeyInput.value.trim()) {
                errorMessages += `<p class="error-message">Please enter your Hugging Face API key in Settings.</p>`;
            } else if (settings.llmModel.startsWith('openai') && !openaiApiKeyInput.value.trim()) {
                errorMessages += `<p class="error-message">Please enter your OpenAI API key in Settings.</p>`;
            } else if (settings.llmModel.startsWith('deepseek') && !deepseekApiKeyInput.value.trim()) {
                errorMessages += `<p class="error-message">Please enter your Deepseek API key in Settings.</p>`;
            } else if (settings.llmModel.startsWith('grok') && !grokApiKeyInput.value.trim()) {
                errorMessages += `<p class="error-message">Please enter your Grok API key in Settings.</p>`;
            }
            if (settings.showIllustration && settings.illustrationSource === 'unsplash' && !unsplashApiKeyInput.value.trim()) {
                errorMessages += `<p class="error-message">Please enter an Unsplash API key or change Illustration Source.</p>`;
            }
            if (settings.showIllustration && settings.illustrationSource === 'ai' && !geminiApiKeyInput.value.trim()) {
                errorMessages += `<p class="error-message">AI Illustrations require a Gemini API key.</p>`;
            }
            if (settings.mode === 'research' && settings.subject === 'astronomy' && !nasaApiKeyInput.value.trim()) {
                errorMessages += `<p class="error-message">The Astronomy research subject requires a NASA API key. You can get a free one from api.nasa.gov.</p>`;
            }
            if (settings.mode === 'research' && settings.subject === 'music' && (!spotifyClientIdInput.value.trim() || !spotifyClientSecretInput.value.trim())) {
                errorMessages += `<p class="error-message">The Music research subject requires a Spotify Client ID and Client Secret.</p>`;
            }
        }
        if (errorMessages) {
            storyContentEl.innerHTML = errorMessages;
            return;
        }
        
        const topicToUse = settings.topic;
        if (!topicToUse) {
            storyTitleTextEl.textContent = 'Error';
            storyContentEl.innerHTML = `<p class="error-message">Please enter a topic.</p>`;
            return;
        }
        
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        summaryBtn.style.display = 'none';
        continueBtn.style.display = 'none';

        storyContentEl.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
        headerIllustrationEl.innerHTML = '<div class="loader-container"><div class="loader" style="width: 30px; height: 30px; border-width: 3px;"></div></div>';


        try {
            let storyText;
            if (isDevMode) {
                storyText = (settings.mode === 'research') ? await simulateResearch(settings) : await simulateStory(settings);
            } else {
                storyText = await generateStory(settings);
            }
            
            let title;
            if (settings.mode === 'story' && settings.aiTitle) {
                const parts = storyText.split('\n');
                title = parts[0];
                storyText = parts.slice(1).join('\n').trim();
            } else {
                title = toTitleCase(topicToUse);
            }
            storyTitleTextEl.textContent = title;
            
            let finalHtmlContent = '';
            
            if (settings.showIllustration) {
                const headerImageUrl = isDevMode ? `https://placehold.co/600x400/a0522d/FFF?text=Header+Image` : await getIllustrationUrl(topicToUse, settings);
                if(headerImageUrl) {
                    headerIllustrationEl.innerHTML = `<img src="${headerImageUrl}" alt="Header illustration for ${topicToUse}">`;
                } else {
                    headerIllustrationEl.innerHTML = 'Could not generate header image.';
                }
            } else {
                 headerIllustrationEl.innerHTML = '';
            }

            if (settings.mode === 'research') {
                storyContentEl.innerHTML = '<div class="loader-container"><div class="loader"></div><p style="margin-top: 10px;">Fetching research data...</p></div>';
                finalHtmlContent = await processResearchContent(storyText, settings);
            } else { // Handle Story mode
                const paragraphs = storyText.split('\n').filter(p => p.trim() !== '');
                finalHtmlContent = paragraphs.map(p => `<p>${p}</p>`).join('');

                if (settings.showIllustration && settings.storyLength !== 'short') {
                    finalHtmlContent = isDevMode ? await simulateEmbedImages(finalHtmlContent) : await embedImagesInStory(finalHtmlContent, settings);
                }
            }
            
            cleanStoryHtml = finalHtmlContent;
            storyContentEl.innerHTML = finalHtmlContent;
            wrapWordsInSpans(storyContentEl);
            lastStorySettings = settings; 
            summaryBtn.style.display = 'inline-block';
            
            if (settings.mode === 'story') {
                continueBtn.style.display = 'inline-block';
            }
            
            saveStoryToHistory({
                title: title,
                content: cleanStoryHtml,
                header: headerIllustrationEl.innerHTML,
                settings: settings,
                notebook: '', // Start with empty notebook
                date: new Date().toISOString()
            });
            currentStoryIndex = 0; // It's the newest story

        } catch (error) {
            console.error('Error during generation:', error);
            storyTitleTextEl.textContent = 'Error';
            storyContentEl.innerHTML = `<p class="error-message">An error occurred: ${error.message}</p>`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate';
        }
    });

    summaryBtn.addEventListener('click', () => {
        if (lastStorySettings) {
            const summaryContentEl = document.getElementById('summary-content');
            let summaryHtml = '<ul>';
            for (const key in lastStorySettings) {
                const value = lastStorySettings[key];
                if (key.includes('Api') || !value || value.length === 0) continue;
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                summaryHtml += `<li><strong>${label}:</strong> ${value}</li>`;
            }
            const sources = [];
            if (lastStorySettings.mode === 'research') {
                if (lastStorySettings.subject === 'astronomy') sources.push('NASA API');
                if (lastStorySettings.subject === 'geography') sources.push('Data Commons API');
                if (lastStorySettings.subject === 'biology') sources.push('GBIF API');
                if (lastStorySettings.subject === 'art') sources.push('The Metropolitan Museum of Art API');
                if (lastStorySettings.subject === 'technology') sources.push('Science.gov API, Datamuse API');
                if (lastStorySettings.subject === 'music') sources.push('Spotify API');
            }
            if (sources.length > 0) {
                summaryHtml += `<li><strong>Data Sources:</strong> ${sources.join(', ')}</li>`;
            }
            summaryHtml += '</ul>';
            summaryContentEl.innerHTML = summaryHtml;
        }
    });

    document.getElementById('pdf-button').addEventListener('click', () => {
        if (!jsPDF) {
            alert("The PDF creation library could not be loaded. Please check your internet connection and try again.");
            return;
        }
        const doc = new jsPDF();
        const title = storyTitleTextEl.textContent;
        const storyText = storyContentEl.innerText;
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const usableWidth = pageWidth - (margin * 2);

        doc.setFontSize(18);
        doc.text(title, pageWidth / 2, margin, { align: 'center' });

        doc.setFontSize(12);
        const lines = doc.splitTextToSize(storyText, usableWidth);
        doc.text(lines, margin, margin + 15);
        
        doc.save(`${title.replace(/ /g, '_')}.pdf`);
    });

    clearStoryBtn.addEventListener('click', () => {
        const isDefaultText = storyContentEl.querySelector('p')?.textContent.startsWith('Select your preferences');
        const hasContent = storyContentEl.innerText.trim().length > 0;
        const originalTitle = lastStorySettings ? lastStorySettings.title || storyTitleTextEl.textContent : storyTitleTextEl.textContent;

        if (!isDefaultText && hasContent) {
             if (confirm('Do you want to save the current text to your bookshelf before clearing?')) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = storyContentEl.innerHTML;
                tempDiv.querySelectorAll('span').forEach(span => {
                    if (span.attributes.length === 0) {
                        span.outerHTML = span.innerHTML;
                    }
                });
                const cleanedContent = tempDiv.innerHTML;

                saveStoryToHistory({
                    title: originalTitle || 'Untitled Story',
                    content: cleanedContent,
                    header: headerIllustrationEl.innerHTML,
                    settings: lastStorySettings || { mode: currentMode },
                    notebook: notebookEl.value,
                    date: new Date().toISOString()
                });
            }
        }
        
        storyTitleTextEl.textContent = 'Your Creation Will Appear Here';
        storyContentEl.innerHTML = '<p>Select your preferences on the left and click "Generate" to begin.</p>';
        headerIllustrationEl.innerHTML = '';
        notebookEl.value = '';
        summaryBtn.style.display = 'none';
        continueBtn.style.display = 'none';
        currentStoryIndex = null;
        lastStorySettings = null;
        cleanStoryHtml = '';
    });

    const modeTabs = document.querySelectorAll('.mode-tab');
    
    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            modeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentMode = tab.dataset.mode;
            
            // --- Hide all panels first ---
            const allControlPanels = [storyControls, researchControls, novelistControls, chatControls, cafeControls, mapControls, agentControls];
            allControlPanels.forEach(p => p.style.display = 'none');

            const allContentPanels = [storyContentEl, chatContentEl, mapContentEl, agentContentEl];
            allContentPanels.forEach(p => p.style.display = 'none');
            
            // Robustly hide all footers
            const storyFooter = document.querySelector('.story-footer');
            const chatFooter = document.querySelector('.chat-footer');
            const agentFooter = document.querySelector('.agent-footer');
            if (storyFooter) storyFooter.style.display = 'none';
            if (chatFooter) chatFooter.style.display = 'none';
            if (agentFooter) agentFooter.style.display = 'none';

            buttonContainer.style.display = 'none';
            storyTitleEl.style.display = 'none';
            headerIllustrationEl.style.display = 'none';

            // --- Reset Story Content properties ---
            storyContentEl.setAttribute('contenteditable', 'false');
            storyContentEl.style.cursor = 'default';

            // --- Configure UI based on the selected mode ---
            switch (currentMode) {
                case 'story':
                    storyControls.style.display = 'block';
                    sharedControlsContainer.style.display = 'block';
                    buttonContainer.style.display = 'block';
                    curatedPromptsBtn.style.display = 'block';
                    openLoomBtn.style.display = 'block';
                    storyContentEl.style.display = 'block';
                    storyTitleEl.style.display = 'flex';
                    headerIllustrationEl.style.display = 'flex';
                    if (storyFooter) storyFooter.style.display = 'flex';
                    generateBtn.textContent = "Generate Story";
                    storyTitleTextEl.textContent = lastStorySettings && lastStorySettings.mode === 'story' ? lastStorySettings.title : 'Your Creation Will Appear Here';
                    if (lastStorySettings && lastStorySettings.mode === 'story') {
                        continueBtn.style.display = 'inline-block';
                    }
                    break;
                case 'research':
                    researchControls.style.display = 'block';
                    sharedControlsContainer.style.display = 'block';
                    buttonContainer.style.display = 'block';
                    curatedPromptsBtn.style.display = 'none';
                    openLoomBtn.style.display = 'none';
                    storyContentEl.style.display = 'block';
                    storyTitleEl.style.display = 'flex';
                    headerIllustrationEl.style.display = 'flex';
                    if (storyFooter) storyFooter.style.display = 'flex';
                    generateBtn.textContent = "Generate Report";
                    storyTitleTextEl.textContent = 'Your Creation Will Appear Here';
                    break;
                case 'novelist':
                    novelistControls.style.display = 'block';
                    sharedControlsContainer.style.display = 'none';
                    storyContentEl.style.display = 'block';
                    storyTitleEl.style.display = 'flex';
                    headerIllustrationEl.style.display = 'flex';
                    if (storyFooter) storyFooter.style.display = 'flex';
                    storyContentEl.setAttribute('contenteditable', 'true');
                    storyContentEl.style.cursor = 'text';
                    saveStoryBtn.style.display = 'inline-block';
                    storyTitleTextEl.textContent = 'Your Creation Will Appear Here';
                    break;
                case 'chat':
                    chatControls.style.display = 'block';
                    sharedControlsContainer.style.display = 'none';
                    chatContentEl.style.display = 'block';
                    if (chatFooter) chatFooter.style.display = 'flex';
                    storyTitleEl.style.display = 'flex';
                    storyTitleTextEl.textContent = 'Chat Room';
                    break;
                case 'maps':
                    mapControls.style.display = 'block';
                    sharedControlsContainer.style.display = 'none';
                    mapContentEl.style.display = 'block';
                    highlightApiKey();
                    loadGoogleMapsScript();
                    storyTitleEl.style.display = 'flex';
                    storyTitleTextEl.textContent = 'World Map';
                    break;
                case 'cafe':
                    cafeControls.style.display = 'block';
                    sharedControlsContainer.style.display = 'none';
                    storyContentEl.style.display = 'block'; 
                    storyTitleEl.style.display = 'flex';
                    headerIllustrationEl.style.display = 'flex';
                    if (storyFooter) storyFooter.style.display = 'flex';
                    highlightApiKey();
                    storyTitleTextEl.textContent = 'Cafe Ambience';
                    break;
                case 'agent':
                    agentControls.style.display = 'block';
                    sharedControlsContainer.style.display = 'none';
                    buttonContainer.style.display = 'block';
                    curatedPromptsBtn.style.display = 'none';
                    openLoomBtn.style.display = 'none';
                    agentContentEl.style.display = 'block';
                    storyTitleEl.style.display = 'flex';
                    if (agentFooter) agentFooter.style.display = 'flex';
                    storyTitleTextEl.textContent = "Agent Workspace";
                    generateBtn.textContent = "Execute Agent Plan";
                    break;
            }
        });
    });

    const guideContentEl = document.getElementById('guide-content');
    const guideTabs = document.querySelectorAll('.guide-tab');
    const guidePrintBtn = document.querySelector('.guide-print-btn');

    const storyWeaverGuideHtml = `
        <h3>1. The Basics: Your Story's Foundation</h3>
        <p>On the left page, you'll find the main controls to shape your narrative.</p>
        <ul>
            <li><b>Grade Level:</b> Select the reading level you're aiming for.</li>
            <li><b>Story Type:</b> Choose between <b>Fiction</b> (an imagined tale) or <b>Non-Fiction</b> (a factual account).</li>
            <li><b>Genre:</b> Pick a category, like Fantasy, Sci-Fi, or History.</li>
            <li><b>Story Length:</b> Choose the approximate length of your story.</li>
            <li><b>Topic or Question:</b> This is the most important part! Enter the main idea of your story.</li>
        </ul>
        <h3>2. The Loom: Advanced Creative Control</h3>
        <p>For more detailed control, click the <b>"Open The Loom"</b> button. This opens a new panel where you can fine-tune the narrative voice.</p>
        <ul>
            <li><b>Tone & Mood:</b> Define the story's attitude (e.g., Humorous) and the feeling it evokes (e.g., Tense).</li>
            <li><b>Character Details:</b> You can give your main character a name, an archetype (like "The Hero"), and specific traits. Stuck for a name? Just click the ✨ button to get a suggestion!</li>
        </ul>
        <h3>3. The Interactive Glossary: A Hidden Power</h3>
        <p>Every story you create is also an interactive dictionary! This is a powerful tool for learning new words. Simply <b>hover your mouse over any word</b> in the generated text on the right page. A small window will pop up instantly with the word's definition and phonetic spelling.</p>
        <h3>4. Your Bookshelf & Archive</h3>
        <p>Every story you generate is automatically saved. Click the <b>"My Bookshelf"</b> button to see all your past creations. Your bookshelf can hold up to ${BOOKSHELF_LIMIT} stories. To save space, you can move stories to the <b>Archive Vault</b>, which holds another ${ARCHIVE_LIMIT} stories. Just click the archive icon (🗃) on a book cover.</p>
    `;

    const researchAssistantGuideHtml = `
        <h3>1. How It Works: AI & Real Data, Combined</h3>
        <p>The Research Assistant is more than just a text generator. It uses a two-step process:</p>
        <ol>
            <li><b>AI Blueprint:</b> First, an AI model writes the main text of the report based on your topic.</li>
            <li><b>Data Weaving:</b> The app then scans that text for opportunities to add real data. It makes separate calls to public APIs like <b>NASA</b>, <b>Spotify</b>, <b>Data Commons</b>, the <b>Global Biodiversity Information Facility (GBIF)</b>, <b>The Metropolitan Museum of Art</b>, and <b>Datamuse</b> to fetch relevant images and statistics, weaving them directly into the final report.</li>
        </ol>
        <h3>2. Getting Started: Your Research Topic</h3>
        <p>First, switch to the <b>"Research Assistant"</b> tab. The controls on the left will change to be more academic.</p>
        <ul>
            <li><b>Subject:</b> Choose a category for your research, like Astronomy, Geography, or Biology.</li>
            <li><b>Output Format:</b> Decide how you want the information presented (e.g., a Report, a Timeline).</li>
            <li><b>Research Topic:</b> Enter the subject you want to learn about.</li>
        </ul>
        <h3>3. Enriched Content: Facts & Figures</h3>
        <p>When you generate a report, look for the special content woven into the text. For example, a report on the 'African Lion' might automatically include its scientific name (<em>Panthera leo</em>) fetched directly from GBIF. Similarly, a report on 'Music' might include a link to an artist's Spotify page, and a 'Technology' report may include related concepts from Datamuse.</p>
        <h3>4. The Interactive Glossary: Define Complex Terms</h3>
        <p>The powerful glossary feature is also available in Research mode! If you come across a complex term in your report, just <b>hover your mouse over the word</b> to see an instant definition. This is perfect for quickly understanding technical or scientific vocabulary.</p>
    `;

    const novelistGuideHtml = `
        <h3>1. Welcome to the Studio: Your Manuscript</h3>
        <p>The Novelist mode transforms the right page into a fully <b>editable manuscript</b>. You can type directly, paste text from other sources, or load a story from your bookshelf to begin.</p>
        <h3>2. The AI as Your Editor: The Revision Loop</h3>
        <p>This is the core of the Novelist mode. Instead of just adding text, you can collaborate with the AI to refine your work.</p>
        <ol>
            <li><b>Highlight Text:</b> Select any portion of your manuscript—a sentence, a paragraph, or a whole chapter.</li>
            <li><b>Open The Revision Loom:</b> Click the "Open The Revision Loom" button to access the advanced editing tools.</li>
            <li><b>Choose a Goal & Style:</b> Tell the AI what you want to achieve (e.g., "Expand on this," "Improve the dialogue") and how it should be done (e.g., "Show, don't tell").</li>
            <li><b>(Optional) Add Director's Notes:</b> Give the AI specific, contextual instructions for the revision.</li>
            <li><b>Click "Revise with AI":</b> The AI will rewrite only the selected text based on your instructions.</li>
        </ol>
        <h3>3. The Writer's Notebook: Your Creative Hub</h3>
        <p>The left-hand page now features a <b>Writer's Notebook</b>. This is your space for ideas, character sketches, plot points, and research notes. Everything you write here is saved with your manuscript when you click the "Save" button in the story footer.</p>
        <h3>4. Saving Your Work & The Archive</h3>
        <p>Your work is not saved automatically in Novelist mode. When you're ready to save your progress, click the <b>"Save"</b> button in the footer. This will update the story on your bookshelf with the latest version of your manuscript and your notebook.</p>
        <p>Your bookshelf can hold up to ${BOOKSHELF_LIMIT} stories. To save space, you can move stories to the <b>Archive Vault</b>, which holds another ${ARCHIVE_LIMIT} stories. Just click the archive icon (🗃) on a book cover.</p>
    `;

    const chatGuideHtml = `
        <h3>1. Start a Conversation</h3>
        <p>The Chat mode allows you to have a direct, real-time conversation with the AI.</p>
        <ul>
            <li><b>Select a Persona:</b> Click the "Select a Persona" button to choose from a list of predefined AI personalities, like a helpful assistant or a historical figure.</li>
            <li><b>Create Your Own:</b> Alternatively, you can type your own persona description in the text box (e.g., "A grumpy, sarcastic cat").</li>
            <li><b>Customize Style:</b> Use "The Loom" to further refine the AI's conversational tone and mood.</li>
        </ul>
        <h3>2. Theater Mode & Saving</h3>
        <p>For a more immersive experience, click the <b>"Theater"</b> button in the chat footer to open a full-screen conversation view. You can save any conversation to your bookshelf by clicking the <b>"Save"</b> button and giving it a name.</p>
    `;

    const mapsGuideHtml = `
        <h3>1. Explore the World</h3>
        <p>The Maps mode connects real-world locations to AI-powered storytelling.</p>
        <ul>
            <li><b>Find a Location:</b> Enter any place, landmark, or address into the search box and click "Find on Map." The map on the right will update to show your chosen location.</li>
            <li><b>Generate a Story:</b> Once you've found a location, click the "Generate Story from this Location" button. The AI will create a unique story set in that specific place.</li>
        </ul>
        <h3>2. API Key</h3>
        <p>This feature is powered by the <b>Google Maps Platform</b>. To use it, you'll need a Google Maps API key. You can get one from the Google Cloud Console and add it in the <b>Settings</b> panel. The required key will be highlighted when you switch to the Maps tab.</p>
    `;

    const cafeGuideHtml = `
        <h3>1. Set the Mood</h3>
        <p>The Cafe mode provides background music to enhance your writing or reading experience. Simply select a station from the dropdown menu to get started.</p>
        <h3>2. Controls</h3>
        <ul>
            <li><b>Play/Pause/Next:</b> Control the music playback.</li>
            <li><b>Volume:</b> Adjust the volume with the slider.</li>
        </ul>
        <h3>3. API Key</h3>
        <p>This feature is powered by the <b>Freesound.org API</b>. To use it, you'll need to get a free API key from their website and add it in the <b>Settings</b> panel. The required key will be highlighted when you switch to the Cafe tab.</p>
    `;

    guideContentEl.innerHTML = storyWeaverGuideHtml; // Set default view

    guideTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            guideTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const guide = tab.dataset.guide;
            if (guide === 'story') {
                guideContentEl.innerHTML = storyWeaverGuideHtml;
            } else if (guide === 'research') {
                guideContentEl.innerHTML = researchAssistantGuideHtml;
            } else if (guide === 'novelist') {
                guideContentEl.innerHTML = novelistGuideHtml;
            } else if (guide === 'chat') {
                guideContentEl.innerHTML = chatGuideHtml;
            } else if (guide === 'maps') {
                guideContentEl.innerHTML = mapsGuideHtml;
            } else if (guide === 'cafe') {
                guideContentEl.innerHTML = cafeGuideHtml;
            }
        });
    });

    guidePrintBtn.addEventListener('click', () => {
        const guideTitle = document.querySelector('.guide-tab.active').textContent;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>${guideTitle} - User Guide</title>`);
        printWindow.document.write('<style>body{font-family: sans-serif; margin: 2em;} h3{border-bottom: 1px solid #ccc; padding-bottom: 5px;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<h1>${guideTitle} Guide</h1>`);
        printWindow.document.write(guideContentEl.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    });


    async function simulateResearch(settings) {
        await new Promise(resolve => setTimeout(resolve, 500));
        let report = `This is a simulated research ${settings.format.toLowerCase()} about ${settings.topic}.\n\nThis section would contain detailed, factual information. For example, if the topic were a planet, it might include data about its size, atmosphere, and moons.\n\n[NASA_IMAGE: ${settings.topic}]\n\nThis is the concluding paragraph of the simulated research. [SCIENCEGOV_ARTICLE: ${settings.topic}] [DATAMUSE_WORDS: ${settings.topic}] [SPOTIFY_ARTIST: ${settings.topic}]`;
        return report;
    }

    async function simulateStory(settings) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        let story = `This is a simulated story about ${settings.topic}. It is written in a ${settings.tone} tone and a ${settings.mood} mood.\n\nThis is the second paragraph. [ILLUSTRATION: a sample image].\n\nThis is the third paragraph, continuing the narrative.\n\nThis is the fourth paragraph. [ILLUSTRATION: another sample image].\n\nThis is the final paragraph of the simulated story.`;
        if(settings.aiTitle) {
            story = `A Simulated Title\n${story}`;
        }
        return story;
    }

    async function simulateEmbedImages(storyText) {
        const illustrationRegex = /\[ILLUSTRATION:\s*([^\]]+)\]/g;
        let processedText = storyText;
        let imageCount = 0;
         while ((illustrationRegex.exec(storyText)) !== null) {
            const match = illustrationRegex.exec(storyText);
            const keyword = match[1];
            const imageUrl = `https://placehold.co/400x300/a0522d/FFF?text=${encodeURIComponent(keyword)}`;
            const alignment = imageCount % 2 === 0 ? 'left' : 'right';
            const imgTag = `<img src="${imageUrl}" class="embedded-illustration ${alignment}" alt="Illustration for the story">`;
            processedText = processedText.replace(match[0], imgTag);
            imageCount++;
        }
        return `<p>${processedText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
    }

    function setupTooltips() {
        const controlGroups = document.querySelectorAll('.control-group');
        controlGroups.forEach(group => {
            const label = group.querySelector('label');
            const tooltip = group.querySelector('.tooltip');
            if (label && tooltip) {
                label.addEventListener('mouseenter', () => {
                    const modalBody = group.closest('.modal-body');
                    tooltip.classList.remove('bottom');
                    tooltip.classList.add('visible');
                    const tooltipRect = tooltip.getBoundingClientRect();
                    
                    let containerTop = 0;
                    if (modalBody) {
                        containerTop = modalBody.getBoundingClientRect().top;
                    }

                    if (tooltipRect.top < containerTop) {
                        tooltip.classList.add('bottom');
                    }
                });
                label.addEventListener('mouseleave', () => {
                    tooltip.classList.remove('visible');
                    tooltip.classList.remove('bottom');
                });
            }
        });
    }
    
    // --- Accessibility & Display ---
    const synth = window.speechSynthesis;
    const readAloudBtn = document.querySelector('.read-aloud-button');
    const theaterReadAloudBtn = document.getElementById('theater-read-aloud-btn');
    const voiceSelect = document.getElementById('voice-select');
    const voiceSpeed = document.getElementById('voice-speed');
    const voiceSpeedLabel = document.getElementById('voice-speed-label');
    const karaokeToggle = document.getElementById('karaoke-toggle');
    const highlightStyleSelect = document.getElementById('highlight-style');
    const fontSize = document.getElementById('font-size');
    const fontSizeLabel = document.getElementById('font-size-label');
    const textSpacing = document.getElementById('text-spacing');
    const textSpacingLabel = document.getElementById('text-spacing-label');
    const fontType = document.getElementById('font-type');
    const bgColor = document.getElementById('bg-color');
    const dyslexiaPreset = document.getElementById('dyslexia-preset-toggle');
    let voices = [];
    let utterance = null;
    let currentWordIndex = 0;
    let words = [];

    function populateVoiceList() {
        voices = synth.getVoices();
        voiceSelect.innerHTML = '';
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            voiceSelect.appendChild(option);
        });
    }

    populateVoiceList();
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = populateVoiceList;
    }

    function applyDisplaySettings() {
        const storyPs = storyContentEl.querySelectorAll('p');
        rightPage.style.backgroundColor = bgColor.value;
        
        let textColor, titleColor, illustrationColor;

        if (bgColor.value === '#222222') { // Dark mode
            textColor = 'var(--light-text-color)';
            titleColor = 'var(--light-text-color)';
            illustrationColor = 'var(--light-text-color)';
        } else { // Light modes
            textColor = 'var(--text-color)';
            titleColor = 'var(--secondary-color)';
            illustrationColor = '#888';
        }

        storyPs.forEach(p => {
            p.style.fontSize = `${fontSize.value}rem`;
            p.style.lineHeight = textSpacing.value;
            p.style.fontFamily = fontType.value;
            p.style.color = textColor; 
        });

        storyTitleTextEl.style.color = titleColor;
        headerIllustrationEl.style.color = illustrationColor;
    }

    fontSize.addEventListener('input', () => {
        fontSizeLabel.textContent = fontSize.value;
        applyDisplaySettings();
    });
    textSpacing.addEventListener('input', () => {
        textSpacingLabel.textContent = textSpacing.value;
        applyDisplaySettings();
    });
    fontType.addEventListener('change', applyDisplaySettings);
    bgColor.addEventListener('change', applyDisplaySettings);
    highlightStyleSelect.addEventListener('change', () => {
        const selectedValue = highlightStyleSelect.value;
        if (selectedValue !== 'line') {
            document.documentElement.style.setProperty('--highlight-color', selectedValue);
        }
    });

    dyslexiaPreset.addEventListener('change', () => {
        if(dyslexiaPreset.checked) {
            fontSize.value = 1.3;
            textSpacing.value = 2.0;
            fontType.value = "'Lexend', sans-serif";
            bgColor.value = "#f3e5ab";
        } else { 
            fontSize.value = 1.1;
            textSpacing.value = 1.7;
            fontType.value = "'Georgia', serif";
            bgColor.value = "#ffffff";
        }
        fontSizeLabel.textContent = fontSize.value;
        textSpacingLabel.textContent = textSpacing.value;
        fontType.dispatchEvent(new Event('change'));
        bgColor.dispatchEvent(new Event('change'));
    });

    function cleanupHighlights(container) {
        container.querySelectorAll('.highlight, .highlight-line').forEach(el => {
            el.classList.remove('highlight', 'highlight-line');
        });
    }

    readAloudBtn.addEventListener('click', () => handleReadAloud(storyContentEl, readAloudBtn, karaokeToggle.checked));
    theaterReadAloudBtn.addEventListener('click', () => handleReadAloud(document.getElementById('theater-story-content'), theaterReadAloudBtn, true));

    function handleReadAloud(contentElement, buttonElement, useKaraoke) {
         if (synth.speaking) {
            synth.cancel();
            buttonElement.textContent = "Read"; 
            cleanupHighlights(contentElement); 
            return;
        }

        if (contentElement.textContent.trim().length > 0) {
            const originalText = contentElement.innerText;
            utterance = new SpeechSynthesisUtterance(originalText);
            const selectedVoiceName = voiceSelect.selectedOptions[0].getAttribute('data-name');
            utterance.voice = voices.find(voice => voice.name === selectedVoiceName);
            utterance.rate = voiceSpeed.value;
            
            utterance.onstart = () => { buttonElement.textContent = "Stop"; };
            utterance.onend = () => {
                buttonElement.textContent = "Read";
                cleanupHighlights(contentElement);
            };
            
            if(useKaraoke) {
                const highlightStyle = highlightStyleSelect.value;
                const isTheaterMode = contentElement.id === 'theater-story-content';
                
                words = contentElement.querySelectorAll('span');
                currentWordIndex = 0;
                utterance.onboundary = (event) => {
                    if (event.name === 'word') {
                        cleanupHighlights(contentElement);
                        for (let i = currentWordIndex; i < words.length; i++) {
                            if (originalText.substring(event.charIndex).startsWith(words[i].textContent)) {
                                if (isTheaterMode || highlightStyle === 'line') {
                                    words[i].classList.add('highlight-line');
                                    document.documentElement.style.setProperty('--highlight-color', 'white');
                                } else {
                                    words[i].classList.add('highlight');
                                    document.documentElement.style.setProperty('--highlight-color', highlightStyle);
                                }
                                currentWordIndex = i + 1;
                                break;
                            }
                        }
                    }
                };
            }
            synth.speak(utterance);
        }
    }

    voiceSpeed.addEventListener('input', () => {
        voiceSpeedLabel.textContent = `${voiceSpeed.value}x`;
        if(synth.speaking) {
            synth.cancel();
        }
    });

    const glossaryModal = document.getElementById('glossary-modal');
    let hoverTimer, glossaryController;

    function decodeHtmlEntities(text) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    }

    function wrapWordsInSpans(container) {
        container.querySelectorAll('p').forEach(p => {
            const images = [];
            let tempHtml = p.innerHTML;
            
            p.querySelectorAll('img').forEach((img, i) => {
                const placeholder = `__IMAGE_${i}__`;
                images.push(img.outerHTML);
                tempHtml = tempHtml.replace(img.outerHTML, placeholder);
            });

            let decodedText = decodeHtmlEntities(tempHtml);
            
            let wrappedText = decodedText.replace(/(\b[a-zA-Z'-]+\b)/g, '<span>$1</span>');
            
            images.forEach((imgHtml, i) => {
                wrappedText = wrappedText.replace(`__IMAGE_${i}__`, imgHtml);
            });
            p.innerHTML = wrappedText;
        });
    }

    async function fetchDefinition(word, signal) {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, { signal });
            if (!response.ok) return null;
            const data = await response.json();
            return data[0];
        } catch (error) {
            if (error.name !== 'AbortError') console.error("Dictionary API error:", error);
            return null;
        }
    }

    storyContentEl.addEventListener('mouseover', (e) => {
        if (e.target.tagName === 'SPAN') {
            const word = e.target.textContent.trim().toLowerCase().replace(/[^a-z'-]/g, '');
            if (word.length < 3) return;
            
            glossaryController = new AbortController();
            const signal = glossaryController.signal;

            hoverTimer = setTimeout(async () => {
                const definitionData = await fetchDefinition(word, signal);
                if (definitionData && !signal.aborted) {
                    let bestMeaning = definitionData.meanings.find(m => m.partOfSpeech === 'noun') || definitionData.meanings[0];
                    document.getElementById('glossary-word').textContent = definitionData.word;
                    document.getElementById('glossary-phonetic').textContent = definitionData.phonetic || '';
                    document.getElementById('glossary-definition').textContent = bestMeaning.definitions[0]?.definition || 'No definition found.';
                    
                    glossaryModal.style.display = 'block';
                    const rect = e.target.getBoundingClientRect();
                    glossaryModal.style.left = `${rect.left + window.scrollX}px`;
                    glossaryModal.style.top = `${rect.bottom + window.scrollY + 5}px`;
                }
            }, 1000); 
        }
    });

    storyContentEl.addEventListener('mouseout', (e) => {
        if (e.target.tagName === 'SPAN') {
            clearTimeout(hoverTimer);
            if (glossaryController) glossaryController.abort();
            glossaryModal.style.display = 'none';
        }
    });

    const appThemeSelect = document.getElementById('app-theme');
    const root = document.documentElement;

    const themes = {
        blue: { '--primary-color': '#2a6f97', '--secondary-color': '#014f86', '--accent-color': '#61a5c2', '--light-bg': '#f0f8ff', '--left-page-bg': '#e6f4ff' },
        brown: { '--primary-color': '#8B4513', '--secondary-color': '#5c4033', '--accent-color': '#a0522d', '--light-bg': '#f0f0f0', '--left-page-bg': '#fdf5e6' },
        green: { '--primary-color': '#2d6a4f', '--secondary-color': '#1b4332', '--accent-color': '#74c69d', '--light-bg': '#f6fff8', '--left-page-bg': '#e8f5e9' }
    };

    function applyTheme(themeName) {
        const theme = themes[themeName];
        for (const [key, value] of Object.entries(theme)) {
            root.style.setProperty(key, value);
        }
        localStorage.setItem('appTheme', themeName);
    }

    appThemeSelect.addEventListener('change', () => applyTheme(appThemeSelect.value));

    const savedTheme = localStorage.getItem('appTheme') || 'blue';
    appThemeSelect.value = savedTheme;
    applyTheme(savedTheme);

    reviseBtn.addEventListener('click', async () => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (!selectedText) {
            alert('Please select some text in the manuscript to revise.');
            return;
        }
        
        glossaryModal.style.display = 'none';

        reviseBtn.disabled = true;
        reviseBtn.textContent = 'Revising...';

        const revisionGoal = document.getElementById('revision-goal').value;
        const revisionStyle = document.getElementById('revision-style').value;
        const revisionTone = document.getElementById('revision-tone').value;
        const revisionMood = document.getElementById('revision-mood').value;
        const directorNotes = document.getElementById('include-director-notes').checked 
            ? document.getElementById('director-notes').value.trim() 
            : '';
        
        const revisionSettings = {
            llmModel: document.getElementById('llm-model').value,
        };

        try {
            const revisedText = devModeToggle.checked
                ? `This is a simulated revision of the selected text with the goal: "${revisionGoal}".\n\nIt includes a second paragraph.`
                : await generateStory(revisionSettings, selectedText, revisionGoal, revisionStyle, directorNotes, revisionTone, revisionMood);

            const range = selection.getRangeAt(0);
            range.deleteContents();
            
            const fragment = document.createDocumentFragment();
            const paragraphs = revisedText.split('\n\n');
            paragraphs.forEach((pText) => {
                if (pText.trim()) {
                    const p = document.createElement('p');
                    p.innerHTML = pText.replace(/\n/g, '<br>');
                    fragment.appendChild(p);
                }
            });

            wrapWordsInSpans(fragment);
            range.insertNode(fragment);
            
            modals.revisionLoom.modal.style.display = 'none'; // Close modal on success

        } catch (error) {
            console.error('Error during revision:', error);
            alert(`An error occurred during revision: ${error.message}`);
        } finally {
            reviseBtn.disabled = false;
            reviseBtn.textContent = 'Revise with AI';
        }
    });

    // --- Story History / Bookshelf Functions ---
    function getStoryHistory() {
        return JSON.parse(localStorage.getItem('storyHistory') || '[]');
    }

    function saveStoryToHistory(story) {
        let history = getStoryHistory();
        // If currentStoryIndex is null, it's a new story (like from the Agent)
        if (currentStoryIndex === null) {
             history.unshift(story);
            if (history.length > BOOKSHELF_LIMIT) {
                history.pop();
            }
            currentStoryIndex = 0; // Set the index for the newly added story
        } else {
             // Otherwise, it's an update to an existing story
            history[currentStoryIndex] = story;
        }
        localStorage.setItem('storyHistory', JSON.stringify(history));
    }

    function deleteStoryFromHistory(index) {
        let history = getStoryHistory();
        history.splice(index, 1);
        localStorage.setItem('storyHistory', JSON.stringify(history));
        renderHistoryModal();
    }

    function loadStoryFromHistory(index) {
        const history = getStoryHistory();
        const story = history[index];
        if (story) {
            storyTitleTextEl.textContent = story.title;
            headerIllustrationEl.innerHTML = story.header || '';
            
            if (story.settings.mode === 'chat') {
                document.querySelector('.mode-tab[data-mode="chat"]').click();
                chatHistory = story.chatHistory || [];
                chatContentEl.innerHTML = '';
                chatTheaterContentEl.innerHTML = '';
                chatHistory.forEach(msg => addMessageToViews(msg.role === 'user' ? 'user' : 'ai', msg.parts[0].text));
            } else {
                storyContentEl.innerHTML = story.content;
                wrapWordsInSpans(storyContentEl);
                cleanStoryHtml = story.content;
                lastStorySettings = story.settings;
                notebookEl.value = story.notebook || '';
                currentStoryIndex = index;
                
                if (story.settings.mode === 'novelist') {
                    document.querySelector('.mode-tab[data-mode="novelist"]').click();
                } else if (story.settings.mode === 'research') {
                    document.querySelector('.mode-tab[data-mode="research"]').click();
                } else {
                    document.querySelector('.mode-tab[data-mode="story"]').click();
                }
            }
            
            modals.history.modal.style.display = 'none';
        }
    }

    // --- Archive Functions ---
    function getStoryArchive() {
        return JSON.parse(localStorage.getItem('storyArchive') || '[]');
    }

    function saveStoryArchive(archive) {
        localStorage.setItem('storyArchive', JSON.stringify(archive));
    }

    function archiveStory(index) {
        let history = getStoryHistory();
        let archive = getStoryArchive();

        if (archive.length >= ARCHIVE_LIMIT) {
            alert(`Archive is full! Please clear some space from the Archive Vault.`);
            return;
        }

        const storyToArchive = history.splice(index, 1)[0];
        if (storyToArchive) {
            archive.unshift(storyToArchive);
            saveStoryArchive(archive);
            localStorage.setItem('storyHistory', JSON.stringify(history));
            renderHistoryModal(); 
            alert(`"${storyToArchive.title}" has been moved to the archive.`);
        }
    }

    function unarchiveStory(index) {
        let history = getStoryHistory();
        let archive = getStoryArchive();

        if (history.length >= BOOKSHELF_LIMIT) {
            alert(`Bookshelf is full! Please make some room before returning a story from the archive.`);
            return;
        }
        
        const storyToUnarchive = archive.splice(index, 1)[0];
        if(storyToUnarchive) {
            history.unshift(storyToUnarchive);
            saveStoryArchive(archive);
            localStorage.setItem('storyHistory', JSON.stringify(history));
            renderArchiveModal();
            alert(`"${storyToUnarchive.title}" has been returned to the bookshelf.`);
        }
    }

    document.getElementById('clear-archive-button').addEventListener('click', () => {
        if(confirm('Are you sure you want to clear your entire archive? This action cannot be undone.')) {
            localStorage.removeItem('storyArchive');
            renderArchiveModal();
        }
    });
    
    document.getElementById('clear-history-button').addEventListener('click', () => {
        if(confirm('Are you sure you want to clear your entire bookshelf? This action cannot be undone.')) {
            localStorage.removeItem('storyHistory');
            renderHistoryModal();
        }
    });

    // --- Cafe Music Feature ---
    const musicPlayer = document.getElementById('background-music-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const nextTrackBtn = document.getElementById('next-track-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const nowPlayingEl = document.getElementById('now-playing');
    const musicMixBtn = document.getElementById('music-mix-btn');
    let musicFavorites = JSON.parse(localStorage.getItem('musicFavorites')) || [];
    let isMixMode = false;
    let currentStationKey = null;

    const musicStations = {
        lofi: { name: 'Lofi Beats', query: 'lofi', duration: '[120 TO 300]', icon: '🎧', description: 'Chill beats to relax, study, or focus.' },
        cafe: { name: 'Rainy Day Cafe', query: 'cafe ambient', duration: '[60 TO 240]', icon: '☕', description: 'The cozy sound of a bustling cafe on a rainy day.' },
        piano: { name: 'Classical Piano', query: 'classical piano', duration: '[90 TO 300]', icon: '🎹', description: 'Timeless masterpieces from legendary composers.' },
        nature: { name: 'Nature Sounds', query: 'forest sounds', duration: '[60 TO 300]', icon: '🌳', description: 'The calming and immersive sounds of the great outdoors.' },
        ocean: { name: 'Ocean Waves', query: 'ocean waves', duration: '[60 TO 300]', icon: '🌊', description: 'The rhythmic sound of waves crashing on the shore.' },
        jazz: { name: 'Jazz Club', query: 'jazz club', duration: '[120 TO 300]', icon: '🎷', description: 'The smooth, improvisational sounds of a live jazz band.' },
        rock: { name: 'Rock', query: 'rock', duration: '[120 TO 300]', icon: '🎸', description: 'High-energy tracks to get your blood pumping.' },
        pop: { name: 'Pop', query: 'pop', duration: '[120 TO 300]', icon: '🎤', description: 'Catchy and upbeat hits from today and yesterday.' },
        instrumental: { name: 'Instrumental', query: 'instrumental', duration: '[120 TO 300]', icon: '🎻', description: 'Music without words, perfect for concentration.' },
        electronic: { name: 'Electronic', query: 'electronic', duration: '[120 TO 300]', icon: '🎛️', description: 'A wide range of electronic music, from ambient to dance.' },
        ambient: { name: 'Ambient', query: 'ambient', duration: '[120 TO 300]', icon: '🌌', description: 'Atmospheric soundscapes to help you drift away.' },
        folk: { name: 'Folk', query: 'folk', duration: '[120 TO 300]', icon: '🪕', description: 'Acoustic storytelling through song.' },
    };

    function toggleFavorite(stationKey) {
        const index = musicFavorites.indexOf(stationKey);
        if (index > -1) {
            musicFavorites.splice(index, 1);
        } else {
            if (musicFavorites.length >= 10) {
                alert('You can only have up to 10 favorite stations.');
                return;
            }
            musicFavorites.push(stationKey);
        }
        localStorage.setItem('musicFavorites', JSON.stringify(musicFavorites));
        populateMusicMenu();
    }

    async function fetchAndPlayMusic(stationKey) {
        const apiKey = freesoundApiKeyInput.value.trim();
        if (!apiKey) {
            nowPlayingEl.textContent = 'Please add a Freesound API key in Settings.';
            return;
        }
        
        currentStationKey = stationKey;
        const { name, query, duration } = musicStations[stationKey];
        const API_URL = `https://freesound.org/apiv2/search/text/?query=${query}&filter=duration:${duration}&fields=name,previews,username&token=${apiKey}`;
        
        nowPlayingEl.textContent = `Finding a track for ${name}...`;
        populateMusicMenu(); // Refresh menu to show 'playing' state

        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Freesound API request failed');
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const randomTrack = data.results[Math.floor(Math.random() * data.results.length)];
                musicPlayer.src = randomTrack.previews['preview-hq-mp3'];
                musicPlayer.play();
                const trackName = toTitleCase(randomTrack.name.replace(/_/g, ' ').replace(/\.mp3/i, ''));
                nowPlayingEl.textContent = `Now Playing: "${trackName}"`;
                playPauseBtn.innerHTML = '❚❚'; // Pause symbol
                
                const announcement = new SpeechSynthesisUtterance(`Now playing ${name}. ${trackName}.`);
                synth.speak(announcement);

            } else {
                nowPlayingEl.textContent = `No tracks found for ${name}.`;
                currentStationKey = null;
                populateMusicMenu();
            }
        } catch (error) {
            console.error('Freesound API Error:', error);
            nowPlayingEl.textContent = 'Error fetching music.';
            currentStationKey = null;
            populateMusicMenu();
        }
    }

    playPauseBtn.addEventListener('click', () => {
        if (musicPlayer.paused && musicPlayer.src) {
            musicPlayer.play();
            playPauseBtn.innerHTML = '❚❚';
        } else if (!musicPlayer.paused) {
            musicPlayer.pause();
            playPauseBtn.innerHTML = '►'; // Play symbol
        } else if (currentStationKey) {
            fetchAndPlayMusic(currentStationKey);
        } else {
            alert("Please select a station from the menu first.");
        }
    });

    nextTrackBtn.addEventListener('click', () => {
        if (isMixMode) {
            playNextInMix();
        } else if (currentStationKey) {
            fetchAndPlayMusic(currentStationKey);
        } else {
            alert("Please select a station from the menu first.");
        }
    });

    volumeSlider.addEventListener('input', () => {
        musicPlayer.volume = volumeSlider.value;
    });

    musicMixBtn.addEventListener('click', () => {
        isMixMode = !isMixMode;
        musicMixBtn.classList.toggle('active', isMixMode);
        musicMixBtn.textContent = isMixMode ? 'Stop Mix' : 'Start Mix';
        if (isMixMode) {
            playNextInMix();
        }
    });

    function playNextInMix() {
        const availableStations = musicFavorites.length > 0 ? musicFavorites : Object.keys(musicStations);
        const randomStationKey = availableStations[Math.floor(Math.random() * availableStations.length)];
        fetchAndPlayMusic(randomStationKey);
    }

    musicPlayer.addEventListener('ended', () => {
        if (isMixMode) {
            playNextInMix();
        } else if (currentStationKey) {
            fetchAndPlayMusic(currentStationKey);
        }
    });

    // --- Chat Feature ---
    let chatHistory = []; 
    
    function addMessageToViews(sender, message) {
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${sender}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = message;
        
        messageEl.appendChild(bubble);

        // Add to both main chat and theater chat
        chatContentEl.appendChild(messageEl);
        chatTheaterContentEl.appendChild(messageEl.cloneNode(true)); // Append a copy

        // Auto-scroll both views
        chatContentEl.scrollTop = chatContentEl.scrollHeight;
        chatTheaterContentEl.scrollTop = chatTheaterContentEl.scrollHeight;
    }

    async function handleSendMessage(inputElement) {
        const userMessage = inputElement.value.trim();
        if (!userMessage) return;

        addMessageToViews('user', userMessage);
        chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
        
        inputElement.value = '';
        chatTheaterInput.value = '';

        const isDevMode = devModeToggle.checked;
        if (isDevMode) {
            setTimeout(() => {
                const simulatedResponse = "This is a simulated response from the AI assistant in Development Mode.";
                addMessageToViews('ai', simulatedResponse);
                chatHistory.push({ role: 'model', parts: [{ text: simulatedResponse }] });
            }, 500);
            return;
        }

        const persona = personas[selectedPersona] || personas.assistant;
        const personaPrompt = `System Instruction: Embody the persona of a ${persona.name}, who is ${persona.description}. Maintain this persona throughout the conversation. The user's messages are part of the history that follows.`;

        const contentsForApi = [
            { role: 'user', parts: [{ text: personaPrompt }] },
            { role: 'model', parts: [{ text: 'Understood. I am ready to chat in character.' }] },
            ...chatHistory
        ];

        try {
            const apiKey = geminiApiKeyInput.value.trim();
            if (!apiKey) {
                addMessageToViews('ai', 'Please enter your Gemini API key in Settings.');
                return;
            }

            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: contentsForApi })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data?.error?.message || 'API request failed');
            if (!data.candidates || !data.candidates[0].content.parts[0].text) throw new Error("Invalid response from AI.");
            
            const aiResponse = data.candidates[0].content.parts[0].text;
            addMessageToViews('ai', aiResponse);
            chatHistory.push({ role: 'model', parts: [{ text: aiResponse }] });

        } catch (error) {
            console.error('Error during chat response generation:', error);
            addMessageToViews('ai', `An error occurred: ${error.message}`);
        }
    }

    function clearChat() {
        chatContentEl.innerHTML = '';
        chatTheaterContentEl.innerHTML = '';
        chatHistory = [];
    }

    function openSaveChatModal() {
        if (chatHistory.length === 0) {
            alert("There is no conversation to save yet.");
            return;
        }
        modals.saveChat.modal.style.display = 'flex';
    }

    // Main Chat Event Listeners
    chatSendBtn.addEventListener('click', () => handleSendMessage(chatInput));
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(chatInput);
        }
    });
    clearChatBtn.addEventListener('click', clearChat);
    saveChatBtn.addEventListener('click', openSaveChatModal);
    
    // Theater Chat Event Listeners
    chatTheaterSendBtn.addEventListener('click', () => handleSendMessage(chatTheaterInput));
    chatTheaterInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(chatTheaterInput);
        }
    });
    chatTheaterClearBtn.addEventListener('click', clearChat);
    chatTheaterSaveBtn.addEventListener('click', openSaveChatModal);

    // Save Chat Modal Logic
    document.getElementById('confirm-save-chat-btn').addEventListener('click', () => {
        const titleInput = document.getElementById('chat-title-input');
        const chatTitle = titleInput.value.trim();
        if (!chatTitle) {
            alert("Please enter a title for your chat.");
            return;
        }

        const personaName = selectedPersona ? personas[selectedPersona].name : 'Default';

        const chatData = {
            title: chatTitle,
            chatHistory: chatHistory,
            persona: personaName,
            settings: { mode: 'chat' },
            date: new Date().toISOString()
        };

        saveStoryToHistory(chatData);
        alert(`Chat "${chatTitle}" saved to your bookshelf!`);
        titleInput.value = '';
        modals.saveChat.modal.style.display = 'none';
    });
    
    // --- Google Maps Functions ---
    function loadGoogleMapsScript() {
        return new Promise((resolve, reject) => {
            const apiKey = localStorage.getItem('googleMapsApiKey');
            if (!apiKey) {
                document.getElementById('map-container').innerHTML = 'Please add a Google Maps API key in Settings to use this feature.';
                reject(new Error('Google Maps API key not set.'));
                return;
            }

            if (window.google && window.google.maps) {
                if (!map) initMap();
                resolve();
                return;
            }

            if (isMapScriptLoading) {
                // If script is already loading, wait for it to finish
                const interval = setInterval(() => {
                    if (window.google && window.google.maps) {
                        clearInterval(interval);
                        if (!map) initMap();
                        resolve();
                    }
                }, 100);
                return;
            }

            isMapScriptLoading = true;
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=marker`;
            script.async = true;
            script.defer = true;
            script.onerror = () => {
                isMapScriptLoading = false;
                reject(new Error('Failed to load Google Maps script.'));
            };
            window.initMap = () => {
                isMapScriptLoading = false;
                initMap();
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    function initMap() {
        const mapContainer = document.getElementById('map-container');
        const mapId = localStorage.getItem('googleMapsMapId');

        if (!mapId) {
            mapContainer.innerHTML = 'Please add a Google Maps Map ID in Settings to use this feature.';
            return;
        }

        mapContainer.innerHTML = ''; // Clear placeholder text
        const initialLocation = { lat: 39.8283, lng: -98.5795 }; // Center of the US
        map = new google.maps.Map(mapContainer, {
            center: initialLocation,
            zoom: 4,
            mapId: mapId
        });
        geocoder = new google.maps.Geocoder();
    }
    
    // --- "Continue Story" Functionality ---
    async function handleContinueClick() {
        if (!lastStorySettings) {
            alert("Please generate a story first before trying to continue it.");
            return;
        }

        continueBtn.disabled = true;
        continueBtn.textContent = 'Continuing...';

        const currentStoryText = storyContentEl.innerText;

        try {
            const continuation = devModeToggle.checked
                ? "\n\nThis is a simulated continuation of the story, adding a new paragraph to the narrative."
                : await generateStory(lastStorySettings, '', '', '', '', '', '', currentStoryText);
            
            const newParagraphs = continuation.trim().split('\n').filter(p => p.trim() !== '');
            const fragment = document.createDocumentFragment();
            
            newParagraphs.forEach(pText => {
                const p = document.createElement('p');
                p.textContent = pText;
                fragment.appendChild(p);
            });

            wrapWordsInSpans(fragment);
            storyContentEl.appendChild(fragment);

            // Update the saved story in the bookshelf
            cleanStoryHtml = storyContentEl.innerHTML;
            const history = getStoryHistory();
            if (history[currentStoryIndex]) {
                history[currentStoryIndex].content = cleanStoryHtml;
                localStorage.setItem('storyHistory', JSON.stringify(history));
            }

        } catch (error) {
            console.error("Error continuing story:", error);
            alert(`An error occurred: ${error.message}`);
        } finally {
            continueBtn.disabled = false;
            continueBtn.textContent = 'Continue';
        }
    }

    // --- API Key Manager ---
    function populateApiKeyManager() {
        const tableBody = document.getElementById('api-key-table').querySelector('tbody');
        tableBody.innerHTML = '';

        const keys = [
            { name: 'Google AI (Gemini)', storageKey: 'geminiApiKey' },
            { name: 'Google Maps API Key', storageKey: 'googleMapsApiKey' },
            { name: 'Google Maps Map ID', storageKey: 'googleMapsMapId' },
            { name: 'OpenAI', storageKey: 'openaiApiKey' },
            { name: 'Deepseek', storageKey: 'deepseekApiKey' },
            { name: 'Grok', storageKey: 'grokApiKey' },
            { name: 'Hugging Face', storageKey: 'huggingfaceApiKey' },
            { name: 'Freesound', storageKey: 'freesoundApiKey' },
            { name: 'Spotify Client ID', storageKey: 'spotifyClientId' },
            { name: 'Spotify Client Secret', storageKey: 'spotifyClientSecret' },
            { name: 'Unsplash', storageKey: 'unsplashApiKey' },
            { name: 'NASA', storageKey: 'nasaApiKey' }
        ];

        keys.forEach(keyInfo => {
            const row = tableBody.insertRow();
            const serviceCell = row.insertCell();
            const keyCell = row.insertCell();
            const statusCell = row.insertCell();

            serviceCell.textContent = keyInfo.name;
            
            const value = localStorage.getItem(keyInfo.storageKey) || '';
            
            const keySpan = document.createElement('span');
            keySpan.textContent = value ? '••••••••••••••••••••' : '';
            keyCell.appendChild(keySpan);

            if (value) {
                const toggleBtn = document.createElement('button');
                toggleBtn.textContent = 'Show';
                toggleBtn.className = 'toggle-key-btn';
                toggleBtn.addEventListener('click', () => {
                    if (keySpan.textContent.includes('•')) {
                        keySpan.textContent = value;
                        toggleBtn.textContent = 'Hide';
                    } else {
                        keySpan.textContent = '••••••••••••••••••••';
                        toggleBtn.textContent = 'Show';
                    }
                });
                keyCell.appendChild(toggleBtn);
            }

            if (value) {
                statusCell.textContent = 'Saved';
                statusCell.className = 'status-saved';
            } else {
                statusCell.textContent = 'Not Set';
                statusCell.className = 'status-not-set';
            }
        });
    }

    document.getElementById('print-keys-btn').addEventListener('click', () => {
        // Reveal all keys before printing
        document.querySelectorAll('#api-key-table .toggle-key-btn').forEach(btn => {
            if (btn.textContent === 'Show') {
                btn.click();
            }
        });
        window.print();
    });


    // --- Initial Setup ---
    function init() {
        updateGenreOptions();
        populateIllustrationStyles();
        populateCuratedPrompts();
        loadApiKeys();
        toggleLoomFictionControls();
        setupTooltips();
        wrapWordsInSpans(storyContentEl);
        applyDisplaySettings();
        populateFaq();
        llmModelSelect.addEventListener('change', highlightApiKey);
        
        // --- Event Listener for Continue Button ---
        continueBtn.addEventListener('click', handleContinueClick);

        if (clearAgentBtn) {
            clearAgentBtn.addEventListener('click', () => {
                agentContentEl.innerHTML = '';
                agentGoalInput.value = '';
            });
        }

        findLocationBtn.addEventListener('click', () => {
            const locationText = locationInput.value.trim();
            if (!locationText) {
                alert('Please enter a location to find.');
                return;
            }

            if (!geocoder) {
                alert('Map is not ready yet. Please ensure your API key is correct and try again in a moment.');
                return;
            }

            geocoder.geocode({ 'address': locationText }, (results, status) => {
                if (status === 'OK') {
                    map.setCenter(results[0].geometry.location);
                    map.setZoom(12);

                    if (currentMarker) {
                        currentMarker.map = null;
                    }

                    currentMarker = new google.maps.marker.AdvancedMarkerElement({
                        map: map,
                        position: results[0].geometry.location
                    });
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        });

        generateMapStoryBtn.addEventListener('click', () => {
            const locationText = locationInput.value.trim();
            if (!locationText) {
                alert('Please enter a location to find.');
                return;
            }
            document.getElementById('topic').value = `A story set in ${locationText}`;
            document.querySelector('.mode-tab[data-mode="story"]').click();
            alert(`The story topic has been set to "${locationText}". Click the "Generate" button in the Story tab to create your story!`);
        });

        const exportBtn = document.getElementById('export-library-btn');
        const importBtn = document.getElementById('import-library-btn');
        const importInput = document.getElementById('import-file-input');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const history = getStoryHistory();
                const archive = getStoryArchive();
                if (history.length === 0 && archive.length === 0) {
                    alert("Your library is empty. Nothing to export.");
                    return;
                }

                const libraryBackup = {
                    bookshelf: history,
                    archive: archive
                };

                const dataStr = JSON.stringify(libraryBackup, null, 2);
                const dataBlob = new Blob([dataStr], {type: "application/json"});
                const url = URL.createObjectURL(dataBlob);
                
                const link = document.createElement('a');
                link.download = 'story-backup.json';
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
                alert("Library exported successfully! Check your downloads folder for 'story-backup.json'.");
            });
        }

        if (importBtn) {
            importBtn.addEventListener('click', () => {
                if (importInput) {
                    importInput.click();
                }
            });
        }

        if (importInput) {
            importInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.bookshelf || data.archive) {
                            if (confirm("This will overwrite your current library. Are you sure you want to continue?")) {
                                localStorage.setItem('storyHistory', JSON.stringify(data.bookshelf || []));
                                localStorage.setItem('storyArchive', JSON.stringify(data.archive || []));
                                renderHistoryModal();
                                alert("Library imported successfully!");
                            }
                        } else {
                            alert("Invalid backup file format.");
                        }
                    } catch (error) {
                        alert("Error reading backup file. Please make sure it's a valid JSON file.");
                        console.error("Import Error:", error);
                    }
                };
                reader.readAsText(file);
                importInput.value = ''; // Reset for next import
            });
        }
    }

    init();
});
