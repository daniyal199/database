const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'cricketTeam.db')
const app = express()
app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}
initializeDbAndServer()

const covertDbObjToResponseObj = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuerry = `
        SELECT
        *
        FROM 
        cricket_team;`
  const playerArray = await database.all(getPlayersQuerry)
  response.send(
    playerArray.map(eachPlayer => covertDbObjToResponseObj(eachPlayer)),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayersQuerry = `
    SELECT
    *
    FROM
    cricket_team
    WHERE 
    player_id =${playerId};`
  const player = await database.get(getPlayersQuerry)
  reponse.send(covertDbObjToResponseObj(player))
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postPlayersQuerry = `
    INSERT INTO
    cricket_team (player_name, jersey_number,role)
    VALUES
    ('${playerName}', ${jerseyNumber}, '${role}')`
  const player = await database.run(postPlayersQuerry)
  response.send('Player Added to Team')
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const updatePlayersQuerry = `
    UPDATE
    cricket_team 
    SET
    player_name = '${playerName}',
    jersey_number = '${jerseyNumber}',
    role = '${role}'
    WHERE
    player_id = ${playerId}`
  await database.run(updatePlayersQuerry)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayersQuerry = `
    DELETE FROM
    cricket_team
    WHERE
    player_id = ${playerId}`
  await database.run(deletePlayersQuerry)
  response.send('Player Removed')
})

module.exports = app
