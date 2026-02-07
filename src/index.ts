import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { disconnectSocket, initSocket, search } from "./api.js";
import { SearchResult } from "./interface.js";

try {
  await initSocket();
  console.log('Type "Exit" at any time to leave.');
  console.log("A long time ago in a galaxy far, far away…");
} catch (error) {
  console.log(`Error occured ${error}`);
}

const rl = readline.createInterface({ input, output });

try {
  while (true) {
    const answer: string = await rl.question(
      "What character would you like to search for? ",
    );

    if (answer === "Exit") break;

    try {
      await search(answer, (result: SearchResult) => {
        if (result.error) {
          console.log(`ERROR: ${result.error}`);
        } else {
          console.log(
            `(${result.page}/${result.resultCount}) ${result.name}  - [${result.films?.join(", ")}]`,
          );
        }
      });
    } catch (error) {
      console.log(`Error occured ${error}`);
    }
  }
} catch (error) {
  console.log(`Error occured ${error}`);
} finally {
  console.log("May the Force be with you…");
  rl.close();
  disconnectSocket();
}
