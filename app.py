import functools
import os
import json

import flask

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

@application.route('/api/popular')
@cached(20)
def follow_popular():
    return json.dumps(v.popular())

@application.route('/api/tags/<tag>')
@cached(20)
def follow_tag(tag):
    return json.dumps(v.tag(tag))

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
