// Lógica del Juego de Dominó Cubano Doble 9

// --- Variables Globales para el Estado del Juego ---
let estadoJuego = {
    fichasEnTablero: [],    // Array de objetos: { fichaOriginal: {ladoA, ladoB, id}, jugadaComo: {ladoA, ladoB, id} }
    extremosAbiertos: [null, null], 
    turnoJugador: 0,        // 0: Humano, 1: Op1/IA, 2: Compañero/IA, 3: Op2/IA
    manosJugadores: [],     
    fichasDormidas: [],     
    juegoIniciado: false,
    numeroDeJugadores: 2,   // Se establecerá a 2 o 4
    consecutivePasses: 0,
    puntuacionParejas: [0, 0],    // Pareja 0 (Humano + Compañero), Pareja 1 (Oponentes)
    vistaFichas: 'numeros', // Valores posibles: 'numeros', 'puntos'
    ayudaFichasJugablesActiva: true, 
    nombreJugador1: "Jugador 1", 
    nombreCompanero: "Compañero (IA)", 
    nombreOponenteDerecha: "Op. Derecha (IA)", 
    nombreOponenteIzquierda: "Op. Izquierda (IA)", 
    ultimaFichaJugadaId: null, // ID de la última ficha jugada para el scroll
};

let fichaSeleccionadaParaJugar = null; 
let windowFichaEnZoom = null; 


// --- Funciones de Lógica del Juego ---

function generarFichasDoble9() {
    const fichas = [];
    for (let i = 0; i <= 9; i++) {
        for (let j = i; j <= 9; j++) {
            fichas.push({ ladoA: i, ladoB: j, id: `ficha-${i}-${j}` });
        }
    }
    return fichas;
}

function barajarFichas(arrayFichas) {
    const fichasBarajadas = [...arrayFichas];
    for (let i = fichasBarajadas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fichasBarajadas[i], fichasBarajadas[j]] = [fichasBarajadas[j], fichasBarajadas[i]];
    }
    return fichasBarajadas;
}

function repartirFichas(fichasBarajadas, numJugadores) {
    const manosJugadores = [];
    const fichasParaRepartir = [...fichasBarajadas];
    const fichasPorJugador = 10;

    for (let i = 0; i < numJugadores; i++) {
        const manoActual = [];
        for (let j = 0; j < fichasPorJugador; j++) {
            if (fichasParaRepartir.length > 0) {
                manoActual.push(fichasParaRepartir.pop());
            }
        }
        manosJugadores.push(manoActual);
    }
    return { manosJugadores, fichasDormidas: fichasParaRepartir };
}

function determinarSalidaPrimeraRonda(manos) {
    let fichaMasAlta = null; 
    manos.forEach((mano, idx) => {
        mano.forEach(ficha => {
            const esDoble = ficha.ladoA === ficha.ladoB;
            const valorDoble = esDoble ? ficha.ladoA : -1;
            const sumaPuntos = ficha.ladoA + ficha.ladoB;
            if (!fichaMasAlta) {
                fichaMasAlta = { valorDoble, sumaPuntos, ficha, jugadorIdx: idx };
            } else {
                if (esDoble && valorDoble > fichaMasAlta.valorDoble) {
                    fichaMasAlta = { valorDoble, sumaPuntos, ficha, jugadorIdx: idx };
                } else if (esDoble && fichaMasAlta.valorDoble === -1) {
                    fichaMasAlta = { valorDoble, sumaPuntos, ficha, jugadorIdx: idx };
                } else if (fichaMasAlta.valorDoble === -1 && valorDoble === -1 && sumaPuntos > fichaMasAlta.sumaPuntos) {
                    fichaMasAlta = { valorDoble, sumaPuntos, ficha, jugadorIdx: idx };
                } else if ((valorDoble === fichaMasAlta.valorDoble && esDoble) || (sumaPuntos === fichaMasAlta.sumaPuntos && !esDoble && fichaMasAlta.valorDoble === -1)) {
                    if (idx < fichaMasAlta.jugadorIdx) {
                        fichaMasAlta = { valorDoble, sumaPuntos, ficha, jugadorIdx: idx };
                    }
                }
            }
        });
    });
    if (fichaMasAlta) {
        return { jugadorIdx: fichaMasAlta.jugadorIdx, fichaDeSalida: fichaMasAlta.ficha };
    }
    return { jugadorIdx: 0, fichaDeSalida: (manos[0] && manos[0].length > 0) ? manos[0][0] : null };
}

function calcularPuntosMano(mano) {
    if (!mano) return 0;
    return mano.reduce((suma, ficha) => suma + ficha.ladoA + ficha.ladoB, 0);
}

function limpiarResaltadoBotonesAccion() {
    const startRoundBtn = document.getElementById('start-round-button');
    const newGameBtn = document.getElementById('new-game-button');
    if (startRoundBtn) startRoundBtn.classList.remove('call-to-action-button');
    if (newGameBtn) newGameBtn.classList.remove('call-to-action-button');
}


function verificarFinDePartida() {
    limpiarResaltadoBotonesAccion(); 
    const puntuacionPareja0 = estadoJuego.puntuacionParejas[0];
    const puntuacionPareja1 = estadoJuego.puntuacionParejas[1];
    let partidaTerminada = false;

    if (puntuacionPareja0 >= 100 || puntuacionPareja1 >= 100) {
        partidaTerminada = true;
        estadoJuego.juegoIniciado = false; 
        let mensajeFinal = "";
        const nombreJ1 = estadoJuego.nombreJugador1;
        const nombrePareja0 = (estadoJuego.numeroDeJugadores === 4) ? `${nombreJ1} y ${estadoJuego.nombreCompanero}` : nombreJ1;
        const nombrePareja1 = (estadoJuego.numeroDeJugadores === 4) ? `${estadoJuego.nombreOponenteDerecha} y ${estadoJuego.nombreOponenteIzquierda}` : "Oponente (IA)";


        if (puntuacionPareja0 >= 100 && puntuacionPareja0 > puntuacionPareja1) {
            mensajeFinal = `¡${nombrePareja0} ha ganado la partida con ${puntuacionPareja0} puntos!`;
        } else if (puntuacionPareja1 >= 100 && puntuacionPareja1 > puntuacionPareja0) {
            mensajeFinal = `¡${nombrePareja1} ha ganado la partida con ${puntuacionPareja1} puntos!`;
        } else if (puntuacionPareja0 === puntuacionPareja1 && puntuacionPareja0 >=100) { 
             mensajeFinal = `¡Empate increíble con ${puntuacionPareja0} puntos! Nadie gana la partida.`;
        } else if (puntuacionPareja0 >= 100) { 
             mensajeFinal = `¡${nombrePareja0} ha ganado la partida con ${puntuacionPareja0} puntos!`;
        } else if (puntuacionPareja1 >= 100) {
             mensajeFinal = `¡${nombrePareja1} ha ganado la partida con ${puntuacionPareja1} puntos!`;
        }

        actualizarMensaje(`${mensajeFinal} Presiona 'Nueva Partida' para jugar de nuevo.`);
        
        const newGameBtn = document.getElementById('new-game-button');
        if (newGameBtn) {
            newGameBtn.style.display = 'inline-block';
            newGameBtn.classList.add('call-to-action-button');
        }
        document.getElementById('start-round-button').style.display = 'none';
    }
    return partidaTerminada;
}


