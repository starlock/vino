import os
import flask

application = flask.Flask(__name__)

application.debug=True

@application.route('/')
def follow_popular():
    return "Following popular"

@application.route('/<tag>')
def follow_tag(tag):
    return "Following %s" % tag

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    application.run(host='0.0.0.0', port=port, debug=True)
