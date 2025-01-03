const axios = require('axios');
const packageJson = require('./package.json');

const installedDeps = Object.keys(packageJson.dependencies);

async function checkDependencies() {
  const invalidDeps = [];

  for (const dep of installedDeps) {
    try {
      const response = await axios.get(`https://registry.npmjs.org/${dep}`);
      if (response.status === 404) {
        invalidDeps.push(dep);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        invalidDeps.push(dep);
      }
    }
  }

  if (invalidDeps.length > 0) {
    console.log(`The following dependencies were not found on npm:`);
    invalidDeps.forEach(dep => console.log(dep));
  } else {
    console.log('All dependencies are available on npm.');
  }
}

checkDependencies();