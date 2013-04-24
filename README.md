vino
====

An application that shows a wall of popular vines, or vines from a specified tag.

Includes a python library for the [Vine.co API](https://github.com/starlock/vino/wiki/API-Reference)

## Quick start

Get and install [libmemcached](http://libmemcached.org/) from their website or from your package manager of choice.

Clone the repo and move into that folder

    git clone git://github.com/starlock/vino.git
    cd vino
    pip install -r requirements.txt

Setup your Vine username and password (in order to have a Vine password, you need to visit your profile in the app,
set an e-mail address and then choose "Reset password")

    export VINO_USER="your_username_here"
    export VINO_PASSWORD="your_password_here"

Start the server

    python app.py

## Tests

To run the tests, you need `nose` and `mock`. Just run

    nosetests
