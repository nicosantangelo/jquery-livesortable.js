describe("The jquery instance", function() {
    beforeEach(function() {
        this.defineTestSuiteVariables();
    });

    it("should call sortable on the matched elements", function() {
        expect(this.$list.sortable).toHaveBeenCalled();
    });

    it("should pass sortable object to jquery ui", function() {
        this.$list.liveSortable({
            socket: this.socketMock,
            sortable: {
                helper: ".test",
                start: "overriden"
            }
        });

        var sortableOptions = this.$list.sortable.mostRecentCall.args[0];

        expect(sortableOptions["start"]).toEqual("overriden");
        expect(sortableOptions["helper"]).toEqual(".test");
    });

    it("should throw if no socket is passed", function() {
        var $list = this.$list;
        expect(function() { $list.liveSortable({ sortable: {} }); }).toThrow(new Error("A socket must be passed as an argument to use liveSortable."));
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

        var spyMoveElementEvent = spyOnEvent(this.$list, "move_element.liveSortable");
        this.socketMock.emit("move_element.liveSortable");

        expect(spyMoveElementEvent).not.toHaveBeenTriggered();
    });
    it("should call the custom events stored in the options with three arguments", function() {
        var events = this.pluginOptions.events;

        this.simulateDragStart();
        expect( this.getLastArguments(events.start).length ).toEqual(3);

        this.simulateDragEnd();
        expect( this.getLastArguments(events.beforeStop).length ).toEqual(3);
        expect( this.getLastArguments(events.stop).length ).toEqual(3);
    });
    it("should call the custom mousemove event", function() {
        this.simulateMousemove();
        expect( this.getLastArguments(this.pluginOptions.events.mousemove).length ).toEqual(2);
    });


});