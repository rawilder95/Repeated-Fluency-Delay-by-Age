jatos.onLoad(function () {
    $(document).ready(function () {

        // Rivets formatters
        rivets.formatters.length = function (value) {
            return value.length;
        }

        rivets.formatters.toMinutes = function (value) {
            mins = parseInt(value / 60)
            seconds = parseInt(value % 60);
            seconds = seconds < 10 ? "0" + seconds : seconds;
            return mins + ":" + seconds;
        }

        // variables for each game
        function gameObj() {
            this.gamenum = 0;
            this.init = function () {
                this.items = [];
                this.times = [];
                this.firsttime = [];
                this.category = "";
                this.starttime = 0;
                this.countdown = timeperlist;
            }
            this.init();
        }

        function shuffle(o) {
            for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        }


        var games = [];                    // Store game results
        var categories = ["Animals"];  // Categories to use
        var timeperlist = 3;                // 3 minutes per list
        var game = new gameObj();               // Keeps track of current game
        var firstkey = 1;

        rivets.bind($('body'), { game: game });

        // Press start
        $(".start").click(startGame);

        // Add item to list
        $("#current").keydown(function (e) {
            if (e.which == 9) {               // Prevents "tab+enter" bug
                e.preventDefault();
            }
            if (e.keyCode == 13) {              // If user hits enter:
                firstkey = 1;
                str = $(this).val();
                if ($.trim(str).length > 0) {
                    game.items.push($.trim(str));      // store in list
                    game.times.push((new Date).getTime());  // & store timestamp
                    $(this).val("");             // & clear input field
                    $("#items").append("<p>" + str + " recorded</p>");
                    $("#items p").fadeOut(800);
                }
            }
            if ((e.keyCode != 13) & (firstkey == 1)) {
                game.firsttime.push((new Date).getTime());
                firstkey = 0;
            }
        });

        function startTimer() {
            var timer = setInterval(function () {
                game.countdown--;
                if (game.countdown == 0) {
                    clearInterval(timer);
                    endGame();
                }
            }, 1000);
        }

        function startGame() {
            game.gamenum++;
            game.init();
            game.category = categories[game.gamenum - 1];
            game.starttime = new Date().getTime();

            $(this).parent().hide();
            $("#game").show();
            $("#current").focus();
            startTimer();
        }

        function endGame() {
            var gamecopy = $.extend(true, {}, game);
            games.push(gamecopy);

            $("#current").val("");
            $("#game").hide();


            if (game.items.length <= 5) {
                $("#too_few").show();
                game.gamenum--;   // hack to replay same round, because startGame() will increment gamenum
            } else {
                if (game.gamenum < (categories.length)) {
                    $("#between_categories").show();
                } else {
                    $("#endgame").show();
                    //$.post("savedata.php", { json: JSON.stringify(games) });
                    //$.post("savedata.php", { json: JSON.stringify(games) });
                    jatos.submitResultsData(games);
                    //jatos.endStudy();
                }
            }
        }
    });
});