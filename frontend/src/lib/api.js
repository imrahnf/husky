// Requests go through the Next.js rewrite proxy → https://husky.omrahnfaqiri.com
const BASE_URL = "/api";

export async function getFlow() {
  const res = await fetch(`${BASE_URL}/flow`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /flow failed (${res.status})`);
  return res.json();
}

export async function resetFlow() {
  const res = await fetch(`${BASE_URL}/flow/reset`, { method: "POST" });
  if (!res.ok) throw new Error(`POST /flow/reset failed (${res.status})`);
  return res.json();
}

export async function completeTask1() {
  const res = await fetch(`${BASE_URL}/task-1/complete`, { method: "POST" });
  if (!res.ok) throw new Error(`POST /task-1/complete failed (${res.status})`);
  return res.json();
}

export async function triggerTask1() {
  const res = await fetch(`${BASE_URL}/task-1/trigger`, { method: "POST" });
  if (!res.ok) throw new Error(`POST /task-1/trigger failed (${res.status})`);
  return res.json();
}

export async function triggerTask2() {
  const res = await fetch(`${BASE_URL}/task-2/trigger`, { method: "POST" });
  if (!res.ok) throw new Error(`POST /task-2/trigger failed (${res.status})`);
  return res.json();
}

export async function triggerTask3() {
  const res = await fetch(`${BASE_URL}/task-3/trigger`, { method: "POST" });
  if (!res.ok) throw new Error(`POST /task-3/trigger failed (${res.status})`);
  return res.json();
}

export async function completeTask2(choice) {
  const res = await fetch(`${BASE_URL}/task-2/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ choice }),
  });
  if (!res.ok) throw new Error(`POST /task-2/complete failed (${res.status})`);
  return res.json();
}

export async function completeTask3() {
  const res = await fetch(`${BASE_URL}/task-3/complete`, { method: "POST" });
  if (!res.ok) throw new Error(`POST /task-3/complete failed (${res.status})`);
  return res.json();
}

export async function getTask2Choice() {
  const res = await fetch(`${BASE_URL}/task-2/choice`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /task-2/choice failed (${res.status})`);
  return res.json();
}