function iniciarNuevaRonda(esNuevaPartida = false) {
    limpiarResaltadoBotonesAccion();
    estadoJuego.fichasEnTablero = [];
    estadoJuego.extremosAbiertos = [null, null];
    estadoJuego.consecutivePasses = 0; 
    fichaSeleccionadaParaJugar = null; 
    limpiarResaltadoExtremos(); 
    estadoJuego.ultimaFichaJugadaId = null; // Resetear para scroll
    
    if (esNuevaPartida) {
        estadoJuego.puntuacionParejas = [0, 0]; 
    }
    
    const todasLasFichas = generarFichasDoble9();
    const fichasBarajadas = barajarFichas(todasLasFichas);
    const { manosJugadores, fichasDormidas } = repartirFichas(fichasBarajadas, estadoJuego.numeroDeJugadores);
    estadoJuego.manosJugadores = manosJugadores;
    estadoJuego.fichasDormidas = fichasDormidas;
    const dataSalida = determinarSalidaPrimeraRonda(estadoJuego.manosJugadores);
    estadoJuego.turnoJugador = dataSalida.jugadorIdx;
    estadoJuego.juegoIniciado = true;

    actualizarUIManos(); 
    actualizarUITablero(); 
    actualizarUIMarcador(); 
    
    let nombreTurno;
    if (estadoJuego.turnoJugador === 0) nombreTurno = estadoJuego.nombreJugador1;
    else if (estadoJuego.turnoJugador === 1) nombreTurno = (estadoJuego.numeroDeJugadores === 4) ? estadoJuego.nombreOponenteDerecha : "Jugador 2 (IA)";
    else if (estadoJuego.turnoJugador === 2) nombreTurno = estadoJuego.nombreCompanero;
    else if (estadoJuego.turnoJugador === 3) nombreTurno = estadoJuego.nombreOponenteIzquierda;
    
    let mensajeRonda = `Inicia la ronda. Turno de ${nombreTurno}.`;
    if (estadoJuego.turnoJugador === 0 && dataSalida.fichaDeSalida) { 
        mensajeRonda += ` Se sugiere jugar ${dataSalida.fichaDeSalida.ladoA}-${dataSalida.fichaDeSalida.ladoB}.`;
    }
    actualizarMensaje(mensajeRonda);
    actualizarResaltadoFichasJugables(); 

    document.getElementById('start-round-button').style.display = 'inline-block';
    document.getElementById('new-game-button').style.display = 'none';

    if (estadoJuego.juegoIniciado && estadoJuego.turnoJugador !== 0 && estadoJuego.numeroDeJugadores > 1) { 
        if (puedeJugar(estadoJuego.manosJugadores[estadoJuego.turnoJugador], estadoJuego.extremosAbiertos)) {
            if (estadoJuego.fichasEnTablero.length === 0 && dataSalida.fichaDeSalida && estadoJuego.turnoJugador === dataSalida.jugadorIdx) {
                 setTimeout(() => { 
                    jugarFicha(dataSalida.fichaDeSalida, null);
                 }, 1000 + Math.random() * 1000);
            } else { 
                jugarTurnoIA();
            }
        } else {
             setTimeout(() => {
                if(estadoJuego.juegoIniciado && estadoJuego.turnoJugador !== 0 && 
                   !puedeJugar(estadoJuego.manosJugadores[estadoJuego.turnoJugador], estadoJuego.extremosAbiertos)) {
                    cambiarTurno(); 
                }
             }, 500);
        }
    }
}

function obtenerExtremosAbiertos() {
    if (estadoJuego.fichasEnTablero.length === 0) {
        return [null, null];
    }
    const primeraFichaEnTablero = estadoJuego.fichasEnTablero[0].jugadaComo;
    const ultimaFichaEnTablero = estadoJuego.fichasEnTablero[estadoJuego.fichasEnTablero.length - 1].jugadaComo;
    return [primeraFichaEnTablero.ladoA, ultimaFichaEnTablero.ladoB];
}

function esMovimientoValido(ficha, extremoElegido) {
    if (extremoElegido === null) return true; 
    return ficha.ladoA === extremoElegido || ficha.ladoB === extremoElegido;
}

function limpiarResaltadoExtremos() {
    document.querySelectorAll('#domino-table .ficha-en-tablero.extremo-jugable').forEach(el => {
        el.classList.remove('extremo-jugable');
    });
     document.querySelectorAll('#domino-table.extremo-drop-activo').forEach(el => {
        el.classList.remove('extremo-drop-activo');
    });
}


function jugarFicha(fichaOriginal, extremoDelTableroAlQueConecta) {
    console.log('DEBUG: Entrando en jugarFicha con:', JSON.parse(JSON.stringify(fichaOriginal)), 'Extremo:', extremoDelTableroAlQueConecta, 'Tablero actual:', JSON.parse(JSON.stringify(estadoJuego.fichasEnTablero)));

    if (!estadoJuego.juegoIniciado) {
        actualizarMensaje("El juego ha terminado o no ha iniciado. Presiona 'Iniciar Nueva Ronda' o 'Nueva Partida'.");
        return;
    }

    limpiarResaltadoExtremos(); 
    fichaSeleccionadaParaJugar = null; 

    const manoActual = estadoJuego.manosJugadores[estadoJuego.turnoJugador];
    const indiceFichaEnMano = manoActual.findIndex(f => f.id === fichaOriginal.id);
    
    if (indiceFichaEnMano === -1 && estadoJuego.fichasEnTablero.length > 0) { 
        console.error("Error: Ficha no encontrada en la mano del jugador.", fichaOriginal);
        actualizarMensaje("Error: Ficha no encontrada en tu mano.");
        return;
    }
    let fichaParaJugarComo; 
    if (estadoJuego.fichasEnTablero.length === 0) { 
        fichaParaJugarComo = { ...fichaOriginal };
        estadoJuego.fichasEnTablero.push({ fichaOriginal, jugadaComo: fichaParaJugarComo });
        console.log('DEBUG: Ficha añadida a fichasEnTablero (primera ficha). Nuevo estado:', JSON.parse(JSON.stringify(estadoJuego.fichasEnTablero)));
    } else {
        const [extIzquierdo, extDerecho] = estadoJuego.extremosAbiertos; 
        if (extremoDelTableroAlQueConecta === extIzquierdo) { 
            if (fichaOriginal.ladoB === extremoDelTableroAlQueConecta) {
                fichaParaJugarComo = { ladoA: fichaOriginal.ladoA, ladoB: fichaOriginal.ladoB, id: fichaOriginal.id };
            } else if (fichaOriginal.ladoA === extremoDelTableroAlQueConecta) {
                fichaParaJugarComo = { ladoA: fichaOriginal.ladoB, ladoB: fichaOriginal.ladoA, id: fichaOriginal.id };
            } else {
                 actualizarMensaje("Movimiento inválido (ficha no coincide con extremo izquierdo)."); return;
            }
            estadoJuego.fichasEnTablero.unshift({ fichaOriginal, jugadaComo: fichaParaJugarComo });
            console.log('DEBUG: Ficha añadida a fichasEnTablero (unshift). Nuevo estado:', JSON.parse(JSON.stringify(estadoJuego.fichasEnTablero)));
        } else if (extremoDelTableroAlQueConecta === extDerecho) { 
            if (fichaOriginal.ladoA === extremoDelTableroAlQueConecta) {
                fichaParaJugarComo = { ladoA: fichaOriginal.ladoA, ladoB: fichaOriginal.ladoB, id: fichaOriginal.id };
            } else if (fichaOriginal.ladoB === extremoDelTableroAlQueConecta) {
                fichaParaJugarComo = { ladoA: fichaOriginal.ladoB, ladoB: fichaOriginal.ladoA, id: fichaOriginal.id };
            } else {
                actualizarMensaje("Movimiento inválido (ficha no coincide con extremo derecho)."); return;
            }
            estadoJuego.fichasEnTablero.push({ fichaOriginal, jugadaComo: fichaParaJugarComo });
            console.log('DEBUG: Ficha añadida a fichasEnTablero (push). Nuevo estado:', JSON.parse(JSON.stringify(estadoJuego.fichasEnTablero)));
        } else {
            actualizarMensaje("Extremo del tablero no válido seleccionado."); return;
        }
    }
    estadoJuego.ultimaFichaJugadaId = fichaOriginal.id; // Guardar ID para scroll

    if (indiceFichaEnMano !== -1) { 
       manoActual.splice(indiceFichaEnMano, 1);
    }
    estadoJuego.extremosAbiertos = obtenerExtremosAbiertos();
    actualizarUIManos(); 
    actualizarUITablero(); // Esto redibuja el tablero y llamará a configurarDropZones y al scroll
    actualizarResaltadoFichasJugables(); 
    estadoJuego.consecutivePasses = 0; 

    if (manoActual.length === 0) { 
        let puntosGanados = 0;
        let nombreGanadorRonda = "";
        let parejaGanadoraIdx = -1;

        if (estadoJuego.numeroDeJugadores === 2) {
            const oponenteIdx = (estadoJuego.turnoJugador + 1) % 2;
            puntosGanados = calcularPuntosMano(estadoJuego.manosJugadores[oponenteIdx]);
            estadoJuego.puntuacionParejas[estadoJuego.turnoJugador] += puntosGanados;
            nombreGanadorRonda = (estadoJuego.turnoJugador === 0) ? estadoJuego.nombreJugador1 : "Jugador 2 (IA)";
            revelarManoJugadorIA(oponenteIdx, false);
        } else { 
            parejaGanadoraIdx = (estadoJuego.turnoJugador === 0 || estadoJuego.turnoJugador === 2) ? 0 : 1;
            nombreGanadorRonda = (parejaGanadoraIdx === 0) ? `${estadoJuego.nombreJugador1} y ${estadoJuego.nombreCompanero}` : `${estadoJuego.nombreOponenteDerecha} y ${estadoJuego.nombreOponenteIzquierda}`;
            
            const indicesParejaPerdedora = (parejaGanadoraIdx === 0) ? [1, 3] : [0, 2];
            
            indicesParejaPerdedora.forEach(idxPerdedor => {
                if (idxPerdedor !== estadoJuego.turnoJugador) { 
                    puntosGanados += calcularPuntosMano(estadoJuego.manosJugadores[idxPerdedor]);
                }
            });
            estadoJuego.puntuacionParejas[parejaGanadoraIdx] += puntosGanados;

            if (estadoJuego.turnoJugador !== 1) revelarManoJugadorIA(1, false); 
            if (estadoJuego.turnoJugador !== 2) revelarManoJugadorIA(2, false); 
            if (estadoJuego.turnoJugador !== 3) revelarManoJugadorIA(3, false); 
        }
        
        actualizarUIMarcador();
        estadoJuego.juegoIniciado = false; 
        if (verificarFinDePartida()) { 
            return; 
        } else {
            actualizarMensaje(`¡${nombreGanadorRonda} ha ganado la ronda y suma ${puntosGanados} puntos! Presiona 'Iniciar Nueva Ronda'.`);
            const startRoundBtn = document.getElementById('start-round-button');
            if (startRoundBtn) startRoundBtn.classList.add('call-to-action-button');
        }
        return;
    }
    cambiarTurno();
}

