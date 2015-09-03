module.exports = (function(){

	var Constants = require('Constants');
	var ContentBase = require('shared/ContentBase');

  var teamColors = [
    '#c6363d', //red
    '#0684AF'  //blue
  ];

	function ShakeYourPhones() {
		ContentBase.call(this, 'shake-your-phones');
		this.currentMotion = 0;
		this.motion = 0;
    this.team = -1;

		this.$background = $('.background');
		this.$background.css('top', '100%');
		this.$background.css('background-color', 'rgba(0, 0, 0, 100)');

		this._motionUpdateHandler = this.motionUpdateHandler.bind(this);
	}

	ShakeYourPhones.prototype = Object.create(ContentBase.prototype);

	ShakeYourPhones.prototype.onStateChanged = function() {
		if(this.state === Constants.STATE_ACTIVE) {
			if (window.DeviceMotionEvent) {
				window.addEventListener('devicemotion', this._motionUpdateHandler, false);
			} else {
				$('.acceleration').text('Not supported on your device :-(');
			}
		} else {
			window.removeEventListener('devicemotion', this._motionUpdateHandler);
		}
	};

	ShakeYourPhones.prototype.receiveSocketMessage = function(message) {
		if(!message.content) {
			return;
		}
    if(message.content.action === Constants.SET_TEAM) {
      this.setTeam(parseInt(message.content.team));
    }
		if(message.content.action === Constants.SET_SUBSTATE) {
      this.setSubstate(message.content.substate);
    }
    if(message.content.action === Constants.YOU_WIN) {
      $('.substate-finished h1').text('Your Team Won!');
    }
    if(message.content.action === Constants.YOU_LOSE) {
      $('.substate-finished h1').text('Your Team Lost...');
    }
	};

  ShakeYourPhones.prototype.setTeam = function(team) {
    team = team % teamColors.length;
    if(team !== this.team) {
      this.team = team;
      //set body background color
      $('body').css('background-color', teamColors[this.team]);
    }
  };

	ShakeYourPhones.prototype.setSubstate = function(substate) {
		if(this.substate !== substate) {
			this.substate = substate;
			this.showCurrentState();
		}
	};

	ShakeYourPhones.prototype.motionUpdateHandler = function(event) {
		this.currentMotion = event.interval * (Math.abs(event.acceleration.x) + Math.abs(event.acceleration.y) + Math.abs(event.acceleration.z));
	};

	ShakeYourPhones.prototype.drawLoop = function() {
		this.motion += this.currentMotion;
		this.motion *= 0.97;
		this.$background.css('top', 100 - this.motion + '%');
		if(this.currentFrame % 10 === 0) {
			this.postSocketMessage({
				target: {
					client: 'presentation',
					slide: 'shake-your-phones'
				},
				content: {
					action: Constants.UPDATE_MOTION,
					motion: this.motion
				}
			});
		}
	};

	ShakeYourPhones.prototype.showCurrentState = function() {
		$('.substate').removeClass('active');
		if(this.substate === Constants.SHAKE_YOUR_PHONES_GAME) {
			$('.substate-game').addClass('active');
		} else if(this.substate === Constants.SHAKE_YOUR_PHONES_FINISHED) {
			$('.substate-finished').addClass('active');
		} else {
			$('.substate-intro').addClass('active');
		}
	};

	return ShakeYourPhones;

})();
