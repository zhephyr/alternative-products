# ANTIGRAVITY MISSION PLAN

### Headless Logic & Autonomous Architecture Loop

---

### MISSION STATUS

- **Current Phase:** Phase 6
- **Current Task:** Mission Complete
- **Mode:** Autonomous
- **Target:** Google Antigravity Agent

---

### AGENTIC GUARDRAILS

1. **No Configuration Changes:** Do not modify `.env`, `README.md`, `requirements.txt`, or any other non-code files.
2. **Git Persistence:** After each successful phase, execure the `/commit` workflow. This will commit all changes to the repository.
3. **Status Tracking:** After each phase, update the `MISSION STATUS` section to reflect the current phase, current task, and mode.
4. **Autonomouse Transition:** If all successful criteria for a phase are met, immediately proceed to the next phase without any user input.
5. **Turbo Agent Mode:** Execute terminal commands without waiting for user confirmation. Accept all changes without user input.
6. **Phase Looping:** After completing the tasks for a phase, check the success criteria. If any success criteria for a phase are not met, restart the phase and try again.
7. **Design Guidelines:** Follow the document `DESIGN.md`. Refer to this file for after each planning and implementation step to ensure that the application is visually consistent with the design guidelines.

---

## Phase 1:

**Goal:** Create the front-end application structure and install dependencies.

### Tasks:
1. Create a client folder for the front-end application. Place all front-end code in this folder.
2. Create a React Single Page Application (SPA) using Vite, TypeScript, and Tailwind CSS.
3. Create the front-end folder structure.
4. Create .env and .env.example files with the following variables:
    - Serp_API_Key=your_serp_api_key_here
    - VITE_API_URL=http://localhost:3000
4. Install the following dependencies:
    - react-router-dom
    - framer-motion
    - tailwindcss/vite
    - eslint
    - prettier
    - eslint-config-prettie
    - Vitest
5. Setup and configure eslint and prettier for the project. Make sure to use the Standard rules for eslint and prettier in Typescript.
6. Update Vite config to use Tailwind CSS and Framer Motion.
7. Add/Update the .gitignore file for the front-end to include the .env file and any other unnecessary files.
8. Create an empty test suite using Vitest.
9. Setup initial routing using React Router.

### Success Criteria:
1. The web application builds successfully.
2. The web application launches successfully.
3. ESLint and Prettier are configured and run without errors.

---

## Phase 2:

**Goal:** Create the layout for the application.

### Tasks:
1. Create the main page based on my Stich project Visual Product Search SPA (Project ID: 3270885382127867718). The three pages in the project are the *same* page with different color themes so create only one page.
2. Implement the theme switching dropdown in the top right corner of the page, keeping the themes consistent with the design guidelines. Use Tailwind Theme variables ensure there is a single source of truth for the color values. The theme should be cached and reapplied on app load.
3. Implement placeholder functionality for the upload zone. The upload zone should accept a clipboard image or a file upload (Paste, Drag and Drop, URL, or File Upload). When an image is uploaded, the image should be displayed in the upload zone.
4. The results section should be hidden initially and should only be displayed when an image is uploaded. When an image is uploaded, the results section should display a loading state with a spinner. Add a slight timeout and mock placeholder data and images to simulate the results being loaded. Make sure to add data relevent to the main filters (Category, Price, and Rating).
5. Implement the filter dropdowns for the results section. The initially displayed filters should be: Price Range and Product Rating. 
6. Implement the Sort By dropdown for the results section. The Sort By dropdown should have the following options: Most Relevant, Price: Low to High, Price: High to Low, and Product Rating: High to Low.
    
### Success Criteria:
1. The theme switching dropdown correctly changes the theme matching the colors laid out in the DESIGN.md file.
2. When the user uploads an image, the image is displayed in the upload zone and the Similar Matches are displayed.
3. The filters and sort by dropdowns are implemented and working.

---

## Phase 3:

**Goal:** Create the backend API and business logic.

