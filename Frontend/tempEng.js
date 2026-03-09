class TemplateEngine {
    constructor(){
        this.varRegex = /{{(.*?)}}/g;  //Matches simple variables like {{name}}
        this.conRegex = /{{#if\s+(.*?)}}([\s\S]*?){{else}}([\s\S]*?){{\/if}}/g  //Matches if-else blocks like {{#if loggedIn}}...{{else}}
        this.ifRegex = /{{#if(.*?)}}([\s\S]*?){{\/if}}/g; //handles only if blocks
        this.loopRegex = /{{#each(.*?)}}([\s\S]*?){{\/each}}/g;  //Matches loops 
    }

    // Function for filling in a snippet for iterative statements
    fillSnippetWithData(tempFrag, data){
        return tempFrag.replace(this.varRegex, (match, dataKey) => {
            const key = dataKey.trim();
            // If the value is string, return string, otherwise find key in object
            const value = typeof data === 'object' ? data[key] : data;
            return value !== undefined ? value: match;
        });
    }

    render(rawHtml, data){
        let newHtml = rawHtml;

        // Process loops
        newHtml = newHtml.replace(this.loopRegex, (match, arrayName, tempFrag) => {
            const itemsArray = data[arrayName.trim()];
            if (!Array.isArray(itemsArray)) {return ''}
            return itemsArray.map(singleItem => {
                return this.fillSnippetWithData(tempFrag, singleItem);
            }).join('');
        });

        // Process if else blocks
        newHtml = newHtml.replace(this.conRegex, (match, condition, ifTrue, elseTrue) => {
            const condtionTrim = condition.trim();

            // If the 'if' condition is true, return if block, otherwise return else block
            return data[condtionTrim] ? ifTrue.trim() : elseTrue.trim();
        });

        // Handle only if statements
        newHtml = newHtml.replace(this.ifRegex, (match, condition, ifTrue) => {
            const conditionTrim = condition.trim();

            // if True, return the if block, otherwise, empty string
            return data[conditionTrim] ? ifTrue.trim() : '';
        });

        // Handle simple variable replacements at the end
        newHtml = this.fillSnippetWithData(newHtml, data);

        newHtml = newHtml.replace(this.varRegex, '');
        return newHtml
    }
}

const engine = new TemplateEngine(); //assign object to class


// A general load page function that checks for page id and load page accordingly
async function loadPage(pageKey){
    try {
        // 1. Fetching the api, and the templates file
        const response = await fetch('/api');
        const data = await response.json();
        
        const tempRes = await fetch('templates.html');
        const tempText = await tempRes.text();

        // 2. Detects if its a home page 
        const isHome = (pageKey === 'Home')
        const isArticle = (pageKey === 'page2_Citizens' || pageKey === 'page3_Global' || pageKey === 'page4_Future')

        // 3. Preparing the object which will store the new injected data
        // We'll include a page class so we can use it for styling in css later for specific pages
        const context = {
            ...data.pages[pageKey],
            siteTitle: data.siteTitle,
            isArticle: isArticle,
            isHome: isHome,
            pageClass: isHome? 'home-layout' : 'article-layout'
        };

        // 4. starting the rendering process
        // We'll look for the generic id, that will exist on every page
        const container = document.getElementById('content-root');
        if (container) {
            container.innerHTML = engine.render(tempText, context);

            // Setting up mobile menu
            setupMobileMenu();
        }
    }
    catch (error){
        console.error("Error loading the page", pageKey, error);
    }
}
// Mobile menu with event listeners
function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (menuBtn && navMenu) {
        // If menu or menu clicked
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

}