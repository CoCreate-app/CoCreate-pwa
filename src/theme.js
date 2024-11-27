function applyThemeAttributes() {
	// Detect the current theme (light or dark)
	const isDarkMode = window.matchMedia(
		"(prefers-color-scheme: dark)"
	).matches;

	// Select all elements with light or dark attributes
	const elements = document.querySelectorAll("[light], [dark]");

	elements.forEach((element) => {
		// Determine the attribute to use based on the theme
		const themeAttr = isDarkMode ? "dark" : "light";
		const themeValue = element.getAttribute(themeAttr);

		// Determine the current value of the attribute to update
		let attributeToUpdate;
		if (element.tagName === "LINK" && element.rel === "manifest") {
			attributeToUpdate = "href";
		} else if (
			element.tagName === "META" &&
			element.name === "theme-color"
		) {
			attributeToUpdate = "content";
		}

		if (attributeToUpdate && themeValue) {
			const currentValue = element.getAttribute(attributeToUpdate);

			// Update only if the current value does not match the new value
			if (currentValue !== themeValue) {
				if (element.tagName === "LINK" && element.rel === "manifest") {
					// Handle manifest link replacement
					const newElement = element.cloneNode(); // Clone the element
					newElement.setAttribute(attributeToUpdate, themeValue); // Update href

					// Replace the old link with the new one to force fetch
					element.parentNode.replaceChild(newElement, element);
					console.log(`Manifest updated: ${themeValue}`);
				} else {
					// For other elements like meta, update the attribute directly
					element.setAttribute(attributeToUpdate, themeValue);
					if (element.tagName === "META") {
						console.log(`Theme color updated: ${themeValue}`);
					}
				}
			}
		}
	});
}

// Apply theme attributes on page load
applyThemeAttributes();

// Listen for changes in the user's theme preference
window
	.matchMedia("(prefers-color-scheme: dark)")
	.addEventListener("change", applyThemeAttributes);
