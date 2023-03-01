jatos.onLoad(function() {
    $(document).ready(function () {

        // Rivets formatters
        rivets.formatters.length = function(value) {
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
            this.jatos_id = jatos.workerId;
            this.prolific_id = jatos.studySessionData.prolificid;
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

        var last_distractor_timestamp = 0;
        var equations = ["(2 / 1) + (6 / 2)",
            "(20 / 5) + (28 / 7)",
            "(8 / 2) - (3 / 3)",
            "(3 / 3) + (5 / 5)",
            "(16 / 4) + (8 / 4)",
            "(12 / 4) + (4 / 4)",
            "(1 / 1) + (1 / 1)",
            "(2 / 2) + (2 / 2)",
            "(3 / 3) + (3 / 3)",
            "(4 / 4) + (4 / 2)",
            "(6 / 1) - (5 / 1)",
            "(8 / 2) - (2 / 2)",
            "(12 / 3) - (6 / 3)",
            "(16 / 4) - (8 / 4)",
            "(9 / 3) + (3 / 3)"];
        var equation_num = 0;
        
        distractor_data = {
            'prolific_id': jatos.studySessionData.prolificid,
            'jatos_id': jatos.workerId,
            'equations': [],
            'responses': [],
            'rts': []
        }

        function shuffle(o) {
            for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        }


        function setNewEquation() {
            equation_num = equation_num + 1;
            if (equation_num > equations.length) {
                equation_num = 1;
            }
            return equations[equation_num-1];
        }

        games = [];                    // Store game results
        var categories = ["Animals", "Animals"];  // Categories to use
        var timeperlist = 60;                   // seconds for fluency task
        var timefordistractors = 150;             // seconds for distractor task
        game = new gameObj();               // Keeps track of current game
        var firstkey = 1;

        rivets.bind($('body'), { game: game });

        // Press start
        $(".start").click(startGame);
        $(".start_distractor").click(startDistractor);

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

        $("#demographicsForm").submit(function() {
            var gender = $("input[name='gender']:checked").val();
            var genderText = $("#genderTxt").val();
            var ageText = $("#ageTxt").val();
            var didYouTry = $("input[name='try']:checked").val();
            var understand = $("input[name='understand']:checked").val();
            var comments = $("textarea[name='comments']").val();
            demographic_data = {
                'prolific_id': jatos.studySessionData.prolificid,
                'jatos_id': jatos.workerId,
                'gender': gender,
                'genderText': genderText,
                'ageText': ageText,
                'didYouTry': didYouTry,
                'understand': understand,
                'comments': comments
            };
            jatos.appendResultData(demographic_data);
            jatos.endStudy();
            return false;
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

        //function to start the distractor and call divs in main.html
        function startDistractor() {
            $("#between_categories").hide();
            $("#dist_trial").show();
            last_distractor_timestamp = (new Date).getTime();
            $("#distractor_problem").text(setNewEquation());
            $("#distractor_response").focus();
            setTimeout(function() {
                jatos.appendResultData(distractor_data);
                $("#dist_trial").hide();
                $("#post_distractors").show();
            }, timefordistractors*1000);
        }

        $("#distractor_response").keydown(function (e) {
            if (e.which == 9) {               // Prevents "tab+enter" bug
                e.preventDefault();
            }
            if (e.keyCode == 13) {              // If user hits enter:
                str = $(this).val();
                if ($.trim(str).length > 0) {
                    distractor_data.equations.push($("#distractor_problem").text());
                    distractor_data.responses.push($.trim(str));
                    distractor_data.rts.push((new Date).getTime() - last_distractor_timestamp);  // & store timestamp
                    last_distractor_timestamp = (new Date).getTime();
                    $(this).val("");
                    $("#distractor_problem").text(setNewEquation());
                }
            }
        });
        
        function endGame() {
            var gamecopy = $.extend(true, {}, game);
            games.push(gamecopy);
            jatos.appendResultData(game);
            

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
                }
            }
        }
    });
});