function cambiarTurno() {
    const gameMessagesDiv = document.getElementById('game-messages');
    if (gameMessagesDiv) gameMessagesDiv.classList.remove('mensaje-pase-resaltado'); 

    estadoJuego.turnoJugador = (estadoJuego.turnoJugador + 1) % estadoJuego.numeroDeJugadores;
    let nombreTurno;
    if (estadoJuego.turnoJugador === 0) nombreTurno = estadoJuego.nombreJugador1;
    else if (estadoJuego.turnoJugador === 1) nombreTurno = (estadoJuego.numeroDeJugadores === 4) ? estadoJuego.nombreOponenteDerecha : "Jugador 2 (IA)";
    else if (estadoJuego.turnoJugador === 2) nombreTurno = estadoJuego.nombreCompanero;
    else if (estadoJuego.turnoJugador === 3) nombreTurno = estadoJuego.nombreOponenteIzquierda;

    actualizarMensaje(`Turno de ${nombreTurno}.`);
    actualizarResaltadoFichasJugables(); 

    if (estadoJuego.juegoIniciado) {
        if (!puedeJugar(estadoJuego.manosJugadores[estadoJuego.turnoJugador], estadoJuego.extremosAbiertos)) {
            estadoJuego.consecutivePasses++;
            actualizarMensaje(`${nombreTurno} no tiene jugada. Pasa automáticamente. (Pases: ${estadoJuego.consecutivePasses})`);
            if (gameMessagesDiv) gameMessagesDiv.classList.add('mensaje-pase-resaltado'); 
            
            if (estadoJuego.consecutivePasses >= estadoJuego.numeroDeJugadores) { 
                if (gameMessagesDiv) gameMessagesDiv.classList.remove('mensaje-pase-resaltado'); 
                
                let mensajeTranque = "¡Juego Trancado! ";
                let jugadorConMenosPuntos; 
                let parejaGanadoraIdxTranque = -1; 

                if (estadoJuego.numeroDeJugadores === 2) {
                    const puntosJ0 = calcularPuntosMano(estadoJuego.manosJugadores[0]);
                    const puntosJ1 = calcularPuntosMano(estadoJuego.manosJugadores[1]);
                    
                    if (puntosJ0 < puntosJ1) {
                        estadoJuego.puntuacionParejas[0] += puntosJ1; 
                        mensajeTranque += `${estadoJuego.nombreJugador1} gana la ronda y suma ${puntosJ1} puntos. (J0: ${puntosJ0} vs J1: ${puntosJ1})`;
                        jugadorConMenosPuntos = {idx: 0, puntos: puntosJ0};
                        parejaGanadoraIdxTranque = 0;
                    } else if (puntosJ1 < puntosJ0) {
                        estadoJuego.puntuacionParejas[1] += puntosJ0; 
                        mensajeTranque += `Jugador 2 (IA) gana la ronda y suma ${puntosJ0} puntos. (J0: ${puntosJ0} vs J1: ${puntosJ1})`;
                        jugadorConMenosPuntos = {idx: 1, puntos: puntosJ1};
                        parejaGanadoraIdxTranque = 1;
                    } else {
                        mensajeTranque += `Empate en puntos (${puntosJ0}), nadie suma.`;
                        jugadorConMenosPuntos = {idx: -1, puntos: puntosJ0}; 
                    }
                    revelarManoJugadorIA(1, jugadorConMenosPuntos.idx === 1);
                    if(jugadorConMenosPuntos.idx === 0) {
                         document.getElementById('player-hand-bottom').querySelectorAll('.ficha-domino').forEach(fd => fd.classList.add('ficha-ganadora-tranque'));
                    } else {
                         document.getElementById('player-hand-bottom').querySelectorAll('.ficha-domino').forEach(fd => fd.classList.remove('ficha-ganadora-tranque'));
                    }

                } else { 
                    let puntosManos = estadoJuego.manosJugadores.map((mano, idx) => ({idx, puntos: calcularPuntosMano(mano)}));
                    
                    jugadorConMenosPuntos = puntosManos[0];
                    for (let i = 1; i < 4; i++) {
                        if (puntosManos[i].puntos < jugadorConMenosPuntos.puntos) {
                            jugadorConMenosPuntos = puntosManos[i];
                        } else if (puntosManos[i].puntos === jugadorConMenosPuntos.puntos) {
                            if (puntosManos[i].idx < jugadorConMenosPuntos.idx) {
                                jugadorConMenosPuntos = puntosManos[i];
                            }
                        }
                    }

                    parejaGanadoraIdxTranque = (jugadorConMenosPuntos.idx === 0 || jugadorConMenosPuntos.idx === 2) ? 0 : 1;
                    let puntosASumar = 0;
                    let nombreGanadorPareja = "";
                    let detallePuntosParejas = "";

                    if (parejaGanadoraIdxTranque === 0) { 
                        puntosASumar = calcularPuntosMano(estadoJuego.manosJugadores[1]) + calcularPuntosMano(estadoJuego.manosJugadores[3]);
                        estadoJuego.puntuacionParejas[0] += puntosASumar;
                        nombreGanadorPareja = `${estadoJuego.nombreJugador1} y ${estadoJuego.nombreCompanero}`;
                        detallePuntosParejas = `(P0: ${puntosManos[0].puntos}+${puntosManos[2].puntos}=${puntosManos[0].puntos+puntosManos[2].puntos} vs P1: ${puntosManos[1].puntos}+${puntosManos[3].puntos}=${puntosManos[1].puntos+puntosManos[3].puntos})`;
                    } else { 
                        puntosASumar = calcularPuntosMano(estadoJuego.manosJugadores[0]) + calcularPuntosMano(estadoJuego.manosJugadores[2]);
                        estadoJuego.puntuacionParejas[1] += puntosASumar;
                        nombreGanadorPareja = `${estadoJuego.nombreOponenteDerecha} y ${estadoJuego.nombreOponenteIzquierda}`;
                        detallePuntosParejas = `(P0: ${puntosManos[0].puntos}+${puntosManos[2].puntos}=${puntosManos[0].puntos+puntosManos[2].puntos} vs P1: ${puntosManos[1].puntos}+${puntosManos[3].puntos}=${puntosManos[1].puntos+puntosManos[3].puntos})`;
                    }
                     mensajeTranque += `${nombreGanadorPareja} ganan la ronda (por ${jugadorConMenosPuntos.idx === 0 ? estadoJuego.nombreJugador1 : (jugadorConMenosPuntos.idx === 1 ? estadoJuego.nombreOponenteDerecha : (jugadorConMenosPuntos.idx === 2 ? estadoJuego.nombreCompanero : estadoJuego.nombreOponenteIzquierda))} con ${jugadorConMenosPuntos.puntos} pts) y suman ${puntosASumar} puntos. ${detallePuntosParejas}`;
                    
                    revelarManoJugadorIA(1, jugadorConMenosPuntos.idx === 1 && parejaGanadoraIdxTranque === 1); 
                    revelarManoJugadorIA(2, jugadorConMenosPuntos.idx === 2 && parejaGanadoraIdxTranque === 0); 
                    revelarManoJugadorIA(3, jugadorConMenosPuntos.idx === 3 && parejaGanadoraIdxTranque === 1); 

                    if ((jugadorConMenosPuntos.idx === 0 || jugadorConMenosPuntos.idx === 2) && parejaGanadoraIdxTranque === 0) {
                        if (jugadorConMenosPuntos.idx === 0) document.getElementById('player-hand-bottom').querySelectorAll('.ficha-domino').forEach(fd => fd.classList.add('ficha-ganadora-tranque'));
                    } else {
                        document.getElementById('player-hand-bottom').querySelectorAll('.ficha-domino').forEach(fd => fd.classList.remove('ficha-ganadora-tranque'));
                    }
                }
                
                actualizarUIMarcador();
                estadoJuego.juegoIniciado = false; 
                if (verificarFinDePartida()) { 
                    return; 
                } else {
                    actualizarMensaje(`${mensajeTranque} Presiona 'Iniciar Nueva Ronda'.`);
                    const startRoundBtn = document.getElementById('start-round-button');
                    if (startRoundBtn) startRoundBtn.classList.add('call-to-action-button');
                }
                return; 
            }
            setTimeout(() => { 
                if (gameMessagesDiv && !estadoJuego.juegoIniciado) { 
                } else if (gameMessagesDiv) {
                    gameMessagesDiv.classList.remove('mensaje-pase-resaltado');
                }
                if (estadoJuego.juegoIniciado) cambiarTurno(); 
            }, 1500); 
        } else {
            estadoJuego.consecutivePasses = 0; 
            if (gameMessagesDiv) gameMessagesDiv.classList.remove('mensaje-pase-resaltado');
            
            if (estadoJuego.turnoJugador !== 0 && estadoJuego.numeroDeJugadores > 1) { 
                jugarTurnoIA();
            }
        }
    }
}

