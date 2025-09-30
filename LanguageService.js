// Updated LanguageService.js to fix circular dependency

// Removed top-level DataService import

export function getLanguage() {
    // Using dynamic import to load DataService when needed
    return import('./DataService').then(DataService => {
        // Your existing logic here, using DataService
    }).catch(error => {
        console.error('Error loading DataService:', error);
    });
}