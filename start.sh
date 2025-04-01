#!/bin/bash
cd epes-back
docker-compose up -d & # Start Docker services in detached mode
go run main.go & # Start Golang backend

cd ../epes-front
bun run dev # Start Next.js frontend
