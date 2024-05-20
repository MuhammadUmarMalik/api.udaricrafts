# Udaricrafts API

Welcome to the Udaricrafts API project! This guide will help you set up and run the project locally using Adonis.js.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 14 or higher)
- **Adonis.js** (version 5 or higher)
- A code editor or IDE of your choice

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/udaricrafts-api.git
cd udaricrafts-api
```

### 2. Install Dependencies

```bash
npm install
```

## Database Setup

### 3. Run Migrations

To create the necessary database tables and schema, run:

```bash
node ace migration:run
```

### 4. Run Seeders

Populate the database with initial data by executing:

```bash
node ace db:seed
```

## Running the Server

### 5. Start the Development Server

Launch the server in development mode with automatic reload on code changes:

```bash
node ace serve --watch
```

## Additional Commands

Enhance your development workflow with these Adonis.js CLI commands:

- **Run Adonis.js CLI**:
  ```bash
  node ace
  ```

- **List All Routes**:
  ```bash
  node ace route:list
  ```

- **Create a New Controller**:
  ```bash
  node ace make:controller YourControllerName
  ```

- **Create a New Model**:
  ```bash
  node ace make:model YourModelName
  ```


