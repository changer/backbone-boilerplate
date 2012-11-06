/**
 * Bootstrap Modal in a Backbone View ready to use with Backbone Layout Manager
 *
 * Takes care of instantiation, manages multiple modals,
 * Removes the element from the DOM when closed
 *
 * @author Ruben Stolk <ruben.stolk@changer.nl>, inspired by
 * https://github.com/powmedia/backbone.bootstrap-modal
 *
 **/
define([
  'jquery',
  'lodash',
  'backbone'
], function($, _, Backbone) {

  return {
    Modal: Backbone.View.extend({

      beforeRender: function() {
        if (this.beforeModal) this.beforeModal();

        this.$el.addClass('modal-wrapper fade');
        // default bootstrap escape event is bound to the element
        // which doesn't work correctly in our case
        $.fn.modal.Constructor.prototype.escape = function () {
          var that = this;
          if (this.isShown && this.options.keyboard) {
            $('body').on('keyup.dismiss.modal', function ( e ) {
              return e.which == 27 && that.hide();
            });
          }
          else if (!this.isShown) {
            $('body').off('keyup.dismiss.modal');
          }
        };
        $('body').removeClass('modal-open-standalone');
      },

      hide: function() {
        this.$el.modal('hide');
      },

      afterRender: function() {
        if (this.afterModal) this.afterModal();

        var view = this, el = this.$el;
        if(view.options.standalone) {
          el.addClass('standalone');
          $('body').addClass('modal-open-standalone');
        }
        else {
          $('body').css({ 'overflow' : 'hidden' });
        }
        el.modal({
          backdrop: view.options.standalone ? false : true
        }).on('hidden', function() {
          if(!view.options.standalone) {
            $('body').css({ 'overflow' : 'auto' });
          }
          else {
            $('body').removeClass('modal-open-standalone');
          }
          $('.modal-backdrop').remove();
          el.remove();
        }).on('hide', function(e) {
          // standalone modals can't be closed
          if(view.options.standalone) {
            e.preventDefault();
          }
          $('body').unbind('click.modal');
        });

        // Trigger hide for any click outside the modal, needed for navbar
        // Defer for preventing bubbling event on loading modal
        _.defer(function() {
          $('body').unbind('click.modal').bind('click.modal', function(e) {
            if(!$(e.target).closest('.modal').length) {
              $('body').unbind('click.modal');
              view.hide();
            }
          });
        });

        return this;
      }
    }),

    Popup: Backbone.View.extend({
      className: 'modal',

      close: function() {
        this.$el.removeClass('in');
        _.delay(_.bind(function() {
          this.$el.remove();
        }, this), 500);
      },

      beforeRender: function() {
        if (this.beforeModal) this.beforeModal();
      },

      afterRender: function() {
        if (this.afterModal) this.afterModal();
        this.$el.find('.close').click(_.bind(this.close, this));
        this.$el.delay(1).queue(function() {
          $(this).addClass('in');
        });
      }
    })

  };

});
