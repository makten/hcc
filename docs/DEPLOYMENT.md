# 🚀 Home Control Center - Deployment Guide

This guide covers deploying the Home Control Center with persistent storage using Docker.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Container                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │            Node.js Express Server                     │  │
│   │  ┌────────────────┐    ┌──────────────────────────┐  │  │
│   │  │  API Endpoints │    │   Static File Server     │  │  │
│   │  │  /api/*        │    │   (React SPA)            │  │  │
│   │  └────────────────┘    └──────────────────────────┘  │  │
│   └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│                    ┌──────────────┐                         │
│                    │   SQLite     │                         │
│                    │   Database   │                         │
│                    └──────────────┘                         │
│                           │                                  │
│                           ▼                                  │
│            ╔══════════════════════════════╗                 │
│            ║    Persistent Volume         ║                 │
│            ║    /app/data/hcc.db          ║                 │
│            ╚══════════════════════════════╝                 │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone or navigate to the project
cd home-control-center

# Build and start the container
docker compose up -d

# View logs
docker compose logs -f

# Access the app at http://localhost:3000
```

### Option 2: Docker Build & Run

```bash
# Build the image
docker build -t home-control-center:latest .

# Run with persistent volume
docker run -d \
  --name home-control-center \
  -p 3000:3000 \
  -v hcc_data:/app/data \
  --restart unless-stopped \
  home-control-center:latest
```

### Option 3: Development Mode (Backend + Frontend)

```bash
# Terminal 1: Start the backend
cd server
npm install
npm run dev

# Terminal 2: Start the frontend (with proxy to backend)
cd ..
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `DATA_DIR` | `/app/data` | Directory for persistent data |
| `DATABASE_PATH` | `/app/data/hcc.db` | SQLite database path |
| `HASS_URL` | - | Home Assistant URL (optional) |
| `HASS_TOKEN` | - | Home Assistant token (optional) |

## Data Persistence

The application stores all data in a SQLite database:

```
/app/data/
├── hcc.db              # Main database (users, config, scenes)
└── hcc.db-wal          # Write-Ahead Log for better performance
```

### Backup Your Data

```bash
# Copy database from container
docker cp home-control-center:/app/data/hcc.db ./backup/

# Or use Docker volumes
docker run --rm \
  -v hcc_data:/data \
  -v $(pwd)/backup:/backup \
  alpine cp /data/hcc.db /backup/
```

### Restore Data

```bash
# Stop the container first
docker compose stop

# Copy backup to volume
docker run --rm \
  -v hcc_data:/data \
  -v $(pwd)/backup:/backup \
  alpine cp /backup/hcc.db /data/

# Restart container
docker compose start
```

## Updating

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build
```

## Accessing from Other Devices

### Option 1: Local Network

Your Home Control Center will be accessible at:
- `http://YOUR-HOST-IP:3000`

Find your IP:
```bash
# Windows
ipconfig

# Linux/Mac
ip addr show | grep inet
```

### Option 2: Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name hcc.home.local;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 3: Cloudflare Tunnel (Remote Access)

For secure remote access without port forwarding:

```bash
# Install cloudflared
# See: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/

# Create tunnel
cloudflared tunnel create hcc

# Configure tunnel
cloudflared tunnel route dns hcc hcc.yourdomain.com

# Run tunnel
cloudflared tunnel run --url http://localhost:3000 hcc
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs

# Check if port is in use
netstat -tlnp | grep 3000
```

### Database errors

```bash
# Enter container
docker exec -it home-control-center sh

# Check database exists
ls -la /app/data/

# Verify database integrity
sqlite3 /app/data/hcc.db "PRAGMA integrity_check;"
```

### Reset to defaults

```bash
# Stop container
docker compose stop

# Remove database (WARNING: This deletes all data!)
docker run --rm -v hcc_data:/data alpine rm -f /data/hcc.db

# Restart (will recreate database)
docker compose start
```

## Security Considerations

1. **Change Default Credentials**: Create your own admin user and delete the default one

2. **Use HTTPS**: Always use HTTPS in production (via reverse proxy)

3. **Limit Network Access**: Only expose to trusted networks or use VPN/Cloudflare Tunnel

4. **Regular Backups**: Set up automated database backups

5. **Update Regularly**: Keep the application updated for security patches

## API Endpoints

The backend provides these REST endpoints:

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/pin` - Update PIN
- `PATCH /api/users/:id/biometric` - Update biometric settings
- `PATCH /api/users/:id/login` - Record login

### Configuration
- `GET /api/config` - Get all config
- `GET /api/config/:key` - Get specific config
- `PUT /api/config/:key` - Set config value
- `DELETE /api/config/:key` - Delete config key

### Scenes
- `GET /api/scenes` - List all scenes
- `POST /api/scenes` - Create scene
- `PATCH /api/scenes/:id` - Update scene
- `DELETE /api/scenes/:id` - Delete scene

### Audit
- `GET /api/audit` - Get audit logs

### Health
- `GET /api/health` - Health check

## Support

For issues or feature requests, please open an issue on GitHub.
