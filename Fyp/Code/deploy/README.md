# deploy


# Development

## Prerequisites
To run the development server, we need to make sure we have prerequisites in place:
- Docker
- Docker network

To install dependencies:

### Debian-based Linux
```
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done
curl -fsSL https://get.docker.com | sudo sh
```
Create the network if it does not exist:
```
sudo docker network ls | grep -q deploy_net || sudo docker network create deploy_net
```

### Windows
To install on Windows, follow this URL: [Install Docker Desktop on Windows](https://docs.docker.com/desktop/setup/install/windows-install/)

Create the network:
```
docker network create deploy_net
```

## Run dev server
The dev server can be easily run using docker compose.

### Linux
```
sudo docker compose up -d
```

### Windows
```
docker compose up -d
```
