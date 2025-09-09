# Message Database Setup

This backend now includes a SQLite database for persisting user messages and generated content.

## Database Schema

### Tables Created:
- `users` - Stores user information
- `study_plans` - Stores study plan metadata
- `messages` - Stores chat messages between users and AI
- `generated_content` - Stores flashcards, summaries, and review questions

## API Endpoints

### Messages
- `GET /messages/:userId/:studyPlanId` - Get all messages for a study plan
- `DELETE /messages/:userId/:studyPlanId` - Delete all messages for a study plan

### Generated Content
- `POST /generated-content` - Save generated content (flashcards, summaries, reviews)
- `GET /generated-content/:userId/:studyPlanId` - Get all generated content for a study plan
- `DELETE /generated-content/:contentId/:userId` - Delete specific generated content

### Study Plans
- `POST /study-plan` - Save study plan metadata

### Chat
- `POST /chat` - Send message to AI (now includes userId and studyPlanId for persistence)

## Usage

1. Start the backend server: `npm start`
2. The database file `messages.db` will be created automatically
3. All chat messages and generated content will now persist across sessions

## Features

- ✅ Messages persist when users re-enter chat
- ✅ Generated content (flashcards, summaries, reviews) persist
- ✅ Each user has their own message history
- ✅ Messages are organized by study plan
- ✅ Automatic user creation
- ✅ Loading states in the UI
