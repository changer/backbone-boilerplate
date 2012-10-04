require.config({

  deps: ['boot'],

  paths: {

    jquery:          'boilerplate/libs/jquery',
    lodash:          'boilerplate/libs/lodash/lodash',
    backbone:        'boilerplate/libs/backbone/backbone',

    layoutmanager:   'boilerplate/libs/backbone.layoutmanager/backbone.layoutmanager',
    routefilter:     'boilerplate/libs/backbone.routefilter/src/backbone.routefilter',
    queryparams:     'boilerplate/libs/backbone.queryparams/backbone.queryparams',

    chosen:          'boilerplate/libs/chosen/chosen/chosen.jquery',
    timeago:         'boilerplate/libs/jquery.timeago/jquery.timeago',
    iframetransport: 'boilerplate/libs/jquery.iframe-transport/jquery.iframe-transport',

    bootstrap:       'boilerplate/libs/bootstrap/docs/assets/js/bootstrap',

    modal:           'boilerplate/libs/backbone.bootstrap-modal'

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
