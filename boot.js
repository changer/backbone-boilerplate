define([
  'jquery',
  'underscore',
  'backbone',
  'layoutmanager'
], function($, _, Backbone) {

  Backbone.Module = function(additionalProps) {
    return _.extend({ Views: {} }, additionalProps);
  };

  Backbone.FetchParallel = function(callback /* , modelsToFetch */) {
    $.when.apply(
      null,
      _(arguments).chain().toArray().slice(1).flatten().map(function(model) {
        return model.fetch().done();
      }).value()
    ).always(callback);
  };

});