function puedeJugar(mano, extremos) {
    if (!mano) return false; 
    if (extremos[0] === null && extremos[1] === null) return mano.length > 0; 
    for (const ficha of mano) {
        if (esMovimientoValido(ficha, extremos[0]) || esMovimientoValido(ficha, extremos[1])) {
            return true;
        }
    }
    return false;
}

// --- Funciones para la UI ---

/**
 * Placeholder para la lógica de la IA.
 */
function jugarTurnoIA() {
    let nombreTurnoIA;
    if (estadoJuego.turnoJugador === 1) nombreTurnoIA = (estadoJuego.numeroDeJugadores === 4) ? estadoJuego.nombreOponenteDerecha : "Jugador 2 (IA)";
    else if (estadoJuego.turnoJugador === 2) nombreTurnoIA = estadoJuego.nombreCompanero;
    else if (estadoJuego.turnoJugador === 3) nombreTurnoIA = estadoJuego.nombreOponenteIzquierda;
    else return; 

    actualizarMensaje(`Turno de ${nombreTurnoIA} (IA), pensando...`);

    setTimeout(() => {
        if (!estadoJuego.juegoIniciado) return; 

        const manoIA = estadoJuego.manosJugadores[estadoJuego.turnoJugador];
        const [extIzquierdo, extDerecho] = obtenerExtremosAbiertos();
        let fichaAJugar = null;
        let extremoElegido = null;

        for (const ficha of manoIA) {
            if (esMovimientoValido(ficha, extIzquierdo)) {
                fichaAJugar = ficha;
                extremoElegido = extIzquierdo;
                break;
            }
        }
        if (!fichaAJugar) {
            for (const ficha of manoIA) {
                if (esMovimientoValido(ficha, extDerecho)) {
                    fichaAJugar = ficha;
                    extremoElegido = extDerecho;
                    break;
                }
            }
        }
        
        if (extIzquierdo === null && manoIA.length > 0) { 
            const dataSalida = determinarSalidaPrimeraRonda(estadoJuego.manosJugadores); 
            if(estadoJuego.turnoJugador === dataSalida.jugadorIdx && dataSalida.fichaDeSalida){
                fichaAJugar = dataSalida.fichaDeSalida;
            } else { 
                fichaAJugar = manoIA[0]; 
            }
            extremoElegido = null;
        }


        if (fichaAJugar) {
            actualizarMensaje(`${nombreTurnoIA} (IA) juega ${fichaAJugar.ladoA}-${fichaAJugar.ladoB}.`);
            jugarFicha(fichaAJugar, extremoElegido);
        } else {
            console.warn(`${nombreTurnoIA} (IA) no encontró jugada, pero esto debería haber sido manejado por puedeJugar y cambiarTurno.`);
            if(estadoJuego.juegoIniciado) cambiarTurno(); 
        }
    }, 1000 + Math.random() * 1000); 
}


function revelarManoJugadorIA(jugadorIdx, esGanadorTranque = false) {
    let idContenedor = '';
    let esManoLateral = false; 
    if (estadoJuego.numeroDeJugadores === 2 && jugadorIdx === 1) {
        idContenedor = 'player-hand-top';
    } else if (estadoJuego.numeroDeJugadores === 4) {
        if (jugadorIdx === 1) { idContenedor = 'player-hand-right'; esManoLateral = true; }      
        else if (jugadorIdx === 2) { idContenedor = 'player-hand-top'; }  
        else if (jugadorIdx === 3) { idContenedor = 'player-hand-left'; esManoLateral = true; } 
        else return; 
    } else {
        return; 
    }

    const manoCont = document.getElementById(idContenedor);
    if (!manoCont) return;
    manoCont.innerHTML = ''; 

    const mano = estadoJuego.manosJugadores[jugadorIdx];
    if (mano && mano.length > 0) {
        mano.forEach(ficha => {
            const fichaDiv = document.createElement('div');
            fichaDiv.classList.add('ficha-domino'); 
            if (esGanadorTranque) {
                fichaDiv.classList.add('ficha-ganadora-tranque');
            }
            const ladoADiv = document.createElement('div'); 
            ladoADiv.classList.add('mitad-ficha-canvas');
            const ladoBDiv = document.createElement('div'); 
            ladoBDiv.classList.add('mitad-ficha-canvas');

            const esVerticalVisual = (idContenedor === 'player-hand-top'); 
            
            if (estadoJuego.vistaFichas === 'numeros') {
                ladoADiv.textContent = ficha.ladoA;
                ladoBDiv.textContent = ficha.ladoB;
            } else {
                ladoADiv.innerHTML = generarHTMLPuntos(ficha.ladoA, esVerticalVisual);
                ladoBDiv.innerHTML = generarHTMLPuntos(ficha.ladoB, esVerticalVisual);
            }
            
            const separadorVisual = document.createElement('span'); 
            
            fichaDiv.appendChild(ladoADiv);
            fichaDiv.appendChild(separadorVisual); 
            fichaDiv.appendChild(ladoBDiv);
            manoCont.appendChild(fichaDiv);
        });
    } else {
        manoCont.textContent = "(Mano vacía)";
    }
}


