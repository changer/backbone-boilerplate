requirejs.config({

  deps: ['boilerplate/boot', 'boot'],

  paths: {

    text:               'boilerplate/libs/require-text',

    jquery:             'boilerplate/libs/jquery',
    underscore:         'boilerplate/libs/lodash',
    backbone:           'boilerplate/libs/backbone',

    layoutmanager:      'boilerplate/libs/backbone.layoutmanager',
    routefilter:        'boilerplate/libs/backbone.routefilter',
    queryparams:        'boilerplate/libs/backbone.queryparams',

    timeago:            'boilerplate/libs/jquery.timeago',
    iframetransport:    'boilerplate/libs/jquery.iframe-transport',
    toe:                'boilerplate/libs/jquery.toe',

    moment:	        'boilerplate/libs/moment.js',

    fastactive:         'boilerplate/libs/fastactive',

    jed:                'boilerplate/libs/jed',
    po2json:            'boilerplate/libs/po2json',

    select2:            'boilerplate/libs/select2',
    prettyCheckable:    'boilerplate/libs/prettyCheckable',
    bootstrap:          'boilerplate/libs/bootstrap',
    bootstrap3:         'boilerplate/libs/bootstrap3',
    bootbox:            'boilerplate/libs/bootbox',
    notify:             'boilerplate/libs/bootstrap-notify',
    kendoui:            'boilerplate/libs/kendoui',

    modal:              'boilerplate/libs/backbone.bootstrap-modal'

  },

  shim: {
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },

    underscore: {
        exports: '_'
    },

    layoutmanager:      ['backbone', 'underscore'],
    routefilter:        ['backbone'],
    queryparams:        ['backbone'],

    bootstrap:          ['jquery'],
    bootstrap3:         ['jquery'],
    notify:             ['jquery'],
    bootbox:            ['bootstrap3'],
    select2:            ['jquery'],
    prettyCheckable:    ['jquery'],
    kendoui:            ['jquery'],
    timeago:            ['jquery'],
    iframetransport:    ['jquery'],
    toe:                ['jquery']

  }

});
