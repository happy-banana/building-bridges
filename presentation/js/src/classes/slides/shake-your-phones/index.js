module.exports = (function(){

  var ContentBase = require('../ContentBase');
  var Constants = require('Constants');

  var teamColors = [
    '#c6363d', //red
    '#0684AF'  //blue
  ];

  var self;

  function ShakeYourPhones($slideHolder) {
    ContentBase.call(this, $slideHolder);

    self = this;

    this.gameDuration = 13; //game lasts 10 seconds
    this.clientsMap = {};
    this.clientsByTeam = [
      [],
      []
    ];
    this.motions = [0, 0];
    this.music = this.$slideHolder.find('#music')[0];

    this.$slideHolder.find('#ip').text('jsworkout.herokuapp.com');

    this.$slideHolder.find('.substate-intro .btn').on('click', this.startClickHandler.bind(this));

    this.$teamBlocks = this.$slideHolder.find('.team');
    this.$teamBlocks.css({
      position: 'absolute',
      height: '100%',
      top: 0
    });
    $(this.$teamBlocks[0]).css('background-color', teamColors[0]);
    $(this.$teamBlocks[1]).css('background-color', teamColors[1]);
    this.displayMotions();

    this.setSubstate(Constants.SHAKE_YOUR_PHONES_INTRO);
  }

  ShakeYourPhones.prototype = Object.create(ContentBase.prototype);

  ShakeYourPhones.prototype.setSubstate = function(substate) {
    if(this.substate !== substate) {
      this.substate = substate;
      //send substate to mobile clients
      this.postSocketMessage({
        target: {
          client: 'mobile',
          slide: 'shake-your-phones'
        },
        content: {
          action: Constants.SET_SUBSTATE,
          substate: this.substate
        }
      });
      if(this.substate === Constants.SHAKE_YOUR_PHONES_GAME) {
        this.resetMotion();
      }
      this.showCurrentState();
    }
  };

  ShakeYourPhones.prototype.receiveSocketMessage = function(message) {
    if(!message.content) {
      return;
    }
    if(message.content.action === 'updateRoomList') {
      //message.content.ids is an array with ids in this room
      var clientMapIds = _.keys(this.clientsMap);
      //which ids are new? (in message.content.ids but not in clientsMap)
      var newClientIds = _.difference(message.content.ids, clientMapIds);
      //which ids need to be removed? (in clientsMap but not in message.content.ids)
      var removeClientIds = _.difference(clientMapIds, message.content.ids);
      //update our map
      newClientIds.forEach(function(id){
        this.clientsMap[id] = {
          id: id,
          teamNr: -1,
          motion: 0,
          size: 10
        };
        //add to the smallest team
        var teamNr = (this.clientsByTeam[0].length < this.clientsByTeam[1].length) ? 0 : 1;
        this.clientsMap[id].teamNr = teamNr;
        //send a message to this client
        this.postSocketMessage({
          target: {
            client: id,
            slide: 'shake-your-phones'
          },
          content: {
            action: Constants.SET_TEAM,
            team: teamNr
          }
        });
       this.postSocketMessage({
          target: {
            client: 'mobile',
            slide: 'shake-your-phones'
          },
          content: {
            action: Constants.SET_SUBSTATE,
            substate: this.substate
          }
        });
        //update the list
        this.updateClientsByTeam();
      }, this);
      removeClientIds.forEach(function(id){
          if(this.clientsMap[id]) {
              //this.clientsMap[id].$div.remove();
          }
          delete this.clientsMap[id];
          this.updateClientsByTeam();
      }, this);

      this.numClientsChanged();
    } else if(message.content.action === Constants.UPDATE_MOTION) {
      if(!message.sender) {
        return;
      }
      //message.sender.id contains the origin id
      if(!this.clientsMap[message.sender.id]) {
        return;
      }
      this.clientsMap[message.sender.id].motion = Math.min(130, message.content.motion); //limit max motion to 130
    }
  };

  ShakeYourPhones.prototype.updateClientsByTeam = function() {
    this.clientsByTeam = [
      [],
      []
    ];
    $.each(this.clientsMap, function(id, client){
      if(client.teamNr !== -1) {
        self.clientsByTeam[client.teamNr].push(client);
      }
    });
  };

  ShakeYourPhones.prototype.startClickHandler = function() {
      this.setSubstate(Constants.SHAKE_YOUR_PHONES_GAME);
  };

  ShakeYourPhones.prototype.resetMotion = function() {
    this.motions = [0, 0];
    for(var id in this.clientsMap) {
      this.clientsMap[id].motion = 0;
    }
  };

  ShakeYourPhones.prototype.numClientsChanged = function() {
      this.$slideHolder.find('#connections span').text(_.keys(this.clientsMap).length);
  };

  ShakeYourPhones.prototype.showCurrentState = function() {
    this.$slideHolder.find('.substate').removeClass('active');
    this.$slideHolder.find('.slide').css({
      backgroundImage: 'none'
    });
    if(this.substate === Constants.SHAKE_YOUR_PHONES_GAME) {
      this.music.play();
      this.$slideHolder.find('.substate-game .countdown').html(this.gameDuration);
      this.$slideHolder.find('.substate-game').addClass('active');
      this.countDownTimeout = setTimeout(this.countDownHandler.bind(this, this.gameDuration - 1), 1000);
    } else if(this.substate === Constants.SHAKE_YOUR_PHONES_FINISHED) {
      //show winner
      var ratio = this.calculateRatio();
      var winningTeam = (ratio > 0.5) ? 0 : 1;
      var winningTeamColor = (winningTeam === 0) ? "red" : "blue";
      this.$slideHolder.find('.substate-finished h1').text('Team ' + winningTeamColor + ' wins!');
      this.$slideHolder.find('.substate-finished').addClass('active');
      //notify the mobile clients
      var winningIds = [];
      var losingIds = [];
      $.each(this.clientsMap, function(id, client){
        if(client.teamNr === winningTeam) {
          winningIds.push(id);
        }
        else {
          losingIds.push(id);
        }
      });
      this.postSocketMessage({
        target: {
          client: winningIds,
          slide: 'shake-your-phones'
        },
        content: {
          action: Constants.YOU_WIN
        }
      });
      this.postSocketMessage({
        target: {
          client: losingIds,
          slide: 'shake-your-phones'
        },
        content: {
          action: Constants.YOU_LOSE
        }
      });
    } else {
      this.$slideHolder.find('.slide').css({
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center center',
        backgroundImage: 'url(slides/images/iphone-connections.png)'
      });
      this.$slideHolder.find('.substate-intro').addClass('active');
    }
  };

  ShakeYourPhones.prototype.countDownHandler = function(timeLeft) {
    this.$slideHolder.find('.substate-game .countdown').html(timeLeft);
    if(timeLeft > 0) {
      this.countDownTimeout = setTimeout(this.countDownHandler.bind(this, timeLeft - 1), 1000);
    } else {
      this.setSubstate(Constants.SHAKE_YOUR_PHONES_FINISHED);
    }
  };

  ShakeYourPhones.prototype.drawLoop = function() {
    if(this.substate === Constants.SHAKE_YOUR_PHONES_GAME) {
      //calculate current motions
      var currentMotions = [0, 0];
      $.each(this.clientsMap, function(id, client){
        if(client.teamNr > -1 && client.motion) {
          currentMotions[client.teamNr] += client.motion;
        }
      });
      //take average motion
      currentMotions[0] /= this.clientsByTeam[0].length;
      currentMotions[1] /= this.clientsByTeam[1].length;
      //add to motion
      this.motions[0] += currentMotions[0];
      this.motions[1] += currentMotions[1];
      //ease it
      this.motions[0] *= 0.97;
      this.motions[1] *= 0.97;
      //visualize it
      this.displayMotions();
    }
  };

  ShakeYourPhones.prototype.calculateRatio = function() {
    var totalMotion = this.motions[0] + this.motions[1];
    var ratio = (totalMotion > 0) ? this.motions[0] / totalMotion : 0.5;
    return ratio;
  };

  ShakeYourPhones.prototype.displayMotions = function() {
    var ratio = this.calculateRatio();
    //console.log(this.motions[0], this.motions[1], totalMotion, ratio);
    $(this.$teamBlocks[0]).css({
      left: 0,
      width: (ratio * 100) + '%'
    });
    $(this.$teamBlocks[1]).css({
      right: 0,
      width: (100 - (ratio * 100)) + '%'
    });
  };

  return ShakeYourPhones;

})();
