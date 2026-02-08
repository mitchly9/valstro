import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { disconnectSocket, initSocket, onDisconnect, search } from "./api.js";
import { SearchResult } from "./interface.js";

let controller = false;

try {
  await initSocket();
  controller = true;
  console.log('Search "Exit_" to leave.');
  console.log("A long time ago in a galaxy far, far away…");
} catch (error) {
  console.log(`Error occured ${error}`);
}

const rl = readline.createInterface({ input, output });

try {
  while (controller) {
    const answer: string = await rl.question(
      "What character would you like to search for? ",
    );

    if (answer === "Exit") break;

    try {
      await Promise.race([
        search(answer, (result: SearchResult) => {
          if (result.error) console.log(`ERROR: ${result.error}`);
          else
            console.log(
              `(${result.page}/${result.resultCount}) ${result.name}`,
            );
        }),
        onDisconnect(),
      ]);
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
