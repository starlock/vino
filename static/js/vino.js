// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};


var Vino = (function($) {
    // Not entirely sure about these values...
    var VIDEO_SIZE = {
        width: 481,
        height: 483
    };

    var API_PAGE_LIMIT = 20;

    var cls = function(options) {
        this.options = options;
        this.selectedContainer = null;
        this.loopTimer = null;

        this.page = 0;
        this.hasNextPage = false;
        this.lastResponse = {};
        this.isLoading = false;

        this.videoContainer = $('#videos');
        this.documentNode = $(document);

        this.videosPerRow = this.options.videosPerRow || 5;

        this._queue = [];
        this.synchronizeCanvasSize();
        this.initEventListeners();
        this.load();
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

            var header = $('#header');
            this.videoCanvasHeight = this.canvasSize.height - header.height();
        },

        load: function(drawOnResponse) {
            var self, callback, endpoint;
            if (drawOnResponse !== false) {
                drawOnResponse = true;
            }

            this.page += 1;

            if (this.options.popular) {
                endpoint = this.generateEndpointURL('popular', this.page);
            } else {
                endpoint = this.generateTagURL(this.options.tag, this.page);
            }

            self = this;
            this.isLoading = true;
            $.get(endpoint, function(response, textStatus, jqXHR) {
                this.lastResponse = response;
                if (response.nextPage !== null) {
                    self.hasNextPage = true;
                }

                self.queue(response);
                self.isLoading = false;

                if (self.page === 1 || drawOnResponse) {
                    self.draw();
                } else {
                    self.setDrawTimeout(10000);
                }
            }, 'json');
        },

        setLoadTimeout: function(milliseconds) {
            var self = this;
            this._loadTimeout = setTimeout(function() {
                if (self.isDrawing) {
                    // Try again later
                    self.setLoadTimeout();
                } else {
                    self.load();
                }
            }, milliseconds);
        },

        clearLoadTimeout: function() {
            if (this._loadTimeout) {
                clearTimeout(this._loadTimeout);
            }
        },

        queue: function(data) {
            var records = data.records;
            if (!records) {
                return false;
            }

            var normalized, count, q;

            q = this._queue;
            count = records.length;

            for (var i = 0; i < count; i++) {
                current = records[i];
                q.push({
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

        calculateVideoHeight: function(width) {
            var ratio = width / VIDEO_SIZE.width;
            return VIDEO_SIZE.height * ratio;
        },

        swapVideos: function(videos, next) {
            var videoCount = videos.length;
            var index = Math.floor(Math.random() * videoCount - 1) + 1;

            var delay = index * 1500;
            setTimeout(function() {
                $(videos.get(index)).replaceWith(next);
            }, delay);
        },

        redraw: function() {
            var container = this.videoContainer;
            container.empty();

            // Reset queue to current page in order to redraw
            this.queue(this.lastResponse);
            this.load(true);
        },

        draw: function() {
            this.clearDrawTimeout();

            var q = this._queue;
            if (!q.length) {
                return;
            }

            this.isDrawing = true;

            var container, width, height,
                count, current;

            container = this.videoContainer;
            width = this.calculateVideoWidth();
            height = this.calculateVideoHeight(width);

            var remainingHeight = this.videoCanvasHeight;

            var onScreenNodes = container.children();
            count = onScreenNodes.length || q.length;

            var isLastInRow;
            for (var i = 0; i < count; i++) {
                current = q[i];

                html = this.generateVideoHtml(current, width, height);
                if (onScreenNodes.length) {
                    this.swapVideos(onScreenNodes, html);
                } else {
                    container.append(html);
                }

                isLastInRow = !((i + 1) % this.videosPerRow);
                if (isLastInRow) {
                    remainingHeight -= height;
                    if (remainingHeight <= 0) {
                        break;
                    }
                }
            }

            q.splice(0, i + 1);
            count = q.length;

            this.isDrawing = false;

            onScreenNodes = container.children();
            if (this.hasNextPage && onScreenNodes.length > count) {
                this.setLoadTimeout(10000);
                return;
            }

            if (!count) {
                return;
            }

            this.setDrawTimeout(20000);
        },

        setDrawTimeout: function(milliseconds) {
            var self = this;
            this._drawTimeout = setTimeout(function() {
                if (self.isLoading) {
                    // Try again later
                    self.setDrawTimeout();
                } else {
                    self.draw();
                }
            }, milliseconds);
        },

        clearDrawTimeout: function() {
            if (this._drawTimeout) {
                clearTimeout(this._drawTimeout);
            }
        },

        setSelected: function(container) {
            try { clearTimeout(this.loopTimer) } catch(e) {}
            if (this.selectedContainer) {
                $(this.selectedContainer).removeClass('selected')
                                         .find('video')[0].volume = 0;
            }
            this.selectedContainer = container;
            $(this.selectedContainer).addClass('selected')
                                     .find('video')[0].volume = 1;
        },

        setRandom: function(self) {
            var videos = $('li');
            var random = videos.eq(Math.floor(Math.random() * videos.length));
            self.setSelected(random);
            self.loopTimer = setTimeout(function() { self.setRandom(self)}, 6000);
        },

        generateVideoHtml: function(record, width, height) {
            var overlay = $('<div class="overlay">'
                        + '<div class="description">' + record.description + '</div>'
                        + '<div class="username">' + record.username + '</div>'
                        + '<div class="likes">' + record.likes + ' likes</div>'
                        + '</div>');

            overlay.css('width', width);

            var video = $('<video autoplay loop>'
                        + '<source src="' + record.video + '">'
                        + '</video>');

            video.css('width', width)
                 .css('height', height);
            video[0].volume = 0;

            var container = $('<li>');
            container.append(overlay).append(video);
            var self = this;
            container.hover(function() { self.setSelected(this) }, function() { self.setRandom(self); });

            return container;
        },

        generateEndpointURL: function(endpoint, page) {
            page = page || 1;
            var origin = document.location.origin;
            return origin + '/api/' + endpoint + '/' + page;
        },

        generateTagURL: function(tag, page) {
            var endpoint = 'tags/' + encodeURIComponent(tag);
            return this.generateEndpointURL(endpoint);
        }
    };

    return cls;
})(window.jQuery || {});
