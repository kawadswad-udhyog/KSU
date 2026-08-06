/**
 * Asynchronously fetches and replaces component placeholders with path awareness for GitHub Pages (/KSU/).
 */
async function loadLayoutComponents() {
    const headerContainer = document.querySelector('header-component, #header-container');
    const footerContainer = document.querySelector('footer-component, #footer-container');

    // Determine the base path dynamically to handle /KSU/ subfolder on GitHub Pages
    const isGitHubPages = window.location.pathname.includes('/KSU/');
    const basePath = isGitHubPages ? '/KSU/' : './';

    const fetchTasks = [];

    if (headerContainer) {
        fetchTasks.push(
            fetch(`${basePath}components/header.html`)
                .then(res => {
                    if (!res.ok) throw new Error(`Header component status: ${res.status}`);
                    return res.text();
                })
                .then(html => {
                    headerContainer.outerHTML = html;
                })
                .catch(err => console.warn('Could not load header component:', err))
        );
    }

    if (footerContainer) {
        fetchTasks.push(
            fetch(`${basePath}components/footer.html`)
                .then(res => {
                    if (!res.ok) throw new Error(`Footer component status: ${res.status}`);
                    return res.text();
                })
                .then(html => {
                    footerContainer.outerHTML = html;
                })
                .catch(err => console.warn('Could not load footer component:', err))
        );
    }

    await Promise.all(fetchTasks);
}
