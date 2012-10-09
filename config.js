require.config({

  deps: ['boot'],

  paths: {

    jquery:          'boilerplate/libs/jquery',
    lodash:          'boilerplate/libs/lodash',
    backbone:        'boilerplate/libs/backbone',

    layoutmanager:   'boilerplate/libs/backbone.layoutmanager',
    routefilter:     'boilerplate/libs/backbone.routefilter',
    queryparams:     'boilerplate/libs/backbone.queryparams',

    timeago:         'boilerplate/libs/jquery.timeago',
    iframetransport: 'boilerplate/libs/jquery.iframe-transport',

    chosen:          'boilerplate/libs/chosen',
    prettyCheckable: 'boilerplate/libs/prettyCheckable',
    bootstrap:       'boilerplate/libs/bootstrap',
    kendoui:         'boilerplate/libs/kendoui',

    modal:           'boilerplate/libs/backbone.bootstrap-modal'

  },

  shim: {
    backbone: {
      deps: ['lodash', 'jquery'],
      exports: 'Backbone',
      init: function() {

        this.Backbone.Module = function(additionalProps) {
          return _.extend({ Views: {} }, additionalProps);
        };

        this.Backbone.FetchParallel = function(callback /* , modelsToFetch */) {
          $.when.apply(
            null,
            _(arguments).chain().toArray().slice(1).flatten().map(function(model) {
              return model.fetch().done();
            }).value()
          ).done(callback);
        };

        // See https://github.com/tbranyen/backbone.layoutmanager/issues/158
        this.Backbone.View.prototype.reset = function() {
          if(this.__manager__ && this.__manager__.viewDeferred && this.__manager__.viewDeferred.done) {
            this.__manager__.viewDeferred.done(this.render);
          }
          else {
            this.render();
          }
        };

        return this.Backbone;
      }
    },

    layoutmanager:   ['backbone'],
    routefilter:     ['backbone'],
    queryparams:     ['backbone'],

    bootstrap:       ['jquery'],
    chosen:          ['jquery'],
    prettyCheckable: ['jquery'],
    kendoui:         ['jquery'],
    timeago:         ['jquery'],
    iframetransport: ['jquery']

  }

});
