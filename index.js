const { Octokit } = require("@octokit/core");
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();
const express = require('express');
const app = express();
const port = 3000;

const octokit = new Octokit({
    auth: process.env.GITHUB_API_KEY
})

const createRepo = async () => {
    try {
        await octokit.request('POST /user/repos', {
            name: 'RandomTest',
            description: 'This is your first node deployed repository',
            homepage: 'https://github.com',
            'private': false,
        })
        console.log("Repo successfully created");
    } catch (err) {
        console.log(err);
    }
}

const addFileToRepo = async (fileInBase64) => {
    try {
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: 'patrzykat',
            repo: 'RandomTest',
            path: 'index.html',
            message: 'initial commit',
            content: fileInBase64
        })
        console.log("index.html file added")
    } catch (err) {
        console.log(err);
    }
}

const createGitHubPagesSite = async () => {
    try {
        await octokit.request('POST /repos/patrzykat/RandomTest/pages', {
            owner: 'patrzykat',
            repo: 'RandomTest',
            source: {
              branch: 'main',
              path: '/'
            }
        })
        console.log("GitHub Pages site created");
    } catch (err) {
        console.log(err);
    }
}

const createSiteInBase64 = () => {
    let sections = ['./snippets/header.html', './snippets/hero.html', './snippets/about.html', './snippets/grid.html', './snippets/contact.html', './snippets/footer.html'];
    let result = '';
    sections.forEach((sectionURL) => {
        let sectionInBase64 = fs.readFileSync(sectionURL, {encoding: "base64"});
        while (sectionInBase64.charAt(sectionInBase64.length - 1) === "=") {
            sectionInBase64 = sectionInBase64.slice(0, sectionInBase64.length - 1);
        }
        result += sectionInBase64;
    })
    result += "=";
    return result;
}

app.post('/create', (req, res) => {
    const fileInBase64 = fs.readFileSync("./snippets/index.html");
    res.send('Send back index.HTML');
})

app.post('/deploy', async (req, res) => {
    const fileInBase64 = fs.readFileSync("./snippets/index.html", { encoding: "base64" });
    await createRepo();
    await addFileToRepo(fileInBase64);
    await createGitHubPagesSite();
    res.send('App Deployed at <put url here>');
})

app.get('/test', async (req, res) => {
    const fileInBase64 = createSiteInBase64();
    console.log(fileInBase64);
    console.log();
    const fileInBase642 = fs.readFileSync("./snippets/index.html", { encoding: "base64" });
    console.log(fileInBase642);
    fs.writeFileSync("./testing.html", fileInBase64, "base64");
    res.send("File created in testing.html");
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})