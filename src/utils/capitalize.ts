/**
 * Make only the first letter capitalized
 * @param text - The text to capitalize
 * @returns
 */
export const capitalize = (text: string) => {
	const low = text.toLowerCase();
	return low.charAt(0).toUpperCase() + low.slice(1);
};
