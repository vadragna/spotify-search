(function() {
    var nextUrl;
    var isLoading = false;
    $("#submit-button").on("click", function() {
        isLoading = true;
        var userInput = $("input[name=user-input]").val();
        var albumOrArtist = $("select").val();
        $.ajax({
            url: "https://elegant-croissant.glitch.me/spotify",
            method: "GET",
            data: {
                query: userInput,
                type: albumOrArtist
            },
            success: function(response) {
                isLoading = false;
                response = response.artists || response.albums;
                if (response.items.length == 0) {
                    console.log("no results");
                    $("#results-container").html("No Results!!");
                } else {
                    var myHTML = getHtml(response);
                    $("#results-container").html(myHTML);
                    checkForNext(response, userInput, albumOrArtist, myHTML);
                    scroll(response);
                }
            }
        });
    });

    function checkForNext(response, userInput, albumOrArtist) {
        console.log("response in checkForNext", response);
        isLoading = true;
        if (response.next) {
            nextUrl = response.next.replace(
                "https://api.spotify.com/v1/search",
                "https://elegant-croissant.glitch.me/spotify"
            );
            console.log("next Url in 2nd request", nextUrl);
            $(".more").css("visibility", "visible");
        } else {
            $(".more").css("visibility", "hidden");
        }
    }
    var url = window.location.href;
    var searchingFor = "scroll=infinite";

    // version 1
    var isInfiniteScroll = url.indexOf(searchingFor) >= 0; // se non c'è da -1 come risultato
    console.log(isInfiniteScroll);

    // version 2
    //    var urlParams = new SearchParams(location.search);
    //    var contentOfScrollurlParams = urlParams.get("scroll");
    function getHtml(response, myHTML) {
        console.log(response);
        myHTML = "";
        for (var i = 0; i < response.items.length; i++) {
            myHTML +=
                '<div class="box"><div class:"name">' +
                '<a href="' +
                response.items[i].external_urls.spotify +
                '">' +
                response.items[i].name +
                "</a>";
            ("</div>");
            var imageUrl = "default.jpg";
            if (response.items[i].images[0]) {
                imageUrl = response.items[i].images[0].url;
            }
            myHTML +=
                '<div><img src="' + imageUrl + '" class="pics"></div></div>';
        }
        return myHTML;
    }

    function secondRequest(response) {
        isLoading = false;
        nextUrl = response.next.replace(
            "https://api.spotify.com/v1/search",
            "https://elegant-croissant.glitch.me/spotify"
        );
        console.log("response", response);
        var myHTML = "";
        $("#results-container").append(getHtml(response, myHTML));
    }

    function scroll(response) {
        isLoading = false;
        setInterval(function() {
            if (!response.next) {
                return;
            } else {
                var window_plus_scrolltop =
                    $(window).height() + $(document).scrollTop();
                var document_height = $(document).height();
                // console.log(window_plus_scrolltop, document_height);
                var reachedBottomOfPage =
                    window_plus_scrolltop >= document_height - 200; //to load close before the user reaches the bottom of the page
                if (reachedBottomOfPage && !isLoading) {
                    console.log("next Url in scroll fn", nextUrl);
                    $(".more").trigger("click");
                }
            }
        }, 800);
    }

    $(".more").on("click", function() {
        console.log("nextUrl in checkforNext", nextUrl);
        $.ajax({
            url: nextUrl,
            method: "GET",
            success: function(response) {
                console.log("response in 2nd request success", response);
                response = response.artists || response.albums;
                secondRequest(response);
            },
            error: (isLoading = false) //ask
        });
    });

    $("#input").on("keypress", function() {
        var keycode = event.keyCode ? event.keyCode : event.which;
        if (keycode == "13") {
            $("#submit-button").trigger("click");
        }
    });
})();
