export default {
  async fetch(req) {
    if (req.method !== "POST") {
      return new Response("ok");
    }

    try {
      const update = await req.json();

      console.log("UPDATE:", update);

      return new Response("ok");
    } catch (e) {
      return new Response("error");
    }
  }
}
