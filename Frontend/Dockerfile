FROM node:20 AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install -g @angular/cli@17
RUN npm install
COPY . .
RUN ng build --configuration production

FROM nginx:alpine
# Remove default Nginx files
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/chess-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80