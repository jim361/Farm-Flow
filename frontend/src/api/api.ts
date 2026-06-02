import type { SavedUserWorkflow } from "../workflowTypes";

export type LibraryDevice = {
  id: string;
  name: string;
  deviceType: "SENSOR" | "ACTUATOR";
  subtype?: string;
  sensorType?: string | null;
  actuatorType?: string | null;
  mqttTopic?: string | null;
  status?: string | null;
};

export type AuthResponse = {
  token: string;
  uid: string;
  name: string;
  greenhouseUid: string;
  role: string;
};

export type UserResponse = {
  uid: string;
  name: string;
  email: string;
  greenhouseUid: string;
  role: string;
};

export type TemplateItem = {
  id: string;
  name: string;
  description: string;
  cropType: string;
  flowData: string;
  ruleData: string;
  scheduleData: string;
  author: string;
  downloadCnt: number;
};

export type DashboardMetric = {
  id: string;
  label: string;
  unit: string;
  value: number;
  trend: number;
  state: "stable" | "warning";
};

export type DashboardAlert = {
  id: string;
  title: string;
  message: string;
  time: string;
  source: string;
  deviceUid: string;
  command: "ON" | "OFF" | string;
  topic: string;
};

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080/api/v1").replace(/\/$/, "");
const BASE_URL = API_BASE_URL;
export const DEFAULT_GREENHOUSE_UID = "";
const GREENHOUSE_STORAGE_KEY = "farmflow.greenhouseUid";

export function getActiveGreenhouseUid(): string {
  return localStorage.getItem(GREENHOUSE_STORAGE_KEY) || DEFAULT_GREENHOUSE_UID;
}

export function setActiveGreenhouseUid(greenhouseUid: string): void {
  const normalized = greenhouseUid.trim();
  if (normalized) {
    localStorage.setItem(GREENHOUSE_STORAGE_KEY, normalized);
  } else {
    localStorage.removeItem(GREENHOUSE_STORAGE_KEY);
  }
}

export function requireActiveGreenhouseUid(): string {
  const greenhouseUid = getActiveGreenhouseUid();
  if (!greenhouseUid) {
    throw new Error("온실 UID를 먼저 확인해주세요.");
  }
  return greenhouseUid;
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function clearToken(): void {
  localStorage.removeItem("token");
  localStorage.removeItem(GREENHOUSE_STORAGE_KEY);
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

export async function signupApi(email: string, password: string, name: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "회원가입 실패" }));
    throw new Error(err.error || "회원가입 실패");
  }
  return res.json();
}

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "로그인 실패" }));
    throw new Error(err.error || "아이디 또는 비밀번호가 일치하지 않습니다.");
  }
  return res.json();
}

export async function logoutApi(): Promise<void> {
  try {
    await authFetch(`${BASE_URL}/auth/logout`, { method: "POST" });
  } finally {
    clearToken();
  }
}

export async function getMeApi(): Promise<UserResponse> {
  const res = await authFetch(`${BASE_URL}/auth/me`);
  if (!res.ok) {
    throw new Error("인증이 만료되었습니다.");
  }
  return res.json();
}

export async function fetchDevicesApi(): Promise<LibraryDevice[]> {
  const greenhouseUid = requireActiveGreenhouseUid();
  const response = await authFetch(`${BASE_URL}/greenhouses/${encodeURIComponent(greenhouseUid)}/devices`);
  if (!response.ok) throw new Error("장치 데이터를 불러올 수 없습니다.");

  const data = await response.json();
  return data.map((d: any) => ({
    id: d.uid || d.id?.toString(),
    name: d.name,
    deviceType: d.deviceType || d.device_type,
    subtype: d.sensorType || d.actuatorType || d.sensor_type,
    sensorType: d.sensorType || d.sensor_type || null,
    actuatorType: d.actuatorType || d.actuator_type || null,
    mqttTopic: d.mqttTopic || d.mqtt_topic || null,
    status: d.status || null,
  }));
}

export async function registerDeviceApi(deviceData: Record<string, unknown>): Promise<any> {
  const greenhouseUid = requireActiveGreenhouseUid();
  const res = await authFetch(`${BASE_URL}/greenhouses/${encodeURIComponent(greenhouseUid)}/devices`, {
    method: "POST",
    body: JSON.stringify(deviceData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "장치 등록 실패" }));
    throw new Error(err.error || "장치 등록 실패");
  }
  return res.json();
}

