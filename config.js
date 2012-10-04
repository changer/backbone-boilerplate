require.config({

  deps: ['boot'],

  paths: {

    jquery:          'boilerplate/libs/jquery',
    lodash:          'boilerplate/libs/lodash',
    backbone:        'boilerplate/libs/backbone',
    module:          'boilerplate/libs/backbone.module',

    layoutmanager:   'boilerplate/libs/backbone.layoutmanager',
    routefilter:     'boilerplate/libs/backbone.routefilter',
    queryparams:     'boilerplate/libs/backbone.queryparams',

    modal:           'boilerplate/libs/backbone.bootstrap-modal',

    chosen:          'boilerplate/libs/chosen',
    timeago:         'boilerplate/libs/jquery.timeago',
    iframetransport: 'boilerplate/libs/jquery.iframe-transport',

    bootstrap:       'boilerplate/bootstrap/docs/assets/js/bootstrap'

  },

  shim: {
    backbone: {
      deps: ['lodash', 'jquery'],
      exports: 'Backbone'
    },

    layoutmanager:   ['backbone'],
    routefilter:     ['backbone'],
    queryparams:     ['backbone'],

    bootstrap:       ['jquery'],
    chosen:          ['jquery'],
    timeago:         ['jquery'],
    iframetransport: ['jquery']
  }

});
