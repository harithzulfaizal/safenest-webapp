# Financial Dashboard Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Accordion.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Form.jsx
│   │   └── Table.jsx
│   │
│   ├── layout/
│   │   ├── Navigation.jsx
│   │   └── PageLayout.jsx
│   │
│   └── features/
│       ├── DetailItem.jsx
│       │
│       ├── profile/
│       │   ├── PersonalDetails.jsx
│       │   ├── FinancialGoals.jsx
│       │   ├── FinancialKnowledge.jsx
│       │   └── FinancialProfile.jsx
│       │
│       ├── insights/
│       │   └── InsightsList.jsx
│       │
│       └── transactions/
│           └── TransactionList.jsx
│
├── pages/
│   ├── LoginPage.jsx
│   ├── ProfilePage.jsx
│   ├── InsightsPage.jsx
│   └── TransactionsPage.jsx
│
├── context/
│   ├── AuthContext.jsx
│   └── UserContext.jsx
│
├── data/
│   └── mockData.js
│
├── utils/
│   └── formatters.js
│
├── styles/
│   └── globals.css
│
├── App.jsx
└── index.jsx
```

## Key File Purposes

### Entry Points
- `index.jsx`: The application entry point that sets up context providers
- `App.jsx`: Main component that handles routing between pages

### Context
- `AuthContext.jsx`: Manages authentication state
- `UserContext.jsx`: Provides user data to components

### Pages
- `LoginPage.jsx`: Handles user authentication
- `ProfilePage.jsx`: Shows user profile and financial information
- `InsightsPage.jsx`: Displays financial insights and recommendations
- `TransactionsPage.jsx`: Lists and filters financial transactions

### Components
- **UI Components**: Reusable base components like Button, Card, etc.
- **Layout Components**: Structure components like Navigation and PageLayout
- **Feature Components**: Domain-specific components organized by feature

### Data & Utilities
- `mockData.js`: Contains dummy data for the application
- `formatters.js`: Helper functions for formatting data

# Financial Dashboard

This document provides instructions on how to set up the Financial Dashboard project locally on your machine.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

* **Node.js and npm:** You can download them from <https://nodejs.org/>. Create React App requires Node.js version 14.0.0 or higher.

### Installation

Follow these steps to set up your development environment:

1.  **Clone the repository (or create a new project):**

    If you are cloning an existing repository:
    ```bash
    git clone <repository-url>
    cd financial-dashboard
    ```
    Alternatively, if starting from scratch with Create React App:
    ```bash
    npx create-react-app financial-dashboard
    cd financial-dashboard
    ```

2.  **Install Project Dependencies:**

    Install the necessary npm packages, including React and specific libraries like `lucide-react` for icons.
    ```bash
    npm install lucide-react
    ```
    *(Note: Add any other core dependencies required by the project here)*

3.  **Install Development Dependencies (Tailwind CSS):**

    Install Tailwind CSS and its peer dependencies (`postcss`, `autoprefixer`) as development dependencies.
    ```bash
    npm install -D @tailwindcss/postcss postcss@^8.4.31 autoprefixer@^10.4.16 tailwindcss@^3.3.5
    ```

4.  **Initialize Tailwind CSS:**

    Generate the Tailwind configuration files (`tailwind.config.js` and `postcss.config.js`).
    ```bash
    npx tailwindcss init -p
    ```

5.  **Configure Tailwind Templates:**

    Update `tailwind.config.js` to include the paths to all your template files:
    ```javascript
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: [
        "./src/**/*.{js,jsx,ts,tsx}", // Adjust paths based on your project structure
      ],
      theme: {
        extend: {},
      },
      plugins: [],
      darkMode: 'class', // Or 'media' based on preference
    }
    ```

6.  **Configure PostCSS:**

    Ensure your `postcss.config.js` includes Tailwind CSS and Autoprefixer. The `init` command usually sets this up correctly, but verify it looks like this:
    ```javascript
    module.exports = {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    }
    ```
    *(Note: The user-provided config used `@tailwindcss/postcss`. The standard setup uses `tailwindcss: {}`)*

7.  **Run the Development Server:**

    Start the React development server:
    ```bash
    npm start
    ```
    This will typically open the application in your default web browser at `http://localhost:3000`.

https://github.com/harithzulfaizal/safenest-webapp/blob/main/assets/Screen%20Recording%202025-04-09%20at%2011.47.13%E2%80%AFPM.mov
