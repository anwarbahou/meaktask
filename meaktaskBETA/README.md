# MeakTask - Task Management App

A modern task management application built with React Native, Expo, and Supabase.

## Features

- User authentication (sign up, login, logout)
- Task management (create, read, update, delete)
- Task prioritization
- Clean and intuitive UI
- Cross-platform support (iOS, Android, web)

## Tech Stack

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Supabase (Authentication, Database, Storage)
- **Styling**: React Native StyleSheet

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/meaktask.git
   cd meaktask
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Set up Supabase:
   - Create a new project on [Supabase](https://supabase.com)
   - Create the following tables in your Supabase database:
     - `tasks` table with columns: id, created_at, title, description, status, user_id, due_date, priority
     - `profiles` table with columns: id, created_at, email, full_name, avatar_url
   - Get your project URL and anon key from the Supabase dashboard

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the `.env` file with your Supabase credentials:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

5. Start the development server:
   ```
   npm start
   # or
   yarn start
   ```

6. Run on your preferred platform:
   ```
   # For iOS
   npm run ios
   # or
   yarn ios

   # For Android
   npm run android
   # or
   yarn android

   # For web
   npm run web
   # or
   yarn web
   ```

## Project Structure

```
meaktask/
├── app/                  # Main application screens
├── assets/               # Static assets (images, fonts)
├── components/           # Reusable UI components
├── constants/            # App constants and theme
├── hooks/                # Custom React hooks
├── lib/                  # Library code
│   └── supabase/         # Supabase client and types
├── utils/                # Utility functions
└── ...
```

## Authentication Flow

The app uses Supabase Authentication for user management:

1. Users can sign up with email and password
2. Users can log in with their credentials
3. Authentication state is persisted using SecureStore
4. Protected routes check for authentication status

## Task Management

Tasks are stored in the Supabase database and include:

- Title
- Description (optional)
- Status (pending, completed)
- Priority (low, medium, high)
- Due date (optional)
- User ID (for ownership)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
