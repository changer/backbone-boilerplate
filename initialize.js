define([
  'boilerplate/boot',
  'boilerplate/loading',
  'layoutmanager',
  'routefilter',
  'toe'
],

function(boot, loading) {

  window.console = window.console || { log: function() {} };
  var html = $('html'), body = $('body');

  return function(app) {

    if(app.live) {
      // Inject global afterRender trigger for loading our live jquery stuff
      var viewRender = Backbone.Layout._viewRender;
      Backbone.Layout._viewRender = function(root) {
        root.on('afterRender', function() {
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
        if(this.url.indexOf(app.baseUrl) === 0) {
          loading();
        }
        if(beforeSend) {
          return beforeSend.apply(this, _.toArray(arguments));
        }
      },
      complete: function() {
        if(this.url.indexOf(app.baseUrl) === 0) {
          loading(true);
        }
        return complete && complete();
      }
    });

    // Localize or create a new JavaScript Template object.
    var JST = window.JST = window.JST || {};

    // Configure LayoutManager with Backbone Boilerplate defaults.
    Backbone.Layout.configure({
      manage: true,

      prefix: app.prefix,

      fetch: function(path) {
        path = path + '.html';
        if (JST[path]) {
          return JST[path];
        }
        else {
          var done = this.async();
          return $.ajax({ url: app.root + path }).then(function(contents) {
            done(JST[path] = _.template(contents, null, { variable: 'context', sourceURL: path }));
          });
        }
      },

      // use in templates to render partial templates, like: <%= partial('template', model.partialModel) %>
      render: function(template, context) {
        var partial = function(path, context, className, attr) {
          if(typeof(className) !== 'string') {
            attr = className;
            className = '';
          }
          attr = _(_(context || {}).clone()).extend(attr || {});
          attr.partial = partial;
          path = Backbone.Layout.prototype.options.prefix + path + '.html';
          if(!JST[path]) {
            // TODO: for now we're synchronous here, might be nice to solve using async
            JST[path] = _.template($.ajax({ async: false, url: app.root + path }).responseText, null, { variable: 'context', sourceURL: path });
          }
          var result = $($.trim(JST[path].call(context, attr))).addClass(className);
          return $('<div />').append(result).html();
        };
        // Return trimmed version of template, however always at least an empty space for preventing caching issues
        return $.trim(template($.extend({
          partial: partial
        }, context))) || ' ';
      }
    });

    var mobile = /(android|mobile)/i.test(navigator.userAgent),
        phone = /(android|phone)/i.test(navigator.userAgent),
        android = /android/i.test(navigator.userAgent),
        embedded = !/https?:\/\//.test(document.location.href);

    app = _.extend(app, {
      loading: loading,
      mobile: mobile,
      phone: phone,
      android: android,
      embedded: embedded,
      clickEvent: mobile ? 'tap' : 'click',
      useLayout: function(name, options) {
        var app = this,
            oldLayout = this.layout,
            layout = new Backbone.Layout(_.extend({
              name: name,
              template: name,
              className: 'layout ' + name
            }, options));

        layout.bind('afterRender', function() {
          return app.switchLayout && app.switchLayout(oldLayout, layout);
        });

        layout.renderOnFetch = function() {
          Backbone.FetchParallel(_.bind(this.render, this), _(arguments).toArray());
        };

        this.layout = layout;
        return this.layout;
      }
    }, Backbone.Events);

    app.start = function(router, options) {

      if(app.mobile) {
        html.addClass('mobile');
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
      options.root = options.root || app.root;
      options.pushState = options.pushState === false ? false : !app.embedded;
      options.bypassSelectors = options.bypassSelectors || 'a[href]:not([data-bypass])';
      options.alwaysReload = options.alwaysReload || false;

      app.router = new router();

      Backbone.history.start(options);

      if (/_=_/.test(window.location.pathname)) {
        Backbone.history.navigate('/', true);
      }

      body.on(app.clickEvent, options.bypassSelectors, function(e) {
        var link = $(this),
            href = {
              prop: link.prop('href'),
              attr: link.attr('href')
            },
            root = /^http/.test(app.root) ? app.root : (location.protocol + '//' + location.host + app.root);

        if((/^file:\/\/\//.test(href.prop) || href.prop.slice(0, root.length) === root)) {
          e.preventDefault();
          Backbone.history.reloaded = false;
          if(options.alwaysReload && Backbone.history.fragment === href.attr.replace(/^\/+/, '')) {
            Backbone.history.reloaded = true;
            Backbone.history.loadUrl(href.attr);
          }
          else {
            Backbone.history.navigate(href.attr, true);
          }
        }
      });
      if(app.mobile) {
        body.on('click', 'a:not([data-bypass])', function(e) {
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
