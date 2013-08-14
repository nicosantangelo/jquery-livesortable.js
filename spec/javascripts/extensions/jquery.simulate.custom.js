;(function( $, undefined ) {
  
  $.extend( $.simulate.prototype, {
    simulateDragStart: function() {
      var i = 0,
        target = this.target,
        options = this.options,
        center = { x: 50, y: 50 },
        x = Math.floor( center.x ),
        y = Math.floor( center.y ),
        dx = options.dx || 0,
        dy = options.dy || 0,
        moves = options.moves || 3,
        coord = { clientX: x, clientY: y };

      this.simulateEvent( target, "mousedown", coord );

      for ( ; i < moves ; i++ ) {
        x += dx / moves;
        y += dy / moves;

        coord = {
          clientX: Math.round( x ),
          clientY: Math.round( y )
        };

        this.simulateEvent( document, "mousemove", coord );
      }
    },
    simulateDragEnd: function() { 
      this.simulateEvent( this.target, "mouseup" );
      this.simulateEvent( this.target, "click" );
    }
  });

})( jQuery );