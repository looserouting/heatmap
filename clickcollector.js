// server.js
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");

const app = express();
const PORT = 3000;

let clickLogs = [];

app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/click-data", (req, res) => {
    const { url, x, y, timestamp } = req.body;
    clickLogs.push({ url, x, y, timestamp });

    fs.writeFileSync("clicks.json", JSON.stringify(clickLogs, null, 2));
    res.sendStatus(200);
});

// Route zum Erzeugen eines Screenshots + Heatmap
app.get("/heatmap", async (req, res) => {
    const logs = JSON.parse(fs.readFileSync("clicks.json"));

    const targetUrl = logs[0]?.url;
    if (!targetUrl) return res.status(400).send("Keine Klickdaten vorhanden.");

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: "networkidle0" });

    const screenshotPath = path.join(__dirname, "public", "screenshot.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await browser.close();

    // Zeige HTML mit Screenshot und Clickpoints
    let html = `
        <html>
            <head><style>
                .click-point {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background-color: rgba(255, 0, 0, 0.6);
                    border-radius: 50%;
                    pointer-events: none;
                }
                #heatmap-container {
                    position: relative;
                    display: inline-block;
                }
                #heatmap-container img {
                    display: block;
                }
            </style></head>
            <body>
                <h2>Heatmap von ${targetUrl}</h2>
                <div id="heatmap-container">
                    <img src="screenshot.png" />
                    ${logs.map(click => 
                        `<div class="click-point" style="left:${click.x}px; top:${click.y}px;"></div>`
                    ).join("")}
                </div>
            </body>
        </html>
    `;

    res.send(html);
});

app.listen(PORT, () => {
    console.log(`Server läuft unter http://localhost:${PORT}`);
});
