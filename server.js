const express = require('express');
const axios = require('axios');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const port = process.env.PORT || 10000;
const app = express();

ffmpeg.setFfmpegPath('./bin/ffmpeg');


app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile("./public/index.html", {
    root: __dirname
  });
});

app.post("/mp4tomp3", async (req, res) => {
  try {
    const fileUrl = req.body.fileUrl;
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer'
    });
    const inputPath = './filestore/input.mp4';
    const outputPath = './filestore/output.mp3';
    fs.writeFileSync(inputPath, response.data);

    ffmpeg(inputPath)
      .toFormat('mp3')
      .on('end', () => {
        console.log("Conversion Done !");
        res.download(outputPath, 'output.mp3', (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('An error occurred');
          }
        });
      })
      .on('error', (err) => {
        console.error(err);
        res.status(500).send('An error occurred');
      })
      .save(outputPath);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});


app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});