export async function deleteDevicesApi(ids: string[]): Promise<void> {
  const greenhouseUid = requireActiveGreenhouseUid();
  await Promise.all(
    ids.map((id) =>
      authFetch(`${BASE_URL}/greenhouses/${encodeURIComponent(greenhouseUid)}/devices/${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
    )
  );
}

export async function updateDeviceStatusApi(deviceUid: string, status: string): Promise<any> {
  const greenhouseUid = requireActiveGreenhouseUid();
  const res = await authFetch(`${BASE_URL}/greenhouses/${encodeURIComponent(greenhouseUid)}/devices/${encodeURIComponent(deviceUid)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("상태 변경 실패");
  return res.json();
}

function workflowFromResponse(w: any): SavedUserWorkflow {
  return {
    id: w.uid || w.id?.toString(),
    name: w.name,
    nodes: w.flowData ? JSON.parse(w.flowData).nodes || [] : [],
    edges: w.flowData ? JSON.parse(w.flowData).edges || [] : [],
  };
}

export async function fetchWorkflowsApi(): Promise<SavedUserWorkflow[]> {
  const res = await authFetch(`${BASE_URL}/workflows`);
  if (!res.ok) throw new Error("워크플로우 로드 실패");
  const data = await res.json();
  return data.map(workflowFromResponse);
}

export async function saveWorkflowApi(name: string, flowData: string): Promise<SavedUserWorkflow> {
  const res = await authFetch(`${BASE_URL}/workflows`, {
    method: "POST",
    body: JSON.stringify({ name, flowData }),
  });
  if (!res.ok) throw new Error("저장 실패");
  return workflowFromResponse(await res.json());
}

export async function updateWorkflowApi(id: string, name: string, flowData: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/workflows/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, flowData }),
  });
  if (!res.ok) throw new Error("수정 실패");
}

export async function deleteWorkflowApi(id: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/workflows/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("삭제 실패");
}

export async function deployWorkflowApi(id: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/workflows/${id}/deploy`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("배포 실패");
}

export async function fetchTemplatesApi(cropType?: string): Promise<TemplateItem[]> {
  const url = cropType
    ? `${BASE_URL}/templates?crop_type=${cropType}`
    : `${BASE_URL}/templates`;
  const res = await authFetch(url);
  if (!res.ok) throw new Error("템플릿 로드 실패");
  const data = await res.json();
  return data.map((t: any) => ({
    id: t.uid || t.id?.toString(),
    name: t.name || "",
    description: t.description || "",
    cropType: t.cropType || t.crop_type || "",
    flowData: t.flowData || t.flow_data || "{}",
    ruleData: t.ruleData || t.rule_data || "{}",
    scheduleData: t.scheduleData || t.schedule_data || "{}",
    author: t.author || "",
    downloadCnt: t.downloadCnt ?? t.download_cnt ?? 0,
  }));
}

export async function applyTemplateApi(templateId: string): Promise<SavedUserWorkflow> {
  const greenhouseUid = requireActiveGreenhouseUid();
  const res = await authFetch(`${BASE_URL}/templates/${templateId}/apply`, {
    method: "POST",
    body: JSON.stringify({ greenhouseUid }),
  });
  if (!res.ok) throw new Error("템플릿 적용 실패");
  return workflowFromResponse(await res.json());
}

export async function fetchDashboardMetricsApi(
  greenhouseUid = getActiveGreenhouseUid()
): Promise<DashboardMetric[]> {
  const params = greenhouseUid ? `?${new URLSearchParams({ greenhouseUid }).toString()}` : "";
  const res = await authFetch(`${BASE_URL}/dashboard/metrics${params}`);
  if (!res.ok) throw new Error("대시보드 지표 로드 실패");
  return res.json();
}

export async function fetchDashboardAlertsApi(
  greenhouseUid = getActiveGreenhouseUid()
): Promise<DashboardAlert[]> {
  const params = greenhouseUid ? `?${new URLSearchParams({ greenhouseUid }).toString()}` : "";
  const res = await authFetch(`${BASE_URL}/dashboard/alerts${params}`);
  if (!res.ok) throw new Error("알림 데이터를 불러올 수 없습니다.");
  return res.json();
}

export async function acknowledgeDashboardAlertApi(
  alertId: string,
  greenhouseUid = getActiveGreenhouseUid()
): Promise<void> {
  const params = greenhouseUid ? `?${new URLSearchParams({ greenhouseUid }).toString()}` : "";
  const res = await authFetch(`${BASE_URL}/dashboard/alerts/${encodeURIComponent(alertId)}${params}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("알림 확인 처리 실패");
}
