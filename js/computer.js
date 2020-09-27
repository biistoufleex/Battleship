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
                self.game.fire(this, 0, 0, function (hasSucced) {
                    self.tries[0][0] = hasSucced;
                });
            }, 2000);
        },
        areShipsOk: function () {
            console.log(this.grid);

            function getRandomInt(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min) + min);
            }
            function randomXY(ship) {
                randomClick = getRandomInt(0,2);
                if(randomClick){
                    randomY = getRandomInt(0,9 - ship.life);
                    randomX = getRandomInt(0,9);
                } else {
                    randomY = getRandomInt(0,9);
                    randomX = getRandomInt(0,9 - ship.life);
                }
            }
            function retryWillFail(ship, that) {
                let ok;
                randomXY(ship);
                ok = that.canOrNot(randomX, randomY, randomClick, ship, that.grid);
                if (ok) {
                    return ok
                } else {
                    console.log('fail');
                    retryWillFail(ship, that);
                }
            }
            var randomX, randomY, randomClick;
            
            this.fleet.forEach(function (ship, i) {
                
                retryWillFail(ship, this);
                // console.log(ship.getLife());
                if (randomClick) {
                    let j=0;
                    
                    while (j < ship.getLife()) {
                        this.grid[randomY+ j][randomX] = ship.getId();
                        ship.position.push([randomY+j, randomX]);
                        j += 1;
                    }
                } else {
                    let i=0;
                    while (i < ship.getLife()) {
                        this.grid[randomY][randomX + i]  = ship.getId();
                        ship.position.push([randomY, randomX + i]);
                        i += 1;
                    }
                }
                // console.log(this.grid);
            }, this);

        
        }
    });

    global.computer = computer;

}(this));