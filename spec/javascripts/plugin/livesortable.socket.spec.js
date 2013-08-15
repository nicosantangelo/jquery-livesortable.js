describe("The socket", function() {
    beforeEach(function() {
        this.defineTestSuiteVariables();
    });

    it("should listen to the liveSortable.move_[started, element, ended] events", function() {
        this.forEachCustomEvent(function(customEvent) {
            expect(this.socketMock.on).wasCalledWith(customEvent, jasmine.any(Function)); 
        });
    });

    it("should emit the broadcast_move_[started, ended].liveSortable when the drag starts", function() {
        this.$firstLi.simulate("dragStart", { dx: 10 });
        expect(this.socketMock.emit).wasCalledWith( "broadcast_move_started.liveSortable", this.pluginOptions.events.start() );

        this.$firstLi.simulate("dragEnd");
        expect(this.socketMock.emit).wasCalledWith("broadcast_move_ended.liveSortable", jasmine.any(Object));
    });

    describe("on mousemove", function() {
        it("should emit a broadcast_moving_element.liveSortable", function() {
            this.emulateMouseMoveOn(this.$firstLi);
            expect(this.socketMock.emit).wasCalledWith("broadcast_moving_element.liveSortable", this.pluginOptions.events.mousemove());
        });
        it("should not emit the liveSortable.broadcast_move_element event if the cancelSedingInRealtime option is set to true", function() {
            var $newList = this.resetPlugin({ cancelSedingInRealtime: true });

            this.emulateMouseMoveOn($newList.children("li:first")) 

            expect(this.socketMock.emit).not.wasCalledWith("broadcast_moving_element.liveSortable");
        });

    });

});
