import { io, Socket } from "socket.io-client";
import { SearchResult } from "./interface.js";

let socket: Socket;
let disconnectPromise: Promise<never> | null = null;

export function initSocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    socket = io("http://localhost:3000");
    socket.once("connect_error", reject);
    socket.on("connect", resolve);

    disconnectPromise = new Promise((_, reject) => {
      socket.on("disconnect", (reason) => {
        reject(new Error(`Socket disconnected: ${reason}`));
      });
    });
  });
}

export function onDisconnect(): Promise<never> {
  if (!disconnectPromise) throw new Error("Promise not initialized");
  return disconnectPromise;
}

export function disconnectSocket() {
  socket.removeAllListeners();
  socket.disconnect();
}

export function search(
  query: string,
  onResult: (result: SearchResult) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    function handleSearchResults(data: SearchResult) {
      onResult(data);

      if (data.page === data.resultCount) {
        cleanup();
        resolve();
      }
    }

    function cleanup() {
      socket.off("search", handleSearchResults);
      socket.off("error", handleError);
    }

    function handleError(error: Error) {
      cleanup();
      reject(error);
    }

    socket.once("error", handleError);
    socket.on("search", handleSearchResults);

    socket.emit("search", { query });
  });
}
