# Mojo - Hostel Management System

![Mojo Banner](https://github.com/bornebyte/mojo/blob/main/public/hostel_logo.png?raw=true)

Mojo is a comprehensive, modern hostel management system designed for educational institutions and residential facilities. It provides role-based dashboards for administrators, wardens, students, and canteen managers to streamline hostel operations, attendance tracking, menu management, and complaint resolution.

## ✨ Features

### 🔐 Role-Based Access Control
- **Admin Dashboard**: Complete system oversight with analytics, member management, and building administration
- **Warden Dashboard**: Building and floor management with student attendance tracking and complaint handling
- **Student Dashboard**: Personal attendance tracking, menu viewing, food ratings, feedback submission, and complaint filing
- **Canteen Manager Dashboard**: Menu planning, announcements, and feedback management

### 📊 Admin Features
- Real-time analytics with interactive charts and statistics
- Member management (add/edit students, wardens, canteen staff)
- Building and floor management with capacity tracking
- Complaint management system with filtering and response capabilities
- Comprehensive dashboard with key metrics and recent activities

### 👨‍💼 Warden Features
- Attendance marking system with floor-wise student views
- Detailed analytics with building-wise statistics
- Student management for assigned buildings and floors
- Complaint response and tracking
- Announcement creation and management

### 🎓 Student Features
- Personal attendance history and statistics with visual charts
- Monthly attendance calendar view
- Food menu viewing with daily meal schedules
- Food rating and feedback submission system
- Complaint filing system with multiple categories and priority levels
- Real-time complaint status tracking
- Hostel announcements and updates

### 🍽️ Canteen Manager Features
- Menu creation with meal type categorization (breakfast, lunch, snacks, dinner)
- Template-based menu planning with quick load options
- Menu preview and calendar-based scheduling
- Student feedback viewing and analysis
- Announcement management for meal updates

### 🎯 System-Wide Features
- Complaint management system with 10+ categories (maintenance, food quality, cleanliness, etc.)
- Priority-based complaint routing (low, medium, high, urgent)
- Status tracking (pending, in-progress, resolved, rejected)
- Dark mode support throughout the application
- Responsive design for mobile, tablet, and desktop
- Animated login page with particle effects
- Modern UI with gradient effects and smooth transitions

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (with App Router and Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

### Backend
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via Neon)
- **ORM**: SQL queries with type safety
- **Authentication**: JWT (JSON Web Tokens)
- **Server Actions**: Next.js Server Actions for data mutations
- **Middleware**: Custom authentication middleware

### Development Tools
- **Linting**: ESLint with TypeScript support
- **Code Quality**: TypeScript strict mode
- **Package Manager**: npm/pnpm/yarn

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

## 🎯 Key Functionalities

### Attendance Management
- Real-time attendance marking with instant feedback
- Historical attendance tracking with visual charts
- Monthly calendar view for students
- Building and floor-wise attendance analytics
- Automatic attendance percentage calculation

### Menu Management
- Daily menu creation for all meal types
- Template-based menu planning for quick setup
- Calendar-based menu scheduling
- Menu preview before publishing
- Meal type categorization (breakfast, lunch, snacks, dinner)

### Complaint System
- **10 Complaint Categories**: Maintenance, Food Quality, Cleanliness, Noise, Internet/WiFi, Electricity, Water Supply, Security, Roommate Issues, Other
- **4 Priority Levels**: Low, Medium, High, Urgent
- **Status Tracking**: Pending, In Progress, Resolved, Rejected
- Student complaint submission with detailed descriptions
- Admin/Warden response system with status updates
- Complaint history and filtering

### Analytics & Reporting
- Real-time dashboard statistics
- Interactive charts with Recharts
- Building-wise and floor-wise analytics
- Attendance trends and patterns
- Food rating analytics
- Complaint resolution tracking

### User Management
- Role-based access control (Admin, Warden, Student, Canteen Manager)
- Secure JWT-based authentication
- Member addition with role assignment
- Building and floor assignment for wardens
- Profile management

## 🔒 Authentication & Security

- JWT-based authentication with HTTP-only cookies
- Protected routes with middleware
- Role-based authorization
- Secure password handling
- Session management

## 🎨 UI/UX Features

- Modern, clean interface with gradient effects
- Dark mode support with system preference detection
- Smooth animations and transitions
- Responsive design for all devices
- Accessible components (ARIA compliant)
- Toast notifications for user feedback
- Loading states and error handling
- Skeleton loaders for better UX

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured dashboard with sidebar navigation
- **Tablet**: Adaptive layout with collapsible sidebar
- **Mobile**: Touch-optimized mobile menu and card layouts

## 🗄️ Database Schema

The system uses PostgreSQL with the following main tables:
- `users` - User authentication and profile data
- `students` - Student information and building assignments
- `wardens` - Warden assignments and building/floor mapping
- `buildings` - Building information and capacity
- `attendance` - Daily attendance records
- `menus` - Daily meal menus
- `food_ratings` - Student food ratings and feedback
- `feedback` - General feedback submissions
- `complaints` - Complaint tracking and management
- `announcements` - System announcements

## 🚦 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Type Checking
npx tsc --noEmit     # Check TypeScript types
```

## 📁 Project Structure

```
mojo/
├── app/
│   ├── dashboard/              # Protected dashboard routes
│   │   ├── admin/              # Admin role pages
│   │   │   ├── add-member/     # Add students, wardens, canteen staff
│   │   │   ├── manage-buildings/ # Building and floor management
│   │   │   ├── manage-members/ # Edit/delete members
│   │   │   ├── complaints/     # Admin complaint management
│   │   │   └── page.tsx        # Admin dashboard with analytics
│   │   ├── warden/             # Warden role pages
│   │   │   ├── attendance/     # Attendance marking system
│   │   │   ├── analytics/      # Building-wise analytics
│   │   │   ├── students/       # Student management
│   │   │   ├── complaints/     # Complaint response page
│   │   │   ├── announcements/  # Announcement creation
│   │   │   └── page.tsx        # Warden dashboard
│   │   ├── student/            # Student role pages
│   │   │   ├── complaints/     # Complaint filing and tracking
│   │   │   ├── actions.ts      # Student server actions
│   │   │   └── page.tsx        # Student dashboard with analytics
│   │   └── canteen-manager/    # Canteen manager pages
│   │       ├── add-menu/       # Menu creation with templates
│   │       ├── view-menu/      # Menu viewing and management
│   │       ├── feedback/       # Student feedback view
│   │       ├── announcements/  # Announcement management
│   │       └── page.tsx        # Canteen manager dashboard
│   ├── login/                  # Authentication pages
│   │   ├── form.tsx            # Login form component
│   │   ├── action.ts           # Login server action
│   │   └── page.tsx            # Login page with animations
│   ├── about/                  # About page
│   ├── context/                # React context providers
│   │   └── UserContext.tsx     # User authentication context
│   ├── page.tsx                # Landing page
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   ├── actions.ts              # Shared server actions
│   └── functions.ts            # Utility functions
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── app-sidebar.tsx         # Role-based navigation sidebar
│   ├── NavMenuComponent.tsx    # Header navigation
│   ├── theme-provider.tsx      # Dark mode provider
│   └── theme-toggle.tsx        # Theme switcher
├── lib/
│   ├── db.ts                   # Database connection
│   ├── types.ts                # TypeScript types and interfaces
│   └── utils.ts                # Utility functions
├── public/                     # Static assets
├── hooks/                      # Custom React hooks
│   └── use-mobile.ts           # Mobile detection hook
├── .env.local                  # Environment variables (not in repo)
├── env                         # Environment template
├── middleware.ts               # Authentication middleware
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── components.json             # shadcn/ui configuration
├── package.json                # Dependencies and scripts
├── CONTRIBUTING.md             # Contribution guidelines
├── LICENSE                     # MIT License
└── README.md                   # This file
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Guidelines

1. Follow the existing code style and conventions
2. Write meaningful commit messages
3. Test your changes thoroughly
4. Update documentation as needed
5. Ensure ESLint passes without errors

## 🐛 Bug Reports & Feature Requests

If you encounter any bugs or have feature requests, please:
1. Check if the issue already exists
2. Create a detailed issue with reproduction steps
3. Include screenshots or error messages if applicable

## 📝 Roadmap

- [ ] Email notifications for complaints and announcements
- [ ] Export attendance reports to PDF/Excel
- [ ] Mobile app for iOS and Android
- [ ] Multi-language support
- [ ] SMS notifications for important updates
- [ ] Advanced analytics with predictive insights
- [ ] Integration with student ID cards (RFID)
- [ ] Mess bill management
- [ ] Room allocation system
- [ ] Visitor management

## 👨‍💻 Author

**Shubham** - [@bornebyte](https://github.com/bornebyte)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Vercel](https://vercel.com/) for deployment platform
- [Neon](https://neon.tech/) for serverless PostgreSQL
- All contributors who help improve this project

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For questions or support, please open an issue on GitHub or contact the maintainer.

---

**Built with ❤️ using Next.js 15 and TypeScript**

*Star ⭐ this repository if you find it helpful!*