import { SteadingGenerator } from './server/lib/steading-generator.js';

const generator = new SteadingGenerator();
const castle = generator.generateCastle();

console.log('Generated Castle:');
console.log(JSON.stringify(castle, null, 2));
