/*jslint browser this */
/*global _, player, computer, utils */

(function () {
    "use strict";

    var game = {
        PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
        PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
        PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
        PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
        PHASE_GAME_OVER: "PHASE_GAME_OVER",
        PHASE_WAITING: "waiting",
        RIGHT_CLICK: false,
        currentPhase: "",
        phaseOrder: [],
        decalage: 0,
        gameOver: false,
        // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
        playerTurnPhaseIndex: 2,

        // l'interface utilisateur doit-elle être bloquée ?
        waiting: false,

        // garde une référence vers les noeuds correspondant du dom
        grid: null,
        miniGrid: null,
        // liste des joueurs
        players: [],

        // liste des sons
        tir: new Audio('./sound/boom.mp3'),

        hit: [
            new Audio('./sound/hit/formule1.mp3'),
            new Audio('./sound/hit/playerSard.mp3'),
            new Audio('./sound/hit/wow.mp3'),
            new Audio('./sound/hit/wow2.mp3')
        ],

        miss: [
            new Audio('./sound/miss/brawh.mp3'),
            new Audio('./sound/miss/concentreToi.mp3'),
            new Audio('./sound/miss/fart.mp3'),
            new Audio('./sound/miss/honteux.mp3'),
            new Audio('./sound/miss/nein.mp3'),
            new Audio('./sound/miss/nop.mp3')
        ],

        // lancement du jeu
        init: function () {

            //on protege nos oreilles
            this.tir.volume = 0.1;
            this.hit.forEach(e => {
                e.volume = 0.1;
            });
            this.miss.forEach(e => {
                e.volume = 0.1;
            });

            // initialisation
            this.grid = document.querySelector('.board .main-grid');
            this.miniGrid = document.querySelector('.mini-grid');
            this.battleship = document.querySelector('.battleship');
            this.destroyer = document.querySelector('.destroyer');
            this.submarine = document.querySelector('.submarine');
            this.smallShip = document.querySelector('.small-ship');

            this.card = document.querySelector('.card');


            this.phaseOrder = [];
            self = this;
            this.card.addEventListener('click', function (e) {
                e = e || window.event;
                e = e.target || e.srcElement;
                if (e.nodeName === 'SPAN') {
                    console.log(e.id);
                    switch (e.id) {
                        case 'firstP-Moi':
                            self.phaseOrder = [
                                self.PHASE_INIT_PLAYER,
                                self.PHASE_INIT_OPPONENT,
                                self.PHASE_PLAY_PLAYER,
                                self.PHASE_PLAY_OPPONENT,
                                self.PHASE_GAME_OVER
                            ];
                            break;
                        case 'firstP-Ordinateur':
                            self.phaseOrder = [
                                self.PHASE_INIT_OPPONENT,
                                self.PHASE_INIT_PLAYER,
                                self.PHASE_PLAY_OPPONENT,
                                self.PHASE_PLAY_PLAYER,
                                self.PHASE_GAME_OVER,
                            ];
                            break;
                        case 'firstP-Aleatoire':
                            let res = self.getRandomInt(0, 2);
                            if (res) {
                                utils.info('Vous adversaire commence');
                                self.phaseOrder = [
                                    self.PHASE_INIT_OPPONENT,
                                    self.PHASE_INIT_PLAYER,
                                    self.PHASE_PLAY_OPPONENT,
                                    self.PHASE_PLAY_PLAYER,
                                    self.PHASE_GAME_OVER,
                                ];
                            } else {
                                utils.info('Vous commencez');
                                self.phaseOrder = [
                                    self.PHASE_INIT_PLAYER,
                                    self.PHASE_INIT_OPPONENT,
                                    self.PHASE_PLAY_PLAYER,
                                    self.PHASE_PLAY_OPPONENT,
                                    self.PHASE_GAME_OVER
                                ];
                            }
                            break;
                        default:
                            self.phaseOrder = [
                                self.PHASE_INIT_PLAYER,
                                self.PHASE_INIT_OPPONENT,
                                self.PHASE_PLAY_PLAYER,
                                self.PHASE_PLAY_OPPONENT,
                                self.PHASE_GAME_OVER
                            ];
                            break;
                    }
                    self.card.style.visibility = 'hidden';
                    // initialise les joueurs
                    self.setupPlayers();

                    // ajoute les écouteur d'événement sur la grille
                    self.addListeners();

                    // c'est parti !
                    self.goNextPhase();
                }
            });
            // défini l'ordre des phase de jeu



        },
        setupPlayers: function () {
            // donne aux objets player et computer une réference vers l'objet game
            player.setGame(this);
            computer.setGame(this);

            // todo : implémenter le jeu en réseaux
            this.players = [player, computer];

            this.players[0].init();
            this.players[1].init();
        },
        goNextPhase: function () {
            // récupération du numéro d'index de la phase courante
            var ci = this.phaseOrder.indexOf(this.currentPhase);
            var self = this;

            if (ci !== this.phaseOrder.length - 1) {
                this.currentPhase = this.phaseOrder[ci + 1];
            } else {
                this.currentPhase = this.phaseOrder[0];
            }
            console.log(this.currentPhase);
            switch (this.currentPhase) {
                case this.PHASE_GAME_OVER:
                    // detection de la fin de partie
                    if (!this.gameIsOver()) {
                        // le jeu n'est pas terminé on recommence un tour de jeu
                        this.currentPhase = this.phaseOrder[this.playerTurnPhaseIndex];
                        console.log(this.currentPhase);
                        if (this.currentPhase == this.PHASE_PLAY_PLAYER) {
                            utils.info("A vous de jouer, choisissez une case !")
                        } else {
                            utils.info("A votre adversaire de jouer...");
                            this.players[1].play();
                        }
                        break;
                    } else {
                        utils.info("La partie est termine");
                        // console.log('partie termine');
                        break;
                    }
                case this.PHASE_INIT_PLAYER:
                    utils.info("Placez vos bateaux");
                    break;
                case this.PHASE_INIT_OPPONENT:
                    this.wait();
                    utils.info("En attente de votre adversaire");
                    this.players[1].areShipsOk();
                    self.stopWaiting();
                    self.goNextPhase();
                    console.log(this.players[1].grid);
                    break;
                case this.PHASE_PLAY_PLAYER:
                    utils.info("A vous de jouer, choisissez une case !");
                    break;
                case this.PHASE_PLAY_OPPONENT:
                    utils.info("A votre adversaire de jouer...");
                    this.players[1].play();
                    break;
            }
        },
        gameIsOver: function () {
            return this.gameOver;
        },
        setgameOver: function () {
            this.gameOver = true;
        },
        getPhase: function () {
            if (this.waiting) {
                return this.PHASE_WAITING;
            }
            return this.currentPhase;
        },
        // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
        wait: function () {
            this.waiting = true;
        },
        // met fin au mode mode "attente"
        stopWaiting: function () {
            this.waiting = false;
        },
        addListeners: function () {
            // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
            this.grid.addEventListener('contextmenu', _.bind(this.handleRightClick, this))
            this.grid.addEventListener('mousemove', _.bind(this.handleMouseMove, this));
            this.grid.addEventListener('click', _.bind(this.handleClick, this));


        },
        handleMouseMove: function (e) {
            // on est dans la phase de placement des bateau
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];
                let topForRight = (utils.eq(e.target.parentNode) - Math.floor(ship.getLife() / 2)) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60);
                let topForLeft = (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60);
                // si on a pas encore affiché (ajouté aux DOM) ce bateau
                if (!ship.dom.parentNode) {
                    this.grid.appendChild(ship.dom);
                    // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
                    ship.dom.style.zIndex = -1;
                }
                // décalage visuelle, le point d'ancrage du curseur est au milieu du bateau
                if (this.RIGHT_CLICK) {

                    ship.dom.style.height = "" + utils.CELL_SIZE * ship.life + "px";
                    ship.dom.style.width = "" + utils.CELL_SIZE + "px";
                    ship.dom.style.top = "" + (topForRight - this.decalage) + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE + "px";

                } else {

                    ship.dom.style.height = "" + utils.CELL_SIZE + "px";
                    ship.dom.style.width = "" + utils.CELL_SIZE * ship.life + "px";
                    ship.dom.style.top = "" + (topForLeft - this.decalage) + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
                }
            }
        },
        handleRightClick: function (e) {
            e.preventDefault();
            this.RIGHT_CLICK = this.RIGHT_CLICK ? false : true;
        },
        handleClick: function (e) {
            // self garde une référence vers "this" en cas de changement de scope
            var self = this;
            var ship = this.players[0].fleet[this.players[0].activeShip];

            // si on a cliqué sur une cellule (délégation d'événement)
            if (e.target.classList.contains('cell')) {
                // si on est dans la phase de placement des bateau
                if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                    // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                    if (this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode), this.RIGHT_CLICK)) {

                        if (this.RIGHT_CLICK) {
                            this.decalage += (ship.getLife() - 1) * 60;
                        }

                        // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
                        if (!this.players[0].activateNextShip()) {
                            this.wait();
                            utils.confirm("Confirmez le placement ?", function () {
                                // si le placement est confirmé
                                self.stopWaiting();
                                self.renderMiniMap();
                                self.players[0].clearPreview();
                                self.goNextPhase();
                            }, function () {
                                self.stopWaiting();
                                // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                self.players[0].resetShipPlacement();
                            });
                        }
                    }
                    // si on est dans la phase de jeu (du joueur humain)
                } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
                    this.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode));
                }
            }
        },
        // fonction utlisée par les objets représentant les joueurs (ordinateur ou non)
        // pour placer un tir et obtenir de l'adversaire l'information de réusssite ou non du tir
        fire: function (from, col, line, callback) {

            this.tir.play();
            this.wait();
            var self = this;
            var msg = "";

            // determine qui est l'attaquant et qui est attaqué
            var target = this.players.indexOf(from) === 0
                ? this.players[1]
                : this.players[0];

            var actualPlayer = this.players.indexOf(from) === 0
                ? this.players[0]
                : this.players[1];

            if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
                msg += "Votre adversaire vous a... ";
            }

            if (this.currentPhase === this.PHASE_PLAY_PLAYER) {
                if (self.players[0].tries[line][col] !== 0) {
                    msg += 'Vous avez deja tiré ici et vous aviez... ';
                }
            }
            // on demande à l'attaqué si il a un bateaux à la position visée
            // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
            target.receiveAttack(col, line, function (hasSucceed) {
                setTimeout(function () {

                    if (hasSucceed) {
                        self.hit[self.getRandomInt(0, self.hit.length)].play();
                        msg += "Touché !";
                    } else {
                        self.miss[self.getRandomInt(0, self.miss.length)].play();
                        msg += "Manqué...";
                    }


                    // self.players[0].renderTries(self.grid);
                    utils.info(msg);

                    // on invoque la fonction callback (4e paramètre passé à la méthode fire)
                    // pour transmettre à l'attaquant le résultat de l'attaque
                    callback(hasSucceed);
                }, 1000);

                // on fait une petite pause avant de continuer...
                // histoire de laisser le temps au joueur de lire les message affiché
                setTimeout(function () {
                    self.stopWaiting();
                    self.players[0].renderTries(self.grid);
                    if (hasSucceed) {

                        if (actualPlayer.tries[line][col] != 0) {

                            let Id_bateau = target.grid[line][col];
                            let bateau = target.getFromId(Id_bateau);
                            bateau.setLife(bateau.life - 1);

                            if (bateau.life <= 0 && target == self.players[0]) {
                                switch (bateau.name) {
                                    case 'Battleship':
                                        self.battleship.classList.add("sunk");
                                        break;
                                    case 'Destroyer':
                                        self.destroyer.classList.add("sunk");
                                        break;
                                    case 'Submarine':
                                        self.submarine.classList.add("sunk");
                                        break;
                                    case 'small-ship':
                                        self.smallShip.classList.add("sunk");
                                        break;
                                }
                            }

                            let res = target.testAlive();
                            if (res.length == target.fleet.length) {
                                self.setgameOver();
                                self.currentPhase = self.PHASE_PLAY_OPPONENT;
                                self.goNextPhase();
                                return;
                            }
                        }

                        if (self.players.indexOf(from) === 0) {
                            // si le joueur touche
                            self.currentPhase = self.PHASE_PLAY_PLAYER;
                            msg = "rejoue !";
                            utils.info(msg);
                        } else {
                            // si le bot touche
                            self.players[1].colorHit(self.miniGrid, col, line);
                            self.currentPhase = self.PHASE_PLAY_OPPONENT;
                            msg = "le bot rejoue !";
                            utils.info(msg);
                            self.players[1].play();
                        }

                    } else {
                        self.goNextPhase();
                    }
                }, 2000);
            });

        },
        renderMap: function () {
            this.players[0].renderTries(this.grid);
        },
        renderMiniMap: function () {
            this.players[0].colorMiniMap(this.miniGrid);
        },
        getRandomInt: function (min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min);
        },
    };

    // point d'entrée
    document.addEventListener('DOMContentLoaded', function () {
        game.init();
    });

}());