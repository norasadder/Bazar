# Use an official Ubuntu runtime as a parent image
FROM ubuntu:latest

# Create a working directory
WORKDIR /home/

# Update and install necessary dependencies
RUN apt-get update -y 
RUN apt-get install nano -y 

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
