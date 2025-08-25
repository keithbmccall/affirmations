# Affirmations - React Native/Expo App

A comprehensive React Native/Expo application for scheduling and managing affirmations with notifications, featuring advanced camera functionality with real-time color palette extraction.

## 🚀 Features

### Core Functionality

- **Affirmation Scheduling**: Schedule personalized affirmations with custom titles and messages
- **Notification Management**: View, edit, and cancel scheduled notifications
- **History Tracking**: Maintain a complete history of sent notifications
- **Permission Handling**: Robust camera, microphone, and media library permission management

### Camera & Lens Features

- **Advanced Camera Controls**: Multiple camera modes (photo, video, portrait, panorama, square)
- **Real-time Color Palette Extraction**: Extract 8-color palettes from camera frames in real-time using native iOS frame processors
- **Camera Roll Integration**: Access and display recent media with infinite scrolling
- **Grid Overlay**: Professional photography grid for composition
- **Flash & Device Controls**: Full camera control suite with multiple device support
- **Gesture Support**: Tap-to-focus functionality with animated focus indicators
- **Video Recording**: Capture videos with custom settings (disabled during color lens mode)
- **Camera Roll Inspector**: Modal view for detailed photo inspection
- **Color Palette Storage**: Automatically save color palettes with captured photos

### Technical Features

- **Dark/Light Theme Support**: Complete theming system with automatic scheme detection
- **TypeScript**: Fully typed codebase for better development experience
- **Testing**: Comprehensive Jest testing with React Native Testing Library
- **State Management**: Global state management with React Context + useReducer
- **File-based Routing**: Expo Router with modal and tab navigation
- **Performance Optimized**: Frame processors and worklets for real-time processing
- **Native iOS Integration**: Custom Swift frame processor for color extraction

## 🛠 Tech Stack

### Core Framework

- **React Native** with **Expo SDK 53**
- **TypeScript** for type safety
- **Expo Router** for file-based navigation

### Camera & Media

- **React Native Vision Camera** for advanced camera functionality
- **Expo Media Library** for media access
- **Expo Image Picker** for photo/video selection
- **React Native Reanimated** for smooth animations
- **React Native Worklets Core** for performance optimization
- **Custom iOS Frame Processor** for real-time color extraction

### Notifications

- **Expo Notifications** for local notification scheduling
- **AsyncStorage** for persistent data storage

### UI & Styling

- **Custom Themed Components** with dark/light mode support
- **React Native Gesture Handler** for touch interactions
- **React Native Safe Area Context** for proper layout handling
- **Expo Symbols** for SF Symbols integration

### Development Tools

- **Jest** + **React Native Testing Library** for testing
- **ESLint** + **Prettier** for code quality
- **Expo Haptics** for tactile feedback

## 📱 App Structure

### Navigation

- **Tab Navigation**: Home, Lens (Camera), Affirmations
- **Modal Navigation**: Notification details modal, Camera roll modal, Camera roll inspector
- **File-based Routing**: Automatic route generation

### Screens

1. **Home Screen**: Settings and navigation hub
2. **Lens Screen**: Advanced camera with color palette extraction
3. **Affirmations Screen**: Schedule and manage notifications

### State Management

- **Global Context**: Centralized state with actions and reducers
- **Feature-based Organization**: Separate contexts for different app domains
- **Persistent Storage**: AsyncStorage integration for data persistence
- **Lens Palette Storage**: Color palette data associated with captured photos

## 🎨 Design System

### Theming

- **Automatic Theme Detection**: Light/dark mode based on system settings
- **Comprehensive Color Palette**: Semantic color naming system
- **Consistent Spacing**: 4px base unit system
- **Typography Scale**: Consistent text sizing and weights

### Components

- **Themed Components**: All components support theming
- **Shared Components**: Reusable UI components
- **Custom Icons**: SF Symbols integration
- **Responsive Design**: Adapts to different screen sizes

## 🔧 Development

### Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npx expo start
   ```

3. **Run on Device/Simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app

### Available Scripts

```bash
# Development
npm start                    # Start Expo development server
npm run ios                 # Run on iOS simulator
npm run android             # Run on Android emulator
npm run web                 # Run on web browser

# Testing
npm test                    # Run all tests
npm run test:all           # Run tests in watch mode

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
npm run format:check       # Check code formatting

