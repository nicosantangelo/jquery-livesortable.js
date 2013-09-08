beforeEach(function() {
	this.pluginOptions = {
        socket: undefined,
        events: {
            start: function(event, ui, liveSortable) {
                // Return something here, so we can check if the socket gets called with it
                return "overriden";
            },
            beforeStop: function(event, ui, liveSortable) {
                // Don't return anything, use the default
            },
            stop: function(event, ui, liveSortable) {
                // The return value it's not important here, it can be used to do some calculations
            },
            mousemove: function(event, liveSortable) {
                // Override the mousemove data too
                return "overriden";
            }
        }
    };

    this.customEvents = {
        started: "move_started.liveSortable", 
        moving: "moving_element.liveSortable",
        ended: "move_ended.liveSortable"
    };

    this.forEachCustomEvent = function(fn) {
        var self = this;
        jQuery.each(this.customEvents, function(key, customEvent) {
            fn.call(self, customEvent);
        }); 
    };

    this.defineTestSuiteVariables = function() {
        this.$list = this.customLoadFixtures();
        this.$firstLi = this.$list.children("li:first");

        this.socketMock = this.startPluginWithSocketMock();
        this.liveSortable = this.getPluginInstance();
    };

    this.customLoadFixtures = function(fixtures, selector) {
    	loadFixtures(fixtures || "livesortable_fixture.html");
    	return $(selector || "#list");
    };

    this.startPluginWithSocketMock = function($element) {
        // Create a socket mock and add the socket to the options
        this.pluginOptions.socket = this.createSocketMock();

        // Spy on the custom events passed as arguments
        this.spyEventsOption(this.pluginOptions);

        // Spy on the sortable method and...
    	spyOn(jQuery.fn, "sortable").andCallThrough();

        // ...start the plugin
        ($element || this.$list).liveSortable(this.pluginOptions);

    	return this.pluginOptions.socket;
    };

    this.createSocketMock = function() {
        var socketMock = jasmine.createSpyObj("socketMock", ["on", "emit", "removeListener"]);

        // Fallback to jquerys event handling
        socketMock.on.andCallFake(function(eventName, fn) {
            jQuery(socketMock).on(eventName, fn);
        });
        socketMock.emit.andCallFake(function(eventName) {
            jQuery(socketMock).trigger(eventName);
        });
        
        socketMock.removeListener.andCallFake(function(eventName) {
            jQuery(socketMock).off(eventName);
        });

        return socketMock;
    }

    this.spyEventsOption = function(options) {
        for(var event in options.events) {
            spyOn(options.events, event).andCallThrough();
        }
    };

    this.getPluginInstance = function($element) {
    	return ($element || this.$list).data("plugin_liveSortable");
    };

    this.resetPlugin = function(addedOptions) {
        var newOptions = jQuery.extend({}, this.pluginOptions, addedOptions);

        // Delete the previous instance of the plugin
        this.liveSortable.remove();

        //Start a new plugin instance and setup the firstLi
        this.$list.liveSortable(newOptions);
        this.$firstLi = this.$list.children("li:first");
    }

    this.toggleRealtime = function() {
        this.$list.liveSortable("toggleRealtime");
        this.socketMock.emit(this.customEvents.moving);
    };

    this.toggleRealtimeSending = function() {
        this.$list.liveSortable("toggleRealtimeSending");
        this.simulateMousemove();
    }

    this.simulateMousemove = function(times, $element) {
        times = times || 1;
        $element = $element || this.$firstLi;

        this.simulateDragStart($element);

        while(times--) {
            $element.simulate("mousemove")
        }

        this.simulateDragEnd($element);
    };

    this.simulateDragStart = function($element) {
        ($element || this.$firstLi).simulate("dragStart", { dx: 10 });
    };

    this.simulateDragEnd = function($element) {
        ($element || this.$firstLi).simulate("dragEnd");
    };

    this.getLastArguments = function(method) {
        return method.calls[0].args;
    }
});
