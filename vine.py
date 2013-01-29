# coding: utf-8

import json
import requests

BASE_URL = "https://api.vineapp.com/"

class Vine(object):
    def __init__(self):
        self._user_id = None
        self._key = None

    def login(self, username, password):
        response = self._call("users/authenticate", username=username, password=password)
        self._user_id = response["data"]["userId"]
        self._key = response["data"]["key"]

    def tag(self, tag_):
        return self._call("timelines/tags/%s" % tag_)

    def _call(self, call, **params):
        """Make an API call. Return the parsed response. If login has
        been called, make an authenticated call.
        """
        url = BASE_URL + call
        headers = {"User-Agent": "com.vine.iphone/1.0.3 (unknown, iPhone OS 6.0.1, iPhone, Scale/2.000000)",
                   "Accept-Language": "en, sv, fr, de, ja, nl, it, es, pt, pt-PT, da, fi, nb, ko, zh-Hans, zh-Hant, ru, pl, tr, uk, ar, hr, cs, el, he, ro, sk, th, id, ms, en-GB, ca, hu, vi, en-us;q=0.8"}
        if self._key:
            headers["vine-session-id"] = self._key

        if params:
            r = requests.post(url, data=params, headers=headers)
        else:
            r = requests.get(url, headers=headers)

        return r.json()
