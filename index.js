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
                'User-Agent': 'Mozilla/5.0',
                'Accept-Language': 'es-ES,es;q=0.9'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Intenta obtener JSON en <script> con window._sharedData
        const scriptTag = $('script').filter((i, el) => $(el).html().includes('window._sharedData')).first().html();
        
        if (scriptTag) {
            const jsonStr = scriptTag.match(/window\._sharedData\s*=\s*(\{.*\});/)[1];
            const json = JSON.parse(jsonStr);

            const media = json.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
            if (media) {
                const video = media.video_url || null;
                const thumbnail = media.display_url || null;
                return res.json({ video, thumbnail });
            }
        }

        return res.status(404).json({ error: 'No se pudo extraer el video. Puede ser privado o incompatible.' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al scrapear la URL' });
    }
});

app.listen(3000, () => {
    console.log('API corriendo en http://localhost:3000');
});