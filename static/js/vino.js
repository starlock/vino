// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

var Vino = (function($) {
    var video = 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk';

    var cls = function(options) {
        this.queue = [];
        this.onScreen = [];

        this.options = options;
        this.videoContainer = $('#videos');
        this.documentNode = $(document);

        this.videosPerRow = this.options.videosPerRow || 5;

        this.synchronizeCanvasSize();
        this.initEventListeners();
        this.reload();
    };

    cls.prototype = {
        initEventListeners: function() {
            var self = this;
            var resize = function() {
                self.synchronizeCanvasSize();
                self.redraw();
            };

            $(window).resize(function() {
                if (self._resizeTimeout) {
                    clearTimeout(self._resizeTimeout);
                }
                self._resizeTimeout = setTimeout(resize, 1000);
            });
        },

        synchronizeCanvasSize: function() {
            this.canvasSize = {
                width: this.documentNode.width(),
                height: this.documentNode.height()
            };
        },

        reload: function() {
            var self, callback, endpoint;

            if (this.options.popular) {
                endpoint = this.generateEndpointURL('popular');
            } else {
                endpoint = this.generateTagURL(this.options.tag);
            }

            self = this;
            $.get(endpoint, function(response, textStatus, jqXHR) {
                /*
                var response = {
                    records: [
                        { videoUrl: 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk' },
                        { videoUrl: 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk' },
                        { videoUrl: 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk' },
                        { videoUrl: 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk' },
                        { videoUrl: 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk' },
                        { videoUrl: 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk' },
                        { videoUrl: 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk' },
                        { videoUrl: 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk' },
                        { videoUrl: 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk' },
                        { videoUrl: 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk' },
                        { videoUrl: 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk' },
                        { videoUrl: 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk' },
                        { videoUrl: 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk' },
                        { videoUrl: 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk' },
                    ]
                };
                */
                self.store(response);
                self.redraw();
            }, 'json');
        },

        store: function(data) {
            var records = data.records;
            if (!records) {
                return false;
            }

            var normalized, count, queue;

            queue = this.queue;
            count = records.length;
            for (var i = 0; i < count; i++) {
                current = records[i];
                queue.push({
                    id: current.postId,
                    video: current.videoUrl,
                    description: current.description,
                    username: current.username,
                    avatarUrl: current.avatarUrl,
                    likes: current.likes.count
                });
            }
        },

        calculateVideoWidth: function() {
            return this.canvasSize.width / this.videosPerRow;
        },

        redraw: function() {
            var container = this.videoContainer;
            container.empty();

            this.draw();
        },

        draw: function() {
            var queue = this.queue;
            if (!queue.length) {
                return;
            }

            var container, width, count, current, onScreen;

            onScreen = this.onScreen;
            container = this.videoContainer;
            width = this.calculateVideoWidth();
            count = queue.length;

            for (var i = 0; i < count; i++) {
                current = queue[i];
                html = this.generateVideoHtml(current, width);
                container.append(html);

                queue.remove(i);
                onScreen.push(current);
            }
        },

        generateVideoHtml: function(record, width) {
            var overlay = $('<div class="overlay">'
                        + '<div class="description">' + record.description + '</div>'
                        + '<div class="username">' + record.username + '</div>'
                        + '<div class="likes">' + record.likes + ' likes</div>'
                        + '</div>');

            var video = $('<video autoplay loop>'
                        + '<source src="' + record.video + '">'
                        + '</video>');
            overlay.css('width', width);
            video.css('width', width)
                 .css('height', width);
            video[0].volume = 0;
            video.hover(function() { this.volume = 1; }, function() { this.volume = 0; });

            var container = $('<li>');
            container.append(overlay).append(video);

            return container;
        },

        generateEndpointURL: function(endpoint) {
            var origin = document.location.origin;
            return origin + '/api/' + endpoint;
        },

        generateTagURL: function(tag) {
            var endpoint = 'tags/' + encodeURIComponent(tag);
            return this.generateEndpointURL(endpoint);
        }
    };

    return cls;
})(window.jQuery || {});