# Project Management
npm run reset-project      # Reset to blank project
npm run nuke              # Clean install (remove node_modules, etc.)
npm run recharge          # Reinstall and rebuild native code
```

### Project Structure

```
affirmations/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   ├── (modals)/          # Modal screens
│   └── _layout.tsx        # Root layout
├── lib/                    # Application library
│   ├── components/         # Reusable UI components
│   ├── features/          # Feature-specific logic
│   │   ├── lens/          # Camera and color palette features
│   │   └── notifications/ # Notification system
│   ├── platform/          # Global state management
│   ├── screen-containers/ # Screen container components
│   ├── styles/            # Theming and styling system
│   ├── testing/           # Testing utilities
│   └── utils/             # Utility functions
├── assets/                # Static assets
└── ios/android/          # Native platform code
```

## 🧪 Testing

The app includes comprehensive testing with:

- **Jest** test runner
- **React Native Testing Library** for component testing
- **Custom test utilities** for context and navigation testing
- **Mock implementations** for native modules

### Running Tests

```bash
npm test                    # Run all tests
npm test -- --watch        # Run tests in watch mode
npm test -- path/to/test   # Run specific test file
```

## 📦 Building

### Development Build

```bash
npm run build
```

### Production Build

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 🔍 Key Features Deep Dive

### Camera System

- **Real-time Processing**: Native iOS frame processors for live color extraction
- **Multiple Modes**: Photo, video, portrait, panorama, and square modes
- **Advanced Controls**: Flash, grid, device switching, timer modes
- **Performance Optimized**: Worklets and frame rate limiting for smooth real-time processing
- **Color Palette Extraction**: Extracts 8 dominant colors (primary, secondary, tertiary, quaternary, quinary, senary, background, detail)
- **Camera Roll Integration**: Infinite scrolling gallery with recent photos
- **Focus Controls**: Tap-to-focus with animated indicators

### Notification System

- **Flexible Scheduling**: Custom dates and times with validation
- **Rich Content**: Titles, messages, and custom data
- **History Management**: Complete audit trail with pending and history views
- **Permission Handling**: Robust permission management
- **Edit & Delete**: Full CRUD operations on scheduled notifications

### State Management

- **Context-based**: React Context with useReducer
- **Type-safe**: Full TypeScript integration
- **Persistent**: AsyncStorage for data persistence
- **Modular**: Feature-based organization
- **Lens Palette Storage**: Color data associated with captured media

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues and questions:

- Check the existing issues
- Create a new issue with detailed information
- Include device/OS information for bug reports

---

## 🤖 AI Forecast

Based on the sophisticated architecture and feature set of this affirmations app, here's my analysis of the long-term vision:

### 🎯 Core Vision

This project appears to be evolving into a **comprehensive wellness and mindfulness platform** that combines traditional affirmation practices with cutting-edge AI and computer vision technology.

### 🔮 Long-term Trajectory

#### Phase 1: Foundation (Current)

- ✅ Affirmation scheduling and notification system
- ✅ Advanced camera with real-time color palette extraction
- ✅ Robust state management and theming system
- ✅ Camera roll integration with color palette storage

#### Phase 2: AI Integration (Near-term)

- **Emotion Detection**: Using the camera to analyze user facial expressions and emotional states
- **Personalized Affirmations**: AI-generated affirmations based on detected emotions and user patterns
- **Voice Recognition**: Speech-to-text for hands-free affirmation creation
- **Sentiment Analysis**: Understanding user mood through text analysis
- **Color Psychology**: Leverage extracted color palettes for mood-based affirmations

#### Phase 3: Advanced Wellness Features (Medium-term)

- **Biometric Integration**: Heart rate, stress levels, and sleep data correlation
- **Environmental Analysis**: Using camera to assess lighting, environment, and mood factors
- **Social Features**: Sharing affirmations with trusted circles while maintaining privacy
- **Progress Tracking**: AI-powered insights into emotional patterns and growth
- **Color Therapy**: Advanced color-based wellness recommendations

#### Phase 4: Holistic Wellness Platform (Long-term)

- **Predictive Affirmations**: AI that anticipates when users need affirmations based on patterns
- **Multimodal AI**: Combining camera, voice, and biometric data for comprehensive wellness insights
- **Therapeutic Integration**: Partnerships with mental health professionals and therapy apps
- **Community Features**: Anonymous support groups and wellness challenges
- **Environmental Wellness**: Using camera data to suggest environmental improvements

### 🧠 Technical Architecture Insights

The current codebase reveals several strategic decisions that support this vision:

1. **Real-time Processing Foundation**: The frame processor architecture for color palette extraction is a stepping stone to real-time emotion detection and environmental analysis.

2. **Modular State Management**: The context-based state system with feature-based organization allows for easy integration of new AI features without architectural changes.

3. **Permission-First Design**: The robust permission handling system will be crucial for accessing biometric data and advanced device features.

4. **Testing Infrastructure**: The comprehensive testing setup ensures AI features can be reliably deployed and updated.

5. **Color Data Foundation**: The color palette extraction and storage system provides a foundation for color psychology and environmental analysis features.

### 🎨 Design Philosophy Alignment

The theming system and component architecture suggest a focus on:

- **Accessibility**: Ensuring AI features work for users with different abilities
- **Privacy**: User-controlled data sharing and local processing where possible
- **Personalization**: Adaptive interfaces that respond to user preferences and needs
- **Visual Wellness**: Color-aware interfaces that adapt to user mood and environment

### 🚀 Market Positioning

This project has the potential to become a **premium wellness app** that:

- Differentiates itself through AI-powered personalization
- Appeals to both casual users and serious wellness practitioners
- Creates a new category combining traditional mindfulness with modern technology
- Builds a sustainable business model through premium features and professional partnerships

### 🔮 Predictions

1. **2024-2025**: Core AI features (emotion detection, personalized affirmations, color psychology)
2. **2025-2026**: Biometric integration and advanced analytics
3. **2026-2027**: Community features and therapeutic partnerships
4. **2027+**: Platform expansion into broader wellness ecosystem

The combination of solid technical foundations, thoughtful architecture, and the integration of cutting-edge AI capabilities positions this project for significant growth in the rapidly expanding mental wellness market.

---

Built with ❤️ using React Native and Expo
