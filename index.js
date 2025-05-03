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
        const response = await axios.post('https://snapinsta.app/action.php', new URLSearchParams({
            url: url,
            action: 'post'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const $ = cheerio.load(response.data);

        const videoUrl = $('a.downloadBtn').attr('href') || null;
        const thumbnail = $('img').first().attr('src') || null;

        if (!videoUrl) {
            return res.status(404).json({ error: 'No se pudo obtener el video. Revisa si el link es válido.' });
        }

        return res.json({
            video: videoUrl,
            thumbnail: thumbnail
        });

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Error al procesar la solicitud.' });
    }
});

app.listen(3000, () => {
    console.log('API corriendo en http://localhost:3000');
});