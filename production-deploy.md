# Production Deployment Guide - Greetify

## Recommended Platforms
1. **Render.com**: Easiest for dual Node/Java setups.
2. **Google Cloud Run**: Highly scalable for Docker containers.
3. **AWS App Runner**: Managed container service.

## Deployment Steps (General Docker)
1. **MongoDB Atlas**:
   - Create a free tier cluster.
   - Whitelist `0.0.0.0/0` (or specific IPs).
   - Get the connection string.

2. **Backend**:
   - Push the `backend-node` image to a registry.
   - Set `MONGO_URI` environment variable.

3. **Frontend**:
   - Push the `frontend-java` image.
   - Set `API_BASE_URL` to point to the backend service.

4. **Security**:
   - Add Basic Auth or an API Key to the `/api/contacts/import` endpoint.
   - Ensure the MongoDB user has limited permissions.
