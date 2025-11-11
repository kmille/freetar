# Docker Deployment Guide

This guide explains how to run Freetar using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+

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

The application doesn't require environment variables for basic functionality. If needed, you can add them:

**Docker Compose:**
```yaml
services:
  freetar:
    environment:
      - NODE_ENV=production
      - CUSTOM_VAR=value
```

**Docker CLI:**
```bash
docker run -d -p 3000:3000 -e CUSTOM_VAR=value --name freetar freetar
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
