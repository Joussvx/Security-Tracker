# Security Tracker

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</p>

A comprehensive web application for managing security guard operations, including scheduling, attendance tracking, and reporting. Built with a modern tech stack for a fast, reliable, and user-friendly experience.

## ✨ Features

-   **Dashboard:** Get a real-time overview of daily attendance, including present, absent, and scheduled guards.
-   **Interactive Schedule Planner:** Easily create and manage guard schedules with a drag-and-drop calendar interface.
-   **Guard Management:** Add, edit, and delete guard profiles, including their default shifts and employee information.
-   **Comprehensive Reporting:** Generate detailed reports on attendance summaries and overtime, with options to filter by date range and export to CSV.
-   **User Roles:** Two levels of access: `admin` for full control and `viewer` for read-only access.
-   **Multi-language Support:** The interface is available in English, Lao, Thai, Russian, Chinese, and Japanese.
-   **Theming:** Switch between light and dark modes to suit your preference.
-   **Real-time Updates:** Changes are reflected across all users in real-time, powered by Supabase subscriptions.

## 🛠️ Tech Stack

-   **Frontend:** [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
-   **Backend:** [Supabase](https://supabase.io/) (Database, Auth, Realtime)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Linting:** [ESLint](https://eslint.org/)
-   **Formatting:** [Prettier](https://prettier.io/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18 or higher)
-   `npm` (usually comes with Node.js)
-   A [Supabase](https://supabase.io/) account and project.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/security-tracker.git
    cd security-tracker
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up your Supabase environment:**
    -   Create a new project on [Supabase](https://app.supabase.io).
    -   In your Supabase project, go to the **SQL Editor** and run the contents of `supabase/schema.sql` to create the necessary tables and policies.
    -   (Optional) Run the contents of `supabase/seed.sql` to seed your database with initial shift data.

4.  **Configure environment variables:**
    -   Create a `.env.local` file in the root of the project.
    -   Find your project's **URL** and **anon key** in your Supabase project settings (API section).
    -   Add them to your `.env.local` file:
        ```
        VITE_SUPABASE_URL=your-supabase-project-url
        VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
        ```

5.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application should now be running on `http://localhost:5173` (or another port if 5173 is in use).

## 📜 Available Scripts

This project comes with several scripts to help with development:

-   `npm run dev`: Starts the development server with hot-reloading.
-   `npm run build`: Builds the application for production.
-   `npm run preview`: Serves the production build locally for previewing.
-   `npm run lint`: Lints the codebase for errors and warnings.
-   `npm run format`: Formats the code using Prettier.
-   `npm run typecheck`: Runs the TypeScript compiler to check for type errors.

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
