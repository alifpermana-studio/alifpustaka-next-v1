# Docker Network Setup

Create required Docker networks for the Alif Pustaka projects.

---

## Network Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     alifpustaka-network                          │
│            (Bridge network, shared across projects)              │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │  Public Site    │  │   Admin App     │  │  Other          ││
│  │  subdomain 1    │  │   subdomain 2   │  │  Subdomains     ││
│  └─────────────────┘  └─────────────────┘  └─────────────────┘│
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      traefik-network                             │
│          (Bridge network, shared with Traefik)                   │
│                                                                  │
│  ┌──────────┐    ┌─────────────────┐    ┌─────────────────┐   │
│  │ Traefik  │───►│  Public Site    │    │   Admin App     │   │
│  │  (SSL)   │    │                 │    │                 │   │
│  └──────────┘    └─────────────────┘    └─────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Why External Networks?

### External Network Definition

```yaml
networks:
  alifpustaka-network:
    external: true  # Network exists outside docker-compose
```

**Characteristics:**
- Created **manually** (not by docker-compose)
- Persists after `docker-compose down`
- **Shared between multiple projects**
- Uses bridge driver by default

### Benefits for Multi-Project Setup

1. **Cross-Project Communication**
   - Public site can reach admin app
   - Admin app can reach public site
   - Other subdomain projects can join same network

2. **Persistent**
   - Network survives project restarts
   - Stopping one project doesn't affect others
   - Manual control over lifecycle

3. **Organized**
   - All Alif Pustaka projects on one network
   - Clear separation from other applications
   - Easy to manage and monitor

---

## Create Networks

Run these commands **once** before deploying any projects:

```bash
# Create shared network for inter-project communication
docker network create alifpustaka-network

# Create Traefik network for routing and SSL
docker network create traefik-network
```

Both networks use the **bridge** driver by default.

---

## Verify Networks

```bash
# List all networks
docker network ls

# Should show:
# alifpustaka-network  bridge  local
# traefik-network      bridge  local
```

**Inspect networks:**
```bash
# Check alifpustaka-network details
docker network inspect alifpustaka-network

# Check traefik-network details
docker network inspect traefik-network
```

**Inspect output shows:**
- Driver: bridge
- Subnet: Auto-assigned (e.g., 172.20.0.0/16)
- Gateway: Auto-assigned (e.g., 172.20.0.1)
- Containers: Lists all connected containers

---

## Network Usage

### alifpustaka-network
**Purpose:** Internal communication between Alif Pustaka projects

**Connected containers:**
- `alifpustaka-public-site` (this project)
- `alifpustaka-admin-app` (admin project)
- `postgres` (database, from admin project)
- Other subdomain projects you add

**Communication examples:**
```bash
# From public site to admin app
curl http://alifpustaka-admin-app:3000/api/health

# From admin app to public site
curl http://alifpustaka-public-site:3000/api/health

# From other project to admin API
curl http://alifpustaka-admin-app:3000/api/public/posts
```

### traefik-network
**Purpose:** External routing and SSL termination

**Connected containers:**
- `traefik` (reverse proxy)
- `alifpustaka-public-site` (routed as alifpustaka.web.id)
- `alifpustaka-admin-app` (routed as app.alifpustaka.web.id)
- Other web-facing services

**Routing:**
- `alifpustaka.web.id` → Public Site (via Traefik)
- `app.alifpustaka.web.id` → Admin App (via Traefik)

---

## Add New Projects to Network

When you deploy another subdomain project:

```yaml
# docker-compose.yml for new project
services:
  new-subdomain:
    # ... config ...
    networks:
      - alifpustaka-network  # Join shared network
      - traefik-network      # Join Traefik routing

networks:
  alifpustaka-network:
    external: true           # Use existing network
  traefik-network:
    external: true           # Use existing network
```

**Result:** All projects can communicate internally via container names.

---

## Container Communication

### Using Container Names

```bash
# Instead of localhost, use container name
NEXT_PUBLIC_ADMIN_API_URL="http://alifpustaka-admin-app:3000"

# Not this (won't work in containers)
NEXT_PUBLIC_ADMIN_API_URL="http://localhost:3001"
```

### Service Discovery

Docker automatically handles DNS:
- `alifpustaka-admin-app` resolves to admin container IP
- `alifpustaka-public-site` resolves to public container IP
- All containers on same network can resolve names

---

## Network Lifecycle

### Networks Persist

```bash
# Stop all containers
docker-compose down

# Networks still exist
docker network ls  # ✓ Networks still there

# Containers can reconnect when started
docker-compose up -d
```

### Delete Networks

**Only when you want to remove everything:**

```bash
# 1. Stop all containers using the networks
cd /path/to/public-site
docker-compose down

cd /path/to/admin-app
docker-compose down

cd /path/to/other-projects
docker-compose down

# 2. Delete networks
docker network rm alifpustaka-network
docker network rm traefik-network

# 3. Recreate if needed
docker network create alifpustaka-network
docker network create traefik-network
```

---

## Troubleshooting

### Network not found

```bash
# Error: network alifpustaka-network declared as external, but could not be found
# Solution: Create the network
docker network create alifpustaka-network
```

### Container can't reach another

```bash
# 1. Check both containers are on same network
docker network inspect alifpustaka-network

# 2. Test connectivity from container
docker exec -it alifpustaka-public-site sh
ping alifpustaka-admin-app
wget -qO- http://alifpustaka-admin-app:3000/api/health

# 3. Check container names match
docker ps --format "{{.Names}}"
```

### Network conflict

```bash
# If subnet conflicts with existing network
docker network rm alifpustaka-network
docker network create alifpustaka-network --subnet=172.25.0.0/16
```

---

## Security

### Network Isolation

- **alifpustaka-network:** Only Alif Pustaka containers
- **traefik-network:** Only web-facing containers + Traefik
- Other applications: Separate networks

### Best Practices

1. **Don't expose ports** if using Traefik
2. **Use container names** for internal communication
3. **Firewall rules** on host for additional security
4. **Monitor** network traffic if needed

---

## Next Steps

1. ✅ Create networks (above)
2. Deploy admin app (uses both networks)
3. Deploy public site (uses both networks)
4. Add other subdomain projects (join alifpustaka-network)

---

## Summary

- **alifpustaka-network:** Internal communication, bridge driver, external
- **traefik-network:** External routing, bridge driver, external
- **External = True:** Shared across multiple projects, manually created
- **Bridge Driver:** Default Docker networking, automatic DNS

**Both networks should be created once and shared by all projects.**

---

**Last Updated:** 2026-08-04
