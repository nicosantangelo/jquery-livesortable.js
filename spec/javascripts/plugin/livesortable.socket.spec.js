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
            this.emulateMousemoveOn(this.$firstLi);
            expect(this.socketMock.emit).wasCalledWith("broadcast_moving_element.liveSortable", this.pluginOptions.events.mousemove());
        });
        it("should emit the event with the supplied delay", function() {
            this.resetPlugin({ delay: 100 });

            //Start the jasmine clock mock to test the delay
            timerCallback = jasmine.createSpy('timerCallback');
            jasmine.Clock.useMock();

            //Move the mouse four times
            this.emulateMousemoveOn(this.$firstLi, 4);

            // Call only the first event
            // We have two calls to start and stop the mousemove, and one actual movement
            expect(this.socketMock.emit.calls.length).toBe(2 + 1);

            jasmine.Clock.tick(110);

            // The second one, gets called only after 100ms
            //Same here, we have, the three from before, two to start and stop and one actual movement
            this.emulateMousemoveOn(this.$firstLi);
            expect(this.socketMock.emit.calls.length).toBe(3 + 2 + 1);
        });
        it("should not emit the liveSortable.broadcast_move_element event if the cancelSedingInRealtime option is set to true", function() {
            this.resetPlugin({ cancelSedingInRealtime: true });

            this.emulateMousemoveOn(this.$firstLi);

            expect(this.socketMock.emit).not.wasCalledWith("broadcast_moving_element.liveSortable");
        });

    });

});
