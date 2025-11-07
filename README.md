# Mojo - Student Attendance Management System

![Mojo Banner](https://github.com/bornebyte/mojo/blob/main/public/hostel_logo.png?raw=true)

Mojo is a modern, web-based student attendance management system designed for educational institutions and residential facilities. It provides an intuitive interface for wardens or administrators to easily track and manage student attendance.

## ✨ Features

- **Warden Dashboard**: A central hub for wardens to manage their assigned building and floors.
- **Real-time Attendance Marking**: Wardens can view a list of students and mark them as present with a single click.
- **Instant Feedback**: The interface provides immediate success or error notifications for attendance marking actions.
- **Student Roster**: Automatically fetches and displays students based on the warden's building and floor assignments.
- **Responsive Design**: Built with modern web technologies for a seamless experience on any device.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Authentication**: JWT (JSON Web Tokens)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18.x or later recommended)
- [pnpm](https://pnpm.io/), `npm`, or `yarn`

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/bornebyte/mojo.git
    cd mojo
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    # or
    # npm install
    # or
    # yarn install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of your project and add the necessary environment variables. You can use `env` as a template.

    ```bash
    cp env .env.local
    ```

    Now, fill in the values in `.env.local`:
    ```env
    DATABASE_URL="your_database_connection_string"
    JWT_SECRET="your_super_secret_jwt_key"
    ```

4.  **Run the development server:**
    ```bash
    pnpm dev
    # or
    # npm run dev
    # or
    # yarn dev
    ```

    Open http://localhost:3000 with your browser to see the result.

## 📁 Project Structure

The project follows the standard Next.js App Router structure.

```
mojo/
├── app/
│   ├── dashboard/          # Protected dashboard routes
│   │   └── warden/
│   │       └── attendance/ # Warden's attendance feature
│   │           ├── actions.ts
│   │           ├── page.tsx
│   │           └── showStudents.tsx
│   ├── (auth)/             # Authentication pages (login, signup)
│   └── layout.tsx
├── components/
│   └── ui/                 # Reusable UI components (from shadcn/ui)
├── lib/
│   ├── types.ts            # TypeScript types and interfaces
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
├── .env.example            # Example environment variables
├── .gitignore
├── next.config.mjs
├── package.json
└── README.md
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*This README was generated with love by Gemini Code Assist.*