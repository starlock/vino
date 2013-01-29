import os
import flask

application = flask.Flask(__name__)

application.debug=True

@application.route('/')
def hello_world():
    return "Hello world!"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    application.run(host='0.0.0.0', port=port, debug=True)
