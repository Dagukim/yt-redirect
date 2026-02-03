import { XMLParser } from "fast-xml-parser";

export default async function handler(req, res) {
    const { CHANNELID, BASEURL } = process.env;

    if (!CHANNELID || !BASEURL) {
        return res.status(500).send("Missing environment variables");
    }

    try {
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNELID}`;

        const xml = await fetch(rssUrl).then((r) => r.text());

        const parser = new XMLParser();
        const data = parser.parse(xml);

        const entry = data.feed?.entry;
        if (!entry) {
            return res.status(200).send("No videos found");
        }

        const latest = Array.isArray(entry) ? entry[0] : entry;
        const videoId = latest["yt:videoId"];

        return res.redirect(302, `${BASEURL}${videoId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("RSS processing error");
    }
}
