
/**
 * A generator function that yields each date string ('YYYY-MM-DD') within a given range.
 * This is memory-efficient as it doesn't create a large array of dates.
 * It also safely handles date objects to avoid timezone-related issues.
 * @param startDate The start date in 'YYYY-MM-DD' format.
 * @param endDate The end date in 'YYYY-MM-DD' format.
 */
export function* iterateDateRange(startDate: string, endDate: string) {
    if (!startDate || !endDate) return;

    // Use a copy of the start date for iteration to avoid mutation.
    const currentDate = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');

    while(currentDate <= end) {
        yield currentDate.toISOString().split('T')[0];
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

/**
 * Formats a date string from 'YYYY-MM-DD' to 'DD/MM/YYYY'.
 * @param dateString The date string in 'YYYY-MM-DD' format.
 * @returns The formatted date string 'DD/MM/YYYY' or the original string if the format is invalid.
 */
export const formatDate = (dateString: string): string => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString; // Return original if format is not YYYY-MM-DD
    }
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};
