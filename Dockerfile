# Use an official Ubuntu runtime as a parent image
FROM ubuntu:latest

# Create a working directory
WORKDIR /home/

# Update and install necessary dependencies
RUN apt-get update -y 
RUN apt-get install nodejs npm -y
RUN apt-get install nano -y 
<<<<<<< HEAD
=======

>>>>>>> 1076749936897ee6b1a3fff3afd9e64d778900f0
