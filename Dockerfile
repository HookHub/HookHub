FROM node:carbon

# Set up the environment
WORKDIR /app
ENTRYPOINT ["/app/scripts/docker_entrypoint.sh"]
CMD ["bin/www"]
EXPOSE 3000

# General housekeeping
ENV DEBIAN_FRONTEND noninteractive

# Build the image
RUN apt update && apt upgrade -y && apt install git
COPY . /app
RUN cd /app && npm install --production
