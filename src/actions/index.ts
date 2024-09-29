"use server";

import axios from "axios";

async function fetchGitHubReadme(username: string): Promise<string> {
  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}/repos`
    );
    const repos = response.data;
    const readmeRepo = repos.find(
      (repo) => repo.name.toLowerCase() === `${username.toLowerCase()}`
    );

    if (readmeRepo) {
      const readmeResponse = await axios.get(
        `https://raw.githubusercontent.com/${username}/${username}/main/README.md`
      );
      return readmeResponse.data;
    } else {
      return "No README found for this user.";
    }
  } catch (error) {
    console.error("Error fetching GitHub README:", error);
    return "Error fetching GitHub README.";
  }
}

async function generateRoast(readme: string): Promise<string> {
  const prompt = `Roast this GitHub README in a funny and light-hearted way, but don't be too mean:\n\n${readme}`;

  try {
    const response = await axios.post(
      "https://llamatool.us.gaianet.network/v1/chat/completions",
      {
        model: "llama",
        messages: [
          {
            role: "system",
            content:
              "You are a witty assistant that generates funny, light-hearted roasts of GitHub READMEs. Keep it playful and avoid being overly mean.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating roast:", error);
    return "Error generating roast.";
  }
}

export async function roastGitHubReadme(username: string): Promise<string> {
  const readme = await fetchGitHubReadme(username);
  if (readme === "Error fetching GitHub README.") {
    return "Couldn't fetch the README. Is the username correct?";
  }

  let roast = await generateRoast(readme);
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    if (
      roast &&
      !roast.includes("<tool_call>") &&
      !roast.includes("I'm sorry")
    ) {
      console.log(roast);
      return roast;
    }
    console.log(`Attempt ${attempts + 1} failed. Retrying...`);
    roast = await generateRoast(readme);
    attempts++;
  }

  console.log("Max attempts reached. Unable to generate a valid roast.");
  return "Sorry, I couldn't come up with a good roast this time. Maybe your README is too awesome to roast!";
}
