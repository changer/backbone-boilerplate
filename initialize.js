define([
  'boilerplate/boot',
  'boilerplate/loading',
  'layoutmanager',
  'routefilter',
  'toe'
],

function(boot, loading) {

  window.console = window.console || { log: function() {} };

  return function(app) {

    if(app.live) {
      // Inject global afterRender trigger for loading our live jquery stuff
      var viewRender = Backbone.LayoutManager._viewRender;
      Backbone.LayoutManager._viewRender = function(root) {
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
    Backbone.LayoutManager.configure({
      manage: true,

      paths: app.paths,

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
          path = Backbone.LayoutManager.prototype.options.paths.template + path + '.html';
          if(!JST[path]) {
            // TODO: for now we're synchronous here, might be nice to solve using async
            JST[path] = _.template($.ajax({ async: false, url: app.root + path }).responseText, null, { variable: 'context', sourceURL: path });
          }
          var result = $(JST[path].call(context, attr)).addClass(className);
          return $('<div />').append(result).html();
        };
        return template($.extend({
          partial: partial
        }, context));
      }
    });

    var mobile = /mobile/i.test(navigator.userAgent),
        embedded = !/https?:\/\//.test(document.location.href);

    app = _.extend(app, {
      loading: loading,
      mobile: mobile,
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
        $('html').addClass('mobile');
      }
      if(app.embedded) {
        $('html').addClass('embedded');
      }

      options = options || {};
      options.root = options.root || app.root;
      options.pushState = options.pushState === false ? false : !app.embedded;

      app.router = new router();

      Backbone.history.start(options);

      if (/_=_/.test(window.location.pathname)) {
        Backbone.history.navigate('/', true);
      }

      $('body').on(app.clickEvent, 'a:not([data-bypass])', function(e) {
        var link = $(this),
            href = {
              prop: link.prop('href'),
              attr: link.attr('href')
            },
            root = /^http/.test(app.root) ? app.root : (location.protocol + '//' + location.host + app.root);

        if(href.prop && (/^file:\/\/\//.test(href.prop) || href.prop.slice(0, root.length) === root)) {
          e.preventDefault();
          Backbone.history.navigate(href.attr, true);
        }
      });
      if(app.mobile) {
        $('body').on('click', 'a:not([data-bypass])', function(e) {
          e.preventDefault();
        });
      }

      var android = /android/i.test(navigator.userAgent);
      window.scrollTo(0, android ? 1 : 0);

      window.console.log('☆☆☆ ' + (app.name || 'Web App') + ' started ☆☆☆');

      loading(true);
    };

    return app;

  };

});
