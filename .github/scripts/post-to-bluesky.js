const core = require('@actions/core');
const { ATProtocol } = require('atproto');

async function run() {
  try {
    const blueskyToken = core.getInput('BLUESKY_TOKEN');
    const atproto = new ATProtocol({
      service: 'https://bsky.social',
      authToken: blueskyToken,
    });

    const commitMessage = process.env.GITHUB_HEAD_REF;
    const post = await atproto.post.create({
      text: `Ik heb zojuist: ${commitMessage} toegevoegd aan de Kleine Boodschap Data website, bekijk de data op https://sjorshartwijk.github.io/kleineboodschap/`,
    });

    core.setOutput('post-url', post.uri);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();