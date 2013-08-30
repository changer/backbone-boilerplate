define([
  'jquery',
  'underscore',
  'backbone'
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

  // See https://github.com/tbranyen/backbone.layoutmanager/issues/158
  Backbone.View.prototype.reset = function() {
    if(this.__manager__ && this.__manager__.viewDeferred && this.__manager__.viewDeferred.done) {
      this.__manager__.viewDeferred.done(this.render);
    }
    else {
      this.render();
    }
  };
});
