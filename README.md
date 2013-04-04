vino
====

An application that shows a wall of popular vines, or vines from a specified tag.

Includes a python library for the [Vine.co API](https://github.com/starlock/vino/wiki/API-Reference)

## Quick start

Clone the repo & move into that folder

    git clone git://github.com/starlock/vino.git
    cd vino
    pip install -r requirements.txt
    
Setup your Vine username & password

	export VINO_USER="your_username_here"
	export VINO_PASSWORD="your_password_here"
	
Start the server

	python app.py
