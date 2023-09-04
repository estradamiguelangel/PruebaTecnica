
const _isWookieeFormat = (req) => {
    if (req.query.format && req.query.format == 'wookiee') {
        return true;
    }
    return false;
}


const applySwapiEndpoints = (server, app) => {

    server.get('/hfswapi/test', async (req, res) => {
        const data = await app.swapiFunctions.genericRequest('https://swapi.dev/api/', 'GET', null, true);
        res.send(data);
    });

    server.get('/hfswapi/getPeople/:id', async (req, res) => {
        const { id } = req.params
        try {
            let [dbPeopleData] = await app.db.swPeople.findAll({
                where: {
                    id
                }
            });
            if (dbPeopleData)
                return res.status(200).send({
                    name: dbPeopleData.name,
                    mass: dbPeopleData.mass,
                    height: dbPeopleData.height,
                    homeworldName: dbPeopleData.homeworld_name,
                    homeworldId: dbPeopleData.homeworld_id,
                });
            else {
                const apiPeopleData = await app.swapiFunctions.genericRequest(`https://swapi.dev/api/people/${id}`, 'GET', null, true);
                const apiPlanetData = await app.swapiFunctions.genericRequest(apiPeopleData.homeworld, 'GET', null, true);
                return res.status(200).send({
                    name: apiPeopleData.name,
                    mass: apiPeopleData.mass,
                    height: apiPeopleData.height,
                    homeworldName: apiPlanetData.name,
                    homeworldId: `/planets/${apiPeopleData.homeworld}`,
                });
            }

        }
        catch (err) {
            return res.status(500).send(err.message);
        }
    });

    server.get('/hfswapi/getPlanet/:id', async (req, res) => {
        const { id } = req.params
        try {
            const [dbPlanetData] = await app.db.swPlanet.findAll({
                where: {
                    id
                }
            });
            if (dbPlanetData)
                return res.status(200).send({ name: dbPlanetData.name, gravity: dbPlanetData.gravity });
            const dataSwapi = await app.swapiFunctions.genericRequest(`https://swapi.dev/api/planets/${id}`, 'GET', null, true);
            return res.status(200).send({ name: dataSwapi.name, gravity: dataSwapi.gravity.split(" ")[0] });

        }
        catch (err) {
            return res.status(500).send(err);
        }
    });

    server.get('/hfswapi/getWeightOnPlanetRandom', async (req, res) => {
        res.sendStatus(501);
    });

    server.get('/hfswapi/getLogs', async (req, res) => {
        const data = await app.db.logging.findAll();
        res.send(data);
    });

}

module.exports = applySwapiEndpoints;