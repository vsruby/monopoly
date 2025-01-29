# Monopoly

Nearly everyone has played the board game Monopoly. Using your knowledge of the mechanics of the game, design a software application that will simulate the gameplay that allows up to 4 humans to interact with it. If you are unfamiliar with how to play Monopoly, watch this great [tutorial](https://www.youtube.com/watch?v=4nz-_hvFw44).

The solution should include high level designs for the models, classes, services and functionality of the application. Models should have attributes, properties, relationships to other models and any specific functions defined.

For the shaping exercise, we have intentionally left the project a little vague to see how people approach gathering an understanding of the problem. We love it when you make some assumptions and then clarify during the conversation. Additionally, your thinking on what the solution would look like is something we are eager to understand. There is no right answer, but how you think about different aspects of the problem from design, scope, scale, monitoring, resiliency, administration, and user experience are things we are looking for.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Setting Up the Database](#setting-up-the-database)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Stopping the Application](#stopping-the-application)
- [Considerations](#considerations)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/)
- [Volta](https://volta.sh/) (for managing Node.js versions) \*not required but was used in development

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/vsruby/monopoly.git
   cd monopoly
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

## Setting Up the Database

1. **Start the Docker container for the database:**

   ```bash
   docker compose up -d
   ```

2. **Initialize the database**

   ```bash
   npm run db:migrate
   ```

3. **Seed Database**

   ```bash
   npm run import-data
   ```

## Configuration

Configure your environment variables by creating a `.env` file in the project root. Refer to `.env.example` for required variables.

Or just run

```bash
npm start
```

Which will copy the values of `.env.example` to a new `.env` file if none exist

Key configurations include:

- `PORT`: The port the server will listen on
- `POSTGRES_DB`: Name of the database
- `POSTGRES_HOST`: Hostname of your database (e.g., localhost or the name of your Docker service)
- `POSTGRES_PASSWORD`: Password for the database
- `POSTGRES_PORT`: Port number the database is listening on
- `POSTGRES_USER`: Username for the database

## Running the Application

1. **Start the node server**

   ```bash
   npm start
   ```

2. **Verify the application is running**

   Open your browder and navigate to `http://localhost:3001/games` to see the application in action

## Stopping the Application

1. **Stop the node server**

   If the node service is running in teh foreground, you can stop it by pressing `Ctrl + c` in the terminal.

2. **Stop the docker database container**

   ```bash
   docker compose down
   ```

## Considerations

1. **What data objects would you need? What data validations (application level) would you put into place?**

2. **What relationships between models/objects would you define? Define one-to-many and many-to-many relationships.**

3. **How would you manage game state? What application classes would you create to handle this?**

4. **How would you handle actions that take place at certain points in the game?**

5. **What data needs to be fixture and what data needs to be transactional?**

6. **Consider that the application could potentially be an online experience. How would you allow for thousands of players at once? How would you scale the solution to accommodate a fluctuating and increased demand in traffic?**
