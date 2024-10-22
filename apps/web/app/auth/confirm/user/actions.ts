export async function getUserData(userId: string) {
  const response = await fetch(`/api/user?id=${userId}`);
  console.log("response", response);
  return await response.json();
}
