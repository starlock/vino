var Vino = (function($) {
    var video = 'http://vines.s3.amazonaws.com/videos_500k/A50E183B-9655-4677-AD76-50BFADDE847C-999-00000067BE55B8F8_1.0.3.mp4?versionId=5yZiEhDHzx60D.tuFt3NJPa1Lh3MAdgk';

    var cls = function(options) {
        this.data = {};
        this.options = options;
        this.videoContainer = $('#videos');
        this.documentNode = $(document);

        this.videosPerRow = this.options.videosPerRow || 3;

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
            this.data = data;
        },

        calculateVideoWidth: function() {
            return this.canvasSize.width / this.videosPerRow;
        },

        redraw: function() {
            var container = this.videoContainer;
            container.empty();

            var records = this.data.records;
            if (!records) {
                console.log('No records');
                return;
            }

            console.log('Redrawing');
            var width = this.calculateVideoWidth();

            var count = records.length;
            for (var i = 0; i < count; i++) {
                html = this.generateVideoHtml(records[i], width);
                container.append(html);
            }
        },

        generateVideoHtml: function(record, width) {
            console.log(width);
            var markup = '<li>'
                        + '<video autoplay loop muted width="' + width + '">'
                        + '<source src="' + record.videoUrl + '">'
                        + '</video>'
                        + '</li>';

            return markup;
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
