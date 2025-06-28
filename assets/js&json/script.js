 
 
 // Initial manga data (first 13 entries) - similar to the anime structure but adapted for manga/lightnovel
        // First, let's modify our data model to include lastReadChapter and lastReadVolume
        const initialMangaData = [
            {
                id: 1,
                title: "Spy x Family",
                image: "./Icons/219741l.jpg",
                type: "Manga",
                volumes: 12,
                chapters: 80,
                rating: 8.9,
                status: "reading",
                readStatus: "reading",
                lastReadChapter: 0,
                lastReadVolume: 0,
                genre: ["Comedy", "Action", "Slice of Life"],
                year: "2019",
                format: "manga",
                publicationStatus: "ongoing"
            }
        ];

        // Add functions to work with localStorage
        function saveReadingData() {
            localStorage.setItem('mangaReadingData', JSON.stringify(allMangaData.map(manga => ({
                id: manga.id,
                readStatus: manga.readStatus,
                lastReadChapter: manga.lastReadChapter || 0,
                lastReadVolume: manga.lastReadVolume || 0
            }))));
        }

        function loadReadingData() {
            const savedData = localStorage.getItem('mangaReadingData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);

                // Update our in-memory data with saved progress
                allMangaData = allMangaData.map(manga => {
                    const savedItem = parsedData.find(item => item.id === manga.id);
                    if (savedItem) {
                        return {
                            ...manga,
                            readStatus: savedItem.readStatus,
                            lastReadChapter: savedItem.lastReadChapter || 0,
                            lastReadVolume: savedItem.lastReadVolume || 0
                        };
                    }
                    return manga;
                });
            }
        }

        // Combined data store that will hold both initial data and data loaded from JSON
        let allMangaData = [...initialMangaData];

        // Current active filter
        let currentFilter = 'all';

        // Function to load additional manga data from external JSON
        async function loadExternalMangaData() {
            try {
                const response = await fetch('mangalightnovel.json');
                if (!response.ok) {
                    throw new Error('Failed to load manga data');
                }
                const jsonData = await response.json();

                const nextId = allMangaData.length + 1;
                const formattedData = jsonData.map((item, index) => ({
                    ...item,
                    id: nextId + index,
                    readStatus: item.readStatus || 'plan',
                    lastReadChapter: item.lastReadChapter || 0,
                    lastReadVolume: item.lastReadVolume || 0
                }));

                allMangaData = [...allMangaData, ...formattedData];

                // Load saved reading data from localStorage to override defaults
                loadReadingData();

                // Display the updated list
                displayMangaList();
            } catch (error) {
                console.error('Error loading manga data:', error);
                showToast('Failed to load additional manga data');
            }
        }

        // Display manga list based on filter
        function displayMangaList() {
            const mangaContent = document.getElementById('manga-content');
            let filteredManga = allMangaData;

            // Filter by reading status if not showing all
            if (currentFilter !== 'all') {
                filteredManga = filteredManga.filter(manga => manga.readStatus === currentFilter);
            }

            // Filter by search if there's text in the search box
            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            if (searchTerm) {
                filteredManga = filteredManga.filter(manga =>
                    manga.title.toLowerCase().includes(searchTerm)
                );
            }

            // Apply genre filter
            const selectedGenre = document.getElementById('genre-filter').value;
            if (selectedGenre !== 'all') {
                filteredManga = filteredManga.filter(manga =>
                    manga.genre.some(g => g.toLowerCase() === selectedGenre.toLowerCase())
                );
            }

            // Apply year filter
            const selectedYear = document.getElementById('year-filter').value;
            if (selectedYear !== 'all') {
                if (selectedYear === 'older') {
                    filteredManga = filteredManga.filter(manga =>
                        parseInt(manga.year) < 2020
                    );
                } else {
                    filteredManga = filteredManga.filter(manga =>
                        manga.year === selectedYear
                    );
                }
            }

            // Apply type filter
            const selectedType = document.getElementById('type-filter').value;
            if (selectedType !== 'all') {
                filteredManga = filteredManga.filter(manga =>
                    manga.format === selectedType
                );
            }

            // Apply publication status filter
            const selectedStatus = document.getElementById('status-filter').value;
            if (selectedStatus !== 'all') {
                filteredManga = filteredManga.filter(manga =>
                    manga.publicationStatus === selectedStatus
                );
            }

            if (filteredManga.length === 0) {
                mangaContent.innerHTML = `
            <div class="no-results">
                <h3>No titles found</h3>
                <p>Try a different search term or filter</p>
            </div>
        `;
                return;
            }

            mangaContent.innerHTML = `
        <div class="manga-grid">
            ${filteredManga.map(manga => `
                <div class="manga-card" data-id="${manga.id}">
                    <div class="manga-image" style="background-image: url('${manga.image}')">
                        <div class="status-indicator ${manga.readStatus}">${getStatusText(manga.readStatus)}</div>
                    </div>
                    <div class="manga-info">
                        <div class="manga-title">${manga.title}</div>
                        <div class="manga-meta">
                            <span>${manga.type} (${manga.volumes ? manga.volumes + ' vol' : manga.chapters + ' ch'})</span>
                            <span class="reading-progress">${manga.lastReadChapter > 0 ? 'Ch.' + manga.lastReadChapter : ''}</span>
                            <span class="rating">★ ${manga.rating}</span>
                        </div>
                        <select class="status-selector" onchange="updateStatus(${manga.id}, this.value)">
                            <option value="reading" ${manga.readStatus === 'reading' ? 'selected' : ''}>Reading</option>
                            <option value="completed" ${manga.readStatus === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="onhold" ${manga.readStatus === 'onhold' ? 'selected' : ''}>On Hold</option>
                            <option value="dropped" ${manga.readStatus === 'dropped' ? 'selected' : ''}>Dropped</option>
                            <option value="plan" ${manga.readStatus === 'plan' ? 'selected' : ''}>Plan to Read</option>
                        </select>
                        ${manga.readStatus === 'reading' || manga.readStatus === 'onhold' ? `
                            <div class="reading-progress-controls">
                                <div class="progress-label">Reading Progress:</div>
                                <div class="progress-inputs">
                                    <div class="volume-input">
                                        <label for="vol-${manga.id}">Vol:</label>
                                        <input type="number" id="vol-${manga.id}" min="0" max="${manga.volumes || 999}" 
                                            value="${manga.lastReadVolume || 0}" 
                                            onchange="updateReadingProgress(${manga.id}, this.value, 'volume')">
                                    </div>
                                    <div class="chapter-input">
                                        <label for="ch-${manga.id}">Ch:</label>
                                        <input type="number" id="ch-${manga.id}" min="0" max="${manga.chapters || 999}" 
                                            value="${manga.lastReadChapter || 0}" 
                                            onchange="updateReadingProgress(${manga.id}, this.value, 'chapter')">
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
        }


        // Function to update reading progress
        function updateReadingProgress(mangaId, value, type) {
            const manga = allMangaData.find(m => m.id === mangaId);
            if (manga) {
                const numValue = parseInt(value);

                if (type === 'chapter') {
                    manga.lastReadChapter = isNaN(numValue) ? 0 : numValue;

                    // If the user sets the last chapter to the max chapter, ask if they want to mark as completed
                    if (manga.chapters && manga.lastReadChapter >= manga.chapters && manga.readStatus !== 'completed') {
                        if (confirm(`You've reached the last chapter of "${manga.title}". Mark as completed?`)) {
                            manga.readStatus = 'completed';
                        }
                    }
                } else if (type === 'volume') {
                    manga.lastReadVolume = isNaN(numValue) ? 0 : numValue;

                    // Similarly for volumes
                    if (manga.volumes && manga.lastReadVolume >= manga.volumes && manga.readStatus !== 'completed') {
                        if (confirm(`You've reached the last volume of "${manga.title}". Mark as completed?`)) {
                            manga.readStatus = 'completed';
                        }
                    }
                }

                // Save to localStorage and update UI
                saveReadingData();
                showToast(`Reading progress updated for "${manga.title}"`);
                displayMangaList();
            }
        }

        // Get display text for status
        function getStatusText(status) {
            switch (status) {
                case 'reading': return 'Reading';
                case 'completed': return 'Completed';
                case 'onhold': return 'On Hold';
                case 'dropped': return 'Dropped';
                case 'plan': return 'Plan to Read';
                default: return 'Unknown';
            }
        }

        // Change active filter
        function changeFilter(filter) {
            currentFilter = filter;
            displayMangaList();
        }

        // Update the status update function to save to localStorage
        function updateStatus(mangaId, newStatus) {
            const manga = allMangaData.find(m => m.id === mangaId);
            if (manga) {
                // If changing from plan to reading, set lastReadChapter to 1 as a convenience
                if (manga.readStatus === 'plan' && newStatus === 'reading' && manga.lastReadChapter === 0) {
                    manga.lastReadChapter = 1;
                }

                // If marking as completed, set lastReadChapter/Volume to max
                if (newStatus === 'completed') {
                    manga.lastReadChapter = manga.chapters || manga.lastReadChapter;
                    manga.lastReadVolume = manga.volumes || manga.lastReadVolume;
                }

                manga.readStatus = newStatus;
                saveReadingData();
                showToast(`"${manga.title}" status updated!`);
                displayMangaList();
            }
        }

        // Add styles for reading progress controls
        const styleElement = document.createElement('style');
        styleElement.textContent = `
    .reading-progress-controls {
        margin-top: 8px;
        padding: 8px;
        background-color: #1f2937;
        border-radius: 4px;
    }
    
    .progress-label {
        font-size: 12px;
        margin-bottom: 4px;
        color: #9ca3af;
    }
    
    .progress-inputs {
        display: flex;
        gap: 10px;
    }
    
    .volume-input, .chapter-input {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .volume-input label, .chapter-input label {
        font-size: 12px;
        color: #e6e6e6;
    }
    
    .volume-input input, .chapter-input input {
        width: 50px;
        padding: 2px 4px;
        background-color: #0a121f;
        border: 1px solid #2a3749;
        border-radius: 3px;
        color: #e6e6e6;
    }
    
    .reading-progress {
        font-size: 11px;
        color: #a78bfa;
    }
`;
        document.head.appendChild(styleElement);

        // Show toast notification
        function showToast(message) {
            const toast = document.getElementById("toast");
            toast.textContent = message;
            toast.classList.add("show");

            setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        }

        // Add event listeners
        document.addEventListener("DOMContentLoaded", function () {
            // Load the initial data
            loadReadingData(); // Load saved progress first
            displayMangaList();

            // Then load additional data from external JSON
            loadExternalMangaData();

            // Set up search functionality
            document.getElementById("search-input").addEventListener("keyup", function () {
                displayMangaList();
            });

            // Filter selectors
            document.getElementById("genre-filter").addEventListener("change", function () {
                displayMangaList();
            });

            document.getElementById("year-filter").addEventListener("change", function () {
                displayMangaList();
            });

            document.getElementById("type-filter").addEventListener("change", function () {
                displayMangaList();
            });

            document.getElementById("status-filter").addEventListener("change", function () {
                displayMangaList();
            });
        });
