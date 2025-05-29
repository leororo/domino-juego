// Lógica del Juego de Dominó Cubano Doble 9

// --- Variables Globales para el Estado del Juego ---
let estadoJuego = {
    fichasEnTablero: [],
    extremosAbiertos: [null, null],
    turnoJugador: 0,
    manosJugadores: [],
    fichasDormidas: [],
    juegoIniciado: false,
    numeroDeJugadores: 2,
    consecutivePasses: 0,
    puntuacionJugadores: [0, 0],
    vistaFichas: 'numeros', // Valores posibles: 'numeros', 'puntos'
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
    // console.log("DEBUG: Fichas generadas (total " + fichas.length + "):", JSON.stringify(fichas));
    // const setFichasGeneradas = new Set(fichas.map(f => `${Math.min(f.ladoA, f.ladoB)}-${Math.max(f.ladoA, f.ladoB)}`));
    // if (setFichasGeneradas.size !== fichas.length) {
    //     console.error("ERROR DEBUG: ¡Fichas duplicadas detectadas en la GENERACIÓN!");
    // }
    return fichas;
}

function barajarFichas(arrayFichas) {
    const fichasBarajadas = [...arrayFichas];
    for (let i = fichasBarajadas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fichasBarajadas[i], fichasBarajadas[j]] = [fichasBarajadas[j], fichasBarajadas[i]];
    }
    // console.log("DEBUG: Fichas barajadas (total " + fichasBarajadas.length + "):", JSON.stringify(fichasBarajadas));
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
    const fichasDormidas = fichasParaRepartir; 

    // console.log("DEBUG: Manos repartidas:", JSON.stringify(manosJugadores));
    // console.log("DEBUG: Fichas dormidas (total " + fichasDormidas.length + "):", JSON.stringify(fichasDormidas));
    
    // let todasLasFichasDelJuego = [];
    // manosJugadores.forEach(mano => { todasLasFichasDelJuego = todasLasFichasDelJuego.concat(mano); });
    // todasLasFichasDelJuego = todasLasFichasDelJuego.concat(fichasDormidas);
    
    // const setFichasEnJuego = new Set(todasLasFichasDelJuego.map(f => {
    //     if (typeof f === 'undefined' || f === null) {
    //         console.error("ERROR DEBUG: Ficha indefinida o nula encontrada al crear el Set de fichas en juego.");
    //         return "indefinida-o-nula"; 
    //     }
    //     return `${Math.min(f.ladoA, f.ladoB)}-${Math.max(f.ladoA, f.ladoB)}`;
    // }));

    // if (setFichasEnJuego.size !== todasLasFichasDelJuego.length) {
    //     console.error("ERROR DEBUG: ¡Fichas duplicadas detectadas DESPUÉS DE REPARTIR!");
    //     const conteoFichas = {};
    //     todasLasFichasDelJuego.forEach(f => {
    //         if (typeof f === 'undefined' || f === null) return;
    //         const key = `${Math.min(f.ladoA, f.ladoB)}-${Math.max(f.ladoA, f.ladoB)}`;
    //         conteoFichas[key] = (conteoFichas[key] || 0) + 1;
    //     });
    //     console.log("DEBUG: Conteo de cada ficha en juego:", conteoFichas);
    // }
    // if (todasLasFichasDelJuego.length !== 55) {
    //      console.error("ERROR DEBUG: El número total de fichas en juego (manos + dormidas) no es 55. Total: ", todasLasFichasDelJuego.length);
    // }
    return { manosJugadores, fichasDormidas };
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
                } else if (
                    (esDoble && valorDoble === fichaMasAlta.valorDoble) ||
                    (!esDoble && fichaMasAlta.valorDoble === -1 && sumaPuntos === fichaMasAlta.sumaPuntos)
                ) {
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
    const puntuacionJ1 = estadoJuego.puntuacionJugadores[0];
    const puntuacionJ2 = estadoJuego.puntuacionJugadores[1];
    let partidaTerminada = false;

    if (puntuacionJ1 >= 100 || puntuacionJ2 >= 100) {
        partidaTerminada = true;
        estadoJuego.juegoIniciado = false;
        let mensajeFinal = "";
        if (puntuacionJ1 >= 100 && puntuacionJ1 > puntuacionJ2) {
            mensajeFinal = `¡Jugador 1 ha ganado la partida con ${puntuacionJ1} puntos!`;
        } else if (puntuacionJ2 >= 100 && puntuacionJ2 > puntuacionJ1) {
            mensajeFinal = `¡Jugador 2 ha ganado la partida con ${puntuacionJ2} puntos!`;
        } else if (puntuacionJ1 === puntuacionJ2 && puntuacionJ1 >= 100) {
             mensajeFinal = `¡Empate increíble con ${puntuacionJ1} puntos! Nadie gana la partida.`;
        } else if (puntuacionJ1 >= 100) {
             mensajeFinal = `¡Jugador 1 ha ganado la partida con ${puntuacionJ1} puntos!`;
        } else if (puntuacionJ2 >= 100) {
             mensajeFinal = `¡Jugador 2 ha ganado la partida con ${puntuacionJ2} puntos!`;
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

    if (esNuevaPartida) {
        estadoJuego.puntuacionJugadores = [0, 0];
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

    let mensajeRonda = `Inicia la ronda. Turno del Jugador ${estadoJuego.turnoJugador + 1}.`;
    // Mostrar sugerencia SOLO para el jugador humano (0) y si realmente tiene una ficha de salida.
    if (estadoJuego.turnoJugador === 0 && dataSalida.fichaDeSalida) { 
        mensajeRonda += ` Se sugiere jugar ${dataSalida.fichaDeSalida.ladoA}-${dataSalida.fichaDeSalida.ladoB}.`;
    }
    actualizarMensaje(mensajeRonda);
    actualizarResaltadoFichasJugables();

    document.getElementById('start-round-button').style.display = 'inline-block';
    document.getElementById('new-game-button').style.display = 'none';

    // Si es el turno de la IA al iniciar la ronda y puede jugar, que juegue.
    if (estadoJuego.juegoIniciado && estadoJuego.turnoJugador === 1) { 
        if (puedeJugar(estadoJuego.manosJugadores[1], estadoJuego.extremosAbiertos)) {
            jugarTurnoIA();
        } else {
             setTimeout(() => {
                if(estadoJuego.juegoIniciado && estadoJuego.turnoJugador === 1 && !puedeJugar(estadoJuego.manosJugadores[1], estadoJuego.extremosAbiertos)) {
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
}

function jugarFicha(fichaOriginal, extremoDelTableroAlQueConecta) {
    if (!estadoJuego.juegoIniciado) {
        actualizarMensaje("El juego ha terminado o no ha iniciado.");
        return;
    }

    limpiarResaltadoExtremos();
    fichaSeleccionadaParaJugar = null;

    const manoActual = estadoJuego.manosJugadores[estadoJuego.turnoJugador];
    const indiceFichaEnMano = manoActual.findIndex(f => f.id === fichaOriginal.id);

    if (indiceFichaEnMano === -1 && estadoJuego.fichasEnTablero.length > 0) {
        if (estadoJuego.turnoJugador === 0) { 
             actualizarMensaje("Error: Ficha no encontrada en la mano.");
        }
        console.error(`Error: Ficha ${fichaOriginal.id} no encontrada en mano de Jugador ${estadoJuego.turnoJugador + 1}. Mano:`, JSON.stringify(manoActual));
        return;
    }

    let fichaParaJugarComo;
    if (estadoJuego.fichasEnTablero.length === 0) {
        fichaParaJugarComo = { ...fichaOriginal };
        estadoJuego.fichasEnTablero.push({ fichaOriginal, jugadaComo: fichaParaJugarComo });
    } else {
        const [extIzquierdo, extDerecho] = estadoJuego.extremosAbiertos;
        if (extremoDelTableroAlQueConecta === extIzquierdo) {
            if (fichaOriginal.ladoB === extremoDelTableroAlQueConecta) {
                fichaParaJugarComo = { ladoA: fichaOriginal.ladoA, ladoB: fichaOriginal.ladoB, id: fichaOriginal.id };
            } else if (fichaOriginal.ladoA === extremoDelTableroAlQueConecta) {
                fichaParaJugarComo = { ladoA: fichaOriginal.ladoB, ladoB: fichaOriginal.ladoA, id: fichaOriginal.id };
            } else {
                 actualizarMensaje("Movimiento inválido."); return;
            }
            estadoJuego.fichasEnTablero.unshift({ fichaOriginal, jugadaComo: fichaParaJugarComo });
        } else if (extremoDelTableroAlQueConecta === extDerecho) {
            if (fichaOriginal.ladoA === extremoDelTableroAlQueConecta) {
                fichaParaJugarComo = { ladoA: fichaOriginal.ladoA, ladoB: fichaOriginal.ladoB, id: fichaOriginal.id };
            } else if (fichaOriginal.ladoB === extremoDelTableroAlQueConecta) {
                fichaParaJugarComo = { ladoA: fichaOriginal.ladoB, ladoB: fichaOriginal.ladoA, id: fichaOriginal.id };
            } else {
                actualizarMensaje("Movimiento inválido."); return;
            }
            estadoJuego.fichasEnTablero.push({ fichaOriginal, jugadaComo: fichaParaJugarComo });
        } else {
            actualizarMensaje("Extremo no válido."); return;
        }
    }

    if (indiceFichaEnMano !== -1) { 
       manoActual.splice(indiceFichaEnMano, 1);
    }

    estadoJuego.extremosAbiertos = obtenerExtremosAbiertos();
    actualizarUIManos();
    actualizarUITablero();
    actualizarResaltadoFichasJugables();
    estadoJuego.consecutivePasses = 0;

    if (manoActual.length === 0) {
        const oponenteIdx = (estadoJuego.turnoJugador + 1) % estadoJuego.numeroDeJugadores;
        const manoOponente = estadoJuego.manosJugadores[oponenteIdx];
        revelarManoOponente(manoOponente);
        const puntosGanados = calcularPuntosMano(manoOponente);
        estadoJuego.puntuacionJugadores[estadoJuego.turnoJugador] += puntosGanados;
        actualizarUIMarcador();
        estadoJuego.juegoIniciado = false;
        if (verificarFinDePartida()) {
            return;
        } else {
            actualizarMensaje(`¡Jugador ${estadoJuego.turnoJugador + 1} ha ganado la ronda y suma ${puntosGanados} puntos! Presiona 'Iniciar Nueva Ronda'.`);
            const startRoundBtn = document.getElementById('start-round-button');
            if (startRoundBtn) startRoundBtn.classList.add('call-to-action-button');
        }
        return;
    }
    cambiarTurno();
}
function cambiarTurno() {
    const gameMessagesDivForPass = document.getElementById('game-messages'); // Obtener referencia para resaltado de pase
    if (gameMessagesDivForPass) gameMessagesDivForPass.classList.remove('mensaje-pase-resaltado');

    estadoJuego.turnoJugador = (estadoJuego.turnoJugador + 1) % estadoJuego.numeroDeJugadores;
    let mensajeTurno = `Turno del Jugador ${estadoJuego.turnoJugador + 1}.`;
    actualizarMensaje(mensajeTurno);
    actualizarResaltadoFichasJugables();

    if (estadoJuego.juegoIniciado) {
        if (!puedeJugar(estadoJuego.manosJugadores[estadoJuego.turnoJugador], estadoJuego.extremosAbiertos)) {
            estadoJuego.consecutivePasses++;
            actualizarMensaje(`Jugador ${estadoJuego.turnoJugador + 1} no tiene jugada. Pasa automáticamente. (Pases: ${estadoJuego.consecutivePasses})`);
            if (gameMessagesDivForPass) { // Resaltar mensaje de pase
                gameMessagesDivForPass.classList.add('mensaje-pase-resaltado');
                setTimeout(() => {
                    // Quitar resaltado solo si el juego no terminó en este intervalo
                    if(estadoJuego.juegoIniciado) gameMessagesDivForPass.classList.remove('mensaje-pase-resaltado');
                }, 1500);
            }

            if (estadoJuego.consecutivePasses >= estadoJuego.numeroDeJugadores) {
                if (gameMessagesDivForPass) gameMessagesDivForPass.classList.remove('mensaje-pase-resaltado');
                revelarManoOponente(estadoJuego.manosJugadores[1]);
                const puntosJ0 = calcularPuntosMano(estadoJuego.manosJugadores[0]);
                const puntosJ1 = calcularPuntosMano(estadoJuego.manosJugadores[1]);
                let mensajeTranque = "¡Juego Trancado! ";
                let ganadorTranqueIdx = -1;

                if (puntosJ0 < puntosJ1) {
                    estadoJuego.puntuacionJugadores[0] += puntosJ1;
                    mensajeTranque += `Jugador 1 gana la ronda y suma ${puntosJ1} puntos. (J0: ${puntosJ0} vs J1: ${puntosJ1})`;
                    ganadorTranqueIdx = 0;
                } else if (puntosJ1 < puntosJ0) {
                    estadoJuego.puntuacionJugadores[1] += puntosJ0;
                    mensajeTranque += `Jugador 2 gana la ronda y suma ${puntosJ0} puntos. (J0: ${puntosJ0} vs J1: ${puntosJ1})`;
                    ganadorTranqueIdx = 1;
                } else {
                    mensajeTranque += `Empate en puntos (${puntosJ0}), nadie suma.`;
                }

                // Aplicar resaltado a fichas del ganador del tranque
                if (ganadorTranqueIdx === 0) {
                    document.getElementById('player-hand-bottom').querySelectorAll('.ficha-domino').forEach(fd => fd.classList.add('ficha-ganadora-tranque'));
                } else if (ganadorTranqueIdx === 1) {
                    // revelarManoOponente ya fue llamado, necesita aplicar la clase.
                    // Modificaremos revelarManoOponente para que acepte un segundo parametro.
                    // Por ahora, la llamada anterior a revelarManoOponente es suficiente para mostrar.
                    // La lógica de aplicar clase al ganador IA está en la nueva revelarManoOponente.
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
                if (estadoJuego.juegoIniciado) cambiarTurno();
            }, 1500);
        } else {
            estadoJuego.consecutivePasses = 0;
            if (gameMessagesDivForPass) gameMessagesDivForPass.classList.remove('mensaje-pase-resaltado');
            if (estadoJuego.turnoJugador === 1) {
                jugarTurnoIA();
            }
        }
    }
}

function jugarTurnoIA() {
    if (!estadoJuego.juegoIniciado || estadoJuego.turnoJugador !== 1) {
        return;
    }
    actualizarMensaje("Jugador 2 (IA) está pensando...");

    setTimeout(() => {
        if (!estadoJuego.juegoIniciado) return;
        const manoIA = estadoJuego.manosJugadores[1];
        const [extIzquierdo, extDerecho] = obtenerExtremosAbiertos();
        let fichaAJugar = null;
        let extremoElegido = null;

        for (const ficha of manoIA) {
            if (extIzquierdo === null) {
                fichaAJugar = ficha;
                extremoElegido = null;
                break;
            }
            if (esMovimientoValido(ficha, extIzquierdo)) {
                fichaAJugar = ficha;
                extremoElegido = extIzquierdo;
                break;
            }
            if (esMovimientoValido(ficha, extDerecho)) {
                fichaAJugar = ficha;
                extremoElegido = extDerecho;
                break;
            }
        }

        if (fichaAJugar) {
            // console.log(`IA juega: ${fichaAJugar.ladoA}-${fichaAJugar.ladoB} en extremo ${extremoElegido}`);
            jugarFicha(fichaAJugar, extremoElegido);
        } else {
            // console.error("Error IA: Se indicó que podía jugar pero la lógica de IA no encontró cómo. Forzando pase.");
            estadoJuego.consecutivePasses++;
            actualizarMensaje(`Jugador 2 (IA) no pudo decidir y pasa. (Pases: ${estadoJuego.consecutivePasses})`);
            const gameMessagesDiv = document.getElementById('game-messages');
            if (gameMessagesDiv) {
                gameMessagesDiv.classList.add('mensaje-pase-resaltado');
                setTimeout(() => {
                    if(estadoJuego.juegoIniciado) gameMessagesDiv.classList.remove('mensaje-pase-resaltado');
                }, 1500);
            }
            if (estadoJuego.consecutivePasses >= estadoJuego.numeroDeJugadores) {
                // Lógica de tranque si este pase forzado causa un tranque
                revelarManoOponente(estadoJuego.manosJugadores[1], true); // Asumiendo que J1 (IA) es el que causa el tranque al no poder jugar
                const puntosJ0 = calcularPuntosMano(estadoJuego.manosJugadores[0]);
                const puntosJ1 = calcularPuntosMano(estadoJuego.manosJugadores[1]);
                let mensajeTranqueFallidoIA = "¡Juego Trancado! ";
                 if (puntosJ0 < puntosJ1) {
                    estadoJuego.puntuacionJugadores[0] += puntosJ1;
                    mensajeTranqueFallidoIA += `Jugador 1 gana la ronda y suma ${puntosJ1} puntos.`;
                    document.getElementById('player-hand-bottom').querySelectorAll('.ficha-domino').forEach(fd => fd.classList.add('ficha-ganadora-tranque'));
                } else if (puntosJ1 < puntosJ0) {
                    estadoJuego.puntuacionJugadores[1] += puntosJ0;
                    mensajeTranqueFallidoIA += `Jugador 2 gana la ronda y suma ${puntosJ0} puntos.`;
                    // revelarManoOponente ya fue llamado con esGanadorTranque=true
                } else {
                    mensajeTranqueFallidoIA += `Empate en puntos (${puntosJ0}), nadie suma.`;
                }
                actualizarUIMarcador();
                estadoJuego.juegoIniciado = false;
                if (verificarFinDePartida()) return;
                else {
                    actualizarMensaje(`${mensajeTranqueFallidoIA} Presiona 'Iniciar Nueva Ronda'.`);
                    const startRoundBtn = document.getElementById('start-round-button');
                    if (startRoundBtn) startRoundBtn.classList.add('call-to-action-button');
                }
                return;
            }
            setTimeout(() => { if (estadoJuego.juegoIniciado) cambiarTurno(); }, 1000);
        }
    }, 1000 + Math.random() * 1500);
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

function actualizarResaltadoFichasJugables() {
    const manoHumanoDiv = document.getElementById('player-hand-bottom');
    if (!manoHumanoDiv) return;
    manoHumanoDiv.querySelectorAll('.ficha-domino').forEach(fichaDiv => {
        fichaDiv.classList.remove('ficha-jugable');
    });
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
    if (scoreboardDiv) {
        scoreboardDiv.innerHTML = `
            <h2>Puntuación</h2>
            <p>Jugador 1: ${estadoJuego.puntuacionJugadores[0]} puntos</p>
            <p>Jugador 2: ${estadoJuego.puntuacionJugadores[1]} puntos</p>
        `;
    }
}

function generarHTMLPuntos(valor, esVertical = true) {
    let puntosHTML = '';
    for (let i = 0; i < valor; i++) {
        puntosHTML += '<span class="punto-domino"></span>';
    }
    const orientacionClase = esVertical ? '' : 'horizontal';
    const resultadoHTML = `<div class="puntos-layout ${orientacionClase} valor-${valor}">${puntosHTML}</div>`;
    // console.log(`DEBUG: generarHTMLPuntos para valor ${valor}, esVertical ${esVertical} -> HTML: ${resultadoHTML}`);
    return resultadoHTML;
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
    separadorVisual.classList.add('ficha-separador-linea');
    fichaDiv.appendChild(ladoADiv);
    fichaDiv.appendChild(separadorVisual);
    fichaDiv.appendChild(ladoBDiv);

    if (jugadorIdx === 0) {
        fichaDiv.addEventListener('click', () => {
            if (!estadoJuego.juegoIniciado) {
                actualizarMensaje("El juego ha terminado o no ha iniciado.");
                return;
            }
            if (estadoJuego.turnoJugador !== jugadorIdx) {
                actualizarMensaje(`No es tu turno. Turno del Jugador ${estadoJuego.turnoJugador + 1}.`);
                return;
            }

            if (fichaSeleccionadaParaJugar && fichaSeleccionadaParaJugar.id !== fichaClicada.id) {
                limpiarResaltadoExtremos();
                fichaSeleccionadaParaJugar = null;
            }
            else if (fichaSeleccionadaParaJugar && fichaSeleccionadaParaJugar.id === fichaClicada.id) {
                 limpiarResaltadoExtremos();
                 fichaSeleccionadaParaJugar = null;
                 actualizarMensaje("Selección de ficha cancelada. Elige una ficha.");
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
                        if (extIzquierdo === extDerecho && (fichaClicada.ladoA === extIzquierdo || fichaClicada.ladoB === extIzquierdo) ) {
                            jugarFicha(fichaClicada, extIzquierdo);
                        } else if ( (fichaClicada.ladoA === extIzquierdo && fichaClicada.ladoA === extDerecho && extIzquierdo !== null) || (fichaClicada.ladoB === extIzquierdo && fichaClicada.ladoB === extDerecho && extIzquierdo !== null) ){
                            // Si un lado de mi ficha coincide con AMBOS extremos del tablero (ej. tengo 6-X, extremos son A-6 y B-6)
                            jugarFicha(fichaClicada, extIzquierdo); // Es indiferente por dónde, jugar por la izquierda
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
    }
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
    if (estadoJuego.manosJugadores && estadoJuego.manosJugadores.length > 0) {
        mostrarManoJugadorUI(estadoJuego.manosJugadores[0], 'player-hand-bottom', 0);
        const manoOponenteCont = document.getElementById('player-hand-top');
        manoOponenteCont.innerHTML = '';
        if (estadoJuego.juegoIniciado && estadoJuego.manosJugadores[1]) {
            estadoJuego.manosJugadores[1].forEach(_ => {
                const fichaDorsoDiv = document.createElement('div');
                fichaDorsoDiv.classList.add('ficha-domino', 'ficha-dorso');
                const spanDorso = document.createElement('span');
                spanDorso.textContent = "?";
                fichaDorsoDiv.appendChild(spanDorso);
                manoOponenteCont.appendChild(fichaDorsoDiv);
            });
        } else if (!estadoJuego.juegoIniciado && estadoJuego.manosJugadores[1] && estadoJuego.manosJugadores[1].length > 0) {
            // No se hace nada aquí, revelarManoOponente() es responsable
        } else if (!estadoJuego.juegoIniciado && (!estadoJuego.manosJugadores[1] || estadoJuego.manosJugadores[1].length === 0)) {
             manoOponenteCont.textContent = "(Mano vacía)";
        }
    }
}

function revelarManoOponente(manoOponente, esGanadorTranque = false) {
    const manoOponenteCont = document.getElementById('player-hand-top');
    if (!manoOponenteCont) return;
    manoOponenteCont.innerHTML = '';

    if (manoOponente && manoOponente.length > 0) {
        manoOponente.forEach(ficha => {
            const fichaDiv = document.createElement('div');
            fichaDiv.classList.add('ficha-domino');
            if (esGanadorTranque) {
                fichaDiv.classList.add('ficha-ganadora-tranque');
            }
            const ladoADiv = document.createElement('div');
            ladoADiv.classList.add('mitad-ficha-canvas');
            const ladoBDiv = document.createElement('div');
            ladoBDiv.classList.add('mitad-ficha-canvas');

            if (estadoJuego.vistaFichas === 'numeros') {
                ladoADiv.textContent = ficha.ladoA;
                ladoBDiv.textContent = ficha.ladoB;
            } else {
                ladoADiv.innerHTML = generarHTMLPuntos(ficha.ladoA, true);
                ladoBDiv.innerHTML = generarHTMLPuntos(ficha.ladoB, true);
            }
            const separadorVisual = document.createElement('span');
            separadorVisual.classList.add('ficha-separador-linea');
            fichaDiv.appendChild(ladoADiv);
            fichaDiv.appendChild(separadorVisual);
            fichaDiv.appendChild(ladoBDiv);
            manoOponenteCont.appendChild(fichaDiv);
        });
    } else {
        manoOponenteCont.textContent = "(Mano vacía - Oponente dominó)";
    }
}

function mostrarFichaEnTableroUI(fichaJugadaObj, contenedorTablero) {
    const fichaDiv = document.createElement('div');
    fichaDiv.classList.add('ficha-domino', 'ficha-en-tablero');
    fichaDiv.dataset.originalId = fichaJugadaObj.fichaOriginal.id;

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
    separadorVisual.classList.add('ficha-separador-linea');
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
            separadorZoom.classList.add('ficha-separador-linea');

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
    const contenedorTablero = document.getElementById('domino-table');
    if (!contenedorTablero) return;
    contenedorTablero.innerHTML = '';
    estadoJuego.fichasEnTablero.forEach((fichaJugadaObj) => {
        mostrarFichaEnTableroUI(fichaJugadaObj, contenedorTablero);
    });
}

// --- Lógica de Inicialización y Accesibilidad ---
document.addEventListener('DOMContentLoaded', () => {
    const mainMenuDiv = document.getElementById('main-menu');
    const appContainerDiv = document.getElementById('app-container');
    const practiceButton = document.getElementById('practice-button');
    const toggleVistaButton = document.getElementById('toggle-vista-fichas-button');

    const vistaGuardada = localStorage.getItem('vistaFichas');
    if (vistaGuardada) {
        estadoJuego.vistaFichas = vistaGuardada;
    }
    if (toggleVistaButton) {
        toggleVistaButton.textContent = estadoJuego.vistaFichas === 'puntos' ? "Ver Números" : "Ver Puntos";
    }

    if (!estadoJuego.puntuacionJugadores) {
        estadoJuego.puntuacionJugadores = [0, 0];
    }
    actualizarUIMarcador();

    const contrasteGuardado = localStorage.getItem('modoContraste');
    if (contrasteGuardado === 'true') {
        document.body.classList.add('contraste-alto');
    }

    const startRoundButton = document.getElementById('start-round-button');
    if (startRoundButton) {
        startRoundButton.addEventListener('click', () => {
            limpiarResaltadoBotonesAccion();
            // console.log("Botón 'Iniciar Nueva Ronda' presionado.");
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
        // console.log("DEBUG: Botón 'toggle-vista-fichas-button' ENCONTRADO y listener añadido.");
        toggleVistaButton.addEventListener('click', () => {
            // console.log("DEBUG: Botón 'toggle-vista-fichas-button' CLICKEADO.");
            estadoJuego.vistaFichas = estadoJuego.vistaFichas === 'numeros' ? 'puntos' : 'numeros';
            // console.log("DEBUG: Nuevo estado vistaFichas:", estadoJuego.vistaFichas);
            toggleVistaButton.textContent = estadoJuego.vistaFichas === 'puntos' ? "Ver Números" : "Ver Puntos";
            localStorage.setItem('vistaFichas', estadoJuego.vistaFichas);
            // console.log("DEBUG: Llamando a actualizarUIManos y actualizarUITablero...");
            actualizarUIManos();
            actualizarUITablero();

            const zoomPopup = document.getElementById('zoom-popup');
            if (zoomPopup.style.display === 'flex' && windowFichaEnZoom) {
                // console.log("DEBUG: Actualizando popup de zoom...");
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
                separadorZoom.classList.add('ficha-separador-linea');
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
    // } else {
        // console.error("DEBUG: Botón 'toggle-vista-fichas-button' NO FUE ENCONTRADO.");
    }

    const newGameButton = document.getElementById('new-game-button');
    if (newGameButton) {
        newGameButton.addEventListener('click', () => {
            limpiarResaltadoBotonesAccion();
            iniciarNuevaRonda(true);
        });
    }

    if (practiceButton && mainMenuDiv && appContainerDiv) {
        practiceButton.addEventListener('click', () => {
            limpiarResaltadoBotonesAccion();
            mainMenuDiv.classList.add('hidden');
            appContainerDiv.classList.remove('hidden');
            iniciarNuevaRonda(true);
        });
    }

    const backToMenuButton = document.getElementById('back-to-menu-button');
    if (backToMenuButton && mainMenuDiv && appContainerDiv) {
        backToMenuButton.addEventListener('click', () => {
            limpiarResaltadoBotonesAccion();
            appContainerDiv.classList.add('hidden');
            mainMenuDiv.classList.remove('hidden');
            estadoJuego.juegoIniciado = false;
            estadoJuego.fichasEnTablero = [];
            estadoJuego.extremosAbiertos = [null, null];
            if (estadoJuego.manosJugadores && estadoJuego.manosJugadores.length > 0) {
                 if (estadoJuego.manosJugadores[0]) mostrarManoJugadorUI([], 'player-hand-bottom', 0);
                 if (estadoJuego.manosJugadores[1]) mostrarManoJugadorUI([], 'player-hand-top', 1);
            }
            estadoJuego.manosJugadores = [];
            estadoJuego.fichasDormidas = [];
            limpiarResaltadoExtremos();
            fichaSeleccionadaParaJugar = null;
            windowFichaEnZoom = null;
            document.getElementById('zoom-popup').style.display = 'none';
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
    } else {
        console.error("Error: No se encontraron los contenedores mainMenuDiv o appContainerDiv.");
    }
});