const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.use(express.json());

app.get('/scrape', async (req, res) => {
    const { url } = req.query;

    if (!url || !url.includes('instagram.com')) {
        return res.status(400).json({ error: 'URL inválida' });
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const $ = cheerio.load(response.data);
        const jsonData = $('script[type="application/ld+json"]').html();

        if (!jsonData) {
            return res.status(404).json({ error: 'No se encontró contenido o es privado' });
        }

        const data = JSON.parse(jsonData);
        const video = data.contentUrl || null;
        const thumbnail = data.thumbnailUrl || null;

        return res.json({
            video,
            thumbnail
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al scrapear la URL' });
    }
});

app.listen(3000, () => {
    console.log('API corriendo en http://localhost:3000');
});