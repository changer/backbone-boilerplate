define([
  'jquery',
  'backbone',
  'lodash',
  'boilerplate/loading',
  'layoutmanager',
  'routefilter'
],

function($, Backbone, _, loading) {

  window.console = window.console || { log: function() {} };

  return function(app) {

    // See https://github.com/tbranyen/backbone.layoutmanager/issues/158
    Backbone.View.prototype.reset = function() {
      if(this.__manager__ && this.__manager__.viewDeferred && this.__manager__.viewDeferred.done) {
        this.__manager__.viewDeferred.done(this.render);
      }
      else {
        this.render();
      }
    };

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
    $.ajaxSetup({
      beforeSend: function() {
        if(this.url.indexOf(app.baseUrl) === 0) {
          loading();
        }
      },
      complete: function() {
        if(this.url.indexOf(app.baseUrl) === 0) {
          loading(true);
        }
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
            done(JST[path] = _.template(contents));
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
          if(attr) {
            context = _(context).extend(attr);
          }
          path = app.root + Backbone.LayoutManager.prototype.options.paths.template + path + '.html';
          if(!JST[path]) {
            // TODO: for now we're synchronous here, might be nice to solve using async
            JST[path] = _.template($.ajax({ async: false, url: path }).responseText);
          }
          var result = $(JST[path].call(context, { partial: partial, model: context })).addClass(className);
          return $('<div />').append(result).html();
        };
        return template($.extend({
          partial: partial,
          data: context
        }, context));
      }
    });

    app = _.extend(app, {
      module: function(additionalProps) {
        return _.extend({ Views: {} }, additionalProps);
      },
      loading: loading,
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

        this.layout = layout;
        return this.layout;
      }
    }, Backbone.Events);

    app.start = function(router) {

      app.router = new router();

      Backbone.history.start({ pushState: true, root: app.root });

      if (/_=_/.test(window.location.pathname)) {
        Backbone.history.navigate('/', true);
      }

      $(document).on('click', 'a:not([data-bypass])', function(e) {
        var href = { prop: $(this).prop('href'), attr: $(this).attr('href') };
        var root = location.protocol + '//' + location.host + app.root;

        if (href.prop && href.prop.slice(0, root.length) === root) {
          e.preventDefault();
          Backbone.history.navigate(href.attr, true);
        }
      });

      var android = /android/i.test(navigator.userAgent);
      window.scrollTo(0, android ? 1 : 0);

      window.console.log('☆☆☆ ' + (app.name || 'Web App') + ' started ☆☆☆');
    };

    return app;

  };

});
