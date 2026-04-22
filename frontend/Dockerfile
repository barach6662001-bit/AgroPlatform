# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Public demo mode — when true, site auto-logs in as the demo user and
# skips the login screen entirely. Defaults to true for this branch (user
# explicitly requested the site be open as a regular user). To restore the
# normal login flow, change the default below to `false` and redeploy.
# Flip via build-arg in CI: --build-arg VITE_PUBLIC_DEMO_MODE=false
ARG VITE_PUBLIC_DEMO_MODE=true
ARG VITE_PUBLIC_DEMO_EMAIL=demo@agro.local
ARG VITE_PUBLIC_DEMO_PASSWORD=DemoPass1
ENV VITE_PUBLIC_DEMO_MODE=$VITE_PUBLIC_DEMO_MODE \
    VITE_PUBLIC_DEMO_EMAIL=$VITE_PUBLIC_DEMO_EMAIL \
    VITE_PUBLIC_DEMO_PASSWORD=$VITE_PUBLIC_DEMO_PASSWORD

RUN npm run build

# Stage 2: Serve
FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