function actualizarResaltadoFichasJugables() {
    const manoHumanoDiv = document.getElementById('player-hand-bottom');
    if (!manoHumanoDiv) return;
    manoHumanoDiv.querySelectorAll('.ficha-domino').forEach(fichaDiv => {
        fichaDiv.classList.remove('ficha-jugable');
    });

    if (!estadoJuego.ayudaFichasJugablesActiva) { 
        return; 
    }

    if (estadoJuego.turnoJugador !== 0 || !estadoJuego.juegoIniciado) {
        return;
    }
    const manoHumano = estadoJuego.manosJugadores[0];
    if (!manoHumano) return; 
    const [extIzquierdo, extDerecho] = obtenerExtremosAbiertos();
    manoHumano.forEach(ficha => {
        let esJugable = false;
        if (extIzquierdo === null) { 
            esJugable = true;
        } else {
            if (esMovimientoValido(ficha, extIzquierdo) || esMovimientoValido(ficha, extDerecho)) {
                esJugable = true;
            }
        }
        if (esJugable) {
            const fichaDiv = manoHumanoDiv.querySelector(`.ficha-domino[data-id='${ficha.id}']`);
            if (fichaDiv) {
                fichaDiv.classList.add('ficha-jugable');
            }
        }
    });
}


function actualizarMensaje(texto) {
    const gameMessagesDiv = document.getElementById('game-messages');
    if (gameMessagesDiv) {
        if (!texto.includes("Pasa automáticamente")) {
             gameMessagesDiv.classList.remove('mensaje-pase-resaltado');
        }
        gameMessagesDiv.textContent = texto;
    }
}

function actualizarUIMarcador() {
    const scoreboardDiv = document.getElementById('scoreboard');
    if (!scoreboardDiv) return;

    if (estadoJuego.numeroDeJugadores === 4) {
        scoreboardDiv.innerHTML = `
            <h2>Puntuación</h2>
            <p>Pareja 1 (${estadoJuego.nombreJugador1} y ${estadoJuego.nombreCompanero}): ${estadoJuego.puntuacionParejas[0]} puntos</p>
            <p>Pareja 2 (${estadoJuego.nombreOponenteDerecha} y ${estadoJuego.nombreOponenteIzquierda}): ${estadoJuego.puntuacionParejas[1]} puntos</p>
        `;
    } else { // 2 Jugadores
        scoreboardDiv.innerHTML = `
            <h2>Puntuación</h2>
            <p>${estadoJuego.nombreJugador1}: ${estadoJuego.puntuacionParejas[0]} puntos</p>
            <p>Jugador 2 (IA): ${estadoJuego.puntuacionParejas[1]} puntos</p>
        `;
    }
}

function generarHTMLPuntos(valor, esVertical = true) {
    let puntosHTML = '';
    for (let i = 0; i < valor; i++) {
        puntosHTML += '<span class="punto-domino"></span>';
    }
    const orientacionClase = esVertical ? '' : 'horizontal';
    return `<div class="puntos-layout ${orientacionClase} valor-${valor}">${puntosHTML}</div>`;
}


function mostrarFichaEnMano(ficha, contenedorHTML, jugadorIdx) {
    const fichaClicada = ficha; 
    const fichaDiv = document.createElement('div');
    fichaDiv.classList.add('ficha-domino');
    fichaDiv.dataset.ladoA = fichaClicada.ladoA;
    fichaDiv.dataset.ladoB = fichaClicada.ladoB;
    fichaDiv.dataset.id = fichaClicada.id;

    const ladoADiv = document.createElement('div'); 
    ladoADiv.classList.add('mitad-ficha-canvas'); 
    const ladoBDiv = document.createElement('div'); 
    ladoBDiv.classList.add('mitad-ficha-canvas');

    if (estadoJuego.vistaFichas === 'numeros') {
        ladoADiv.innerHTML = ''; 
        ladoBDiv.innerHTML = '';
        ladoADiv.textContent = fichaClicada.ladoA; 
        ladoBDiv.textContent = fichaClicada.ladoB;
    } else { 
        ladoADiv.textContent = ''; 
        ladoBDiv.textContent = '';
        ladoADiv.innerHTML = generarHTMLPuntos(fichaClicada.ladoA, true); 
        ladoBDiv.innerHTML = generarHTMLPuntos(fichaClicada.ladoB, true); 
    }
    
    const separadorVisual = document.createElement('span'); 
    
    fichaDiv.appendChild(ladoADiv);
    fichaDiv.appendChild(separadorVisual); 
    fichaDiv.appendChild(ladoBDiv);

    if (jugadorIdx === 0) { 
        fichaDiv.draggable = true;
        fichaDiv.addEventListener('dragstart', (event) => {
            if (estadoJuego.turnoJugador !== 0 || 
                (estadoJuego.ayudaFichasJugablesActiva && !fichaDiv.classList.contains('ficha-jugable'))) {
                event.preventDefault(); 
                return;
            }
            event.dataTransfer.setData('application/json', JSON.stringify(fichaClicada));
            event.dataTransfer.effectAllowed = 'move';
            setTimeout(() => { 
                fichaDiv.classList.add('ficha-arrastrando');
            }, 0);
            limpiarResaltadoExtremos();
            fichaSeleccionadaParaJugar = null;
        });
        fichaDiv.addEventListener('dragend', (event) => {
            fichaDiv.classList.remove('ficha-arrastrando');
        });
    }


    fichaDiv.addEventListener('click', () => {
        if (!estadoJuego.juegoIniciado) {
            actualizarMensaje("El juego ha terminado o no ha iniciado. Presiona 'Iniciar Nueva Ronda' o 'Nueva Partida'.");
            return;
        }
        if (estadoJuego.turnoJugador !== jugadorIdx) {
            let nombreTurnoActual = "";
            if(estadoJuego.turnoJugador === 0) nombreTurnoActual = estadoJuego.nombreJugador1;
            else if(estadoJuego.turnoJugador === 1) nombreTurnoActual = (estadoJuego.numeroDeJugadores === 4) ? estadoJuego.nombreOponenteDerecha : "Jugador 2 (IA)";
            else if(estadoJuego.turnoJugador === 2) nombreTurnoActual = estadoJuego.nombreCompanero;
            else if(estadoJuego.turnoJugador === 3) nombreTurnoActual = estadoJuego.nombreOponenteIzquierda;
            actualizarMensaje(`No es tu turno. Turno de ${nombreTurnoActual}.`);
            return;
        }

        if (fichaSeleccionadaParaJugar && fichaSeleccionadaParaJugar.id !== fichaClicada.id) {
            limpiarResaltadoExtremos();
            fichaSeleccionadaParaJugar = null; 
        }
        else if (fichaSeleccionadaParaJugar && fichaSeleccionadaParaJugar.id === fichaClicada.id) {
            limpiarResaltadoExtremos();
            fichaSeleccionadaParaJugar = null;
            actualizarMensaje(`Selección de ${fichaClicada.ladoA}-${fichaClicada.ladoB} cancelada. Elige una ficha.`);
            actualizarResaltadoFichasJugables(); 
            return; 
        }
        
        const [extIzquierdo, extDerecho] = obtenerExtremosAbiertos();

        if (extIzquierdo === null) { 
            jugarFicha(fichaClicada, null);
        } else {
            const puedeConectarIzquierdo = esMovimientoValido(fichaClicada, extIzquierdo);
            const puedeConectarDerecho = esMovimientoValido(fichaClicada, extDerecho);
            const esDoble = fichaClicada.ladoA === fichaClicada.ladoB;

            if (esDoble) {
                if (puedeConectarIzquierdo) {
                    jugarFicha(fichaClicada, extIzquierdo);
                } else if (puedeConectarDerecho) {
                    jugarFicha(fichaClicada, extDerecho);
                } else {
                    actualizarMensaje("Este doble no se puede jugar en ningún extremo.");
                }
            } else { 
                if (puedeConectarIzquierdo && puedeConectarDerecho) {
                    if (extIzquierdo === extDerecho) { 
                        jugarFicha(fichaClicada, extIzquierdo); 
                    } else { 
                        limpiarResaltadoExtremos(); 
                        fichaSeleccionadaParaJugar = fichaClicada;
                        actualizarMensaje(`Has seleccionado ${fichaClicada.ladoA}-${fichaClicada.ladoB}. Haz clic en el extremo del tablero donde quieres jugarla.`);
                        document.getElementById('player-hand-bottom').querySelectorAll('.ficha-domino.ficha-jugable').forEach(fD => fD.classList.remove('ficha-jugable'));
                        
                        const tableroDiv = document.getElementById('domino-table');
                        const fichasEnTableroUI = Array.from(tableroDiv.children);
                        if (fichasEnTableroUI.length > 0) {
                            const fichaUIExtIzquierdo = fichasEnTableroUI[0];
                            const fichaUIExtDerecho = fichasEnTableroUI[fichasEnTableroUI.length - 1];
                            
                            const clickHandlerIzquierdo = () => {
                                if (fichaSeleccionadaParaJugar && fichaSeleccionadaParaJugar.id === fichaClicada.id) {
                                    jugarFicha(fichaSeleccionadaParaJugar, extIzquierdo);
                                }
                            };
                            fichaUIExtIzquierdo.classList.add('extremo-jugable');
                            fichaUIExtIzquierdo.addEventListener('click', clickHandlerIzquierdo, { once: true });

                            if (fichaUIExtIzquierdo !== fichaUIExtDerecho) {
                                const clickHandlerDerecho = () => {
                                    if (fichaSeleccionadaParaJugar && fichaSeleccionadaParaJugar.id === fichaClicada.id) {
                                        jugarFicha(fichaSeleccionadaParaJugar, extDerecho);
                                    }
                                };
                                fichaUIExtDerecho.classList.add('extremo-jugable');
                                fichaUIExtDerecho.addEventListener('click', clickHandlerDerecho, { once: true });
                            }
                        }
                    }
                } else if (puedeConectarIzquierdo) {
                    jugarFicha(fichaClicada, extIzquierdo);
                } else if (puedeConectarDerecho) {
                    jugarFicha(fichaClicada, extDerecho);
                } else {
                    actualizarMensaje("Esta ficha no se puede jugar en ningún extremo.");
                }
            }
        }
    });
    contenedorHTML.appendChild(fichaDiv);
    return fichaDiv;
}

