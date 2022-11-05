import express from 'express';
import 'dotenv/config';
import {Configuration, OpenAIApi} from 'openai';
import path from 'path';
import {fileURLToPath} from 'url';
import {writeFileSync} from 'fs';

const app = express();
const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('index', {img: null, prompt: null});
});

app.post('/', async (req, res) => {
    let prompt = req.body.prompt;

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY
    });

    const openai = new OpenAIApi(configuration);

    const response = await openai.createImage({
        prompt,
        n: 1, // Number of generates
        size: '1024x1024'
    });

    const url = response.data.data[0].url;

    // Save image locally
    const imgResult = await fetch(url);
    const blob = await imgResult.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    const imgName = prompt.toLowerCase().replace(/\s/g, '-');
    writeFileSync(`./img/${imgName}.png`, buffer);

    // Render new page with image
    res.render('index', {img: url, prompt: prompt});
});

app.listen(PORT, () => {
    console.log(`Website listening on port ${PORT}!`);
});