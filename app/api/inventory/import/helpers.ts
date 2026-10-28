// Magic: The Gathering language name to ISO code mapping
const languageMapping: Record<string, string> = {
    "English": "en",
    "Chinese Simplified": "zhs",
    "Chinese Traditional": "zht",
    "French": "fr",
    "German": "de",
    "Italian": "it",
    "Japanese": "ja",
    "Korean": "ko",
    "Portuguese (Brazil)": "pt",
    "Russian": "ru",
    "Spanish": "es",
    "Ancient Greek": "grc",
    "Arabic": "ar",
    "Hebrew": "he",
    "Latin": "la",
    "Phyrexian": "ph",
    "Sanskrit": "sa",
    // Default to English if no mapping is found
    "Unknown": "en"
};

// Function to convert MTG language name to ISO code
export function convertLanguageToISO(languageName: string): string {
    // Handle undefined or empty strings
    if (!languageName || languageName.trim() === '') {
        return 'en'; // Default to English
    }
    
    // Try to find exact match
    const isoCode = languageMapping[languageName.trim()];
    if (isoCode) {
        return isoCode;
    }
    
    // Try case-insensitive match
    const languageKey = Object.keys(languageMapping).find(
        key => key.toLowerCase() === languageName.trim().toLowerCase()
    );
    if (languageKey) {
        return languageMapping[languageKey];
    }
    
    // Return English as fallback
    console.warn(`Language "${languageName}" not found in mapping, using English as fallback.`);
    return 'en';
}