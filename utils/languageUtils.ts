/**
 * Determines the language code based on a country name.
 * Defaults to 'en' for unrecognized countries.
 * @param country The full name or abbreviation of the country (case-insensitive).
 * @returns 'en' or 'vi'.
 */
export const getLanguageForCountry = (country: string): 'en' | 'vi' => {
    if (!country) {
        return 'en';
    }
    const lowerCaseCountry = country.toLowerCase().trim();
    
    // List of countries that map to Vietnamese
    const vietnameseCountries = ['vietnam', 'vi', 'vn'];

    if (vietnameseCountries.includes(lowerCaseCountry)) {
        return 'vi';
    }
    
    // Default to English for all other countries
    return 'en';
};
