# coding: utf-8

from mock import Mock, sentinel, patch
import nose.tools as nt

import vine

class TestLogin(object):
    def setup(self):
        self.vine = vine.Vine()
        self.call_mock = Mock()
        self.vine._call = self.call_mock

    def test_successful_login(self):
        self.call_mock.return_value = {"data": {"userId": sentinel.userId,
                                                "key": sentinel.key}}
        self.vine.login(sentinel.username, sentinel.password)
        self.call_mock.assert_called_once_with("users/authenticate",
                                               data={"username": sentinel.username,
                                                     "password": sentinel.password})
        nt.assert_equals(sentinel.userId, self.vine._user_id)
        nt.assert_equals(sentinel.key, self.vine._key)

    def test_failed_login(self):
        self.call_mock.side_effect = vine.VineError({
            "code": 101, "data": "", "success": False,
            "error": "That username or password is incorrect."})
        with nt.assert_raises(vine.VineError) as ecm:
            self.vine.login(sentinel.username, sentinel.password)
        nt.assert_equals(101, ecm.exception.code)
        nt.assert_equals("That username or password is incorrect.", ecm.exception.message)

@patch("vine.requests")
class TestCall(object):
    def setup(self):
        self.vine = vine.Vine()

    def test_successful_get(self, requests_mock):
        requests_mock.get.return_value.json.return_value = {"success": True,
                                                            "data": sentinel.data}
        ret = self.vine._call("path", params=sentinel.params)
        nt.assert_equals(1, requests_mock.get.call_count)
        nt.assert_equals(vine.BASE_URL + "path", requests_mock.get.call_args[0][0])
        nt.assert_equals(sentinel.params, requests_mock.get.call_args[1]["params"])
        nt.assert_equals({"success": True, "data": sentinel.data}, ret)

    def test_successful_post(self, requests_mock):
        requests_mock.post.return_value.json.return_value = {"success": True,
                                                             "data": sentinel.data}
        ret = self.vine._call("path", params=sentinel.params, data=sentinel.data)
        nt.assert_equals(1, requests_mock.post.call_count)
        nt.assert_equals(vine.BASE_URL + "path", requests_mock.post.call_args[0][0])
        nt.assert_equals(sentinel.params, requests_mock.post.call_args[1]["params"])
        nt.assert_equals(sentinel.data, requests_mock.post.call_args[1]["data"])
        nt.assert_equals({"success": True, "data": sentinel.data}, ret)

    def test_logged_in_call(self, requests_mock):
        """If the Vine object has a _key (as received by Vine.login), it is sent
        as the header vine-session-id
        """
        requests_mock.get.return_value.json.return_value = {"success": True}
        self.vine._key = sentinel.key
        ret = self.vine._call("path")
        nt.assert_equals(
            sentinel.key, requests_mock.get.call_args[1]["headers"]["vine-session-id"])

    def test_impersonates_headers(self, requests_mock):
        """We try (half-heartedly) to set headers that look like what
        the official client sets.
        """
        requests_mock.get.return_value.json.return_value = {"success": True}
        ret = self.vine._call("path")
        nt.assert_true(
            "com.vine.iphone" in requests_mock.get.call_args[1]["headers"]["User-Agent"])
        nt.assert_true("Accept-Language" in requests_mock.get.call_args[1]["headers"])

    def test_unsuccessful_call(self, requests_mock):
        """If the returned json doesn't contain a key 'success' with value true,
        a VineError is raised.
        """
        requests_mock.get.return_value.json.return_value = {"success": False,
                                                            "code": sentinel.code,
                                                            "error": sentinel.error}
        with nt.assert_raises(vine.VineError) as ecm:
            self.vine._call("path")
        nt.assert_equals(sentinel.code, ecm.exception.code)
        nt.assert_equals(sentinel.error, ecm.exception.message)

    def test_communication_error(self, requests_mock):
        """Errors raised by requests are passed right through.
        """
        class CommunicationsError(Exception):
            pass
        requests_mock.get.side_effect = CommunicationsError()
        with nt.assert_raises(CommunicationsError):
            self.vine._call("path")
