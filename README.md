jquery-livesortable.js
===================

_livesortable_ helps you to build a realtime sortable list providing a defined comunication between the server and the client, support for turning on and off the information exchange, and a few more options to play with.

![](https://raw.github.com/NicoSantangelo/jquery-livesortable.js/master/demo.gif)

Usage
-----

### Default options
```javascript
$(selector).liveSortable({
    socket: undefined, //required
    cancelRealtime: false,
    cancelSendingInRealtime: false,
    delay: 0,
    events: {
        start: function(event, ui, liveSortable) {},
        beforeStop: function(event, ui, liveSortable) {},
        stop: function(event, ui, liveSortable) {},
        mousemove: function(event, liveSortable) {}
    },
    sortable: {}
});
```
The options are:
* `socket` – An object witch responds to the [Socket.IO](http://socket.io) interface for events, that is `on`, `emit`, `removeListener`. You can use any object you like (check [the spec](https://github.com/NicoSantangelo/jquery-livesortable.js/blob/master/spec/javascripts/helpers/spec_helper.js#L59) for an example using jQuery events).

* `cancelRealtime` – Boolean indicating if we should recieve information in realtime.

* `cancelSendingInRealtime` – Boolean indicating if we should send information in mousemove.

* `delay` – Time in milliseconds between every send to the server on mousemove (to reduce load).

* `events` – Object with holds functions that run for every event. The return value is used as data to send to the server (if undefined it will send the default).

* `sortable` – Functions to override the default sortable options (it will get passed directly to the sortable plugin).

### Events fired
All events live inside the `.liveSortable` namespace, and are fired with the user interaction (unless any "cancel" option is `true`)

##### Emitted to the server

* `broadcast_move_started.liveSortable` – Sent when the user starts dragging an element.

* `broadcast_moving_element.liveSortable` – Sent on mousemove (depends on the delay option).

* `broadcast_move_ended.liveSortable` – Sent when the user stops dragging an element.

##### On the element ( $(selector) ) and listened on the socket

* `move_started.liveSortable` -  Triggered when the user starts dragging an element.

* `moving_element.liveSortable` - Triggered on mousemove.

* `move_ended.liveSortable` - Triggered when the user stops dragging an element


### API

##### jQuery#liveSortable("delay", ms)
Sets the supplied delay

```javascript
$(selector).liveSortable("delay", 100); // wait 10ms between sends
```

##### jQuery#liveSortable("toggleRealtime")
Toggles the cancelRealtime option

```javascript
$(selector).liveSortable("toggleRealtime");
```
##### jQuery#liveSortable("toggleRealtimeSending")
Toggles the cancelSendingInRealtime option

```javascript
$(selector).liveSortable("toggleRealtimeSending");
```

##### jQuery#liveSortable("remove")
Removes the plugin and unbinds events

```javascript
$(selector).liveSortable("remove");
```


That's all
-----

Probably not the best documentation, but before hating me try [the example](https://github.com/NicoSantangelo/jquery-livesortable.js/tree/master/example) or the [specs](https://github.com/NicoSantangelo/jquery-livesortable.js/tree/master/spec/javascripts). The specs are using [jasmine](http://pivotal.github.io/jasmine/), to run them you can use the [jasmine gem](https://github.com/pivotal/jasmine-gem) and then use Guard to watch the files.

Have a problem, bug, a new implementation ?, be sure to open an issue or a pull request!
