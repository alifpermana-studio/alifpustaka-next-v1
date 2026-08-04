# Network Configuration Summary

Quick reference for Docker network setup.

---

## Network Types

### External + Bridge = Shared Network

```yaml
networks:
  alifpustaka-network:
    external: true  # Manually created, shared across projects
    # Driver: bridge (default when created via docker network create)
```

**Explanation:**
- **external: true** = Network exists outside this docker-compose file
- **Driver: bridge** = Default Docker networking (auto DNS, container-to-container)
- **Created manually:** `docker network create alifpustaka-network`

---

## Why This Configuration?

### Your Use Case
> "This network will be used for communication with another subdomain project"

### Solution: External Networks
✅ **Correct approach** because:

1. **Multiple Projects Share Network**
   - Public site (this project)
   - Admin app (separate project)
   - Other subdomain projects
   - All on same `alifpustaka-network`

2. **Persistent**
   - Network survives `docker-compose down`
   - Stopping one project doesn't affect others
   - Manual control over lifecycle

3. **Cross-Project Communication**
   ```bash
   # From public site
   curl http://alifpustaka-admin-app:3000/api/health
   
   # From admin app
   curl http://alifpustaka-public-site:3000/api/health
   
   # From other subdomain
   curl http://alifpustaka-admin-app:3000/api/public/posts
   ```

---

## Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  alifpustaka-network                         │
│              (external: true, bridge driver)                 │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Public Site  │  │  Admin App   │  │   Other      │     │
│  │ (port 3000)  │  │  (port 3000) │  │  Subdomains  │     │
│  │              │  │              │  │              │     │
│  │ Project 1    │  │  Project 2   │  │  Project 3+  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         └────────────────────┴────────────────────┘
              All communicate via container names
              No port conflicts (internal networking)
```

---

## Commands

### Create Networks
```bash
docker network create alifpustaka-network
docker network create traefik-network
```

### Verify Networks
```bash
docker network ls
# NETWORK ID     NAME                  DRIVER    SCOPE
# xxxxxxxxxxxx   alifpustaka-network   bridge    local
# yyyyyyyyyyyy   traefik-network       bridge    local
```

### Inspect Network
```bash
docker network inspect alifpustaka-network
# Shows:
# - Driver: bridge
# - Subnet: (auto-assigned)
# - Connected containers
```

---

## Comparison

### External (Your Setup)
```yaml
networks:
  alifpustaka-network:
    external: true
```
- ✅ Shared across projects
- ✅ Persists after docker-compose down
- ✅ Manual creation required
- ✅ Perfect for multi-project setup

### Non-External (Alternative)
```yaml
networks:
  alifpustaka-network:
    driver: bridge
```
- ❌ Only for this project
- ❌ Deleted with docker-compose down
- ❌ Can't be shared
- ❌ Wrong for your use case

---

## Key Points

1. **External = Shared** - Multiple projects can use it
2. **Bridge = Default** - Docker's standard networking
3. **Manual Creation** - Created once, used by all
4. **Container Names** - DNS resolution automatic
5. **No Port Conflicts** - All use internal networking

---

**See:** [docs/NETWORK-SETUP.md](./docs/NETWORK-SETUP.md) for complete guide

**Last Updated:** 2026-08-04
