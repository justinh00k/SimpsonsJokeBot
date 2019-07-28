const Twitter = require('twitter');
const config = require('./config.js');

const client = new Twitter(config);

const testing_mode = false; // Logs 100 Tweets
const retweet_multiplier = 4;
const celeb_count = 15000;

exports.handler = async function(event) {

    // Bot Will Run Every 24 hours and do two things:
    // 1: Retweet the most faved (x1) and retweeted (x4) reply to our last tweet


    client.get('statuses/user_timeline', { user_id: "SimpsonsJokeBot", count: 1, }, function(error, tweets, response) {
        if (error) throw error;
        var last_tweet = tweets[0].id_str;
        // console.log(tweets); // The favorites.
        // console.log(response); // Raw response object.


        client.get('search/tweets', { q: 'to:@SimpsonsJokeBot', sinceID: last_tweet }, function(error, search_tweets, response) {
            if (error) throw error;
            let most_points = { id: 0, points: 0 };
            let celebs = [];

            for (let i = 0; i < search_tweets.statuses.length; i++) {
                if (search_tweets.statuses[i].favorite_count + search_tweets.statuses[i].retweet_count * retweet_multiplier > most_points.points) {
                    most_points = { id: search_tweets.statuses[i].id_str, points: search_tweets.statuses[i].favorite_count + search_tweets.statuses[i].retweet_count * retweet_multiplier }
                } else if (search_tweets.statuses[i].followers_count > celeb_count && search_tweets.statuses[i].retweet_count > 50) {
                    celebs.push({ id: search_tweets.statuses[i].id_str, points: search_tweets.statuses[i].favorite_count + search_tweets.statuses[i].retweet_count * retweet_multiplier });
                }
            }


            celebs.push(most_points);

            console.log(celebs);

            for (let i = 0; i < celebs.length; i++) {

                if (testing_mode) {
                    console.log("Retweeted");
                } else {
                    client.post('statuses/retweet/' + celebs[i].id, function(error, tweet, response) {
                        if (!error) {
                            console.log("Retweeted");
                        }

                    });

                }
            }

        });

    });



    // 2: Tweet a new random()ized prompt

    let tweet_question = ["What is", "What's"];
    let tweet_prompt = ["Reply with", "Send us"];
    let tweet_superlative = ["the best", "your favorite", "the funniest", "the most funny"];
    let tweet_simpsons_joke = ["Simpsons joke", "Simpsons joke", "joke from The Simpsons"];
    let tweet_involving = ["involving", "featuring", "about"];
    let tweet_type = ["visual", "background", "well-known", "underrated", "obscure", "random", "complicated", "one-line", "referential", "celebrity", "food-related", "animal-related", "flashback", "music-related", "meta", "game-related"];
    let characters_family = ["Homer", "Marge", "Bart", "Lisa"];
    let characters_major = ["Maggie", "Abe Simpson", "Apu", "Barney", "Chief Wiggum", "Itchy and/or Scratchy", "Kent Brockman", "Mrs. Krabappel", "Krusty", "Lenny and/or Carl", "Comic Book Guy", "Groundskeeper Willie", "Milhouse", "Moe", "Mr. Burns", "Flanders", "Otto", "Patty and/or Selma", "Ralph Wiggum", "Reverend Lovejoy", "Principal Skinner", "Mayor Quimby", "Nelson Muntz", "Smithers", "Dr. Hibbert", "Dr. Nick", "Lionel Hutz", "Professor Frink", "Troy McClure"];
    let characters_minor = ["Santa's Little Helper", "Sea Captain", "Kang and/or Kodos", "Snake", "Squeaky-Voiced Teen", "Cletus", "Fat Tony", "Gil", "Martin", "Ms. Hoover", "Kirk Van Houten", "Lunchlady Doris", "Superintendent Chalmers", "Sideshow Bob", "Rodd and/or Todd Flanders"];
    let characters_very_minor = ["the FOX Network", "Hank Scorpio", "Rich Texan", "Disco Stu", "Snowball", "Jasper", "Lou", "Wendell", "Blue-Haired Lawyer", "Dolph", "Hans Moleman", "Helen Lovejoy", "Herman", "Jimbo Jones", "Kearney", "Maude Flanders", "Sideshow Mel", "Agnes Skinner", "Judge Snyder", "Arnie Pye", "Bumblebee Man", "Artie Ziff", "Duffman", "Crazy Cat Lady", "Sherri and/or Terri"];
    let follow_up = "\n\nThe reply with the most likes wins. Retweets count as " + retweet_multiplier + " likes.";
    let number_of_tweets = 1;


    // Construct the Tweet

    if (testing_mode)
        number_of_tweets = 100;

    for (let i = 0; i < number_of_tweets; i++) {

        let family_joke = false;

        let prompt_is_question = (Math.random() < .75) ? true : false; // 75% chance it will be phrased as a question

        let the_tweet = prompt_is_question ? tweet_question[Math.floor(Math.random() * tweet_question.length)] : tweet_prompt[Math.floor(Math.random() * tweet_prompt.length)];

        the_tweet += " ";

        the_tweet += tweet_superlative[Math.floor(Math.random() * tweet_superlative.length)];


        the_tweet += " ";

        if (Math.random() < .80) { // 80% chance the prompt involves a character

            if (Math.random() < .20) { // 60% chance the prompt involves a family member - 16% overall
                family_joke = true;

                the_tweet += tweet_type[Math.floor(Math.random() * tweet_type.length)];

                the_tweet += " ";
            }

            the_tweet += tweet_simpsons_joke[Math.floor(Math.random() * tweet_simpsons_joke.length)];

            the_tweet += " ";

            the_tweet += tweet_involving[Math.floor(Math.random() * tweet_involving.length)];

            the_tweet += " ";

            if (family_joke)
                the_tweet += characters_family[Math.floor(Math.random() * characters_family.length)];
            else if (Math.random() < .50) // 50% of non-family characters will be major
                the_tweet += characters_major[Math.floor(Math.random() * characters_major.length)];
            else if (Math.random() < .50) // 25% of non-family characters will be minor
                the_tweet += characters_minor[Math.floor(Math.random() * characters_minor.length)];
            else // // 25% of non-family characters will be very minor
                the_tweet += characters_very_minor[Math.floor(Math.random() * characters_very_minor.length)];

        } else {

            the_tweet += tweet_type[Math.floor(Math.random() * tweet_type.length)];

            the_tweet += " ";

            the_tweet += tweet_simpsons_joke[Math.floor(Math.random() * tweet_simpsons_joke.length)];

        }

        the_tweet += prompt_is_question ? "?" : ".";

        /*
    if (!testing_mode)
        the_tweet += follow_up;
*/


        if (testing_mode)
            console.log("Testing: " + the_tweet);
        else {

            setTimeout(function() {

                client.post('statuses/update', { status: the_tweet }, function(error, tweet, response) {
                    if (!error) {
                        console.log("Tweeting: " + the_tweet);
                    }
                });

            }, 5000);

        }
    }
}