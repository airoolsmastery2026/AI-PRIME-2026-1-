

export const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

export const saveToStorage = <T>(key: string, value: T): void => {
    try {
        const item = JSON.stringify(value);
        window.localStorage.setItem(key, item);
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};