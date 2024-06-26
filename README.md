# Collaborative Whiteboard

This project is a real-time collaborative whiteboard application. It consists of a frontend built with React and TypeScript, and a backend built with Express and Prisma.

## Project Structure

The project is divided into two main directories:

- `frontend/`: Contains the React application.
- `backend/`: Contains the Express server.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository.
2. Navigate to the `backend/` directory.
3. Run `npm install` to install the backend dependencies.
4. Navigate to the `frontend/` directory.
5. Run `npm install` to install the frontend dependencies.

### Running the Application

#### Backend

Navigate to the `backend/` directory and run the following command to start the server:

```sh
npm run start-local
```

#### Frontend

Navigate to the frontend/ directory and run the following command to start the React application:

```sh
npm run dev
```

#### Features

- **Real-time collaboration**: Draw on the whiteboard along with your friends and see changes in real-time.
- **Room creation**: Create a new room and share link with others to join.
- **Room joining**: Join an existing room using a room ID.
- **Save Diagram**: Save the current diagram so that it can be loaded from the previous saved state.

## Contributing

Contributions are welcome. Please open an issue to discuss your ideas or submit a pull request with your changes.

## License

This project is licensed under the ISC License.