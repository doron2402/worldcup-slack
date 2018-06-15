'use strict';

module.exports = ((ENV = 'develop') => {
  return {
    ICON_URL: 'http://worldcupzones.com/wp-content/uploads/2014/05/the-2014-fifa-world-cup-in46.jpg',
    BOTNAME: process.env.BOTNAME || 'WorldCupBot',
    CHANNEL_NAME: '#' + (process.env.CHANNEL || 'world_cup_2018'),
    LANGUAGE: process.env.LANGUAGE || 'en',
    FETCH_URL: 'https://raw.githubusercontent.com/openfootball/world-cup.json/master/2018/worldcup.json'
  }
})(process.env.NODE_ENV)