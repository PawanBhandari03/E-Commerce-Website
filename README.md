# Task Manager App

Full-stack task management application with 
Spring Boot backend and React TypeScript frontend.

## Tech Stack
- Backend: Java, Spring Boot, Spring MVC, 
  Spring Data JPA, Maven
- Frontend: React, TypeScript, Tailwind CSS, Vite
- DevOps: Docker, Docker Compose

## Features
- Task Lists with nested Tasks
- Task Priority — High, Medium, Low
- Task Status — Todo, In Progress, Done
- Full CRUD for Tasks and Task Lists
- Clean REST API with DTO pattern
- Global exception handling
- Dockerized with docker-compose

## Project Structure
Task-Manager-App/
├── Backend/    → Spring Boot REST API
├── Frontend/   → React TypeScript frontend
└── docker-compose.yml

## Getting Started

### Using Docker (recommended)
docker-compose up

### Manual Setup

#### Backend
cd Backend
mvn spring-boot:run
Backend runs on http://localhost:8080

#### Frontend
cd Frontend
npm install
npm run dev
Frontend runs on http://localhost:5173

## Demo
Watch demo: https://youtu.be/brnazVsG4cY