### Tasks:
1. Create a backend folder for the backend application. Place all backend code in this folder.
2. Create a Python virtual environment for the backend application.
3. Install the following dependencies:
    - fastapi
    - uvicorn
    - python-dotenv
    - tinydb
4. Create a .env and .env.example file with the following variables:
    - AI_PROVIDER
    - OPEN_AI_API_KEY
    - ANTHROPIC_API_KEY
5. Add/Update the .gitignore file for the back-end to include the .env file and any other unnecessary files.
6. Prompt and wait for the user to provide the API keys for the AI providers Update the .env file with the provided values.
7. Create a FastAPI application that can be used to serve the backend API.
8. Create an API endpoint that accepts an image and uses an AI agent to search the web to find visually similar products for sale. While searching, the agent should keep a list of the products it has found so far in order of relevance, keeping the order even as new products are added.
9. For each product found, the search agent should pass the result off to a scraping agent to validate if the site is a store actively selling the product and has it in stock. Use a semaphore to limit the number of concurrent scraping requests to 5.
10. If the site is valid, the scraping agent should then scrape the product page to extract product information (GTIN/UPC/EAN, Brand, Model, SKU).
11. The information returned by the scraping agent should be used with the SerpAPI Google Shopping API (https://serpapi.com/search?engine=google_shopping) to get the produce information. Then, that product information should be added to the finalized list of products in the order of relevance.
12. The API endpoint should stream back the finalized list of products even as it updates.
13. Reset the list of similar matches when a new image to search is uploaded.

### Success Criteria:
1. Backend folder is set up, dependencies installed, and .env files correctly configured and ignored by git.
2. The backend API is running and the swagger documentation is accessible.
3. API accepts images and returns a list of products ranked by relevance.
4. Scraping agent validates product availability, extracts key details, and integrates SerpAPI information correctly.
5. API streams updates as products are found and validated.

---

## Phase 4:

**Goal:** Connect the frontend to the backend API and implement the full product search functionality.

### Tasks:
1. Make it so when a user uploads an image, the frontend sends the image to the backend API.
2. Take the streamed response from the backend API and display the products in the results section.
3. Each product should display the product image, brand, product name, price, rating, and a icon link to the product page.
4. Clicking on a product should open a modal with additional product details found under "about_the_product" in the product object.
5. Add code to dynamically create additional filters based on common `about_the_product.features` title values. The values should be grouped by title and the title should be used as the filter label. The values should be used as the filter options.
6. Create a user authentication system that allows users to create an account and log in. The authentication system should use JWT tokens to authenticate users.
7. Create a dropdown for the profile image that allows login/logout and a link to the user profile page.
8. Create a modal for the user profile page. It should have a navigation panel on the left to change between Profile, Usage History, and Settings pages. The Profile page should display the user's name, email, and profile picture. And give them the ability to change their display name and profile picture. The Usage History page should display a list of images that the user has searched for. The Settings page should display a form to update the user's email and password.
9. Add a feature to save the images search history. The searches should be initially cached locally. Then once a user is created, the searches should be cached in the database. This history is accessible from the "Usage History" button. Said button should open the Usage History page of the modal.
10. Add a feature to save/favorite products. The list of favorited products should be accessible from the "Saved Searches" button which should be renamed to "Saved Products".
11. The favorited products should be displayed in a modal that opens when the user clicks on the "Saved Products" button. They should be displayed similarly to the results section. Clicking on a product in this modal should expand the product accordion to show the full product details.
12. Add logging to both the frontend and backend to track any failed requests and errors.

### Success Criteria:
1. The application accepts an image and returns a list of visually similar products.
2. The products are sorted by relevance and changing the sort order correctly changes the order of the products.
3. The user authentication system is implemented and working.
4. The user can login and out.
5. The user profile modal displays the correct user information.
6. The user profile modal allows the user to change their display name, profile picture, email, and password.
7. The Usage History correctly tracks the images that the user has searched for.
8. The favorited products are correctly saved and displayed.
9. The logging system logs any failed requests or errors.

---

## Phase 5:

**Goal:** Create end-to-end tests for the application.

###Tasks:

1. Setup E2E test framework using Playwright or Cypress.
2. Configure test backend with mocked AI and SerpAPI responses.
3. Upload a test image via the frontend and verify the request reaches the backend API.
4. Validate that streamed product responses are displayed in the frontend results section.
5. Verify product cards display image, brand, name, price, rating, and link icon.
6. Verify product modals display complete about_the_product details.
7. Validate Sort By dropdown correctly updates product order.
8. Validate dynamic filters based on about_the_product.features correctly filter results.
9. Create a test user account, log in, log out, and verify authentication workflow.
10. Update user profile information: display name, profile picture, email, and password.
11. Verify Usage History correctly logs uploaded images.
12. Verify Saved Products reflects favorited products and displays correctly.
13. Simulate network failures, AI provider errors, and API rate-limit responses, confirming retry logic works and errors are handled gracefully.

### Success Criteria:

1. Frontend successfully sends image uploads to the backend API.
2. Backend streams product data and frontend displays it correctly.
3. Product cards and modals display all required information correctly.
4. Sort By and dynamic filters function correctly.
5. User authentication and profile updates work correctly.
6. Usage History and Saved Products features function correctly.
7. Network errors, AI provider failures, and API rate-limit scenarios are handled without crashing the application.
8. Retry logic executes correctly for failed requests.
9. All E2E tests complete successfully without uncaught errors.

---

## Phase 6:

**Goal:** Add polish and final touches to the application.

### Tasks:
1. Add a visual feedback for dragging and dropping an image into the upload zone.
2. Add a loading spinner while the image is being processed.
3. Add hover states to the product cards in the "Similar Matches" section.
4. Add fade-in animations when adding new products to the "Similar Matches" section.

### Success Criteria: 
1. Drag-and-drop image upload provides clear visual feedback when hovering over the upload zone.
2. Loading spinner is displayed while an image is being processed and disappears when results are loaded.
3. Hover states on product cards in the "Similar Matches" section are visually distinct and responsive.
4. Fade-in animations trigger correctly when new products are added to the "Similar Matches" section.
5. All animations are smooth and do not interfere with user interactions or cause layout shifts.

---

## COMPLETION SIGNAL

When the last phase's tests pass and the final commit is made, output the following message:

"MISSION COMPLETE"

And wait for the user to provide the next set of instructions.

---

## ERROR HANDLING

If a terminal command hangs, check the lines in the output above where you are looking in case you missed the output of the command. If you did not miss the output, then the command is likely stuck. In this case, you should kill the command and restart the phase.

If a test fails 3 times in a row:
1. Generate a `DEBUG REPORT.md` file.
2. In the `DEBUG REPORT.md` file, describe the error and the steps you took to try and fix it.
3. Attempt one more "Refactor" iteration.
4. If the test fails for a 4th time, stop and report the error to the user and wait for human intervention.

If an API call fails:
1. Re-attempt up to 3 time.
2. Wait an increasing amount of time between attempts (1s, 2s, 4s).
3. If all attempts fail, stop and report the error to the user and wait for human intervention.

If an API returns a rate-limit error (HTTP 429):
1. Pause that specific request for the time indicated in the Retry-After header.
2. Retry after waiting, without affecting other concurrent requests.
3. If multiple requests hit rate limit, queue them and release them sequentially according to allowed requests per second.
4. After 5 rate limit errors on the same request, stop and report the error to the user and wait for human intervention.

If the AI provider returns an error:
1. In case of timeout, retry after 1s. Retry up to 3 times. If its still failing, stop and report the error to the user and wait for human intervention.
2. In case of the quota being exceeded, wait until the quota is reset and retry.
3. In case of any other error, stop and report the error to the user and wait for human intervention.