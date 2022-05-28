import { readdir, readFile, writeFile } from "fs/promises";

import { fileURLToPath } from "url";
import path, { dirname } from "path";
import dayjs from "dayjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const data = [];

try {
  const files = await readdir(path.join(__dirname, "inbox"));
  let count = 0;
  for (const file of files) {
    if (file !== ".DS_Store") {
      try {
        let chatFile = await readFile(
          path.join(__dirname, "inbox", file, "message_1.json")
        );
        chatFile = JSON.parse(chatFile);
        extractInfo(chatFile);
        count++;
      } catch (e) {
        console.log(e);
      }
    }
  }
  console.log('total folders processed:', count);

  await writeFile("output.json", JSON.stringify(data));
} catch (err) {
  console.error(err);
}

function extractInfo({ participants, messages }) {
  let author = participants[0].name,
    query = "",
    response = "",
    queryTime = null;
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
          queryTime: dayjs(queryTime).format("DD-MM-YYYY HH:mm:ss"),
          responseTime: dayjs(timestamp_ms).format("DD-MM-YYYY HH:mm:ss"),
          queryResolutionTime: `${dayjs(timestamp_ms).diff(
            dayjs(queryTime),
            "hours"
          )} hours`,
        });
        (query = ""), (response = ""), (queryTime = null);
      }
    } else {
      queryTime = queryTime || timestamp_ms;
      query += content + " ";
    }
    i--;
  }
}
