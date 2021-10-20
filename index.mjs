import { readdir, readFile, writeFile } from "fs/promises";

import { fileURLToPath } from "url";
import path, { dirname } from "path";
import dayjs from "dayjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const data = [];

try {
  const files = await readdir(path.join(__dirname, "inbox"));
  for (const file of files) {
    if (file !== ".DS_Store") {
      let chatFile = await readFile(
        path.join(__dirname, "inbox", file, "message_1.json")
      );
      chatFile = JSON.parse(chatFile);
      extractInfo(chatFile);
    }
  }

  await writeFile("output.json", JSON.stringify(data));
} catch (err) {
  console.error(err);
}

function extractInfo({ participants, messages }) {
  let author = participants[0].name,
    query = "",
    response = "",
    queryStartTime = null;
  let i = messages.length - 1;
  while (i >= 0) {
    const { sender_name, content, timestamp_ms } = messages[i];
    if (sender_name === "Masai School") {
      response += content + " ";
      if (messages[i - 1]?.sender_name !== "Masai School") {
        data.push({
          author,
          query: query.trim(),
          response: response.trim(),
          queryStartTime: dayjs(queryStartTime).format("DD-MM-YYYY HH:mm:ss"),
          queryEndTime: dayjs(timestamp_ms).format("DD-MM-YYYY HH:mm:ss"),
          responseTime: `${dayjs(timestamp_ms).diff(
            dayjs(queryStartTime),
            "hours"
          )} hours`,
        });
        (query = ""), (response = ""), (queryStartTime = null);
      }
    } else {
      queryStartTime = queryStartTime || timestamp_ms;
      query += content + " ";
    }
    i--;
  }
}
