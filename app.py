import os
import flask
import json

import vine

application = flask.Flask(__name__)

application.debug=True

@application.route('/')
def follow_popular():
    return "Following popular"

@application.route('/<tag>')
def follow_tag(tag):
    return json.dumps(v.tag(tag))

if __name__ == '__main__':
    v = vine.Vine()
    v.login(os.environ["VINO_USER"], os.environ["VINO_PASSWORD"])

    port = int(os.environ.get("PORT", 5000))
    application.run(host="0.0.0.0", port=port)
