# Supabase Setup for Meaktask

This directory contains the necessary SQL scripts and setup instructions for configuring your Supabase project for the Meaktask application.

## Setup Instructions

### 1. Create a New Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in or create an account
2. Click "New Project" and fill in the details:
   - Name: `meaktask` (or your preferred name)
   - Database Password: Create a strong password and save it
   - Region: Choose the region closest to your users
   - Pricing Plan: Free tier is sufficient for development

### 2. Apply the SQL Setup

There are two ways to apply the SQL setup:

#### Option 1: Using the Supabase Dashboard (Recommended)

1. In your Supabase project, go to the "SQL Editor" tab
2. Create a new query
3. Copy the entire contents of `setup.sql` from this directory
4. Paste it into the SQL editor
5. Click "Run" to execute the SQL

#### Option 2: Using the Setup Script

1. Install the required dependencies:
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

2. Make sure your `.env` file in the project root contains:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the setup script:
   ```bash
   node supabase/setup.js
   ```

### 3. Configure Authentication

1. In your Supabase project, go to "Authentication" > "Providers"
2. Make sure "Email" provider is enabled
3. Configure the following settings:
   - "Confirm email" should be enabled
   - "Secure email change" should be enabled
   - Set your site URL (e.g., `http://localhost:19006` for development)

### 4. Update Your Environment Variables

Make sure your `.env` file in the project root contains the correct Supabase URL and anon key:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings under "API".

## Database Schema

The setup script creates the following tables:

### Profiles Table

Stores user profile information:

- `id`: UUID (primary key, references auth.users)
- `created_at`: Timestamp
- `email`: Text (unique)
- `full_name`: Text
- `avatar_url`: Text

### Tasks Table

Stores task information:

- `id`: UUID (primary key)
- `created_at`: Timestamp
- `title`: Text
- `description`: Text
- `status`: Text (default: 'pending')
- `user_id`: UUID (references auth.users)
- `due_date`: Timestamp
- `priority`: Text (default: 'medium')

## Row Level Security (RLS)

The setup includes RLS policies to ensure users can only access their own data:

- Users can view, update, and insert their own profiles
- Users can view, insert, update, and delete their own tasks
- A special policy allows the trigger to create profiles

## Triggers

The setup includes a trigger that automatically creates a profile when a new user signs up.

## Functions

The setup includes utility functions:

- `user_exists`: Checks if a user with a given email exists
- `get_user_profile`: Gets a user's profile information 