
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
        try{
            const [dbPeopleData] = await app.db.swPeople.findAll({
                where: {
                    id
                }
            });
            if (dbPeopleData)
                return res.status(200).send(dbPeopleData);
            const dataSwapi = await app.swapiFunctions.genericRequest(`https://swapi.dev/api/people/${id}`, 'GET', null, true);
            return res.status(200).send(dataSwapi);

        }
        catch (err){
            return res.status(200).send(dataSwapi);
        }
    });

    server.get('/hfswapi/getPlanet/:id', async (req, res) => {
        res.sendStatus(501);
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