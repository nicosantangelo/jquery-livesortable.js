beforeEach(function() {
	this.pluginOptions = {
        socketUrl: "http://localhost:5000",
        sortable: {
            helper: ".test",
            notDefault: function() {}
        }
    };

    this.customEvents = ["move_started.liveSortable", "move_element.liveSortable", "move_ended.liveSortable"];
    this.forEachCustomEvent = function(fn) {
        var self = this;
        jQuery.each(this.customEvents, function(index, customEvent) {
            fn.call(self, customEvent);
        }); 
    };

    this.defineTestSuiteVariables = function() {
        this.$list = this.customLoadFixtures();
        this.$firstLi = this.$list.children("li:first");

        this.socketMock = this.startPluginWithSocketMock(this.$list);
        this.liveSortable = this.getPluginInstance(this.$list);
    };

    this.customLoadFixtures = function(fixtures, selector) {
    	loadFixtures(fixtures || "livesortable_fixture.html");
    	return $(selector || "#list");
    };

    this.startPluginWithSocketMock = function($element, pluginOptions) {
    	var socketMock;

        // Create a socket mock
        socketMock = this.createSocketMock();

        // Return the mock on connect
        spyOn(io, "connect").andReturn(socketMock);

        // Spy on the sortable method and...
    	spyOn($element, "sortable").andCallThrough();

        // ...start the plugin
        $element.liveSortable(pluginOptions || this.pluginOptions);

    	return socketMock;
    };

    this.createSocketMock = function() {
        var socketMock = jasmine.createSpyObj("socketMock", ["on", "emit", "removeListener", "removeAllListeners"]);

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
        socketMock.removeAllListeners.andCallFake(function() {
            jQuery(socketMock).off();
        });

        return socketMock;
    }

    this.getPluginInstance = function($element) {
    	return $element.data("plugin_liveSortable");
    };

    this.resetPlugin = function(addedOptions) {
        var newOptions = jQuery.extend({}, this.pluginOptions, addedOptions);

        // Delete the previous instance of the plugin
        this.liveSortable.remove();

        //Start a new one and return the jQuery instance
        return this.$list.liveSortable(newOptions);
    }

    this.toggleRealtime = function() {
        this.$list.liveSortable("toggleRealtime");
        this.socketMock.emit("move_element.liveSortable");
    };

    this.toggleRealtimeSending = function() {
        this.$list.liveSortable("toggleRealtimeSending");
        this.emulateMouseMoveOn(this.$firstLi);
    }

    this.emulateMouseMoveOn = function($element) {
        $element.simulate("dragStart", { dx: 10 }).simulate("mousemove").simulate("dragEnd");
    };
});
