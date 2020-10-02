/*jslint browser this */
/*global _, player */

(function (global) {
    "use strict";

    var computer = _.assign({}, player, {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        play: function () {
            var self = this;
            setTimeout(function () {
                let colX  = self.getRandomInt(0,10);
                let lineY = self.getRandomInt(0,10);
                // let colX  =0;
                // let lineY  =0;
                while (self.tries[colX][lineY] !== 0) {
                    lineY = self.getRandomInt(0,10);
                    colX = self.getRandomInt(0,10);
                }
                console.log('tire: '+ colX, lineY);
                self.game.fire(this, colX, lineY, function (hasSucced) {
                    self.tries[colX][lineY] = hasSucced;
                });
            }, 2000);
        },
        areShipsOk: function () {
            var self = this;

            function randomXY(ship) {
                randomClick = self.getRandomInt(0,2);
                if(randomClick){
                    randomY = self.getRandomInt(0,9 - ship.life);
                    randomX = self.getRandomInt(0,9);
                } else {
                    randomY = self.getRandomInt(0,9);
                    randomX = self.getRandomInt(0,9 - ship.life);
                }
            }
            function retryWillFail(ship, that) {
                let ok;
                randomXY(ship);
                ok = that.canOrNot(randomX, randomY, randomClick, ship);
                if (ok) {
                    return ok
                } else {
                    retryWillFail(ship, that);
                }
            }
            var randomX, randomY, randomClick;

            this.fleet.forEach(function (ship, i) {

                retryWillFail(ship, this);

                if (randomClick) {
                    let j = 0;

                    while (j < ship.getLife()) {
                        this.grid[randomY + j][randomX] = ship.getId();
                        ship.position.push([randomY + j, randomX]);
                        j += 1;
                    }
                } else {
                    let i = 0;
                    while (i < ship.getLife()) {
                        this.grid[randomY][randomX + i] = ship.getId();
                        ship.position.push([randomY, randomX + i]);
                        i += 1;
                    }
                }
            }, this);
        },
        getRandomInt: function(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min);
        }
    });

    global.computer = computer;

}(this));