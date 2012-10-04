define([
  'jquery',
  'lodash'
],

function($, _) {
  return function(off, el) {
    off = !!off;
    el = el || $('body');
    var loader = $('.loader'),
        visible = loader.hasClass('visible');
    // Only toggle when necessary
    if(off === visible) {
      if(!loader.parent().is(el)) {
        if(off) {
          return;
        }
        loader.appendTo(el);
      }
      else if(off && !loader.p)
      if(loader.data('timer')) {
        clearTimeout(loader.data('timer'));
        loader.removeData('timer');
      }
      loader.show();
      loader.toggleClass('visible', !off);
      if(off) {
        loader.data('timer', setTimeout(function() {
          loader.hide().appendTo('body');
        }, 800));
      }
    }
  };
});
