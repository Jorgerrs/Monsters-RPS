import './App.css';
import React, { useState, useEffect } from 'react';

const rarities = {
  comun: 1,
  "poco comun": 2,
  epico: 3,
  legendario: 4
};

const choices = ["piedra", "papel", "tijera"];

function getWinner(playerMove, playerMonster, enemyMove, enemyMonster) {
  if (playerMove === enemyMove) {
    if (rarities[playerMonster.rareza] < rarities[enemyMonster.rareza]) {
      return "enemy";
    }
    return "tie";
  }
  if (
    (playerMove === "piedra" && enemyMove === "tijera") ||
    (playerMove === "papel" && enemyMove === "piedra") ||
    (playerMove === "tijera" && enemyMove === "papel")
  ) {
    return "player";
  }
  return "enemy";
}

function getAbility(monster, move) {
  const index = { piedra: 0, papel: 1, tijera: 2 }[move];
  return monster.ataques[index];
}

function App() {
  const [monsters, setMonsters] = useState(null);
  const [playerMonsterId, setPlayerMonsterId] = useState(""); // ID en string
  const [battleCount, setBattleCount] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [result, setResult] = useState(null);
  const [lastBattle, setLastBattle] = useState(null);
  const [unlockedMonsters, setUnlockedMonsters] = useState([]);
  const [playerMonster, setPlayerMonster] = useState(null);

  // variables para el registro 
  const [pantalla, setPantalla] = useState("home"); // home , login , registro
  const [nombre, setNombre] = useState('');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState(null);

  // variable para el inicio de sesion
  const [usuario, setUsuario] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMensaje, setLoginMensaje] = useState(null);


  useEffect(() => {
    async function loadMonsters() {
      try {
        const response = await fetch("https://backend-api-criaturas.onrender.com/criaturas");
        const data = await response.json();
        setMonsters(data);

        const unlocked = data.filter(m => m.unlocked);
        setUnlockedMonsters(unlocked);

        const initial = unlocked[0]?._id || "";
        setPlayerMonsterId(initial);
        setPlayerMonster(unlocked.find(m => m._id === initial));
      } catch (e) {
        console.error(e);
      }
    }
    loadMonsters();
  }, []);

  useEffect(() => {
    if (monsters) {
      const selected = monsters.find(m => m._id === playerMonsterId);
      setPlayerMonster(selected);
    }
  }, [playerMonsterId, monsters]);

  async function handleRegister(e) {
    e.preventDefault();
    setMensaje(null);

    try {
      const response = await fetch("https://backend-api-criaturas.onrender.com/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          alias,
          email,
          password,
          nivel: 1,
          acumulado: 0,
          victoria: 0,
          derrota: 0,
          empate: 0,
          unlocked: []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al registrar");
      }

      alert("Usuario registrado correctamente");
      setMensaje({ tipo: "success", texto: "Registro exitoso. Ahora puedes iniciar sesión." });
      setTimeout(() => setPantalla("login"), 500); // redirigir tras registrar

    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  }

  async function handleLogin(e) {
  e.preventDefault();
  setLoginMensaje(null);

  try {
    const response = await fetch("https://backend-api-criaturas.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al iniciar sesión");
    }

    const userData = await response.json();
    setUsuario(userData);
    alert(`✅ Bienvenido, ${userData.alias}`);
    setPantalla("home");

  } catch (err) {
    setLoginMensaje({ tipo: "error", texto: err.message });
  }
}

  function handleMove(move) {
    const playerMonster = monsters.find(m => m._id === playerMonsterId);
    const enemyMonster = monsters[Math.floor(Math.random() * monsters.length)];
    const enemyMove = choices[Math.floor(Math.random() * choices.length)];
    const winner = getWinner(move, playerMonster, enemyMove, enemyMonster);

    let message;
    if (winner === "player") {
      message = "\u00A1Ganaste!";
      setWins(wins + 1);
    } else if (winner === "enemy") {
      message = "Perdiste";
      setLosses(losses + 1);
    } else {
      message = "Empate";
    }
    setResult(message);
    setLastBattle({
      playerMonster,
      playerMove: move,
      enemyMonster,
      enemyMove
    });

    const newCount = battleCount + 1;
    setBattleCount(newCount);

    if (newCount % 5 === 0) {
      const index = monsters.findIndex(m => !m.unlocked);
      if (index !== -1) {
        const updated = monsters.slice();
        updated[index].unlocked = true;
        setMonsters(updated);
        setUnlockedMonsters(updated.filter(m => m.unlocked));
        if (!updated.find(m => m._id === playerMonsterId)?.unlocked) {
          const next = updated.find(m => m.unlocked);
          setPlayerMonsterId(next?._id || "");
          setPlayerMonster(next || null);
        }
      }
    }
  }

  if (!monsters || !playerMonster) {
    return <p>Cargando...</p>;
  }

  return (

    <div>
      <h1>Combate de Monstruos</h1>
<nav className="navbar">
  <div className="navbar-title">⚔️ Batalla de Monstruos</div>

  <div className="navbar-buttons">
    {usuario ? (
      <>
        <span style={{ color: "#fff", marginRight: "10px" }}>
          👤 {usuario.alias} | Nivel {usuario.nivel}
        </span>
          <button
          className="navbar-button"
          onClick={() => {
            // aqui deberia hacer una llamada para modificacion del usuario para guardar su progreso, nivel monstruos... etc
          }}
        >
          Guardar progreso
        </button>
        <button
          className="navbar-button"
          onClick={() => {
            setUsuario(null);
            setPantalla("home");
          }}
        >
          Cerrar sesión
        </button>
      </>
    ) : (
      <>
        <button className="navbar-button" onClick={() => setPantalla("login")}>
          Iniciar sesión
        </button>
        <button className="navbar-button" onClick={() => setPantalla("register")}>
          Registrarse
        </button>
      </>
    )}
  </div>
</nav>


      {pantalla === "login" && (
  <div>
    <h2>Iniciar sesión</h2>
    <form onSubmit={handleLogin}>
      <div>
        <label>Email:</label><br />
        <input
          type="email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Contraseña:</label><br />
        <input
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" style={{ marginTop: 10 }}>Entrar</button>
    </form>
    {loginMensaje && <p style={{ color: "red" }}>{loginMensaje.texto}</p>}
  </div>
      )}

      {pantalla === "register" && (
        <div>
          <h2>Registrarse</h2>
          <form onSubmit={handleRegister}>
            <div>
              <label>Nombre completo:</label><br />
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Alias:</label><br />
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Email:</label><br />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Contraseña:</label><br />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" style={{ marginTop: "10px" }}>Crear cuenta</button>
          </form>
          {mensaje && <p style={{ color: mensaje.tipo === "error" ? "red" : "green" }}>{mensaje.texto}</p>}
        </div>
      )}

      {pantalla === "home" && (
        <div>
          <h1>Combate de Monstruos</h1>
          <p>
            Combates: {battleCount} | Victorias: {wins} | Derrotas: {losses}
          </p>

          <div>
            <h2>Selecciona tu monstruo</h2>
            <div className="monster-selection">
              {unlockedMonsters.map(m => (
                <label key={m._id} className="monster-option">
                  <input
                    type="radio"
                    value={m._id}
                    checked={playerMonsterId === m._id}
                    onChange={() => setPlayerMonsterId(m._id)}
                  />
                  <img src={m.imagen} alt={m.nombre} />
                  <span>{m.nombre} ({m.rareza})</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <h2>Elige tu movimiento</h2>
            {choices.map(choice => (
              <button
                key={choice}
                onClick={() => handleMove(choice)}
                className={`move-${choice}`}
              >
                {getAbility(playerMonster, choice)}
              </button>
            ))}
            <div style={{ marginTop: "10px" }}>
              <strong>Leyenda:</strong>
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                <li><span className="legend-box move-piedra"></span>Piedra</li>
                <li><span className="legend-box move-papel"></span>Papel</li>
                <li><span className="legend-box move-tijera"></span>Tijera</li>
              </ul>
            </div>
          </div>

          {lastBattle && (
            <div style={{ marginTop: "20px" }}>
              <h3>Tu monstruo: {lastBattle.playerMonster.nombre} ({lastBattle.playerMonster.rareza})</h3>
              <img
                src={lastBattle.playerMonster.imagen}
                alt={lastBattle.playerMonster.nombre}
                width="60"
                style={{ display: "block", marginBottom: "10px" }}
              />
              <p>Tu movimiento: {getAbility(lastBattle.playerMonster, lastBattle.playerMove)} ({lastBattle.playerMove})</p>

              <h3>Enemigo: {lastBattle.enemyMonster.nombre} ({lastBattle.enemyMonster.rareza})</h3>
              <img
                src={lastBattle.enemyMonster.imagen}
                alt={lastBattle.enemyMonster.nombre}
                width="60"
                style={{ display: "block", marginBottom: "10px" }}
              />
              <p>Movimiento del enemigo: {getAbility(lastBattle.enemyMonster, lastBattle.enemyMove)} ({lastBattle.enemyMove})</p>
            </div>
          )}

          {result && <h2 style={{ marginTop: "10px" }}>{result}</h2>}

          <div style={{ marginTop: "20px" }}>
            <h2>Monstruos desbloqueados</h2>
            <ul className="monster-list">
              {monsters.filter(m => m.unlocked).map(m => (
                <li key={m._id}>
                  <img
                    src={m.imagen}
                    alt={m.nombre}
                    width="30"
                    style={{ verticalAlign: "middle", marginRight: "4px" }}
                  />
                  {m.nombre} ({m.rareza})
                </li>
              ))}
            </ul>
            <h2>Bloqueados</h2>
            <ul className="monster-list">
              {monsters.filter(m => !m.unlocked).map(m => (
                <li key={m._id}>
                  <img
                    src={m.imagen}
                    alt={m.nombre}
                    width="30"
                    style={{ verticalAlign: "middle", marginRight: "4px" }}
                  />
                  {m.nombre} ({m.rareza})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;