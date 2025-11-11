# Docker Deployment Guide

This guide explains how to run Freetar using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+
- Node.js 22+ (for local development)

## Quick Start

### Using Docker Compose (Recommended)

1. Build and start the container:
```bash
docker-compose up -d
```

2. Access the application at http://localhost:3000

3. View logs:
```bash
docker-compose logs -f
```

4. Stop the container:
```bash
docker-compose down
```

### Using Docker CLI

1. Build the image:
```bash
docker build -t freetar .
```

2. Run the container:
```bash
docker run -d -p 3000:3000 --name freetar freetar
```

3. Stop and remove:
```bash
docker stop freetar
docker rm freetar
```

## Docker Architecture

The Dockerfile uses a multi-stage build process:

1. **Dependencies Stage**: Installs npm dependencies
2. **Builder Stage**: Builds the Next.js application
3. **Runner Stage**: Creates a minimal production image with only necessary files

### Image Optimization

- Uses Alpine Linux base image for smaller size
- Multi-stage build reduces final image size
- Runs as non-root user for security
- Only includes production dependencies

## Port Configuration

By default, the application runs on port 3000. To use a different port:

**Docker Compose:**
```yaml
services:
  freetar:
    ports:
      - "8080:3000"  # Maps host port 8080 to container port 3000
```

**Docker CLI:**
```bash
docker run -d -p 8080:3000 --name freetar freetar
```

## Environment Variables

The application doesn't require environment variables for basic functionality.

### Optional Configuration

**NEXT_PUBLIC_BASE_URL** - Sets the base URL for metadata and Open Graph images (defaults to `https://freetar.de`)

**Docker Compose:**
```yaml
services:
  freetar:
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

**Docker CLI:**
```bash
docker run -d -p 3000:3000 -e NEXT_PUBLIC_BASE_URL=https://yourdomain.com --name freetar freetar
```

**Using .env file:**
```bash
# Copy the example file
cp .env.example .env

# Edit with your values
# Then uncomment env_file in docker-compose.yml
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs freetar

# Or with Docker CLI
docker logs freetar
```

### Port already in use
Change the host port in `docker-compose.yml` or use a different port with `-p` flag.

### Rebuild after code changes
```bash
docker-compose up -d --build
```

## Production Deployment

For production deployment:

1. Consider using a reverse proxy (nginx, Traefik) for SSL/TLS
2. Set up automatic restarts: `restart: unless-stopped` (already configured)
3. Monitor container health and logs
4. Use Docker secrets or environment files for sensitive data
5. Consider using Docker Swarm or Kubernetes for scaling

## Data Persistence

Freetar stores all user data (favorites, preferences) in the browser's localStorage. No server-side data persistence is required.
