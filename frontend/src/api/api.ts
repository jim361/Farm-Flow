import type { SavedUserWorkflow } from "../workflowTypes";
 
// 백엔드 엔티티 구조와 일치하는 타입 정의
export type LibraryDevice = {
  id: string;
  name: string;
  deviceType: "SENSOR" | "ACTUATOR";
  subtype?: string;
};
 
const BASE_URL = "http://localhost:8080/api/v1";
 
// ─── 장치(Device) API ───
 
/** 백엔드 DB에서 장치 목록을 가져오는 함수 */
export async function fetchDevicesApi(): Promise<LibraryDevice[]> {
  const response = await fetch(`${BASE_URL}/devices`);
  if (!response.ok) throw new Error("장치 데이터를 불러올 수 없습니다.");
 
  const data = await response.json();
  console.log("Fetched Devices from DB:", data);
 
  return data.map((d: any) => ({
    id: d.id.toString(),
    name: d.name,
    deviceType: d.deviceType || d.device_type,
    subtype: d.sensorType || d.actuatorType || d.sensor_type,
  }));
}
 
/** 장치 삭제 (여러 개 동시) */
export async function deleteDevicesApi(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) =>
      fetch(`${BASE_URL}/devices/${id}`, { method: "DELETE" })
    )
  );
}
 
// ─── 워크플로우(Workflow) API ───
 
/** 백엔드에서 워크플로우 목록을 가져오는 함수 */
export async function fetchWorkflowsApi(): Promise<SavedUserWorkflow[]> {
  const res = await fetch(`${BASE_URL}/workflows`);
  if (!res.ok) throw new Error("워크플로우 로드 실패");
 
  const data = await res.json();
  return data.map((w: any) => ({
    id: w.id.toString(),
    name: w.name,
    nodes: w.flowData ? JSON.parse(w.flowData).nodes || [] : [],
    edges: w.flowData ? JSON.parse(w.flowData).edges || [] : [],
  }));
}
 
/** 워크플로우 저장 */
export async function saveWorkflowApi(name: string, flowData: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/workflows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, flowData }),
  });
  if (!res.ok) throw new Error("저장 실패");
}
 
/** 워크플로우 삭제 */
export async function deleteWorkflowApi(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/workflows/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("삭제 실패");
}