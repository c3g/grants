FROM node:8

# Binds to port 3001
EXPOSE 3001

# Working directory for application
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy application data
COPY . .

# Expose files volume
RUN mkdir -p /usr/share/app
VOLUME [ "/usr/share/app" ]

# Expose config volume
RUN mkdir -p /usr/etc
VOLUME [ "/usr/etc" ]

#CMD ["./wait_for_it.sh", "postgres:5432", "--", "npm", "run", "start:dev"]
