# Affirmations

A mobile application built with React Native and Expo that helps users schedule and manage daily affirmations and motivational quotes. The app allows users to create custom affirmations or use suggested quotes, schedule them for specific times, and receive notifications to stay motivated throughout their day.

## Features

- Schedule custom affirmations with personalized messages
- Choose from a curated list of motivational quotes
- Calendar integration for managing affirmation schedules
- Push notifications for timely reminders
- Dark mode support
- Beautiful and intuitive user interface
- History tracking of past affirmations
- Bottom sheet modals for enhanced user experience

## Tech Stack

### Mobile App (React Native)
- React Native with Expo
- TypeScript
- React Native Elements UI Library
- Expo Notifications
- Expo Calendar
- React Native Reanimated
- React Native Bottom Sheet
- React Native Safe Area Context

### Backend Server
- Node.js
- Express.js
- TypeScript
- CORS middleware
- Environment configuration with dotenv

## Project Structure

The project consists of two main parts:

1. `/` - React Native mobile application (root directory)
2. `/server` - Express.js backend server

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- npm or yarn package manager
- iOS Simulator or Android Emulator
- Expo CLI
- CocoaPods (for iOS development)

### Installation

1. Clone the repository
2. Install dependencies for the mobile app:
   ```bash
   yarn install
   # or
   npm install
   ```
3. Install dependencies for the server:
   ```bash
   cd server
   yarn install
   # or
   npm install
   ```

### Development

#### Mobile App
```bash
# Start the Expo development server
yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android
```

#### Backend Server
```bash
cd server
yarn dev
```

## Features in Detail

### Affirmation Scheduling
- Create custom affirmations with titles and messages
- Schedule notifications for specific dates and times
- Edit or delete scheduled affirmations
- View all upcoming scheduled affirmations

### Quote System
- Access a curated list of motivational quotes
- Automatically suggest quotes for scheduling
- Track sent quotes to avoid repetition

### Calendar Integration
- Sync affirmations with device calendar
- View affirmations alongside other calendar events
- Manage affirmation schedules through calendar interface

### Notification System
- Push notifications for scheduled affirmations
- Custom notification sounds
- Background notification handling
- History tracking of received notifications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 