# coding: utf-8

import json
import logging

import requests

BASE_URL = "https://api.vineapp.com/"

class VineError(Exception):
    def __init__(self, response):
        self.code = response["code"]
        self.message = response["error"]

    def __str__(self):
        return str(self.message)

class Vine(object):
    def __init__(self):
        self._user_id = None
        self._key = None

    def login(self, username, password):
        response = self._call("users/authenticate", data={"username": username, "password": password})
        self._user_id = response["data"]["userId"]
        self._key = response["data"]["key"]

    def tag(self, tag_, page=None, size=None):
        return self._call("timelines/tags/%s" % tag_, params={"page": page, "size": size})["data"]

    def popular(self, page=None, size=None):
        return self._call("timelines/popular", params={"page": page, "size": size})["data"]

    def venues(self, venue_id_, page=None, size=None):
        return self._call("timelines/venues/%s" % venue_id_, params={"page": page, "size": size})["data"]

    def get_user_timeline(self, userid_, page=None, size=None):
        return self._call("timelines/users/%s" % userid_, params={"page": page, "size": size})["data"]

    def get_post(self, postid_, page=None, size=None):
        return self._call("timelines/posts/%s" % postid_, params={"page": page, "size": size})["data"]

    def search_user(self, username_, page=None, size=None):
        return self._call("users/search/%s" % username_, params={"page": page, "size": size})["data"]

    def search_tag(self, tag_, page=None, size=None):
        return self._call("tags/search/%s" % tag_, params={"page": page, "size": size})["data"]

    def get_authorized_user(self, page=None, size=None):
        return self._call("users/me", params={"page": page, "size": size})["data"]

    def get_user_profile(self, userid_, page=None, size=None):
        return self._call("users/profiles/%s" % userid_, params={"page": page, "size": size})["data"]

    def _call(self, call, params=None, data=None):
        """Make an API call. Return the parsed response. If login has
        been called, make an authenticated call. If data is not None,
        it's a post request.
        """
        url = BASE_URL + call
        headers = {"User-Agent": "com.vine.iphone/1.0.3 (unknown, iPhone OS 6.0.1, iPhone, Scale/2.000000)",
                   "Accept-Language": "en, sv, fr, de, ja, nl, it, es, pt, pt-PT, da, fi, nb, ko, zh-Hans, zh-Hant, ru, pl, tr, uk, ar, hr, cs, el, he, ro, sk, th, id, ms, en-GB, ca, hu, vi, en-us;q=0.8"}
        if self._key:
            headers["vine-session-id"] = self._key

        if data:
            r = requests.post(url, params=params, data=data, headers=headers, verify=False)
        else:
            r = requests.get(url, params=params, headers=headers, verify=False)

        try:
            data = r.json()
            if data.get("success") is not True:
                raise VineError(data)
            return data
        except:
            logging.error(r.text)
            raise
        
