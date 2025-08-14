#!/bin/bash

sudo docker compose down --remove-orphans 
sudo docker compose pull
sudo docker compose up -d