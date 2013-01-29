import functools
import os
import json

import flask
from flask import request

import vine

application = flask.Flask(__name__)

application.debug=True

def cached(time=None):
    def _cached(f):
        @functools.wraps(f)
        def _f(*args, **kwargs):
            key = "%s__%s__%s" % (f.func_name, args, kwargs)
            data = mc.get(key)
            if not data:
                data = f(*args, **kwargs)
                mc.set(key, data, time=time)
            return data
        return _f
    return _cached

def json_endpoint(f):
    @functools.wraps(f)
    def _json_endpoint(*args, **kwargs):
        return flask.Response(json.dumps(f(*args, **kwargs)), content_type="application/json")
    return _json_endpoint

@application.route('/api/popular', defaults={"page": None})
@application.route('/api/popular/<int:page>')
@cached(20)
@json_endpoint
def api_popular(page):
    return v.popular(page=page)

@application.route('/api/tags/<tag>', defaults={"page": None})
@application.route('/api/tags/<tag>/<int:page>')
@cached(20)
@json_endpoint
def api_tag(tag, page):
    return v.tag(tag, page=page)

@application.route('/')
def show_popular():
    return flask.render_template('tag.html', popular=True)

@application.route('/<tag>')
def show_tag(tag):
    return flask.render_template('tag.html', tag=tag)


if __name__ == '__main__':
    # The Vine API
    v = vine.Vine()
    v.login(os.environ["VINO_USER"], os.environ["VINO_PASSWORD"])

    # Memcached if available
    if "MEMCACHE_SERVERS" in os.environ:
        import pylibmc
        mc = pylibmc.Client(
            servers=[os.environ.get("MEMCACHE_SERVERS")],
            username=os.environ.get("MEMCACHE_USERNAME"),
            password=os.environ.get("MEMCACHE_PASSWORD"),
            binary=True)
    else:
        class MemcacheDummy(object):
            def get(self, *args):
                return None

            def set(self, *args, **kwargs):
                return None

        mc = MemcacheDummy()

    # The application itself
    port = int(os.environ.get("PORT", 5000))
    application.run(host="0.0.0.0", port=port)
