;(function (window, document, undefined) {
    "use strict";

    // Dependencies
    if (jQuery === undefined) {
        throw "jQuery should be defined to use liveSortable";
    }
    if (jQuery().sortable === undefined) {
        throw "jQuery UIs sortable should be defined to use liveSortable";
    }
    if (io === undefined) {
        throw "SocketIO should be defined to use liveSortable";
    }


    var pluginName = "liveSortable",
        pluginDataName = "plugin_" + pluginName;

    var isDragging = false;
     
    // LiveSortable Defaults
    var defaults = {
            // Realtime options
            cancelRealtime: false,
            cancelSedingInRealtime: false,

            // jQuery UI options
            sortable: {
                helper: "clone",
                start: function(event, ui) {
                    var liveSortable = jQuery(this).data(pluginDataName);
                    var socket = liveSortable.getSocket();

                    socket.emit( eventNamesFactory.addSufix("broadcast_move_started"), {
                        id: ui.item.get(0).id
                    } );

                    liveSortable.isBeingDragged = true;
                },
                beforeStop: function(event, ui) {
                    var item = ui.item,
                        next = item.next().get(0),
                        prev = item.prev().get(0);

                    var socket = jQuery(this).data(pluginDataName).getSocket();
                    
                    socket.emit( eventNamesFactory.addSufix("broadcast_move_ended"), {
                        id:   item.get(0).id,
                        next: next && next.id,
                        prev: prev && prev.id
                    } );
                },
                stop: function(event, ui) {
                    var liveSortable = jQuery(this).data(pluginDataName);

                    liveSortable.isBeingDragged = false;
                }
            }
        };

    /* ==============================================
        eventNamesFactory
       ============================================== */

    // Creates new event names in the plugin namespace 
    var eventNamesFactory = {
        sufix: "." + pluginName,
        addSufix: function(eventName) {
            return eventName + eventNamesFactory.sufix;
        },
        create: function(liveSortable) {
            var eventNames = ["move_element", "move_started", "move_ended"];

            // If realtime is canceled, delete the move_element event
            if(liveSortable.options.cancelRealtime) {
                eventNames = eventNames.slice(1);
            }
            return jQuery.map(eventNames, this.addSufix);
        }
    }

    /* ==============================================
        SocketEventer Class
       ============================================== */

    // Class to handle the Socket events, add and remove them
    function SocketEventer(liveSortable) {
        var self = this;

        this.$element = liveSortable.$element;

        this.socket = io.connect(liveSortable.options.socketUrl);

        // Listen every event on the socket and trigger it on the stored element
        jQuery.each(liveSortable.customEvents, function(index, customEvent) {
            self.addEvent( customEvent );
        });

        return this;
    };
    SocketEventer.prototype = {
        eventHandlers: {},
        addEvent: function(eventName) {
            // We support only a default handler (for now)
            var self = this;
            var handler = function(data) {
                self.$element.trigger(eventName, data);
            };

            this.eventHandlers[eventName] = handler;
            this.socket.on(eventName, handler);
        },
        removeEvent: function(eventName) {
            this.socket.removeListener(eventName, this.eventHandlers[eventName]);
        },
        removeAllEvents: function() {
            this.socket.removeAllListeners();
        }
    };

    /* ==============================================
        LiveSortable Class
       ============================================== */

    function LiveSortable( jqueryInstance, options ) {
        this.$element = jqueryInstance;

        // Plugin defaults
        this.options = jQuery.extend({}, defaults, options);

        // Sortable defaults
        this.sortableOptions = jQuery.extend({}, defaults.sortable, this.options.sortable);

        // Start jqueryui sortable
        this.$element.sortable(this.sortableOptions);

        // Create the event names
        this.customEvents = eventNamesFactory.create(this);

        // Create a new (private) SocketEventer, and a getter for the socket itself
        this._socketEventer = new SocketEventer(this);
        this.getSocket = function() {
            return this._socketEventer.socket;
        }

        // Mousemove event
        if(!this.options.cancelSedingInRealtime) {
            this.addMousemoveHandler();
        }

        return this;
    };

    LiveSortable.prototype = {
        isBeingDragged: false,
        addMousemoveHandler: function() {
            var self = this;
            this.$element.on(eventNamesFactory.addSufix("mousemove"), function(event) {
                if(self.isBeingDragged) {
                    var target = event.target;
                    self._socketEventer.socket.emit(eventNamesFactory.addSufix("broadcast_moving_element"), {
                        id:   target.id,
                        top:  target.style.top,
                        left: target.style.left
                    });
                }
            });
        },
        removeMousemoveHandler: function() {
            this.$element.off(eventNamesFactory.addSufix("mousemove"));
        },
        remove: function() {
            this.$element.removeData(pluginDataName).off(eventNamesFactory.sufix);
            this._socketEventer.removeAllEvents();
            return this.$element;
        },
        toggleOption: function(option) {
            this.options[option] = !this.options[option]; 
            return this.options[option];
        },
        toggleRealtime: function() {
            var realtimeEventName = eventNamesFactory.addSufix("move_element");

            if( this.toggleOption("cancelRealtime") ) {
                this._socketEventer.removeEvent(realtimeEventName);
            } else {
                this._socketEventer.addEvent(realtimeEventName);
            }
        },
        toggleRealtimeSending: function() {
            if( this.toggleOption("cancelSedingInRealtime") ) {
                this.removeMousemoveHandler();
            } else {
                this.addMousemoveHandler();
            }
        }
    };

    /* ==============================================
        jQuery Plugin initialization
       ============================================== */

    jQuery.fn[pluginName] = function ( options ) {

        // When the first argument is a string, call a method on the instance with that string as the method name
        // Otherwise instantiate the plugin
        if (typeof options === 'string') {
            var methodArguments = Array.prototype.slice.call(arguments, 1);

            var instance = this.data(pluginDataName);
            if (!instance) {
                throw "Method called on liveSortable before instantiation";
            }
            if ( !jQuery.isFunction(instance[options]) ) {
                throw "The method: " + options + " was not found in liveSortable";
            }

            var returnValue = instance[options].apply(instance, methodArguments);

            if (returnValue !== undefined) {
                return returnValue;
            }
        } else {
            this.data(pluginDataName, new LiveSortable(this, options));
        }
            
        return this;
    };

})(window, document);