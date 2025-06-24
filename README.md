# Care Management Application

A comprehensive client management system for care providers with assessment modules, resource management, and scheduling capabilities.

## Features

### 🏠 Dashboard
- Welcome screen with quick actions and statistics
- Direct access to Open Tasks, Today's Appointments, and Email
- Overview of active clients, pending tasks, and recent assessments

### 👥 Client Management
- Add, edit, and manage client information
- Client profiles with contact details and care history
- Access code generation for client portal access

### 📋 Assessment Module
- Comprehensive client assessments with multiple sections:
  - Basic Information
  - Medical History
  - Functional Assessment
  - Cognitive Assessment (including SLUMS)
  - Mental Health Assessment
  - Home Safety Evaluation
  - Advance Directives
  - Psychosocial Assessment
  - Hobbies and Interests
  - Care Providers and Services
- Auto-save draft functionality
- Progress tracking with completion percentages
- Print and export capabilities

### 📅 Calendar Module *(Coming Soon)*
- Appointment scheduling
- Staff coordination
- Multiple calendar views (daily, weekly, monthly)

### ✅ Task Tracker *(Coming Soon)*
- Task creation and assignment
- Due date tracking and notifications
- Priority management
- Progress monitoring

### 📚 Resource Management
- ECC Resource directory
- Resource search and filtering
- CSV import/export functionality
- Service type management

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore (Firebase)
- **Backend**: Express.js with TypeScript
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React

## Project Structure

```
client/src/
├── App.tsx                      # Main application routing
├── main.tsx                     # Application entry point
├── components/                  # Shared components
│   ├── common/                  # Reusable UI components
│   ├── Layout.tsx              # Main layout with navigation
│   ├── Login.tsx               # Authentication
│   └── ...                     # Other shared components
├── contexts/                    # Global state management
│   └── AuthContext.tsx         # Authentication context
├── lib/                        # Utility libraries
│   ├── firebase.ts             # Firebase configuration
│   ├── firestoreService.ts     # Database operations
│   └── ...                     # Other utilities
├── types/                      # TypeScript type definitions
└── Modules/                    # Feature modules
    ├── DashboardModule/        # Main dashboard
    ├── AssessmentModule/       # Client assessments
    ├── CalendarModule/         # Appointment scheduling
    ├── TaskTrackerModule/      # Task management
    └── ECCResource/            # Resource management
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/care-management-app.git
cd care-management-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Firebase Setup

1. Create a new Firebase project
2. Enable Firestore Database
3. Enable Authentication with Email/Password
4. Configure security rules for your collections
5. Add your web app configuration to the environment variables

## Usage

### User Roles

- **Admin**: Full access to all features including user management
- **Staff**: Access to client management, assessments, and resources
- **Client**: Limited access to personal portal (in development)

### Key Workflows

1. **Client Onboarding**: Add client → Generate access code → Create assessment
2. **Assessment Process**: Create assessment → Complete sections → Auto-save drafts → Finalize
3. **Resource Management**: Search resources → Add/edit entries → Export data

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Organization

- **Modular Architecture**: Each feature is organized as an independent module
- **Shared Components**: Common UI elements in `/components/common/`
- **Type Safety**: Comprehensive TypeScript coverage
- **Context Pattern**: Global state management with React Context

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Architecture Decisions

- **Module-based Structure**: Each major feature is self-contained
- **Firebase Integration**: Leveraging Firestore for real-time data sync
- **TypeScript First**: Full type safety across the application
- **Component Composition**: Reusable UI components with consistent styling
- **Auto-save Functionality**: Draft management for long-form assessments

## Future Roadmap

- [ ] Complete Calendar module with appointment scheduling
- [ ] Implement Task Tracker with notification system
- [ ] Add reporting and analytics dashboard
- [ ] Mobile-responsive design improvements
- [ ] PDF export functionality for assessments
- [ ] Advanced search and filtering capabilities
- [ ] Integration with external care management systems

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ for care management professionals