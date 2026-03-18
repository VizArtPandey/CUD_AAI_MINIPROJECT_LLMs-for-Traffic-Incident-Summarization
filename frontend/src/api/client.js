import axios from "axios";

const api = axios.create({
  // Use relative paths in production (Hugging Face) so it hits the same domain.
  // In local dev, continue reaching out to FastAPI on port 8000.
  baseURL: import.meta.env.PROD ? "" : "http://127.0.0.1:8000"
});

export async function summarizeText(payload) {
  const { data } = await api.post("/summarize", payload);
  return data;
}

export async function compareModels(payload) {
  const { data } = await api.post("/compare", payload);
  return data;
}

export async function fetchSamples(track) {
  const { data } = await api.get(`/samples?track=${track}`);
  return data.items || [];
}
