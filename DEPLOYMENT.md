# Deployment Guide

This guide covers deploying the Weather Route App to various platforms.

## Vercel (Recommended)

Vercel is the recommended platform for deploying Next.js applications.

### Steps:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Import your repository
   - Add environment variables:
     ```
     OPENROUTESERVICE_API_KEY=your_key
     OPENWEATHER_API_KEY=your_key
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
     ```
   - Deploy

3. **Configure Domain** (optional):
   - Add custom domain in project settings
   - Update Google Maps API key restrictions

## Netlify

### Steps:

1. **Build Configuration**:
   Create `netlify.toml`:
   ```toml
   [build]
     command = "bun run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"

   [build.environment]
     NODE_VERSION = "18"
   ```

2. **Deploy**:
   - Connect GitHub repository to Netlify
   - Add environment variables in site settings
   - Deploy

## Railway

### Steps:

1. **Connect Repository**:
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub repo

2. **Configure**:
   - Add environment variables
   - Railway will auto-detect Next.js and deploy

## Docker (Self-hosted)

### Dockerfile:

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN npm install -g bun && bun install --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g bun && bun run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose:

```yaml
version: '3.8'
services:
  weather-route-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENROUTESERVICE_API_KEY=${OPENROUTESERVICE_API_KEY}
      - OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
      - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
```

## Environment Variables

Make sure to set these environment variables on your deployment platform:

### Required:
- `OPENROUTESERVICE_API_KEY` - Your OpenRouteService API key
- `OPENWEATHER_API_KEY` - Your OpenWeatherMap API key  
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Your Google Maps API key

### Optional:
- `NODE_ENV=production` - Set to production
- `NEXTAUTH_URL` - Your app's URL (if using NextAuth.js in future)

## Performance Optimization

### For Production:

1. **Enable Static Exports** (if needed):
   ```js
   // next.config.js
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     trailingSlash: true,
     images: {
       unoptimized: true
     }
   }
   module.exports = nextConfig
   ```

2. **Bundle Analysis**:
   ```bash
   bun add @next/bundle-analyzer
   ```

3. **Optimize Images**:
   - Use Next.js Image component
   - Configure image domains in next.config.js

## Security Considerations

1. **API Key Security**:
   - Never expose server-side API keys to client
   - Use environment variables
   - Restrict API keys to your domain

2. **HTTPS**:
   - Always use HTTPS in production
   - Google Maps requires HTTPS for geolocation

3. **Rate Limiting**:
   - Monitor API usage
   - Implement client-side rate limiting if needed

## Monitoring

### Recommended Tools:
- **Vercel Analytics** - Built-in for Vercel deployments
- **Google Analytics** - Web analytics
- **Sentry** - Error tracking
- **LogRocket** - Session replay

### Adding Sentry (Error Tracking):

```bash
bun add @sentry/nextjs
```

```js
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version (use 18+)
   - Ensure all dependencies are installed
   - Check for TypeScript errors

2. **API Failures**:
   - Verify environment variables are set
   - Check API key validity
   - Monitor rate limits

3. **Map Not Loading**:
   - Verify Google Maps API key
   - Check domain restrictions
   - Ensure HTTPS is enabled

### Build Commands:

```bash
# Local development
bun dev

# Production build
bun build

# Start production server
bun start

# Type checking
bun run type-check

# Linting
bun run lint
```
