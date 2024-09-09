FROM node:lts

# Set up the environment
WORKDIR /app

EXPOSE 3000

ENTRYPOINT ["/app/scripts/docker_entrypoint.sh"]

CMD ["bin/www"]

# Build the image
COPY . /app

RUN scripts/bootstrap.sh --prod
