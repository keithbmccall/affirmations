# Affirmations Server

A Node.js/Express backend server that supports the Affirmations mobile application. This server is built with TypeScript and provides a robust API for managing scheduled affirmations and notifications.

## Features

- RESTful API endpoints for affirmation management
- Health check endpoint for monitoring server status
- CORS enabled for cross-origin requests
- Environment variable configuration support
- TypeScript for type safety and better development experience

## Tech Stack

- Node.js
- Express.js
- TypeScript
- CORS middleware
- dotenv for environment configuration

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development

To start the development server with hot-reload:

```bash
npm run dev
# or
yarn dev
```

### Building for Production

To compile TypeScript to JavaScript:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm start
# or
yarn start
```

## API Endpoints

- `GET /health` - Health check endpoint that returns server status and timestamp

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000 # Server port number (default: 3000)
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
