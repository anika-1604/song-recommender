/**
 * Fetches and parses the song database from songs.json
 * This function loads all mood-categorized songs from the static JSON file
 * 
 * @returns {Promise<Object>} A promise that resolves to the song database object
 *                            containing mood categories as keys and song arrays as values
 * @throws {Error} If the fetch fails or JSON parsing fails
 */
async function getAllSongs() {
  try {
    // Fetch the songs.json file using the Fetch API
    const response = await fetch('songs.json');
    
    // Check if the response was successful (status 200-299)
    if (!response.ok) {
      throw new Error(`Failed to load songs: ${response.status} ${response.statusText}`);
    }
    
    // Parse the JSON response into a JavaScript object
    // The object structure: { mood: [song1, song2, ...], ... }
    const songDatabase = await response.json();
    
    // Return the parsed song database
    return songDatabase;
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error loading song database:', error);
    
    // Re-throw the error so calling code can handle it appropriately
    throw error;
  }
}

/**
 * Retrieves one random song from the specified mood category
 * This function implements the recommendation engine's core selection logic
 * 
 * @param {string} mood - The mood category to select from (happy, sad, nostalgic, or energetic)
 * @returns {Promise<string>} A promise that resolves to a randomly selected song string
 *                            in the format "Song Title – Artist Name"
 * @throws {Error} If the mood parameter is invalid or the mood category doesn't exist
 */
async function getSongByMood(mood) {
  try {
    // Load the complete song database from songs.json
    const songDatabase = await getAllSongs();
    
    // Validate that the requested mood exists in the database
    // This handles the case where an invalid mood parameter is provided
    if (!songDatabase.hasOwnProperty(mood)) {
      throw new Error(`Invalid mood category: "${mood}". Valid moods are: happy, sad, nostalgic, energetic`);
    }
    
    // Get the array of songs for the specified mood category
    const songsInCategory = songDatabase[mood];
    
    // Validate that the mood category contains songs
    if (!songsInCategory || songsInCategory.length === 0) {
      throw new Error(`No songs available for mood: "${mood}"`);
    }
    
    // Implement random selection algorithm using Math.random()
    // Math.random() returns a value between 0 (inclusive) and 1 (exclusive)
    // Multiply by array length and floor to get a valid array index
    const randomIndex = Math.floor(Math.random() * songsInCategory.length);
    
    // Select and return the song at the random index
    const selectedSong = songsInCategory[randomIndex];
    
    return selectedSong;
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error getting song by mood:', error);
    
    // Re-throw the error for graceful handling by calling code
    throw error;
  }
}
/**
 * Displays a song recommendation in the result container with a fade-in animation
 * This function updates the DOM to show the recommended song to the user
 * 
 * @param {string} song - The song to display in format "Song Title – Artist Name"
 */
function displayRecommendation(song) {
  // Get the result container element from the DOM
  const resultContainer = document.querySelector('.result-container');
  
  // Remove any existing fade-in animation class to reset the animation
  // This ensures the animation plays even if displaying multiple recommendations
  resultContainer.classList.remove('fade-in');
  
  // Update the text content of the result container with the song
  // The song is already formatted as "Song Title – Artist Name" from the database
  resultContainer.textContent = song;
  
  // Force a reflow to ensure the class removal takes effect before re-adding
  // This is necessary for the animation to restart properly
  void resultContainer.offsetWidth;
  
  // Apply the fade-in animation class to trigger the CSS animation
  resultContainer.classList.add('fade-in');
}

/**
 * Initializes the application by setting up event listeners and UI interactions
 * This function is called when the DOM is fully loaded and ready
 * It establishes the connection between user actions and application logic
 */
function initializeApp() {
  // Get references to the DOM elements we need to interact with
  const recommendButton = document.getElementById('recommend-button');
  const moodDropdown = document.getElementById('mood-dropdown');
  const resultContainer = document.querySelector('.result-container');
  
  // Set up click event listener for the recommend button
  // This is the main user interaction that triggers the recommendation flow
  recommendButton.addEventListener('click', async () => {
    // Read the currently selected mood value from the dropdown
    const selectedMood = moodDropdown.value;
    
    // Handle the case when no mood is selected (empty string value)
    // Requirements 1.4 specifies preventing recommendation requests without mood selection
    if (!selectedMood) {
      resultContainer.textContent = 'Please select a mood first!';
      resultContainer.classList.remove('fade-in');
      return;
    }
    
    try {
      // Call the recommendation engine with the selected mood
      // This retrieves one random song from the chosen mood category
      const recommendedSong = await getSongByMood(selectedMood);
      
      // Display the recommendation to the user with animation
      displayRecommendation(recommendedSong);
    } catch (error) {
      // Handle errors gracefully by displaying a user-friendly message
      // This covers cases like network errors, invalid moods, or empty categories
      console.error('Failed to get recommendation:', error);
      resultContainer.textContent = 'Sorry, something went wrong. Please try again.';
      resultContainer.classList.remove('fade-in');
    }
  });
}

// Wait for the DOM to be fully loaded before initializing the application
// This ensures all HTML elements are available before we try to access them
// Requirements 1.1 and 2.1 specify that the UI must be properly loaded
document.addEventListener('DOMContentLoaded', initializeApp);
