describe("The jquery instance", function() {
    beforeEach(function() {
        this.defineTestSuiteVariables();
    });

    it("should call sortable on the matched elements", function() {
        expect(this.$list.sortable).toHaveBeenCalled();
        expect(jQuery.fn.sortable).toHaveBeenCalled();
    });

    it("should pass sortable object to jquery ui", function() {
        this.$list.liveSortable("remove").liveSortable({
            socket: this.socketMock,
            sortable: {
                helper: ".test",
                start: "overriden"
            }
        });
        var sortableOptions = jQuery.fn.sortable.mostRecentCall.args[0];

        expect(sortableOptions["start"]).toEqual("overriden");
        expect(sortableOptions["helper"]).toEqual(".test");
    });

    it("should throw if no socket is passed", function() {
        var $list = this.$list.liveSortable("remove");
        expect(function() {
            $list.liveSortable({ sortable: {} });
        })
        .toThrow( new Error("A socket must be passed as an argument to use liveSortable.") );
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

    it("should not trigger the moving_element.liveSortable event if the cancelRealtime option is set to true", function() {
        var $newList = this.resetPlugin({ cancelRealtime: true });

        var spyMoveElementEvent = spyOnEvent(this.$list, this.defaultEvents.moving);
        this.socketMock.emit(this.defaultEvents.moving);

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

    describe("when the event names are overriden", function() {
        var newEventNames;
        beforeEach(function() {
            newEventNames = {
                started: "my_started_event",
                moving:  "my_moving_event"
            };

            this.$list.liveSortable("remove").liveSortable({
                socket: this.socketMock,
                eventNames: newEventNames
            });

        });

        it("should leave the defaults if any of them is not provided", function() {
            var customEvents = this.getPluginInstance().customEvents;
            expect( customEvents.ended ).toEqual(this.defaultEvents.ended);
        });

        it("should trigger them", function() {
            var self = this;

            $.each(newEventNames, function(key, newEventName) {
                var eventWithSufix = newEventName + ".liveSortable";
                var spyEvent = spyOnEvent(self.$list, eventWithSufix);

                self.socketMock.emit(eventWithSufix);
                expect(spyEvent).toHaveBeenTriggered();
            });
        });

        it("should toggle the cancelRealtime option on toggleRealtime", function() {
            var newMovingEventName = newEventNames.moving + ".liveSortable";
            var spyMoveElementEvent = spyOnEvent(this.$list, newMovingEventName);

            // By default the event is handled by the object, the first toggle disables it...
            this.toggleRealtime(newMovingEventName);
            expect(spyMoveElementEvent).not.toHaveBeenTriggered();

            //...the next reenables it
            this.toggleRealtime(newMovingEventName);
            expect(spyMoveElementEvent).toHaveBeenTriggered();
        });

        it("should emit the broadcast events with the custom names when the drag starts", function() {
            var broadcast = "broadcast_" + newEventNames.started + ".liveSortable";
            this.simulateDragStart();
            expect(this.socketMock.emit).wasCalledWith( broadcast,  jasmine.any(Object) );

            this.simulateDragEnd();
            expect(this.socketMock.emit).wasCalledWith("broadcast_move_ended.liveSortable", jasmine.any(Object));
        });

        it("should emit a broadcast_moving_element.liveSortable on mousemove", function() {
            var broadcast = "broadcast_" + newEventNames.moving + ".liveSortable";

            this.simulateMousemove();
            expect(this.socketMock.emit).wasCalledWith(broadcast, jasmine.any(Object));
        });
    });

});