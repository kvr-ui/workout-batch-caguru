FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_ZOHO_FLOW_WEBHOOK_URL=""
ARG VITE_LEAD_SOURCE="CAGURU WB"
ENV VITE_ZOHO_FLOW_WEBHOOK_URL=$VITE_ZOHO_FLOW_WEBHOOK_URL \
    VITE_LEAD_SOURCE=$VITE_LEAD_SOURCE
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
