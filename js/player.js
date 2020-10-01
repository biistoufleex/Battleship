/*jslint browser this */
/*global _, shipFactory, player, utils */

(function (global) {
    "use strict";

    var sheep = {dom: {parentNode: {removeChild: function () {}}}};

    var player = {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        activeShip: 0,
        init: function () {
            // créé la flotte
            this.fleet.push(shipFactory.build(shipFactory.TYPE_BATTLESHIP));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_DESTROYER));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SUBMARINE));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SMALL_SHIP));

            // créé les grilles
            this.grid = utils.createGrid(10, 10);
            this.tries = utils.createGrid(10, 10);
        },
        play: function (col, line) {
            // appel la fonction fire du game, et lui passe une calback pour récupérer le résultat du tir
            this.game.fire(this, col, line, _.bind(function (hasSucced) {
                this.tries[line][col] = hasSucced;
            }, this));
        },
        // quand il est attaqué le joueur doit dire si il a un bateaux ou non à l'emplacement choisi par l'adversaire
        receiveAttack: function (col, line, callback) {
            var succeed = false;

            if (this.grid[line][col] !== 0) {
                succeed = true;
            }
            callback.call(undefined, succeed);
        },
        setActiveShipPosition: function (x, y, RIGHT_CLICK) {
            var ship = this.fleet[this.activeShip];
            var i = 0;
            var j = 0;
            // console.log(RIGHT_CLICK);
            
            let erreur = false;
            if(RIGHT_CLICK){
                y = (this.fleet.length-1 == this.activeShip ? y-1 :y-2);
                for(let z= 0; z < ship.getLife(); z++){
                    if(this.grid[y+z][x] !== 0 || y < 0 || y + ship.getLife() > 10){
                        erreur = true;
                    }
                }
                if(erreur) return false;
                while (j < ship.getLife()) {
                    this.grid[y+ j][x]  = ship.getId();
                    ship.position.push([y+j, x]);
                    j += 1;
                }
                ship.setIsVertical(true);
            } else { 
                x = (this.fleet.length-1 == this.activeShip ? x-1 : x-2);
                for(let z= 0; z < ship.getLife(); z++){
                    if(this.grid[y][x+z] !== 0 || x < 0 || x + ship.getLife() > 10){
                        erreur = true;
                    }
                }
                if(erreur) return false;
                while (i < ship.getLife()) {
                    this.grid[y][x + i]  = ship.getId();
                    ship.position.push([y, x + i]);
                    i += 1;
                }
            }
            
            // on passe les ship en transparent au click 
            ship.dom.style.opacity = '0';
        
            return true;
        },
        canOrNot: function (x,y,click, currentShip, currentGrid) {
            let erreur = false;

            try {
                
                if(click){
                    for(let z= 0; z < currentShip.getLife(); z++){
                       
                        if(this.grid[y+z][x] !== 0 || y < 0 || y + currentShip.getLife() > 10){
    
                            erreur = true;
                        }
                    }
                    if(erreur) return false;
                } else { 
                    for(let z= 0; z < currentShip.getLife(); z++){
    
                        if(this.grid[y][x+z] !== 0 || x < 0 || x + currentShip.getLife() > 10){
    
                            erreur = true;
                        }
                    }
                    if(erreur) return false;
                }
            } catch (error) {
                console.log(error);
                console.log(this.grid);
                return false;
            }

            return true
        },
        clearPreview: function () {
            this.fleet.forEach(function (ship) {
                if (sheep.dom.parentNode) {
                    sheep.dom.parentNode.removeChild(ship.dom);
                }
            });
        },
        resetShipPlacement: function () {
            this.clearPreview();

            this.activeShip = 0;
            this.grid = utils.createGrid(10, 10);
        },
        activateNextShip: function () {
            if (this.activeShip < this.fleet.length - 1) {
                this.activeShip += 1;
                return true;
            } else {
                return false;
            }
        },
        renderTries: function (grid) {
            this.tries.forEach(function (row, rid) {
                row.forEach(function (val, col) {
                    var node = grid.querySelector('.row:nth-child(' + (rid + 1) + ') .cell:nth-child(' + (col + 1) + ')');

                    if (val === true) {
                        node.style.backgroundColor = '#e60019';
                    } else if (val === false) {
                        node.style.backgroundColor = '#aeaeae';
                    }
                });
            });
        },
        colorHit: function (grid, col, rid) {
    
            var node = grid.querySelector('.row:nth-child(' + (rid + 1) + ') .cell:nth-child(' + (col + 1) + ')');
            node.style.backgroundColor = 'black';
        
        },
        renderShips: function (grid) {
        },
        setGame: function (game) {
            this.game = game;
        },
        colorMiniMap: function (grid) {
            console.log(this.grid);
            for(let i = 0; i < this.fleet.length; i++){
                if(this.fleet[i].isVertical){
                    for (let j = 0; j < this.fleet[i].position.length; j++) {
                        if (i === this.fleet.length -1) {
                            grid.children[this.fleet[i].position[j][0]].children[this.fleet[i].position[j][1]].style.backgroundColor = this.fleet[i].color;
                        } else {
                            grid.children[this.fleet[i].position[j][0]].children[this.fleet[i].position[j][1]].style.backgroundColor = this.fleet[i].color;
                        }
                    }
                } else {
                    for (let j = 0; j < this.fleet[i].position.length; j++) {
                        if (i === this.fleet.length -1) {
                            grid.children[this.fleet[i].position[j][0]].children[this.fleet[i].position[j][1]].style.backgroundColor = this.fleet[i].color;
                        } else {
                            grid.children[this.fleet[i].position[j][0]].children[this.fleet[i].position[j][1]].style.backgroundColor = this.fleet[i].color;
                        }
                    }
                }
            }
        },
        getFromId: function (needed) {
            const result = this.fleet.filter(val => val.id == needed);

            return result[0];
        },
        testAlive: function () {
            let result = this.fleet.filter(val => val.life == 0)
            if (result.length >= 1) {
                console.log('unb mort');
            }
            return result;
        }
    };

    global.player = player;

}(this));