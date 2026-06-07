import api from "@/lib/api";

export async function downloadExport(endpoint = "/exports/excel", filename = "export", ext = "csv") {
  const res = await api.get(endpoint, { responseType: "blob" });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
