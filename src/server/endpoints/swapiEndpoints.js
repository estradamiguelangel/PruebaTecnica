const loggingMiddleware = require('../middlewares/loggingMiddleware')
const _isWookieeFormat = (req) => {
    if (req.query.format && req.query.format == 'wookiee') {
        return true;
    }
    return false;
}
const applySwapiEndpoints = (server, app) => {
    const getPeople = async (id) => {
        let [dbPeopleData] = await app.db.swPeople.findAll({
            where: {
                id
            }
        });
        if (dbPeopleData)
            return {
                name: dbPeopleData.name,
                mass: dbPeopleData.mass,
                height: dbPeopleData.height,
                homeworldName: dbPeopleData.homeworld_name,
                homeworldId: dbPeopleData.homeworld_id,
            };
        else {
            const apiPeopleData = await app.swapiFunctions.genericRequest(`https://swapi.dev/api/people/${id}`, 'GET', null, true);
            const apiPlanetData = await app.swapiFunctions.genericRequest(apiPeopleData.homeworld, 'GET', null, true);
            return {
                name: apiPeopleData.name,
                mass: apiPeopleData.mass,
                height: apiPeopleData.height,
                homeworldName: apiPlanetData.name,
                homeworldId: `/planets/${apiPeopleData.homeworld}`,
            };
        }
    }
    const getPlanet = async (id) => {
        const [dbPlanetData] = await app.db.swPlanet.findAll({
            where: {
                id
            }
        });
        if (dbPlanetData)
            return { name: dbPlanetData.name, gravity: dbPlanetData.gravity };
        const dataSwapi = await app.swapiFunctions.genericRequest(`https://swapi.dev/api/planets/${id}`, 'GET', null, true);
        return { name: dataSwapi.name, gravity: dataSwapi.gravity.split(" ")[0] };
    }

    server.get('/hfswapi/test', async (req, res) => {
        const data = await app.swapiFunctions.genericRequest('https://swapi.dev/api/', 'GET', null, true);
        res.send(data);
    });

    server.get('/hfswapi/getPeople/:id', loggingMiddleware(app.db), async (req, res) => {
        const { id } = req.params
        try {
            const getPeopleData = await getPeople(id)
            return res.status(200).send(getPeopleData);
        }
        catch (err) {
            return res.status(500).send(err.message);
        }
    });

    server.get('/hfswapi/getPlanet/:id', loggingMiddleware, async (req, res) => {
        const { id } = req.params
        try {
            const getPlanetData = await getPlanet(id)
            return res.status(200).send(getPlanetData);
        }
        catch (err) {
            return res.status(500).send(err);
        }
    });

    server.get('/hfswapi/getWeightOnPlanetRandom', loggingMiddleware, async (req, res) => {

        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }
        try {
            const peopleId = getRandomInt(83);
            const planetId = getRandomInt(60);
            const peopleData = await getPeople(peopleId)
            const planetData = await getPlanet(planetId)
            if (peopleData.homeworldName === planetData.name) return res.status(401).send("El planeta es el natal del personaje");
            const pesoPersonaje = parseFloat(planetData.gravity) * parseFloat(peopleData.mass)
            return res.status(200).send({ pesoPersonaje });
        }
        catch (err) {
            return res.status(500).send(err);
        }
    });

    server.get('/hfswapi/getLogs', async (req, res) => {
        const data = await app.db.logging.findAll();
        res.send(data);
    });

}

module.exports = applySwapiEndpoints;