# ECC ElderCare Connections Application

## Overview

This is a comprehensive elder care management system built as a full-stack TypeScript application. The system includes client assessment modules, staff management tools, and an integrated resource directory. The application is designed to support elder care coordinators in managing clients, conducting assessments, and accessing community resources.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the main application
- **Vite** as the build tool and development server
- **Tailwind CSS** for styling with shadcn/ui components
- **Modular architecture** with separate modules for different functionalities
- **Context-based state management** for authentication and assessment data
- **Client-side routing** with React Router

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API design** with `/api` prefix for all endpoints
- **Middleware-based request handling** with logging and error handling
- **Modular storage interface** supporting both in-memory and database implementations

### Database & Storage
- **Drizzle ORM** configured for PostgreSQL
- **Neon Database** as the PostgreSQL provider
- **Firebase Firestore** for the resource directory module
- **Dual storage approach**: PostgreSQL for core app data, Firestore for resource directory

## Key Components

### Authentication System
- **Multi-tenant authentication** supporting both staff and client users
- **Firebase Auth** integration for some modules
- **Role-based access control** (admin, care_manager, client)
- **Email verification** system with automated workflows
- **Session management** with proper security measures

### Assessment Module
- **Comprehensive geriatric assessment** forms
- **Real-time auto-save** functionality
- **Progress tracking** across multiple assessment sections
- **Print-friendly** layouts for assessment reports
- **Validation system** with error handling
- **Audit trail** for all assessment changes

### Client Management
- **Full CRUD operations** for client records
- **Staff assignment** and access control
- **Client portal** for self-service access
- **Demographic and contact information** management

### Resource Directory Module
- **Standalone React application** integrated as a module
- **Firebase backend** for resource data
- **CSV import** functionality for bulk resource addition
- **Advanced search** with filtering and categorization
- **Favorite system** for frequently used resources

## Data Flow

1. **User Authentication**: Users authenticate through Firebase Auth or custom email/password system
2. **Role-based Routing**: Users are directed to appropriate interfaces based on their role
3. **Assessment Workflow**: 
   - Staff creates new assessments linked to clients
   - Multi-section forms with auto-save functionality
   - Real-time validation and progress tracking
   - Final summary generation with signatures
4. **Resource Management**: Independent module with its own data flow using Firestore
5. **Client Portal**: Simplified interface for clients to view their information

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database queries
- **firebase**: Authentication and Firestore for resource directory
- **@tanstack/react-query**: Server state management
- **react-router-dom**: Client-side routing
- **@radix-ui**: Accessible UI components
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production
- **vite**: Development server and build tool

### Third-party Integrations
- **EmailJS**: Email verification service (configured but not fully implemented)
- **Speech Recognition API**: Voice input for assessment forms
- **Web Audio API**: Timer notifications in assessments

## Deployment Strategy

### Development Environment
- **Replit**: Primary development environment
- **Hot reload**: Vite development server on port 5000
- **PostgreSQL**: Managed database instance
- **Environment variables**: Database URL and Firebase configuration

### Production Build
- **Static assets**: Built to `dist/public` directory
- **Server bundle**: ESM format with external packages
- **Asset optimization**: Vite handles CSS/JS optimization
- **Database migrations**: Drizzle migrations in `migrations/` directory

### Deployment Configuration
- **Autoscale**: Replit autoscale deployment target
- **Port mapping**: Internal port 5000 mapped to external port 80
- **Build process**: `npm run build` creates production bundle
- **Start process**: `npm run start` runs production server

## Changelog

- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.