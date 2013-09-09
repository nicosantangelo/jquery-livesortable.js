(function() {
    "use strict"

    var usernameInput = document.getElementById('username');
     
    var $teamsList = $(".list");

    $teamsList.liveSortable({
        socket: io.connect('http://localhost:5000'),
        cancelRealtime: true,
        eventNames: {
            started: "hold_tight"
        },
        events: {
            start: function(event, ui, liveSortable) {
                return {
                    id:       ui.item.get(0).id,
                    username: usernameInput.value || "Anonymous"
                };
            }  
        }
    });

    $teamsList.on("hold_tight.liveSortable", function(event, data) {
        var elem = document.getElementById(data.id);
        elem.style.backgroundColor = '#CCC';
        elem.style.cursor          = 'default';

        var movedBySpan = document.createElement("span");
        movedBySpan.className = "movedBy";
        movedBySpan.innerHTML = "Being moved by: <i>" + data.username + "</i>";

        elem.appendChild(movedBySpan);
    });

    $teamsList.on("moving_element.liveSortable", function(event, data) {
        var elem = document.getElementById(data.id);

        elem.style.position = 'absolute';
        elem.style.width    = 450;
        elem.style.top      = data.top;
        elem.style.left     = data.left;
    });

    $teamsList.on("move_ended.liveSortable", function(event, data) {
        var elem = document.getElementById(data.id);

        elem.removeAttribute("style");
        elem.removeChild(elem.getElementsByTagName('span')[0]);
        elem.parentNode.removeChild(elem);

        var $elem = $(elem);

        if(data.next) {
            $elem.insertBefore('#' + data.next);
        } else if(data.prev) {
            $elem.insertAfter('#' + data.prev);
        } else {
            $teamsList.prepend($elem);
        }

        $elem.highlight();
    });

    $("#activateRealtime").change(function() {
        $teamsList.liveSortable("toggleRealtime");
    });

    jQuery.fn.highlight = function(highlightColor, currentColor) {
        var self = this;
        self.animate({ backgroundColor: highlightColor || "#FFF593" }, "slow", function() {
            self.animate({ backgroundColor: currentColor || "#FFF" }, "slow");
        });
    }

})();