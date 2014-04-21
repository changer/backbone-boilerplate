define([
  'boilerplate/boot',
  'boilerplate/loading',
  'layoutmanager',
  'routefilter',
  'hammer',
  'fastactive'
],

function(boot, loading) {

  window.console = window.console || { log: function() {} };

  var html = $('html'), body = $('body');

  html.hammer({ stop_browser_behavior: false });

  return function(app) {

    if(app.live) {
      // Inject global afterRender trigger for loading our live jquery stuff
      var viewRender = Backbone.Layout.prototype._viewRender;
      Backbone.Layout.prototype._viewRender = function() {
        var root = this;
        root.bind('afterRender', function() {
          app.live(root.el);
        });
        return viewRender.apply(this, Array.prototype.slice.call(arguments));
      };
    }

    // JQuery Ajax global settings
    var beforeSend = $.ajaxSettings.beforeSend,
        complete = $.ajaxSettings.complete;
    $.ajaxSetup({
      beforeSend: function() {
        if(!this.url) console.log(this);
        if(this.url.indexOf(app.baseUrl) === 0 || this.url.indexOf(app.root + app.prefix) === 0) {
          loading(false, null, this.url);
        }
        return beforeSend && beforeSend.apply(this, _.toArray(arguments));
      },
      complete: function() {
        if(!this.url) console.log(this);
        if(this.url.indexOf(app.baseUrl) === 0 || this.url.indexOf(app.root + app.prefix) === 0) {
          loading(true, null, this.url);
        }
        return complete && complete.apply(this, _.toArray(arguments));
      }
    });

    // Localize or create a new JavaScript Template object.
    var JST = window.JST = window.JST || {};

    // Partial templates
    app.fetchTemplate = function(path, callback) {
      // Replace upward paths
      path = path.replace(/\/[^\/]+\/\.\.\//g, '/');
      var variable = app.templateContextName || 'context';
      var url = app.root + path;
      if(JST[path]) {
        return callback ? callback(JST[path]) : JST[path];
      }
      else if(window.getStaticFile) {
        JST[path] = _.template(getStaticFile(url), null, { variable: variable, sourceURL: path });
        return callback ? callback(JST[path]) : JST[path];
      }
      else if(callback) {
        return $.ajax({ url: url }).then(function(contents) {
          callback(JST[path] = _.template(contents, null, { variable: variable, sourceURL: path }));
        });
      }
      else {
        JST[path] = _.template($.ajax({ url: url, async: false }).responseText, null, { variable: variable, sourceURL: path });
        return JST[path];
      }
    };

    var partial = function(path, context, className, attr) {
          if(typeof(className) !== 'string') {
            attr = className;
            className = '';
          }
          attr = _(_(context || {}).clone()).extend(attr || {});
          attr.partial = partial;
          path = Backbone.Layout.prototype.options.prefix + path + '.html';
          var result = $($.trim(app.fetchTemplate(path).call(context, attr))).addClass(className);
          return $('<div />').append(result).html();
        };

    // Configure LayoutManager with Backbone Boilerplate defaults.
    Backbone.Layout.configure({

      manage: true,
      prefix: app.prefix,

      fetchTemplate: function(path) {
        path = path + '.html';
        return JST[path] || app.fetchTemplate(path, this.async());
      },

      // use in templates to render partial templates
      // like: <%= context.partial('template', model.partialModel) %>
      renderTemplate: function(template, context) {
        // Trim template, at least a space to prevent caching issues
        return $.trim(template($.extend({ partial: partial }, context, app.templateContext))) || ' ';
      }

    });

    var mobile = /(android|mobile)/i.test(navigator.userAgent),
        android = /android/i.test(navigator.userAgent),
        androidBrowser = /mozilla\/5\.0.*?android.*?applewebkit/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent),
        ios = /(iphone|ipad)/i.test(navigator.userAgent),
        phone = /(android|phone)/i.test(navigator.userAgent),
        embedded = !/https?:\/\//.test(document.location.href);

    app = _.extend(app, {
      loading: loading,
      mobile: mobile,
      android: android,
      androidBrowser: androidBrowser,
      ios: ios,
      phone: phone,
      embedded: embedded,
      useLayout: function(name, options) {
        if(this.lazyRendering && this.layout && this.layout.options.name === name) {
          return this.layout;
        }
        var app = this,
            oldLayout = this.layout,
            layout = new Backbone.Layout(_.extend({
              name: name,
              template: name,
              className: 'layout ' + name
            }, options));

        layout.once('afterRender', function() {
          // After the first render, only render explicit views if set
          if(app.explicitRenderViews) {
            layout.render = function() {
              _.each(app.explicitRenderViews, function(view) {
                return layout.views[view] && layout.views[view].render();
              });
              layout.trigger('afterRender');
              return this;
            };
          }
          return app.switchLayout && app.switchLayout(oldLayout, layout);
        });

        layout.renderOnFetch = function() {
          Backbone.FetchParallel(_.bind(this.render, this), _(arguments).toArray());
          return this;
        };

        this.layout = layout;
        if(!this.started) {
          if(window.onBackboneLoad) {
            window.onBackboneLoad(app);
          }
          app.started = true;
        }
        return this.layout;
      }
    }, Backbone.Events);

    app.start = function(router, options) {

      if(app.mobile) {
        html.addClass('mobile');
        if(ios) {
          html.addClass('ios');
        }
        if(android) {
          html.addClass('android');
          if(androidBrowser) {
            html.addClass('android-browser');
          }
        }
      }
      else {
        html.addClass('non-mobile');
      }
      if(app.embedded) {
        html.addClass('embedded');
      }
      else {
        html.addClass('non-embedded');
      }

      options = options || {};
      options.root = options.root || '/';
      options.pushState = options.pushState === false ? false : !app.embedded;
      options.bypassSelectors = options.bypassSelectors || 'a[href]:not([data-bypass])';
      options.alwaysReload = options.alwaysReload || false;
      app.router = new router();

      Backbone.history.start(options);

      if (/_=_/.test(window.location.pathname)) {
        Backbone.history.navigate('/', true);
      }

      html.on('click tap', options.bypassSelectors, function(e) {

        if(e.type === 'click') {
          return e.preventDefault();
        }

        var link = $(this),
            href = {
              prop: link.prop('href'),
              attr: link.attr('href')
            },
            url = href.attr.replace(new RegExp('^' + options.root.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')), ''),
            root = location.protocol + '//' + location.host + options.root;

        if((/^(content|file):\/\/+/.test(href.prop) || href.prop.slice(0, root.length) === root)) {
          e.preventDefault();
          Backbone.history.reloaded = false;
          if(options.alwaysReload && Backbone.history.fragment === url.replace(/^\/+/, '')) {
            Backbone.history.reloaded = true;
            Backbone.history.loadUrl(url);
          }
          else {
            Backbone.history.navigate(url.replace(/^(\/?)#/g, '$1'), true);
          }
        }

      });

      if(app.mobile) {
        body.on('click', options.bypassSelectors, function(e) {
          e.preventDefault();
        });
        html.addClass('untouched');
        body.one('touchstart', function() {
          html.removeClass('untouched');
        });
      }

      if(phone) {
        window.scrollTo(0, android ? 1 : 0);
      }

      window.console.log('☆☆☆ ' + (app.name || 'Web App') + ' started ☆☆☆');

      loading(true);

    };

    return app;

  };

});
