describe("The jquery instance", function() {
    beforeEach(function() {
        this.defineTestSuiteVariables();
    });

    it("should call sortable on the matched elements", function() {
        expect(this.$list.sortable).toHaveBeenCalled();
    });

    it("should pass sortableOptions to jquery ui", function() {
        var sortableOptions = this.$list.sortable.mostRecentCall.args[0];

        // Default options
        expect(sortableOptions["start"]).toBeDefined();
        expect(sortableOptions["stop"]).toBeDefined();
        expect(sortableOptions["beforeStop"]).toBeDefined();

        // Overridden default options
        expect(sortableOptions["helper"]).toEqual(this.pluginOptions.sortable["helper"]);

        // Non default options
        expect(sortableOptions["notDefault"]).toBeDefined();
    });

    it("should handle a mousemove event", function() {
        expect(this.$list).toHandle("mousemove.liveSortable");
    });

    it("should trigger the move_[started, element, ended].liveSortable events when the socket gets the message from the server", function() {
        this.forEachCustomEvent(function(customEvent) {
            var spyEvent = spyOnEvent(this.$list, customEvent);

            this.socketMock.emit(customEvent);
            expect(spyEvent).toHaveBeenTriggered();
        });
    });
    it("should not trigger the move_element.liveSortable event if the cancelRealtime option is set to true", function() {
        var $newList = this.resetPlugin({ cancelRealtime: true });

        var spyMoveElementEvent = spyOnEvent($newList, "move_element.liveSortable");
        this.socketMock.emit("move_element.liveSortable");

        expect(spyMoveElementEvent).not.toHaveBeenTriggered();
    });

});