# Use an official Ubuntu runtime as a parent image
FROM ubuntu:latest

# Create a working directory
WORKDIR /home/

# Update and install necessary dependencies
RUN apt-get update -y 
RUN apt-get install nodejs npm -y
RUN apt-get install nano -y 