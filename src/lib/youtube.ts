import {google} from "googleapis";

const auth = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

auth.setCredentials({
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
});

const youtube = google.youtube({
  version: "v3",
  auth,
});

export async function uploadVideoToYouTube(
  title: string,
  description: string,
  tags: string[],
  filePath: string
) {
  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title,
        description,
        tags,
      },
      status: {
        privacyStatus: "private",
      },
    },
    media: {
      body: require("fs").createReadStream(filePath),
    },
  });


  return res.data;
}