function mostrarManoJugadorUI(mano, idContenedor, jugadorIdx) {
    const contenedorHTML = document.getElementById(idContenedor);
    if (!contenedorHTML) return;
    contenedorHTML.innerHTML = ''; 
    if (mano) { 
      mano.forEach(ficha => mostrarFichaEnMano(ficha, contenedorHTML, jugadorIdx));
    }
}

function actualizarUIManos() {
    ['player-hand-bottom', 'player-hand-top', 'player-hand-left', 'player-hand-right'].forEach(id => {
        const cont = document.getElementById(id);
        if (cont) cont.innerHTML = '';
    });

    if (!estadoJuego.manosJugadores || estadoJuego.manosJugadores.length === 0) return;

    mostrarManoJugadorUI(estadoJuego.manosJugadores[0], 'player-hand-bottom', 0);

    const idsContenedoresIA = { 
        1: 'player-hand-right', 
        2: 'player-hand-top',   
        3: 'player-hand-left'   
    };
    const indicesIA = (estadoJuego.numeroDeJugadores === 4) ? [1, 2, 3] : [1]; 

    indicesIA.forEach((idxIA) => {
        let idContenedor;
        if (estadoJuego.numeroDeJugadores === 2 && idxIA === 1) {
            idContenedor = 'player-hand-top';
        } else if (estadoJuego.numeroDeJugadores === 4) {
            idContenedor = idsContenedoresIA[idxIA];
        } else {
            return; 
        }
        
        const manoIACont = document.getElementById(idContenedor);

        if (manoIACont) {
            if (estadoJuego.juegoIniciado && estadoJuego.manosJugadores[idxIA]) { 
                estadoJuego.manosJugadores[idxIA].forEach(_ => { 
                    const fichaDorsoDiv = document.createElement('div');
                    fichaDorsoDiv.classList.add('ficha-domino', 'ficha-dorso');
                    const spanDorso = document.createElement('span'); 
                    spanDorso.textContent = "?";
                    fichaDorsoDiv.appendChild(spanDorso);
                    manoIACont.appendChild(fichaDorsoDiv);
                });
            } else if (!estadoJuego.juegoIniciado && estadoJuego.manosJugadores[idxIA] && estadoJuego.manosJugadores[idxIA].length > 0) {
            } else if (!estadoJuego.juegoIniciado && (!estadoJuego.manosJugadores[idxIA] || estadoJuego.manosJugadores[idxIA].length === 0)) {
                manoIACont.textContent = "(Mano vacía)";
            }
        }
    });
}

function mostrarFichaEnTableroUI(fichaJugadaObj, contenedorTablero) {
    const fichaDiv = document.createElement('div');
    fichaDiv.classList.add('ficha-domino', 'ficha-en-tablero');
    fichaDiv.dataset.originalId = fichaJugadaObj.fichaOriginal.id; 
    fichaDiv.dataset.extremoValorA = fichaJugadaObj.jugadaComo.ladoA;
    fichaDiv.dataset.extremoValorB = fichaJugadaObj.jugadaComo.ladoB;


    const esDobleOriginal = fichaJugadaObj.fichaOriginal.ladoA === fichaJugadaObj.fichaOriginal.ladoB;
    const esVerticalVisual = esDobleOriginal; 

    if (esVerticalVisual) { 
        fichaDiv.classList.add('doble-en-tablero'); 
    } else {
        fichaDiv.classList.add('normal-en-tablero'); 
    }

    const ladoADiv = document.createElement('div'); 
    ladoADiv.classList.add('mitad-ficha-canvas');
    const ladoBDiv = document.createElement('div'); 
    ladoBDiv.classList.add('mitad-ficha-canvas');

    if (estadoJuego.vistaFichas === 'numeros') {
        ladoADiv.textContent = fichaJugadaObj.jugadaComo.ladoA;
        ladoBDiv.textContent = fichaJugadaObj.jugadaComo.ladoB;
    } else {
        ladoADiv.innerHTML = generarHTMLPuntos(fichaJugadaObj.jugadaComo.ladoA, esVerticalVisual);
        ladoBDiv.innerHTML = generarHTMLPuntos(fichaJugadaObj.jugadaComo.ladoB, esVerticalVisual);
    }
    
    const separadorVisual = document.createElement('span');

    fichaDiv.appendChild(ladoADiv);
    fichaDiv.appendChild(separadorVisual); 
    fichaDiv.appendChild(ladoBDiv);
    
    fichaDiv.addEventListener('click', () => {
        if (!fichaSeleccionadaParaJugar && !fichaDiv.classList.contains('extremo-jugable')) {
            windowFichaEnZoom = fichaJugadaObj.fichaOriginal; 
            const zoomPopup = document.getElementById('zoom-popup');
            const zoomContenido = document.getElementById('zoom-contenido');
            zoomContenido.innerHTML = ''; 
            
            const fichaZoomDiv = document.createElement('div');
            fichaZoomDiv.classList.add('ficha-zoom'); 
            const esDobleParaZoom = windowFichaEnZoom.ladoA === windowFichaEnZoom.ladoB;
            if (esDobleParaZoom) {
                fichaZoomDiv.classList.add('vertical-zoom');
            } else {
                fichaZoomDiv.classList.add('horizontal-zoom');
            }

            const ladoAZoom = document.createElement('div'); 
            ladoAZoom.classList.add('mitad-ficha-canvas');
            const ladoBZoom = document.createElement('div'); 
            ladoBZoom.classList.add('mitad-ficha-canvas');
            const separadorZoom = document.createElement('span');

            if(estadoJuego.vistaFichas === 'numeros') {
                ladoAZoom.textContent = windowFichaEnZoom.ladoA; 
                ladoBZoom.textContent = windowFichaEnZoom.ladoB;
            } else {
                ladoAZoom.innerHTML = generarHTMLPuntos(windowFichaEnZoom.ladoA, esDobleParaZoom);
                ladoBZoom.innerHTML = generarHTMLPuntos(windowFichaEnZoom.ladoB, esDobleParaZoom);
            }
            
            fichaZoomDiv.appendChild(ladoAZoom);
            fichaZoomDiv.appendChild(separadorZoom);
            fichaZoomDiv.appendChild(ladoBZoom);
            zoomContenido.appendChild(fichaZoomDiv);
            zoomPopup.style.display = 'flex'; 
        }
    });
    contenedorTablero.appendChild(fichaDiv);
}

