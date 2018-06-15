var requestify = require("requestify");
var cron = require("cron");
const config = require('./config');

// Create an incoming webhook
var slack = require('slack-notify')(process.env.SLACKHOOK);

// Load configuration.
const DEFAULT_ICON_URL = config.ICON_URL;
const botName = config.BOTNAME;
const iconUrl = (process.env.ICON_URL || DEFAULT_ICON_URL);
const channelName = config.CHANNEL_NAME;

/**
 * Sends a message to slack.
 */
var announce = function (text) {
    slack.send({
        channel: channelName,
        text: text,
        username: botName,
        icon_url: iconUrl,
    });
};


const _isGameOver = (now, start) => {
  const GAME_TIME = 120 * 60 * 1000;
  return now.getTime() > (start.getTime() + GAME_TIME);
}

const _isGameOver10MinutesAgo = (now, start) => {
  const GAME_TIME = 120 * 60 * 1000;
  const TEN_MINUTES = 10 * 60 * 1000;
  return (
    now.getTime() > (start.getTime() + GAME_TIME) &&
    now.getTime() < (start.getTime() + GAME_TIME + TEN_MINUTES)
  );
}

var cronJob = cron.job("* */7 * * * *", function(){
    const url = config.FETCH_URL;
    console.log(`${new Date().toISOString()} Making a call`);
      // Get Match list
      requestify.get(url).then(function(response) {
        const parsedResponse = JSON.parse(response.body);
        parsedResponse.rounds.forEach((round) => {
          round.matches.forEach((game) => {
            const startDate = new Date(`${game.date}T${game.time}:00.000Z`);
            const nowTime = new Date();
            // Game it's on its way
            if (nowTime > startDate && !_isGameOver(nowTime, startDate)) {
              const vs = `${game.team1.name} VS ${game.team2.name} (${game.group})`;
              const score = `Score: ${game.score1} : ${game.score2}`;
              announce(`${vs} [${score}]`);
            }
            // Game is over in the last 10 minutes - print final score
            else if (nowTime > startDate && _isGameOver10MinutesAgo(nowTime, startDate)) {
              let msg = `
                Final: ${game.team1.name} VS ${game.team2.name} (${game.group})
                Score: ${game.score1} : ${game.score2}
              `;
              if (game.goals1.length > 0) {
                game.goals1.forEach((goal) => {
                  msg += `${game.team1.name} (${goal.name} - ${goal.minute})`;
                });
              }
              if (game.goals2.length > 0) {
                game.goals2.forEach((goal) => {
                  msg += `${game.team2.name} (${goal.name} - ${goal.minute})`;
                });
              }
              announce(msg);
            }
          });
        });
    }).catch((err) => {
        console.error(err);
    });
});

cronJob.start();