function actualizarUITablero() {
    console.log('DEBUG: Entrando en actualizarUITablero. Fichas en tablero:', JSON.parse(JSON.stringify(estadoJuego.fichasEnTablero)));
    const contenedorTablero = document.getElementById('domino-table');
    if (!contenedorTablero) return;
    contenedorTablero.innerHTML = ''; 
    estadoJuego.fichasEnTablero.forEach((fichaJugadaObj) => {
        mostrarFichaEnTableroUI(fichaJugadaObj, contenedorTablero);
    });
    configurarDropZones();

    if (estadoJuego.ultimaFichaJugadaId) {
        const fichaUI = contenedorTablero.querySelector(`.ficha-en-tablero[data-original-id='${estadoJuego.ultimaFichaJugadaId}']`);
        if (fichaUI && typeof fichaUI.scrollIntoView === 'function') {
            fichaUI.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
        estadoJuego.ultimaFichaJugadaId = null; // Resetear después del scroll
    }
}

function configurarDropZones() {
    const contenedorTablero = document.getElementById('domino-table');
    
    contenedorTablero.ondragover = null;
    contenedorTablero.ondragleave = null;
    contenedorTablero.ondrop = null;
    contenedorTablero.classList.remove('extremo-drop-activo'); 

    if (estadoJuego.fichasEnTablero.length === 0) {
        contenedorTablero.ondragover = (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            contenedorTablero.classList.add('extremo-drop-activo');
        };
        contenedorTablero.ondragleave = () => {
            contenedorTablero.classList.remove('extremo-drop-activo');
        };
        contenedorTablero.ondrop = (event) => {
            event.preventDefault();
            contenedorTablero.classList.remove('extremo-drop-activo');
            if (!estadoJuego.juegoIniciado || estadoJuego.turnoJugador !== 0) return;
            if (estadoJuego.fichasEnTablero.length !== 0) return; 

            const fichaArrastradaJSON = event.dataTransfer.getData('application/json');
            if (!fichaArrastradaJSON) return;
            const fichaArrastrada = JSON.parse(fichaArrastradaJSON);
            jugarFicha(fichaArrastrada, null);
        };
    } else {
        const fichasEnTableroUI = Array.from(contenedorTablero.children);
        if (fichasEnTableroUI.length > 0) {
            const extremoIzquierdoUI = fichasEnTableroUI[0];
            const extremoDerechoUI = fichasEnTableroUI[fichasEnTableroUI.length - 1];

            const setupDropEvents = (element, esIzquierdo) => {
                element.ondragover = (event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    element.classList.add('extremo-drop-activo');
                };
                element.ondragleave = () => {
                    element.classList.remove('extremo-drop-activo');
                };
                element.ondrop = (event) => {
                    event.preventDefault();
                    element.classList.remove('extremo-drop-activo');
                    if (!estadoJuego.juegoIniciado || estadoJuego.turnoJugador !== 0) return;

                    const fichaArrastradaJSON = event.dataTransfer.getData('application/json');
                    if (!fichaArrastradaJSON) return;
                    const fichaArrastrada = JSON.parse(fichaArrastradaJSON);
                    
                    const extremoParaConectarValor = esIzquierdo ? estadoJuego.extremosAbiertos[0] : estadoJuego.extremosAbiertos[1];
                                        
                    if (esMovimientoValido(fichaArrastrada, extremoParaConectarValor)) {
                        jugarFicha(fichaArrastrada, extremoParaConectarValor);
                    } else {
                        actualizarMensaje('Movimiento inválido al soltar la ficha.');
                    }
                };
            };
            
            setupDropEvents(extremoIzquierdoUI, true);
            if (extremoIzquierdoUI !== extremoDerechoUI) { 
                setupDropEvents(extremoDerechoUI, false);
            }
        }
    }
}


// --- Lógica de Inicialización y Accesibilidad ---
document.addEventListener('DOMContentLoaded', () => {
    const mainMenuDiv = document.getElementById('main-menu');
    const appContainerDiv = document.getElementById('app-container');
    const practiceButton = document.getElementById('practice-button');
    const subMenuPracticaDiv = document.getElementById('sub-menu-practica');
    const practice1v1Button = document.getElementById('practice-1v1-button');
    const practice2v2Button = document.getElementById('practice-2v2-button');
    const backToMainMenuFromSubmenuButton = document.getElementById('back-to-main-menu-from-submenu-button');

    const toggleVistaButton = document.getElementById('toggle-vista-fichas-button');
    const toggleAyudaFichasButton = document.getElementById('toggle-ayuda-fichas-button');

    const nombreGuardado = localStorage.getItem('nombreJugadorDominó');
    if (nombreGuardado) {
        estadoJuego.nombreJugador1 = nombreGuardado;
    }

    const vistaGuardada = localStorage.getItem('vistaFichas');
    if (vistaGuardada) {
        estadoJuego.vistaFichas = vistaGuardada;
    }
    if (toggleVistaButton) {
        toggleVistaButton.textContent = estadoJuego.vistaFichas === 'puntos' ? "Ver Números" : "Ver Puntos";
    }

    const ayudaGuardada = localStorage.getItem('ayudaFichasJugablesActiva');
    if (ayudaGuardada !== null) {
        estadoJuego.ayudaFichasJugablesActiva = ayudaGuardada === 'true';
    }
    if (toggleAyudaFichasButton) {
        toggleAyudaFichasButton.textContent = estadoJuego.ayudaFichasJugablesActiva ? "Desactivar Ayuda Fichas" : "Activar Ayuda Fichas";
    }


    if (!estadoJuego.puntuacionParejas) { 
        estadoJuego.puntuacionParejas = [0, 0];
    }
    actualizarUIMarcador(); 

    const contrasteGuardado = localStorage.getItem('modoContraste');
    if (contrasteGuardado === 'true') {
        document.body.classList.add('contraste-alto');
    }

    const startRoundButton = document.getElementById('start-round-button');
    if (startRoundButton) {
        startRoundButton.addEventListener('click', () => {
            console.log("Botón 'Iniciar Nueva Ronda' presionado.");
            iniciarNuevaRonda(false); 
        });
    }
    
    const contrasteButton = document.getElementById('contraste-button');
    if (contrasteButton) {
        contrasteButton.addEventListener('click', () => {
            document.body.classList.toggle('contraste-alto');
            localStorage.setItem('modoContraste', document.body.classList.contains('contraste-alto'));
        });
    }

    if (toggleVistaButton) {
        toggleVistaButton.addEventListener('click', () => {
            estadoJuego.vistaFichas = estadoJuego.vistaFichas === 'numeros' ? 'puntos' : 'numeros';
            toggleVistaButton.textContent = estadoJuego.vistaFichas === 'puntos' ? "Ver Números" : "Ver Puntos";
            localStorage.setItem('vistaFichas', estadoJuego.vistaFichas);
            
            actualizarUIManos();
            actualizarUITablero();
            actualizarResaltadoFichasJugables(); 
            
            const zoomPopup = document.getElementById('zoom-popup');
            if (zoomPopup.style.display === 'flex' && windowFichaEnZoom) { 
                const zoomContenido = document.getElementById('zoom-contenido');
                zoomContenido.innerHTML = ''; 
                const fichaZoomDiv = document.createElement('div');
                fichaZoomDiv.classList.add('ficha-zoom');
                const esDobleOriginalEnZoom = windowFichaEnZoom.ladoA === windowFichaEnZoom.ladoB;
                 if (esDobleOriginalEnZoom) {
                    fichaZoomDiv.classList.add('vertical-zoom');
                } else {
                    fichaZoomDiv.classList.add('horizontal-zoom');
                }
                const ladoAZoom = document.createElement('div'); 
                ladoAZoom.classList.add('mitad-ficha-canvas');
                const ladoBZoom = document.createElement('div'); 
                ladoBZoom.classList.add('mitad-ficha-canvas');
                const separadorZoom = document.createElement('span');

                if(estadoJuego.vistaFichas === 'numeros') {
                    ladoAZoom.textContent = windowFichaEnZoom.ladoA; 
                    ladoBZoom.textContent = windowFichaEnZoom.ladoB;
                } else {
                    ladoAZoom.innerHTML = generarHTMLPuntos(windowFichaEnZoom.ladoA, esDobleOriginalEnZoom);
                    ladoBZoom.innerHTML = generarHTMLPuntos(windowFichaEnZoom.ladoB, esDobleOriginalEnZoom);
                }
                fichaZoomDiv.appendChild(ladoAZoom);
                fichaZoomDiv.appendChild(separadorZoom);
                fichaZoomDiv.appendChild(ladoBZoom);
                zoomContenido.appendChild(fichaZoomDiv);
            }
        });
    }

    if (toggleAyudaFichasButton) {
        toggleAyudaFichasButton.addEventListener('click', () => {
            estadoJuego.ayudaFichasJugablesActiva = !estadoJuego.ayudaFichasJugablesActiva;
            localStorage.setItem('ayudaFichasJugablesActiva', estadoJuego.ayudaFichasJugablesActiva);
            toggleAyudaFichasButton.textContent = estadoJuego.ayudaFichasJugablesActiva ? "Desactivar Ayuda Fichas" : "Activar Ayuda Fichas";
            actualizarResaltadoFichasJugables(); 
        });
    }


    const newGameButton = document.getElementById('new-game-button');
    if (newGameButton) {
        newGameButton.addEventListener('click', () => {
            limpiarResaltadoBotonesAccion();
            actualizarMensaje("Iniciando nueva partida...");
            iniciarNuevaRonda(true); 
        });
    }

    if (practiceButton && mainMenuDiv && subMenuPracticaDiv && appContainerDiv) { 
        practiceButton.addEventListener('click', () => {
            limpiarResaltadoBotonesAccion(); 
            mainMenuDiv.classList.add('hidden');
            subMenuPracticaDiv.classList.remove('hidden'); 
            appContainerDiv.classList.add('hidden'); 
        });
    }

    if (practice1v1Button && subMenuPracticaDiv && appContainerDiv) {
        practice1v1Button.addEventListener('click', () => {
            subMenuPracticaDiv.classList.add('hidden');
            appContainerDiv.classList.remove('hidden');
            estadoJuego.numeroDeJugadores = 2;
            if (!localStorage.getItem('nombreJugadorDominó')) { 
                const nombrePrompt = prompt("Introduce tu nombre:", estadoJuego.nombreJugador1);
                if (nombrePrompt && nombrePrompt.trim() !== "") {
                    estadoJuego.nombreJugador1 = nombrePrompt.trim();
                    localStorage.setItem('nombreJugadorDominó', estadoJuego.nombreJugador1);
                }
            } else {
                estadoJuego.nombreJugador1 = localStorage.getItem('nombreJugadorDominó');
            }
            iniciarNuevaRonda(true); 
            actualizarMensaje(`Modo Práctica Individual con ${estadoJuego.nombreJugador1}: ¡A jugar!`);
        });
    }
    
    if (practice2v2Button && subMenuPracticaDiv && appContainerDiv) {
        practice2v2Button.addEventListener('click', () => {
            subMenuPracticaDiv.classList.add('hidden');
            appContainerDiv.classList.remove('hidden');
            estadoJuego.numeroDeJugadores = 4; 
            if (!localStorage.getItem('nombreJugadorDominó')) {
                const nombrePrompt = prompt("Introduce tu nombre:", estadoJuego.nombreJugador1);
                if (nombrePrompt && nombrePrompt.trim() !== "") {
                    estadoJuego.nombreJugador1 = nombrePrompt.trim();
                    localStorage.setItem('nombreJugadorDominó', estadoJuego.nombreJugador1);
                }
            } else {
                estadoJuego.nombreJugador1 = localStorage.getItem('nombreJugadorDominó');
            }
            iniciarNuevaRonda(true); 
            actualizarMensaje(`Modo Práctica Parejas con ${estadoJuego.nombreJugador1}: ¡A jugar!`);
        });
    }

    if (backToMainMenuFromSubmenuButton && mainMenuDiv && subMenuPracticaDiv) {
        backToMainMenuFromSubmenuButton.addEventListener('click', () => {
            subMenuPracticaDiv.classList.add('hidden');
            mainMenuDiv.classList.remove('hidden');
        });
    }


    const backToMenuButton = document.getElementById('back-to-menu-button');
    if (backToMenuButton && mainMenuDiv && appContainerDiv) {
        backToMenuButton.addEventListener('click', () => {
            limpiarResaltadoBotonesAccion();
            appContainerDiv.classList.add('hidden');  
            if (subMenuPracticaDiv) subMenuPracticaDiv.classList.add('hidden'); 
            mainMenuDiv.classList.remove('hidden'); 
            estadoJuego.juegoIniciado = false;
            estadoJuego.fichasEnTablero = [];
            estadoJuego.extremosAbiertos = [null, null];
            if (estadoJuego.manosJugadores[0]) mostrarManoJugadorUI([], 'player-hand-bottom', 0);
            if (estadoJuego.manosJugadores[1]) mostrarManoJugadorUI([], 'player-hand-top', 1); 
            if (estadoJuego.manosJugadores[2]) mostrarManoJugadorUI([], 'player-hand-left', 2); 
            if (estadoJuego.manosJugadores[3]) mostrarManoJugadorUI([], 'player-hand-right', 3); 

            estadoJuego.manosJugadores = []; 
            estadoJuego.fichasDormidas = [];
            limpiarResaltadoExtremos(); 
            fichaSeleccionadaParaJugar = null;
            windowFichaEnZoom = null; 
            actualizarUITablero(); 
            actualizarMensaje("Bienvenido al Dominó. Elige una opción."); 
            actualizarResaltadoFichasJugables(); 
        });
    }
    
    const zoomPopup = document.getElementById('zoom-popup');
    const zoomCerrarButton = document.getElementById('zoom-cerrar-button');

    if (zoomCerrarButton && zoomPopup) { 
        zoomCerrarButton.addEventListener('click', () => {
            zoomPopup.style.display = 'none';
            windowFichaEnZoom = null; 
        });
    }
    if (zoomPopup) {
        zoomPopup.addEventListener('click', (event) => {
            if (event.target === zoomPopup) { 
                zoomPopup.style.display = 'none';
                windowFichaEnZoom = null; 
            }
        });
    }

    if (mainMenuDiv && appContainerDiv) {
        mainMenuDiv.classList.remove('hidden');
        appContainerDiv.classList.add('hidden');
        if (subMenuPracticaDiv) subMenuPracticaDiv.classList.add('hidden'); 
    } else {
        console.error("Error: No se encontraron los contenedores mainMenuDiv o appContainerDiv.");
        return; 
    }
});
